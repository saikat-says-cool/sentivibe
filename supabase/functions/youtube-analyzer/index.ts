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
  // Fallback to single key if numbered keys are not found
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

// Define tier limits
const UNAUTHENTICATED_LIMITS = {
  dailyAnalyses: 2,
  maxCustomQuestions: 1,
  maxCustomQuestionWordCount: 100,
};

const AUTHENTICATED_FREE_TIER_LIMITS = {
  dailyAnalyses: 5,
  maxCustomQuestions: 2,
  maxCustomQuestionWordCount: 150,
};

const PAID_TIER_LIMITS = {
  dailyAnalyses: 50,
  maxCustomQuestions: 5,
  maxCustomQuestionWordCount: 500,
};

serve(async (req: Request) => {
  // Handle CORS preflight request
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
    let currentLimits;
    let userSubscriptionId: string | null = null; // Will be user.id for authenticated, null for anon

    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const now = new Date();

    if (user) {
      userSubscriptionId = user.id;
      const { data: subscriptionData, error: subscriptionError } = await supabaseClient
        .from('subscriptions')
        .select('status, plan_id')
        .eq('id', user.id)
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error("Error fetching subscription for user:", user.id, subscriptionError);
        // Fallback to authenticated free tier if there's an error fetching subscription
        currentLimits = AUTHENTICATED_FREE_TIER_LIMITS;
      } else if (subscriptionData && subscriptionData.status === 'active' && subscriptionData.plan_id !== 'free') {
        currentLimits = PAID_TIER_LIMITS;
      } else {
        // User is authenticated but has a 'free' plan or no active paid subscription
        currentLimits = AUTHENTICATED_FREE_TIER_LIMITS;
      }
    } else {
      // Unauthenticated user
      userSubscriptionId = null; // Explicitly null for anon users
      currentLimits = UNAUTHENTICATED_LIMITS;
    }

    const longcatApiKeys = getApiKeys('LONGCAT_AI_API_KEY'); // Declared here

    const { videoLink, customQuestions, forceReanalyze } = await req.json();
    if (!videoLink) {
      return new Response(JSON.stringify({ error: 'Video link is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Extract video ID from the link
    const videoIdMatch = videoLink.match(/(?:v=|\/videos\/|embed\/|youtu.be\/|\/v\/|\/e\/|watch\?v=|&v=)([^#&?]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
      return new Response(JSON.stringify({ error: 'Invalid YouTube video link' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // --- Enforce Daily Analysis Limit (only for new analyses or forced re-analyses) ---
    // We only count against the limit if it's a new analysis or a forced re-analysis.
    // If it's a cached, fresh analysis without forceReanalyze, it doesn't count.
    let isNewAnalysisOrForcedReanalysis = false;

    const { data: existingBlogPost, error: _fetchError } = await supabaseClient
      .from('blog_posts')
      .select('*')
      .eq('video_id', videoId)
      .single();

    let shouldPerformFullReanalysis = false;

    if (existingBlogPost) {
      const lastReanalyzedDate = new Date(existingBlogPost.last_reanalyzed_at);
      const daysSinceLastReanalysis = (now.getTime() - lastReanalyzedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (forceReanalyze || daysSinceLastReanalysis > STALENESS_THRESHOLD_DAYS) {
        shouldPerformFullReanalysis = true;
        isNewAnalysisOrForcedReanalysis = true;
      } else {
        // If it's a fresh analysis, but new custom questions are added, it's not a full re-analysis
        // but we still need to process the new questions. This is handled later.
      }
    } else {
      shouldPerformFullReanalysis = true;
      isNewAnalysisOrForcedReanalysis = true;
    }

    if (isNewAnalysisOrForcedReanalysis) {
      if (user) { // Authenticated user limit check
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        let { count, error: countError } = await supabaseClient
          .from('blog_posts')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', twentyFourHoursAgo)
          .eq('author_id', user.id);

        if (countError) {
          console.error("Error counting daily analyses for authenticated user:", countError);
          return new Response(JSON.stringify({ error: 'Failed to check daily analysis limit.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }

        if (count !== null && count >= currentLimits.dailyAnalyses) {
          return new Response(JSON.stringify({ 
            error: `Daily analysis limit (${currentLimits.dailyAnalyses}) exceeded. ${currentLimits === PAID_TIER_LIMITS ? 'You have reached your paid tier limit.' : 'Upgrade to a paid tier for more analyses.'}` 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403,
          });
        }
      } else { // Unauthenticated user IP-based limit check
        let { data: anonUsage, error: anonError } = await supabaseClient
          .from('anon_usage')
          .select('*')
          .eq('ip_address', clientIp)
          .single();

        if (anonError && anonError.code !== 'PGRST116') {
          console.error("Error fetching anon usage for IP:", clientIp, anonError);
          return new Response(JSON.stringify({ error: 'Failed to check anonymous usage data.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }

        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        let currentAnalysesCount = 0;
        let lastResetAt = now.toISOString();

        if (anonUsage) {
          if (new Date(anonUsage.last_reset_at) < twentyFourHoursAgo) {
            // Reset counts if older than 24 hours
            currentAnalysesCount = 0;
            lastResetAt = now.toISOString();
          } else {
            currentAnalysesCount = anonUsage.analyses_count;
            lastResetAt = anonUsage.last_reset_at;
          }
        }

        if (currentAnalysesCount >= UNAUTHENTICATED_LIMITS.dailyAnalyses) { // Always use UNAUTHENTICATED_LIMITS for anon
          return new Response(JSON.stringify({ 
            error: `Daily analysis limit (${UNAUTHENTICATED_LIMITS.dailyAnalyses}) exceeded for your IP address. Upgrade to a paid tier for more analyses.` 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403,
          });
        }

        // Increment count and update anon_usage
        currentAnalysesCount++;
        const { error: updateAnonError } = await supabaseClient
          .from('anon_usage')
          .upsert({ 
            ip_address: clientIp, 
            analyses_count: currentAnalysesCount, 
            comparisons_count: anonUsage?.comparisons_count || 0, // Preserve other counts
            copilot_queries_count: anonUsage?.copilot_queries_count || 0, // Preserve other counts
            last_reset_at: lastResetAt,
            updated_at: now.toISOString(),
          }, { onConflict: 'ip_address' });

        if (updateAnonError) {
          console.error("Error updating anon usage for IP:", clientIp, updateAnonError);
          return new Response(JSON.stringify({ error: 'Failed to update anonymous usage data.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }
      }
    }

    // --- Enforce Custom Question Limits ---
    if (customQuestions && customQuestions.length > currentLimits.maxCustomQuestions) {
      return new Response(JSON.stringify({ 
        error: `You can only ask a maximum of ${currentLimits.maxCustomQuestions} custom question(s) per analysis. ${currentLimits === PAID_TIER_LIMITS ? '' : 'Upgrade to a paid tier to ask more questions.'}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    if (customQuestions) {
      for (const qa of customQuestions) {
        if (qa.wordCount > currentLimits.maxCustomQuestionWordCount) {
          return new Response(JSON.stringify({ 
            error: `Maximum word count for a custom question answer is ${currentLimits.maxCustomQuestionWordCount}. ${currentLimits === PAID_TIER_LIMITS ? '' : 'Upgrade to a paid tier for longer answers.'}` 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403,
          });
        }
      }
    }

    let videoTitle: string;
    let videoDescription: string;
    let videoThumbnailUrl: string;
    let videoTags: string[];
    let creatorName: string;
    let videoSubtitles: string = '';
    let allFetchedCommentsText: string[];
    let aiAnalysis: any;
    let blogPostSlug: string;
    let originalVideoLink: string;
    let combinedQaResults: { question: string; wordCount: number; answer: string }[] = [];
    let lastReanalyzedAt: string;

    if (existingBlogPost && !shouldPerformFullReanalysis) {
      console.log(`Reusing existing analysis for video ID: ${videoId}. Analysis is fresh.`);
      videoTitle = existingBlogPost.title;
      videoDescription = existingBlogPost.meta_description;
      videoThumbnailUrl = existingBlogPost.thumbnail_url;
      videoTags = existingBlogPost.keywords || [];
      creatorName = existingBlogPost.creator_name;
      allFetchedCommentsText = existingBlogPost.ai_analysis_json?.raw_comments_for_chat || [];
      aiAnalysis = existingBlogPost.ai_analysis_json;
      blogPostSlug = existingBlogPost.slug;
      originalVideoLink = existingBlogPost.original_video_link;
      combinedQaResults = existingBlogPost.custom_qa_results || [];
      lastReanalyzedAt = existingBlogPost.last_reanalyzed_at;
    } else {
      console.log(`Performing full analysis for video ID: ${videoId}. Should re-analyze: ${shouldPerformFullReanalysis}`);

      // Access the YouTube API Keys from Supabase Secrets
      const youtubeApiKeys = getApiKeys('YOUTUBE_API_KEY');
      if (youtubeApiKeys.length === 0) {
        return new Response(JSON.stringify({ error: 'YouTube API key(s) not configured' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      // --- Fetch Video Details (Title, Description, Thumbnails, Tags, Channel Title) ---
      let videoDetailsResponse;
      for (const currentYoutubeApiKey of youtubeApiKeys) {
        const videoDetailsApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${currentYoutubeApiKey}`;
        videoDetailsResponse = await fetch(videoDetailsApiUrl);
        if (videoDetailsResponse.ok) {
          break;
        } else if (videoDetailsResponse.status === 403 || videoDetailsResponse.status === 429) {
          const errorData = await videoDetailsResponse.json();
          if (errorData.error?.errors?.[0]?.reason === 'quotaExceeded') {
            console.warn(`YouTube API key ${currentYoutubeApiKey} hit quota limit for video details. Trying next key.`);
            continue;
          }
        }
        break;
      }

      if (!videoDetailsResponse || !videoDetailsResponse.ok) {
        const errorData = videoDetailsResponse ? await videoDetailsResponse.json() : { message: "No response from YouTube API" };
        console.error('YouTube Video Details API error:', errorData);
        return new Response(JSON.stringify({ error: 'Failed to fetch video details from YouTube API', details: errorData }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: videoDetailsResponse?.status || 500,
        });
      }
      const videoDetailsData = await videoDetailsResponse.json();
      const videoSnippet = videoDetailsData.items?.[0]?.snippet;

      videoTitle = videoSnippet?.title || 'Unknown Title';
      videoDescription = videoSnippet?.description || 'No description available.';
      videoThumbnailUrl = videoSnippet?.thumbnails?.high?.url || videoSnippet?.thumbnails?.medium?.url || '';
      videoTags = videoSnippet?.tags || [];
      creatorName = videoSnippet?.channelTitle || 'Unknown Creator';

      // --- Fetch Comments ---
      let youtubeCommentsResponse;
      for (const currentYoutubeApiKey of youtubeApiKeys) {
        const youtubeCommentsApiUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${currentYoutubeApiKey}&maxResults=100`;
        youtubeCommentsResponse = await fetch(youtubeCommentsApiUrl);
        if (youtubeCommentsResponse.ok) {
          break;
        } else if (youtubeCommentsResponse.status === 403 || youtubeCommentsResponse.status === 429) {
          const errorData = await youtubeCommentsResponse.json();
          if (errorData.error?.errors?.[0]?.reason === 'quotaExceeded') {
            console.warn(`YouTube API key ${currentYoutubeApiKey} hit quota limit for comments. Trying next key.`);
            continue;
          }
        }
        break;
      }

      if (!youtubeCommentsResponse || !youtubeCommentsResponse.ok) {
        const errorData = youtubeCommentsResponse ? await youtubeCommentsResponse.json() : { message: "No response from YouTube Comments API" };
        console.error('YouTube Comments API error:', errorData);
        return new Response(JSON.stringify({ error: 'Failed to fetch comments from YouTube API', details: errorData }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: youtubeCommentsResponse?.status || 500,
        });
      }

      const youtubeCommentsData = await youtubeCommentsResponse.json();
      let commentsWithLikes = youtubeCommentsData.items
        ? youtubeCommentsData.items.map((item: any) => ({
            text: item.snippet.topLevelComment.snippet.textOriginal,
            likeCount: item.snippet.topLevelComment.snippet.likeCount,
          }))
        : [];

      if (commentsWithLikes.length < 50) {
        return new Response(JSON.stringify({ error: `Video must have at least 50 comments to proceed with analysis. This video has ${commentsWithLikes.length} comments.` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      commentsWithLikes.sort((a: any, b: any) => b.likeCount - a.likeCount);
      const formattedCommentsForAI = commentsWithLikes.map((comment: any) => `(Likes: ${comment.likeCount}) ${comment.text}`);
      allFetchedCommentsText = commentsWithLikes.map((comment: any) => comment.text);

      let longcatPrompt = `Analyze the following YouTube video content.
      Crucially, when assessing sentiment, emotional tones, and key themes, give **significantly more weight and importance to comments that have a higher 'Likes' counts**. This ensures the analysis reflects the sentiment of the most popular and influential opinions within the comment section.
      
      Video Title: "${videoTitle}"
      Video Description: "${videoDescription}"
      Video Creator: "${creatorName}"
      Video Tags: ${videoTags.length > 0 ? videoTags.join(', ') : 'None'}

      Respond in a structured JSON format.

      Example JSON format:
      {
        "overall_sentiment": "positive",
        "emotional_tones": ["joy", "excitement"],
        "key_themes": ["product review", "user experience"],
        "summary_insights": "The comments are overwhelmingly positive, highlighting the product's ease of use and innovative features, with popular comments strongly influencing this assessment. The video's content, as described in the subtitles, aligns with these sentiments."
      }

      YouTube Comments:\n\n${formattedCommentsForAI.join('\n')}`;

      longcatPrompt += `\n\nNote: Subtitles were not available for this video. Please base your analysis solely on the comments, video title, description, tags, and creator name.`;

      // Check longcatApiKeys here, as it's needed for the main AI analysis and blog post generation
      if (longcatApiKeys.length === 0) {
        return new Response(JSON.stringify({ error: 'Longcat AI API key(s) not configured' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      let longcatResponse;
      const longcatApiUrl = "https://api.longcat.chat/openai/v1/chat/completions";
      for (const currentLongcatApiKey of longcatApiKeys) {
        longcatResponse = await fetch(longcatApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentLongcatApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "LongCat-Flash-Chat",
            messages: [
              { "role": "system", "content": `You are SentiVibe AI, an advanced sentiment analysis engine with data-science credibility. Your primary task is to objectively analyze YouTube video comments, prioritizing those with higher 'Likes' counts to reflect influential audience sentiment. Generate a comprehensive summary including overall sentiment, specific emotional tones, key discussion themes, and actionable insights. Your analysis must be factual, transparent, and avoid conversational filler. The output must be a valid, well-formed JSON object, strictly adhering to the provided schema. Focus on providing a nuanced understanding of the audience's reaction, explaining *why* certain sentiments or themes are dominant based on the weighted comments.` },
              { "role": "user", "content": longcatPrompt }
            ],
            max_tokens: 1000,
            temperature: 0.7,
            response_format: { type: "json_object" }
          }),
        });

        if (longcatResponse.ok) {
          break;
        } else if (longcatResponse.status === 429) {
          console.warn(`Longcat AI API key ${currentLongcatApiKey} hit quota limit for analysis. Trying next key.`);
          continue;
        }
        break;
      }

      if (!longcatResponse || !longcatResponse.ok) {
        const errorData = longcatResponse ? await longcatResponse.json() : { message: "No response from Longcat AI" };
        console.error('Longcat AI API error:', errorData);
        return new Response(JSON.stringify({ error: 'Failed to get analysis from Longcat AI', details: errorData }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: longcatResponse?.status || 500,
        });
      }

      const longcatData = await longcatResponse.json();
      let aiContent = longcatData.choices[0].message.content;

      if (aiContent.startsWith('```json') && aiContent.endsWith('```')) {
        aiContent = aiContent.substring(7, aiContent.length - 3).trim();
      }

      aiAnalysis = JSON.parse(aiContent);

      // --- Generate SEO-optimized blog post ---
      const blogPostPrompt = `Based on the following YouTube video analysis, generate a comprehensive, SEO-optimized blog post for the SentiVibe platform. This post is intended for content creators and marketers seeking to understand audience reactions.
      
      Video Title: "${videoTitle}"
      Video Description: "${videoDescription}"
      Video Creator: "${creatorName}"
      Video Tags: ${videoTags.length > 0 ? videoTags.join(', ') : 'None'}
      Overall Sentiment: ${aiAnalysis.overall_sentiment}
      Emotional Tones: ${aiAnalysis.emotional_tones.join(', ')}
      Key Themes: ${aiAnalysis.key_themes.join(', ')}
      Summary Insights: ${aiAnalysis.summary_insights}
      Top Comments (for reference, do not list all):
      ${allFetchedCommentsText.slice(0, 5).map((comment: string, _index: number) => `- ${comment}`).join('\n')}

      The blog post should:
      1. Have a compelling, SEO-optimized title (max 70 characters).
      2. Generate a URL-friendly slug from the title (lowercase, hyphen-separated, **without any leading or trailing slashes or path segments**).
      3. Include a concise meta description (max 160 characters).
      4. List 5-10 relevant keywords as an array.
      5. Be structured with an H1 (the title), H2s for sections, and H3s for sub-sections.
      6. Be at least 500 words long.
      7. Discuss the public sentiment, emotional tones, and key themes of the video, leveraging SentiVibe's AI insights.
      8. Incorporate insights from the summary and reference the top comments naturally to support the analysis.
      9. Conclude with a strong call to action, encouraging readers to use SentiVibe for their own video analysis.
      10. Be written in Markdown format.

      Respond in a structured JSON format:
      {
        "title": "SEO Optimized Blog Post Title",
        "slug": "seo-optimized-blog-post-title",
        "meta_description": "A concise meta description for search engines.",
        "keywords": ["keyword1", "keyword2", "keyword3"],
        "content": "# H1 Title\\n\\nIntroduction...\\n\\n## H2 Section\\n\\nContent...\\n\\n### H3 Sub-section\\n\\nMore content...\\n\\n## Conclusion\\n\\nCall to action..."
      }
      `;

      let blogPostResponse;
      for (const currentLongcatApiKey of longcatApiKeys) {
        blogPostResponse = await fetch(longcatApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentLongcatApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "LongCat-Flash-Chat",
            messages: [
              { "role": "system", "content": `You are SentiVibe AI, an expert SEO content strategist and writer. Your task is to generate a high-quality, detailed, and SEO-optimized blog post in Markdown format. This post will be published on the SentiVibe platform to inform content creators and marketers about YouTube audience sentiment. The content must be engaging, insightful, and directly leverage the provided video analysis data. Ensure the output is a valid, well-formed JSON object, strictly adhering to the provided schema, and ready for immediate publication. Avoid generic phrases or fluff; focus on actionable insights and clear, professional language. The blog post should be compelling and provide genuine value to the reader, encouraging them to explore SentiVibe further.` },
              { "role": "user", "content": blogPostPrompt }
            ],
            max_tokens: 2000,
            temperature: 0.7,
            response_format: { type: "json_object" }
          }),
        });

        if (blogPostResponse.ok) {
          break;
        } else if (blogPostResponse.status === 429) {
          console.warn(`Longcat AI API key ${currentLongcatApiKey} hit quota limit for blog post generation. Trying next key.`);
          continue;
        }
        break;
      }

      if (!blogPostResponse || !blogPostResponse.ok) {
        const errorData = blogPostResponse ? await blogPostResponse.json() : { message: "No response from Longcat AI for blog post" };
        console.error('Longcat AI Blog Post API error:', errorData);
        return new Response(JSON.stringify({ error: 'Failed to generate blog post from Longcat AI', details: errorData }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: blogPostResponse?.status || 500,
        });
      }

      const blogPostData = await blogPostResponse.json();
      let blogPostContent = blogPostData.choices[0].message.content;

      if (blogPostContent.startsWith('```json') && blogPostContent.endsWith('```')) {
        blogPostContent = blogPostContent.substring(7, blogPostContent.length - 3).trim();
      }
      const generatedBlogPost = JSON.parse(blogPostContent);

      console.log("Generated Blog Post Slug:", generatedBlogPost.slug);
      blogPostSlug = generatedBlogPost.slug;
      originalVideoLink = videoLink;
      lastReanalyzedAt = now.toISOString();

      if (existingBlogPost) {
        combinedQaResults = existingBlogPost.custom_qa_results || [];
      }

      if (customQuestions && customQuestions.length > 0) {
        // Also check longcatApiKeys here, as it's needed for custom QA
        if (longcatApiKeys.length === 0) {
          return new Response(JSON.stringify({ error: 'Longcat AI API key(s) not configured' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }
        for (const qa of customQuestions) {
          if (qa.question.trim() === "") continue;

          const customQuestionPrompt = `Based on the following YouTube video analysis, answer the user's custom question.
          
          --- Video Analysis Context ---
          Video Title: "${videoTitle}"
          Video Description: "${videoDescription}"
          Video Creator: "${creatorName}"
          Video Tags: ${videoTags.length > 0 ? videoTags.join(', ') : 'None'}
          Overall Sentiment: ${aiAnalysis.overall_sentiment}
          Emotional Tones: ${aiAnalysis.emotional_tones.join(', ')}
          Key Themes: ${aiAnalysis.key_themes.join(', ')}
          Summary Insights: ${aiAnalysis.summary_insights}
          --- End Video Analysis Context ---

          --- Top Comments (for reference) ---
          ${allFetchedCommentsText.slice(0, 10).map((comment: string, _index: number) => `- ${comment}`).join('\n')}
          --- End Top Comments ---

          User's Question: "${qa.question}"
          
          Please provide an answer that is approximately ${qa.wordCount} words long. Your answer should primarily draw from the 'Video Analysis Context' and 'Top Comments' provided. If the information is not present, indicate that. Ensure the answer is complete and directly addresses the question.
          `;

          let customQaResponse;
          for (const currentLongcatApiKey of longcatApiKeys) {
            customQaResponse = await fetch(longcatApiUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${currentLongcatApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: "LongCat-Flash-Chat",
                messages: [
                  { "role": "system", "content": `You are SentiVibe AI, an insightful and precise AI assistant. Your task is to answer specific user questions about a YouTube video analysis. Your answers must be accurate, directly derived from the provided 'Video Analysis Context' and 'Top Comments', and strictly adhere to the requested word count. If the answer cannot be fully derived from the provided context, state this clearly and concisely. Do not speculate or introduce external information unless explicitly instructed. Ensure the answer is comprehensive within the word limit, providing a complete and well-structured response. Format your answers for clarity, using bullet points or bolding where appropriate.` },
                  { "role": "user", "content": customQuestionPrompt }
                ],
                max_tokens: Math.ceil(qa.wordCount * 1.5),
                temperature: 0.5,
                stream: false,
              }),
            });

            if (customQaResponse.ok) {
              break;
            } else if (customQaResponse.status === 429) {
              console.warn(`Longcat AI API key ${currentLongcatApiKey} hit rate limit for custom QA. Trying next key.`);
              continue;
            }
            break;
          }

          if (!customQaResponse || !customQaResponse.ok) {
            const errorData = customQaResponse ? await customQaResponse.json() : { message: "No response from Longcat AI for custom question" };
            console.error('Longcat AI Custom QA API error:', errorData);
            combinedQaResults.push({ ...qa, answer: `Error generating answer: ${errorData.message || 'Unknown error'}` });
          } else {
            const customQaData = await customQaResponse.json();
            const answerContent = customQaData.choices[0].message.content;
            combinedQaResults.push({ ...qa, answer: answerContent });
          }
        }
      }

      if (existingBlogPost) {
        const { error: updateError } = await supabaseClient
          .from('blog_posts')
          .update({
            title: generatedBlogPost.title,
            slug: generatedBlogPost.slug,
            meta_description: generatedBlogPost.meta_description,
            keywords: generatedBlogPost.keywords,
            content: generatedBlogPost.content,
            creator_name: creatorName,
            thumbnail_url: videoThumbnailUrl,
            original_video_link: videoLink,
            ai_analysis_json: {
              ...aiAnalysis,
              raw_comments_for_chat: allFetchedCommentsText.slice(0, 10),
            },
            custom_qa_results: combinedQaResults,
            last_reanalyzed_at: lastReanalyzedAt,
            updated_at: now.toISOString(),
          })
          .eq('id', existingBlogPost.id);

        if (updateError) {
          console.error('Supabase Blog Post Update Error during re-analysis:', updateError);
          return new Response(JSON.stringify({ error: 'Failed to update blog post during re-analysis', details: updateError }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }
      } else {
        const { error: insertError } = await supabaseClient
          .from('blog_posts')
          .insert({
            video_id: videoId,
            title: generatedBlogPost.title,
            slug: generatedBlogPost.slug,
            meta_description: generatedBlogPost.meta_description,
            keywords: generatedBlogPost.keywords,
            content: generatedBlogPost.content,
            published_at: now.toISOString(),
            author_id: userSubscriptionId, // Use userSubscriptionId (null for anon)
            creator_name: creatorName,
            thumbnail_url: videoThumbnailUrl,
            original_video_link: videoLink,
            ai_analysis_json: {
              ...aiAnalysis,
              raw_comments_for_chat: allFetchedCommentsText.slice(0, 10),
            },
            custom_qa_results: combinedQaResults,
            last_reanalyzed_at: lastReanalyzedAt,
            updated_at: now.toISOString(),
          });

        if (insertError) {
          console.error('Supabase Blog Post Insert Error:', insertError);
          return new Response(JSON.stringify({ error: 'Failed to save blog post to database', details: insertError }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }
      }
    }

    return new Response(JSON.stringify({
      message: `Successfully fetched comments and performed AI analysis for video ID: ${videoId}`,
      videoTitle: videoTitle,
      videoDescription: videoDescription,
      videoThumbnailUrl: videoThumbnailUrl,
      videoTags: videoTags,
      creatorName: creatorName,
      videoSubtitles: videoSubtitles,
      comments: allFetchedCommentsText,
      aiAnalysis: aiAnalysis,
      blogPostSlug: blogPostSlug,
      originalVideoLink: originalVideoLink,
      customQaResults: combinedQaResults,
      lastReanalyzedAt: lastReanalyzedAt,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: unknown) {
    console.error('Edge Function error:', (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});