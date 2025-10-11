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

    const { videoLinkA, videoLinkB, customComparativeQuestions } = await req.json();

    if (!videoLinkA || !videoLinkB) {
      return new Response(JSON.stringify({ error: 'Both video links are required for comparison.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Extract video IDs
    const videoIdMatchA = videoLinkA.match(/(?:v=|\/videos\/|embed\/|youtu.be\/|\/v\/|\/e\/|watch\?v=|&v=)([^#&?]{11})/);
    const videoIdA = videoIdMatchA ? videoIdMatchA[1] : null;
    const videoIdMatchB = videoLinkB.match(/(?:v=|\/videos\/|embed\/|youtu.be\/|\/v\/|\/e\/|watch\?v=|&v=)([^#&?]{11})/);
    const videoIdB = videoIdMatchB ? videoIdMatchB[1] : null;

    if (!videoIdA || !videoIdB) {
      return new Response(JSON.stringify({ error: 'Invalid YouTube video link(s) provided.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // --- Step 1: Get individual video analysis data (from cache or re-analyze) ---
    const fetchIndividualAnalysis = async (videoId: string, videoLink: string) => {
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
        // Invoke the youtube-analyzer Edge Function
        const youtubeAnalyzerResponse = await supabaseClient.functions.invoke('youtube-analyzer', {
          body: { videoLink: videoLink, customQuestions: [], forceReanalyze: true }, // Force reanalyze to get latest data
        });

        if (youtubeAnalyzerResponse.error) {
          console.error(`Error invoking youtube-analyzer for ${videoId}:`, youtubeAnalyzerResponse.error);
          throw new Error(`Failed to analyze video ${videoId}: ${youtubeAnalyzerResponse.error.message}`);
        }
        // Fetch the newly updated/inserted blog post data
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
      return blogPostData;
    };

    const blogPostA = await fetchIndividualAnalysis(videoIdA, videoLinkA);
    const blogPostB = await fetchIndividualAnalysis(videoIdB, videoLinkB);

    if (!blogPostA || !blogPostB) {
      return new Response(JSON.stringify({ error: 'Could not retrieve full analysis for both videos.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // --- Step 2: Fetch External Context ---
    const longcatApiKeys = getApiKeys('LONGCAT_AI_API_KEY');
    if (longcatApiKeys.length === 0) {
      return new Response(JSON.stringify({ error: 'Longcat AI API key(s) not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const externalContextQuery = `${blogPostA.title} vs ${blogPostB.title} comparison`;
    const fetchExternalContextResponse = await supabaseClient.functions.invoke('fetch-external-context', {
      body: { query: externalContextQuery },
    });

    let externalContext = '';
    if (fetchExternalContextResponse.error) {
      console.warn("Error fetching external context for comparison:", fetchExternalContextResponse.error);
      // Continue without external context if there's an error
    } else {
      externalContext = fetchExternalContextResponse.data.externalSearchResults;
    }

    // --- Step 3: Longcat AI Calls for Comparative Insights ---
    const longcatApiUrl = "https://api.longcat.chat/openai/v1/chat/completions";

    const formatAnalysisForAI = (blogPost: any, label: string) => `
      --- Video ${label} Analysis ---
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
      --- End Video ${label} Analysis ---
    `;

    const combinedAnalysisContext = 
      formatAnalysisForAI(blogPostA, 'A') + 
      formatAnalysisForAI(blogPostB, 'B') +
      (externalContext ? `\n\n--- Recent External Information ---\n${externalContext}\n--- End External Information ---` : '');

    // --- AI Call for Core Comparison Data (Sentiment Delta, Emotional Tones, Themes, Weighted Influence, Keyword Diff) ---
    const coreComparisonPrompt = `
      Based on the following analyses of two YouTube videos (Video A and Video B), provide a structured comparison.
      Focus on quantitative differences and key shifts in audience reaction.

      ${combinedAnalysisContext}

      Generate a JSON object with the following structure:
      {
        "sentiment_delta": {
          "video_a_sentiment": "positive",
          "video_b_sentiment": "neutral",
          "delta_description": "Video B shows a -16% positive shift compared to Video A, indicating a more neutral overall reception."
        },
        "emotional_tone_breakdown": [
          {"emotion": "joy", "video_a_frequency": 0.3, "video_b_frequency": 0.15, "comparison": "Joy was twice as prevalent in Video A."},
          {"emotion": "anger", "video_a_frequency": 0.05, "video_b_frequency": 0.1, "comparison": "Anger doubled in Video B."},
          // ... other emotions
        ],
        "top_themes_intersection": {
          "common_themes": ["theme1", "theme2"],
          "unique_to_video_a": ["theme_a1"],
          "unique_to_video_b": ["theme_b1"],
          "summary_shift": "Viewers shifted from discussing cinematography in Video A to focusing on political context in Video B."
        },
        "weighted_influence_shift": "High-like comments in Video A were overwhelmingly positive toward the creator; in Video B, critical voices dominated popular comments.",
        "keyword_diff_summary": "The keyword 'amazing' dropped 70% in frequency from Video A to Video B, while 'controversial' increased by 50%."
      }
      Ensure all fields are populated with relevant data derived from the provided video analyses.
    `;

    let coreComparisonResponse;
    for (const currentLongcatApiKey of longcatApiKeys) {
      coreComparisonResponse = await fetch(longcatApiUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentLongcatApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "LongCat-Flash-Chat",
          messages: [{ "role": "system", "content": "You are SentiVibe AI, an expert in comparative video analysis. Your task is to meticulously compare two YouTube video analyses and extract key quantitative and qualitative differences in audience sentiment, emotional tones, themes, and keyword usage. Present your findings in a structured JSON format as specified, ensuring accuracy and conciseness. Focus on highlighting shifts and deltas between the two videos." }, { "role": "user", "content": coreComparisonPrompt }],
          max_tokens: 1500,
          temperature: 0.7,
          response_format: { type: "json_object" }
        }),
      });
      if (coreComparisonResponse.ok) break;
      else if (coreComparisonResponse.status === 429) console.warn(`Longcat AI API key hit rate limit for core comparison. Trying next key.`);
      else break;
    }
    if (!coreComparisonResponse || !coreComparisonResponse.ok) {
      const errorData = coreComparisonResponse ? await coreComparisonResponse.json() : { message: "No response from Longcat AI" };
      console.error('Longcat AI Core Comparison API error:', errorData);
      throw new Error(`Failed to get core comparison from Longcat AI: ${errorData.message}`);
    }
    const coreComparisonData = JSON.parse(coreComparisonResponse.choices[0].message.content);

    // --- AI Call for Comparative Blog Post Generation ---
    const blogPostComparisonPrompt = `
      Based on the detailed comparison of Video A ("${blogPostA.title}") and Video B ("${blogPostB.title}"), generate a comprehensive, SEO-optimized blog post for the SentiVibe platform. This post is intended for content creators and marketers seeking to understand comparative audience reactions.

      ${combinedAnalysisContext}

      Core Comparison Data:
      ${JSON.stringify(coreComparisonData, null, 2)}

      The blog post should:
      1. Have a compelling, SEO-optimized title (max 70 characters) in the format: "${blogPostA.title} vs ${blogPostB.title}: Audience Sentiment Comparison ({{Year}}) | SentiVibe".
      2. Generate a URL-friendly slug from the title (lowercase, hyphen-separated, **without any leading or trailing slashes or path segments**).
      3. Include a concise meta description (max 160 characters) summarizing the comparison.
      4. List 5-10 relevant keywords as an array, combining keywords from both videos and comparison terms.
      5. Be structured with an H1 (the title), H2s for sections, and H3s for sub-sections.
      6. Be at least 800 words long.
      7. Discuss the comparative sentiment delta, emotional tone breakdown, key themes intersection, and weighted influence shift, leveraging SentiVibe's AI insights.
      8. Incorporate insights from the core comparison data naturally to support the analysis.
      9. Conclude with a strong call to action, encouraging readers to use SentiVibe for their own video analysis and comparisons.
      10. Be written in Markdown format.

      Respond in a structured JSON format:
      {
        "title": "SEO Optimized Comparison Blog Post Title",
        "slug": "seo-optimized-comparison-blog-post-title",
        "meta_description": "A concise meta description for search engines.",
        "keywords": ["keyword1", "keyword2", "keyword3"],
        "content": "# H1 Title\\n\\nIntroduction...\\n\\n## H2 Section\\n\\nContent...\\n\\n### H3 Sub-section\\n\\nMore content...\\n\\n## Conclusion\\n\\nCall to action..."
      }
    `;

    let blogPostComparisonResponse;
    for (const currentLongcatApiKey of longcatApiKeys) {
      blogPostComparisonResponse = await fetch(longcatApiUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentLongcatApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "LongCat-Flash-Chat",
          messages: [{ "role": "system", "content": "You are SentiVibe AI, an expert SEO content strategist and writer specializing in comparative analysis. Your task is to generate a high-quality, detailed, and SEO-optimized blog post in Markdown format comparing two YouTube video analyses. The content must be engaging, insightful, and directly leverage the provided comparison data. Ensure the output is a valid, well-formed JSON object, strictly adhering to the provided schema, and ready for immediate publication. Avoid generic phrases or fluff; focus on actionable insights and clear, professional language. The blog post should be compelling and provide genuine value to the reader, encouraging them to explore SentiVibe further." }, { "role": "user", "content": blogPostComparisonPrompt }],
          max_tokens: 2500,
          temperature: 0.7,
          response_format: { type: "json_object" }
        }),
      });
      if (blogPostComparisonResponse.ok) break;
      else if (blogPostComparisonResponse.status === 429) console.warn(`Longcat AI API key hit rate limit for comparison blog post. Trying next key.`);
      else break;
    }
    if (!blogPostComparisonResponse || !blogPostComparisonResponse.ok) {
      const errorData = blogPostComparisonResponse ? await blogPostComparisonResponse.json() : { message: "No response from Longcat AI" };
      console.error('Longcat AI Comparison Blog Post API error:', errorData);
      throw new Error(`Failed to generate comparison blog post from Longcat AI: ${errorData.message}`);
    }
    const generatedComparisonBlogPost = JSON.parse(blogPostComparisonResponse.choices[0].message.content);

    // --- Process Custom Comparative Questions ---
    let combinedComparativeQaResults: { question: string; wordCount: number; answer: string }[] = [];
    if (customComparativeQuestions && customComparativeQuestions.length > 0) {
      for (const qa of customComparativeQuestions) {
        if (qa.question.trim() === "") continue;

        const customComparativeQuestionPrompt = `
          Based on the following analyses of two YouTube videos (Video A: "${blogPostA.title}" and Video B: "${blogPostB.title}"), and the core comparison data, answer the user's custom comparative question.

          ${combinedAnalysisContext}

          Core Comparison Data:
          ${JSON.stringify(coreComparisonData, null, 2)}

          User's Comparative Question: "${qa.question}"
          
          Please provide an answer that is approximately ${qa.wordCount} words long. Your answer should primarily draw from the provided video analyses and core comparison data. If the information is not present, indicate that. Ensure the answer is complete and directly addresses the question.
        `;

        let customQaResponse;
        for (const currentLongcatApiKey of longcatApiKeys) {
          customQaResponse = await fetch(longcatApiUrl, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentLongcatApiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: "LongCat-Flash-Chat",
              messages: [{ "role": "system", "content": "You are SentiVibe AI, an insightful and precise AI assistant specializing in comparative analysis. Your task is to answer specific user questions about a comparison between two YouTube video analyses. Your answers must be accurate, directly derived from the provided context, and strictly adhere to the requested word count. If the answer cannot be fully derived from the provided context, state this clearly and concisely. Do not speculate or introduce external information unless explicitly instructed. Ensure the answer is comprehensive within the word limit, providing a complete and well-structured response." }, { "role": "user", "content": customComparativeQuestionPrompt }],
              max_tokens: Math.ceil(qa.wordCount * 1.5),
              temperature: 0.5,
              stream: false,
            }),
          });
          if (customQaResponse.ok) break;
          else if (customQaResponse.status === 429) console.warn(`Longcat AI API key hit rate limit for custom comparative QA. Trying next key.`);
          else break;
        }

        if (!customQaResponse || !customQaResponse.ok) {
          const errorData = customQaResponse ? await customQaResponse.json() : { message: "No response from Longcat AI" };
          console.error('Longcat AI Custom Comparative QA API error:', errorData);
          combinedComparativeQaResults.push({ ...qa, answer: `Error generating answer: ${errorData.message || 'Unknown error'}` });
        } else {
          const customQaData = await customQaResponse.json();
          const answerContent = customQaData.choices[0].message.content;
          combinedComparativeQaResults.push({ ...qa, answer: answerContent });
        }
      }
    }

    // --- Step 4: Save Comparison to Database ---
    const now = new Date().toISOString();
    const { error: insertError } = await supabaseClient
      .from('comparisons')
      .insert({
        video_a_blog_post_id: blogPostA.id,
        video_b_blog_post_id: blogPostB.id,
        title: generatedComparisonBlogPost.title,
        slug: generatedComparisonBlogPost.slug,
        meta_description: generatedComparisonBlogPost.meta_description,
        keywords: generatedComparisonBlogPost.keywords,
        content: generatedComparisonBlogPost.content,
        author_id: user?.id,
        created_at: now,
        updated_at: now,
        last_compared_at: now,
        comparison_data_json: coreComparisonData,
        custom_comparative_qa_results: combinedComparativeQaResults,
      });

    if (insertError) {
      console.error('Supabase Comparison Insert Error:', insertError);
      throw new Error(`Failed to save comparison to database: ${insertError.message}`);
    }

    return new Response(JSON.stringify({
      message: `Successfully compared videos and generated insights.`,
      comparisonTitle: generatedComparisonBlogPost.title,
      comparisonSlug: generatedComparisonBlogPost.slug,
      comparisonMetaDescription: generatedComparisonBlogPost.meta_description,
      comparisonKeywords: generatedComparisonBlogPost.keywords,
      comparisonContent: generatedComparisonBlogPost.content,
      comparisonData: coreComparisonData,
      customComparativeQaResults: combinedComparativeQaResults,
      lastComparedAt: now,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Edge Function error (video-comparator):', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});