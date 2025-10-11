// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to get multiple API keys from environment variables
function getApiKeys(baseName: string): string[] {
  const keys: string[] = [];
  let i = 1;
  while (true) {
    // @ts-ignore
    const key = Deno.env.get(`${baseName}_${i}`);
    if (key) {
      keys.push(key);
      i++;
    } else {
      break;
    }
  }
  if (keys.length === 0) {
    // @ts-ignore
    const singleKey = Deno.env.get(baseName);
    if (singleKey) {
      keys.push(singleKey);
    }
  }
  return keys;
}

// Define staleness threshold (e.g., 30 days)
const STALENESS_THRESHOLD_DAYS = 30;

// Helper function to strip markdown code block fences
function stripMarkdownFences(content: string): string {
  if (content.startsWith('```json') && content.endsWith('```')) {
    return content.substring(7, content.length - 3).trim();
  }
  if (content.startsWith('```') && content.endsWith('```')) {
    return content.substring(3, content.length - 3).trim();
  }
  return content;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // @ts-ignore
    const supabaseClient = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') || '' },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();

    const { videoLinks, customComparativeQuestions } = await req.json();

    if (!videoLinks || !Array.isArray(videoLinks) || videoLinks.length < 2) {
      return new Response(JSON.stringify({ error: 'At least two video links are required for multi-comparison.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const longcatApiKeys = getApiKeys('LONGCAT_AI_API_KEY');
    if (longcatApiKeys.length === 0) {
      return new Response(JSON.stringify({ error: 'Longcat AI API key(s) not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    const longcatApiUrl = "https://api.longcat.chat/openai/v1/chat/completions";

    // --- Step 1: Get individual video analysis data (from cache or re-analyze) ---
    const analyzedBlogPosts: any[] = [];
    const videoTitles: string[] = [];
    const videoKeywords: string[] = [];

    for (const videoLink of videoLinks) {
      const videoIdMatch = videoLink.match(/(?:v=|\/videos\/|embed\/|youtu.be\/|\/v\/|\/e\/|watch\?v=|&v=)([^#&?]{11})/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;

      if (!videoId) {
        throw new Error(`Invalid YouTube video link provided: ${videoLink}`);
      }

      const { data: existingBlogPost, error: fetchError } = await supabaseClient
        .from('blog_posts')
        .select('*')
        .eq('video_id', videoId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error(`Supabase fetch existing blog post error for ${videoId}:`, fetchError);
        throw new Error(`Failed to check for existing analysis for video ${videoId}`);
      }

      const now = new Date();
      let shouldPerformFullReanalysis = false;
      let blogPostData: any;

      if (existingBlogPost) {
        const lastReanalyzedDate = new Date(existingBlogPost.last_reanalyzed_at);
        const daysSinceLastReanalysis = (now.getTime() - lastReanalyzedDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLastReanalysis > STALENESS_THRESHOLD_DAYS) {
          console.log(`Triggering full re-analysis for video ID: ${videoId} due to staleness.`);
          shouldPerformFullReanalysis = true;
        } else {
          console.log(`Reusing existing analysis for video ID: ${videoId}. Analysis is fresh.`);
          blogPostData = existingBlogPost;
        }
      } else {
        console.log(`No existing analysis found for video ID: ${videoId}. Performing full analysis.`);
        shouldPerformFullReanalysis = true;
      }

      if (shouldPerformFullReanalysis) {
        const youtubeAnalyzerResponse = await supabaseClient.functions.invoke('youtube-analyzer', {
          body: { videoLink: videoLink, customQuestions: [], forceReanalyze: true },
        });

        if (youtubeAnalyzerResponse.error) {
          console.error(`Error invoking youtube-analyzer for ${videoId}:`, youtubeAnalyzerResponse.error);
          if (youtubeAnalyzerResponse.error.name === 'FunctionsHttpError' && youtubeAnalyzerResponse.error.context?.status === 400) {
            try {
              const errorBody = await youtubeAnalyzerResponse.error.context.json();
              if (errorBody && errorBody.error) {
                throw new Error(`Failed to analyze video ${videoId}: ${errorBody.error}`);
              }
            } catch (jsonError) {
              console.error(`Failed to parse youtube-analyzer error response for ${videoId}:`, jsonError);
            }
          }
          throw new Error(`Failed to analyze video ${videoId}: ${youtubeAnalyzerResponse.error.message}`);
        }
        const { data: updatedBlogPost, error: refetchError } = await supabaseClient
          .from('blog_posts')
          .select('*')
          .eq('video_id', videoId)
          .single();
        
        if (refetchError) {
          console.error(`Error refetching blog post for ${videoId}:`, refetchError);
          throw new Error(`Failed to retrieve updated analysis for video ${videoId}`);
        }
        blogPostData = updatedBlogPost;
      }
      analyzedBlogPosts.push(blogPostData);
      videoTitles.push(blogPostData.title);
      if (blogPostData.keywords) {
        videoKeywords.push(...blogPostData.keywords);
      }
    }

    // --- Step 2: Fetch External Context ---
    const externalContextQuery = `${videoTitles.join(' ')} multi-video comparison`;
    const fetchExternalContextResponse = await supabaseClient.functions.invoke('fetch-external-context', {
      body: { query: externalContextQuery },
    });

    let externalContext = '';
    if (fetchExternalContextResponse.error) {
      console.warn("Error fetching external context for multi-comparison:", fetchExternalContextResponse.error);
    } else {
      externalContext = fetchExternalContextResponse.data.externalSearchResults;
    }

    // --- Step 3: Longcat AI Calls for Multi-Comparative Insights ---
    const formatAnalysisForAI = (blogPost: any, index: number) => `
      --- Video ${index + 1} Analysis ---
      Title: ${blogPost.title}
      Creator: ${blogPost.creator_name}
      Description: ${blogPost.meta_description}
      Keywords: ${blogPost.keywords ? blogPost.keywords.join(', ') : 'None'}
      Overall Sentiment: ${blogPost.ai_analysis_json?.overall_sentiment || 'N/A'}
      Emotional Tones: ${blogPost.ai_analysis_json?.emotional_tones ? blogPost.ai_analysis_json.emotional_tones.join(', ') : 'None'}
      Key Themes: ${blogPost.ai_analysis_json?.key_themes ? blogPost.ai_analysis_json.key_themes.join(', ') : 'None'}
      Summary Insights: ${blogPost.ai_analysis_json?.summary_insights || 'No insights available.'}
      Top Comments:
      ${blogPost.ai_analysis_json?.raw_comments_for_chat ? blogPost.ai_analysis_json.raw_comments_for_chat.slice(0, 5).map((c: string, i: number) => `${i + 1}. ${c}`).join('\n') : 'No comments available.'}
      --- End Video ${index + 1} Analysis ---
    `;

    const combinedAnalysisContext = analyzedBlogPosts.map((bp, i) => formatAnalysisForAI(bp, i)).join('\n') +
      (externalContext ? `\n\n--- Recent External Information ---\n${externalContext}\n--- End External Information ---` : '');

    // --- AI Call for Core Multi-Comparison Data ---
    const coreMultiComparisonPrompt = `
      Based on the following analyses of multiple YouTube videos, provide a structured comparison.
      Focus on identifying commonalities, unique aspects, overall sentiment trends, and key shifts across all videos.

      ${combinedAnalysisContext}

      Generate a JSON object with the following structure:
      {
        "overall_sentiment_trend": "Across the videos, there's a general shift from positive reception in earlier videos to more mixed or neutral sentiment in later ones.",
        "common_emotional_tones": ["excitement", "curiosity"],
        "divergent_emotional_tones": {
          "Video 1 Title": ["nostalgia"],
          "Video 3 Title": ["frustration"]
        },
        "common_themes": ["product review", "gaming mechanics"],
        "unique_themes": {
          "Video 2 Title": ["community engagement strategies"],
          "Video 4 Title": ["ethical considerations"]
        },
        "summary_insights": "The series shows a consistent interest in product features, but later videos introduce more nuanced discussions around community and ethics, reflecting evolving audience expectations.",
        "video_summaries": [
          {"title": "Video 1 Title", "sentiment": "positive", "themes": ["theme1", "theme2"]},
          {"title": "Video 2 Title", "sentiment": "neutral", "themes": ["theme3", "theme4"]}
        ]
      }
      Ensure all fields are populated with relevant data derived from the provided video analyses.
    `;

    let coreMultiComparisonResponse;
    for (const currentLongcatApiKey of longcatApiKeys) {
      coreMultiComparisonResponse = await fetch(longcatApiUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentLongcatApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "LongCat-Flash-Chat",
          messages: [{ "role": "system", "content": "You are SentiVibe AI, an expert in multi-video comparative analysis. Your task is to meticulously compare multiple YouTube video analyses and extract key quantitative and qualitative commonalities, unique aspects, and overall trends in audience sentiment, emotional tones, and themes. Present your findings in a structured JSON format as specified, ensuring accuracy and conciseness. Focus on highlighting overarching patterns and significant divergences across the videos." }, { "role": "user", "content": coreMultiComparisonPrompt }],
          max_tokens: 2000,
          temperature: 0.7,
          response_format: { type: "json_object" }
        }),
      });
      if (coreMultiComparisonResponse.ok) break;
      else if (coreMultiComparisonResponse.status === 429) console.warn(`Longcat AI API key hit rate limit for core multi-comparison. Trying next key.`);
      else break;
    }
    if (!coreMultiComparisonResponse || !coreMultiComparisonResponse.ok) {
      const errorData = coreMultiComparisonResponse ? await coreMultiComparisonResponse.json() : { message: "No response from Longcat AI" };
      console.error('Longcat AI Core Multi-Comparison API error:', errorData);
      throw new Error(`Failed to get core multi-comparison from Longcat AI: ${errorData.message}`);
    }
    const longcatDataCore = await coreMultiComparisonResponse.json();
    if (!longcatDataCore.choices || longcatDataCore.choices.length === 0 || !longcatDataCore.choices[0].message || !longcatDataCore.choices[0].message.content) {
      console.error('Longcat AI Core Multi-Comparison API returned unexpected structure:', longcatDataCore);
      throw new Error('Longcat AI Core Multi-Comparison API returned an empty or malformed response.');
    }
    const coreMultiComparisonDataContent = stripMarkdownFences(longcatDataCore.choices[0].message.content);
    const coreMultiComparisonData = JSON.parse(coreMultiComparisonDataContent);

    // --- AI Call for Multi-Comparative Blog Post Generation ---
    const blogPostMultiComparisonPrompt = `
      Based on the detailed multi-video comparison of the following YouTube videos: ${videoTitles.map(t => `"${t}"`).join(', ')}, generate a comprehensive, SEO-optimized blog post for the SentiVibe platform. This post is intended for content creators and marketers seeking to understand comparative audience reactions across multiple pieces of content.

      ${combinedAnalysisContext}

      Core Multi-Comparison Data:
      ${JSON.stringify(coreMultiComparisonData, null, 2)}

      The blog post should:
      1. Have a compelling, SEO-optimized title (max 70 characters) in the format: "Multi-Video Sentiment Comparison: ${videoTitles.slice(0, 2).join(' vs ')}${videoTitles.length > 2 ? ' and more' : ''} ({{Year}}) | SentiVibe".
      2. Generate a URL-friendly slug from the title (lowercase, hyphen-separated, **without any leading or trailing slashes or path segments**).
      3. Include a concise meta description (max 160 characters) summarizing the multi-comparison.
      4. List 5-10 relevant keywords as an array, combining keywords from all videos and comparison terms.
      5. Be structured with an H1 (the title), H2s for sections, and H3s for sub-sections.
      6. Be at least 1000 words long.
      7. Discuss the overall sentiment trends, common and divergent emotional tones, common and unique themes, and summary insights, leveraging SentiVibe's AI.
      8. Incorporate insights from the core multi-comparison data naturally to support the analysis.
      9. Conclude with a strong call to action, encouraging readers to use SentiVibe for their own multi-video analysis and comparisons.
      10. Be written in Markdown format.

      Respond in a structured JSON format:
      {
        "title": "SEO Optimized Multi-Comparison Blog Post Title",
        "slug": "seo-optimized-multi-comparison-blog-post-title",
        "meta_description": "A concise meta description for search engines.",
        "keywords": ["keyword1", "keyword2", "keyword3"],
        "content": "# H1 Title\\n\\nIntroduction...\\n\\n## H2 Section\\n\\nContent...\\n\\n### H3 Sub-section\\n\\nMore content...\\n\\n## Conclusion\\n\\nCall to action..."
      }
    `;

    let blogPostMultiComparisonResponse;
    for (const currentLongcatApiKey of longcatApiKeys) {
      blogPostMultiComparisonResponse = await fetch(longcatApiUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentLongcatApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "LongCat-Flash-Chat",
          messages: [{ "role": "system", "content": "You are SentiVibe AI, an expert SEO content strategist and writer specializing in multi-video comparative analysis. Your task is to generate a high-quality, detailed, and SEO-optimized blog post in Markdown format comparing multiple YouTube video analyses. The content must be engaging, insightful, and directly leverage the provided multi-comparison data. Ensure the output is a valid, well-formed JSON object, strictly adhering to the provided schema, and ready for immediate publication. Avoid generic phrases or fluff; focus on actionable insights and clear, professional language. The blog post should be compelling and provide genuine value to the reader, encouraging them to explore SentiVibe further." }, { "role": "user", "content": blogPostMultiComparisonPrompt }],
          max_tokens: 3000,
          temperature: 0.7,
          response_format: { type: "json_object" }
        }),
      });
      if (blogPostMultiComparisonResponse.ok) break;
      else if (blogPostMultiComparisonResponse.status === 429) console.warn(`Longcat AI API key hit rate limit for multi-comparison blog post. Trying next key.`);
      else break;
    }
    if (!blogPostMultiComparisonResponse || !blogPostMultiComparisonResponse.ok) {
      const errorData = blogPostMultiComparisonResponse ? await blogPostMultiComparisonResponse.json() : { message: "No response from Longcat AI" };
      console.error('Longcat AI Multi-Comparison Blog Post API error:', errorData);
      throw new Error(`Failed to generate multi-comparison blog post from Longcat AI: ${errorData.message}`);
    }
    const longcatDataBlogPost = await blogPostMultiComparisonResponse.json();
    if (!longcatDataBlogPost.choices || longcatDataBlogPost.choices.length === 0 || !longcatDataBlogPost.choices[0].message || !longcatDataBlogPost.choices[0].message.content) {
      console.error('Longcat AI Multi-Comparison Blog Post API returned unexpected structure:', longcatDataBlogPost);
      throw new Error('Longcat AI Multi-Comparison Blog Post API returned an empty or malformed response.');
    }
    const generatedMultiComparisonBlogPostContent = stripMarkdownFences(longcatDataBlogPost.choices[0].message.content);
    const generatedMultiComparisonBlogPost = JSON.parse(generatedMultiComparisonBlogPostContent);

    // --- Process Custom Comparative Questions ---
    let combinedCustomComparativeQaResults: { question: string; wordCount: number; answer: string }[] = [];
    if (customComparativeQuestions && customComparativeQuestions.length > 0) {
      for (const qa of customComparativeQuestions) {
        if (qa.question.trim() === "") continue;

        const customComparativeQuestionPrompt = `
          Based on the following analyses of multiple YouTube videos and the core multi-comparison data, answer the user's custom comparative question.

          ${combinedAnalysisContext}

          Core Multi-Comparison Data:
          ${JSON.stringify(coreMultiComparisonData, null, 2)}

          User's Comparative Question: "${qa.question}"
          
          Please provide an answer that is approximately ${qa.wordCount} words long. Your answer should primarily draw from the provided video analyses and core multi-comparison data. If the information is not present, indicate that. Ensure the answer is complete and directly addresses the question.
        `;

        let customQaResponse;
        for (const currentLongcatApiKey of longcatApiKeys) {
          customQaResponse = await fetch(longcatApiUrl, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentLongcatApiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: "LongCat-Flash-Chat",
              messages: [{ "role": "system", "content": "You are SentiVibe AI, an insightful and precise AI assistant specializing in multi-video comparative analysis. Your task is to answer specific user questions about a comparison between multiple YouTube video analyses. Your answers must be accurate, directly derived from the provided context, and strictly adhere to the requested word count. If the information is not present, indicate that. Ensure the answer is comprehensive within the word limit, providing a complete and well-structured response." }, { "role": "user", "content": customComparativeQuestionPrompt }],
              max_tokens: Math.ceil(qa.wordCount * 1.5),
              temperature: 0.5,
              stream: false,
            }),
          });
          if (customQaResponse.ok) break;
          else if (customQaResponse.status === 429) console.warn(`Longcat AI API key hit rate limit for custom multi-comparative QA. Trying next key.`);
          else break;
        }

        if (!customQaResponse || !customQaResponse.ok) {
          const errorData = customQaResponse ? await customQaResponse.json() : { message: "No response from Longcat AI" };
          console.error('Longcat AI Custom Multi-Comparative QA API error:', errorData);
          combinedCustomComparativeQaResults.push({ ...qa, answer: `Error generating answer: ${errorData.message || 'Unknown error'}` });
        } else {
          const customQaData = await customQaResponse.json();
          if (!customQaData.choices || customQaData.choices.length === 0 || !customQaData.choices[0].message || !customQaData.choices[0].message.content) {
            console.error('Longcat AI Custom Multi-Comparative QA API returned unexpected structure:', customQaData);
            combinedCustomComparativeQaResults.push({ ...qa, answer: `Error generating answer: AI returned empty or malformed response.` });
          } else {
            const answerContent = customQaData.choices[0].message.content;
            combinedCustomComparativeQaResults.push({ ...qa, answer: answerContent });
          }
        }
      }
    }

    // --- Step 4: Save Multi-Comparison to Database ---
    const now = new Date().toISOString();
    const { data: newMultiComparison, error: insertMultiCompError } = await supabaseClient
      .from('multi_comparisons')
      .insert({
        title: generatedMultiComparisonBlogPost.title,
        slug: generatedMultiComparisonBlogPost.slug,
        meta_description: generatedMultiComparisonBlogPost.meta_description,
        keywords: generatedMultiComparisonBlogPost.keywords,
        content: generatedMultiComparisonBlogPost.content,
        author_id: user?.id,
        created_at: now,
        updated_at: now,
        last_compared_at: now,
        comparison_data_json: coreMultiComparisonData,
        custom_comparative_qa_results: combinedCustomComparativeQaResults,
        overall_thumbnail_url: analyzedBlogPosts[0]?.thumbnail_url || null, // Use first video's thumbnail as overall
      })
      .select()
      .single();

    if (insertMultiCompError) {
      console.error('Supabase Multi-Comparison Insert Error:', insertMultiCompError);
      throw new Error(`Failed to save multi-comparison to database: ${insertMultiCompError.message}`);
    }

    // Insert into multi_comparison_videos junction table
    const multiComparisonVideosData = analyzedBlogPosts.map((bp, index) => ({
      multi_comparison_id: newMultiComparison.id,
      blog_post_id: bp.id,
      video_order: index,
    }));

    const { error: insertJunctionError } = await supabaseClient
      .from('multi_comparison_videos')
      .insert(multiComparisonVideosData);

    if (insertJunctionError) {
      console.error('Supabase Multi-Comparison Videos Insert Error:', insertJunctionError);
      throw new Error(`Failed to link videos to multi-comparison: ${insertJunctionError.message}`);
    }

    return new Response(JSON.stringify({
      message: `Successfully created multi-video comparison.`,
      id: newMultiComparison.id,
      title: newMultiComparison.title,
      slug: newMultiComparison.slug,
      meta_description: newMultiComparison.meta_description,
      keywords: newMultiComparison.keywords,
      content: newMultiComparison.content,
      created_at: newMultiComparison.created_at,
      last_compared_at: newMultiComparison.last_compared_at,
      comparison_data_json: newMultiComparison.comparison_data_json,
      custom_comparative_qa_results: newMultiComparison.custom_comparative_qa_results,
      overall_thumbnail_url: newMultiComparison.overall_thumbnail_url,
      videos: analyzedBlogPosts.map((bp, index) => ({
        blog_post_id: bp.id,
        video_order: index,
        title: bp.title,
        thumbnail_url: bp.thumbnail_url,
        original_video_link: bp.original_video_link,
        raw_comments_for_chat: bp.ai_analysis_json?.raw_comments_for_chat || [],
      })),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Edge Function error (multi-video-comparator):', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});