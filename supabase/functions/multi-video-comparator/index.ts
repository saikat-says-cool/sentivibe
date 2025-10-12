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

// Define simplified tier limits for multi-comparisons
const MULTICOMP_UNAUTHENTICATED_LIMITS = {
  dailyComparisons: 1, // 1 comparison per day for unauthenticated users
};

const MULTICOMP_AUTHENTICATED_FREE_TIER_LIMITS = {
  dailyComparisons: 1, // 1 comparison per day for authenticated free users
};

const MULTICOMP_PAID_TIER_LIMITS = {
  dailyComparisons: 20, // 20 comparisons per day for paid users (effectively unlimited)
};

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

// Helper function to generate a unique slug
async function generateUniqueSlug(supabaseClient: any, baseSlug: string): Promise<string> {
  let uniqueSlug = baseSlug;
  let counter = 0;
  while (true) {
    const { data: _data, error } = await supabaseClient // Renamed 'data' to '_data'
      .from('multi_comparisons')
      .select('slug')
      .eq('slug', uniqueSlug)
      .single();

    if (error && error.code === 'PGRST116') { // PGRST116 means no rows found, so slug is unique
      return uniqueSlug;
    } else if (error) {
      console.error("Error checking slug uniqueness:", error);
      throw new Error(`Failed to check slug uniqueness: ${error.message}`);
    }

    // Slug exists, append a random string or counter
    counter++;
    uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`; // Append random string
    if (counter > 5) { // Fallback to counter if random fails multiple times
      uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-5)}`;
    }
  }
}

serve(async (req: Request) => {
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
    let userSubscriptionId: string | null = null;

    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const now = new Date();

    if (user) {
      userSubscriptionId = user.id;
      const { data: subscriptionData, error: subscriptionError } = await supabaseClient
        .from('subscriptions')
        .select('status, plan_id')
        .eq('id', user.id)
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        console.error("Error fetching subscription for user:", user.id, subscriptionError);
        currentLimits = MULTICOMP_AUTHENTICATED_FREE_TIER_LIMITS; // Fallback
      } else if (subscriptionData && subscriptionData.status === 'active' && subscriptionData.plan_id !== 'free') {
        currentLimits = MULTICOMP_PAID_TIER_LIMITS;
      } else {
        currentLimits = MULTICOMP_AUTHENTICATED_FREE_TIER_LIMITS;
      }
    } else {
      userSubscriptionId = null;
      currentLimits = MULTICOMP_UNAUTHENTICATED_LIMITS;
    }

    const longcatApiKeys = getApiKeys('LONGCAT_AI_API_KEY'); // Declared here
    const longcatApiUrl = "https://api.longcat.chat/openai/v1/chat/completions"; // Declared here

    const { videoLinks, customComparativeQuestions, forceRecompare } = await req.json();

    if (!videoLinks || !Array.isArray(videoLinks) || videoLinks.length < 2) {
      return new Response(JSON.stringify({ error: 'At least two video links are required for multi-comparison.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const videoIds = videoLinks.map(videoLink => {
      const videoIdMatch = videoLink.match(/(?:v=|\/videos\/|embed\/|youtu.be\/|\/v\/|\/e\/|watch\?v=|&v=)([^#&?]{11})/);
      return videoIdMatch ? videoIdMatch[1] : null;
    });

    if (videoIds.some(id => !id)) {
      return new Response(JSON.stringify({ error: 'Invalid YouTube video link(s) provided.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // --- Check for existing multi-comparison and determine if re-comparison is needed ---
    let existingMultiComparison: any = null;
    const blogPostIds = []; // Collect blog post IDs after individual analysis

    // First, ensure all individual videos are analyzed/fresh and collect their blog_post_ids
    const analyzedBlogPosts: any[] = [];
    const videoTitles: string[] = [];
    const videoKeywords: string[] = [];

    for (const videoLink of videoLinks) {
      const videoIdMatch = videoLink.match(/(?:v=|\/videos\/|embed\/|youtu.be\/|\/v\/|\/e\/|watch\?v=|&v=)([^#&?]{11})/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;

      const { data: existingBlogPost, error: _fetchError } = await supabaseClient
        .from('blog_posts')
        .select('*')
        .eq('video_id', videoId)
        .single();

      let shouldPerformIndividualReanalysis = false;
      let blogPostData: any;

      if (existingBlogPost) {
        const lastReanalyzedDate = new Date(existingBlogPost.last_reanalyzed_at);
        const daysSinceLastReanalysis = (now.getTime() - lastReanalyzedDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLastReanalysis > STALENESS_THRESHOLD_DAYS) {
          shouldPerformIndividualReanalysis = true;
        } else {
          blogPostData = existingBlogPost;
        }
      } else {
        shouldPerformIndividualReanalysis = true;
      }

      if (shouldPerformIndividualReanalysis) {
        const youtubeAnalyzerResponse = await supabaseClient.functions.invoke('youtube-analyzer', {
          body: { videoLink: videoLink, customQuestions: [], forceReanalyze: true, isInternalCall: true }, // Pass isInternalCall: true
        });

        if (youtubeAnalyzerResponse.error) {
          console.error(`Error invoking youtube-analyzer for ${videoId}:`, youtubeAnalyzerResponse.error);
          const errorContextResponse = youtubeAnalyzerResponse.error.context as Response; // Cast to Response
          let errorMessage = `Edge Function returned status ${errorContextResponse.status}`;

          if (errorContextResponse) {
            try {
              // Clone the response body as it can only be read once
              const clonedResponse = errorContextResponse.clone();
              const errorBody = await clonedResponse.json();
              if (errorBody && errorBody.error) {
                errorMessage = errorBody.error; // Use the specific error message from youtube-analyzer
              } else {
                errorMessage = `youtube-analyzer returned status ${errorContextResponse.status} but its error message could not be parsed.`;
              }
            } catch (jsonError) {
              console.error(`Failed to parse youtube-analyzer error response body for ${videoId}:`, jsonError);
              errorMessage = `youtube-analyzer returned status ${errorContextResponse.status} but its error message could not be parsed.`;
            }
          }
          // Propagate the specific error message
          throw new Error(`Failed to analyze video ${videoId}: ${errorMessage}`);
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
      blogPostIds.push(blogPostData.id); // Collect IDs here
      videoTitles.push(blogPostData.title);
      if (blogPostData.keywords) {
        videoKeywords.push(...blogPostData.keywords);
      }
    }

    // Now that all individual videos are fresh, check multi-comparison staleness
    const sortedBlogPostIds = blogPostIds.sort();

    const { data: existingMultiComps, error: fetchMultiCompError } = await supabaseClient
      .from('multi_comparison_videos')
      .select('multi_comparison_id')
      .in('blog_post_id', sortedBlogPostIds);

    if (fetchMultiCompError) {
      console.error("Error fetching existing multi-comparison videos:", fetchMultiCompError);
      throw new Error(`Failed to check for existing multi-comparison: ${fetchMultiCompError.message}`);
    }

    const multiCompIdCounts = new Map<string, number>();
    for (const row of existingMultiComps) {
      multiCompIdCounts.set(row.multi_comparison_id, (multiCompIdCounts.get(row.multi_comparison_id) || 0) + 1);
    }

    let foundMultiComparisonId: string | null = null;
    for (const [mcId, count] of multiCompIdCounts.entries()) {
      if (count === sortedBlogPostIds.length) {
        const { data: mcVideos, error: mcVideosError } = await supabaseClient
          .from('multi_comparison_videos')
          .select('blog_post_id')
          .eq('multi_comparison_id', mcId);

        if (mcVideosError) {
          console.error("Error fetching multi-comparison videos for verification:", mcVideosError);
          continue;
        }

        const existingMcBlogPostIds = mcVideos.map((v: any) => v.blog_post_id).sort();
        if (existingMcBlogPostIds.length === sortedBlogPostIds.length && existingMcBlogPostIds.every((val: string, idx: number) => val === sortedBlogPostIds[idx])) {
          foundMultiComparisonId = mcId;
          break;
        }
      }
    }

    if (foundMultiComparisonId) {
      const { data: mcData, error: mcDataError } = await supabaseClient
        .from('multi_comparisons')
        .select('*')
        .eq('id', foundMultiComparisonId)
        .single();
      
      if (mcDataError) {
        console.error("Error fetching existing multi-comparison data:", mcDataError);
        throw new Error(`Failed to retrieve existing multi-comparison data: ${mcDataError.message}`);
      }
      existingMultiComparison = mcData;
    }

    let coreMultiComparisonData: any;
    let generatedMultiComparisonBlogPost: any;
    let combinedCustomComparativeQaResults: { question: string; wordCount: number; answer: string }[] = [];
    let lastComparedAt = now.toISOString();

    let shouldRegenerateMultiComparison = false;
    let isNewComparison = false;

    if (existingMultiComparison) {
      const lastComparedDate = new Date(existingMultiComparison.last_compared_at);
      const daysSinceLastCompared = (now.getTime() - lastComparedDate.getTime()) / (1000 * 60 * 60 * 24);

      if (forceRecompare || daysSinceLastCompared > STALENESS_THRESHOLD_DAYS) {
        shouldRegenerateMultiComparison = true;
      } else {
        coreMultiComparisonData = existingMultiComparison.comparison_data_json;
        generatedMultiComparisonBlogPost = {
          title: existingMultiComparison.title,
          slug: existingMultiComparison.slug,
          meta_description: existingMultiComparison.meta_description,
          keywords: existingMultiComparison.keywords,
          content: existingMultiComparison.content,
        };
        combinedCustomComparativeQaResults = existingMultiComparison.custom_comparative_qa_results || [];
        lastComparedAt = existingMultiComparison.last_compared_at;
      }
    } else {
      shouldRegenerateMultiComparison = true;
      isNewComparison = true;
    }

    // --- Enforce Daily Comparison Limit (only for new comparisons or forced re-comparisons) ---
    if (shouldRegenerateMultiComparison) {
      if (user) { // Authenticated user limit check
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        let { count, error: countError } = await supabaseClient
          .from('multi_comparisons')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', twentyFourHoursAgo)
          .eq('author_id', user.id);

        if (countError) {
          console.error("Error counting daily multi-comparisons for authenticated user:", countError);
          return new Response(JSON.stringify({ error: 'Failed to check daily comparison limit.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }

        if (count !== null && count >= currentLimits.dailyComparisons) {
          return new Response(JSON.stringify({ 
            error: `Daily multi-comparison limit (${currentLimits.dailyComparisons}) exceeded. ${currentLimits === MULTICOMP_PAID_TIER_LIMITS ? 'You have reached your paid tier limit.' : 'Upgrade to a paid tier for more comparisons.'}` 
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
        let currentComparisonsCount = 0;
        let lastResetAt = now.toISOString();

        if (anonUsage) {
          if (new Date(anonUsage.last_reset_at) < twentyFourHoursAgo) {
            // Reset counts if older than 24 hours
            currentComparisonsCount = 0;
            lastResetAt = now.toISOString();
          } else {
            currentComparisonsCount = anonUsage.comparisons_count;
            lastResetAt = anonUsage.last_reset_at;
          }
        }

        if (currentComparisonsCount >= MULTICOMP_UNAUTHENTICATED_LIMITS.dailyComparisons) {
          return new Response(JSON.stringify({ 
            error: `Daily multi-comparison limit (${MULTICOMP_UNAUTHENTICATED_LIMITS.dailyComparisons}) exceeded for your IP address. Upgrade to a paid tier for more comparisons.` 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403,
          });
        }

        // Increment count and update anon_usage
        currentComparisonsCount++;
        const { error: updateAnonError } = await supabaseClient
          .from('anon_usage')
          .upsert({ 
            ip_address: clientIp, 
            analyses_count: anonUsage?.analyses_count || 0, // Preserve other counts
            comparisons_count: currentComparisonsCount, 
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

    // --- Removed Custom Comparative Question Limits Enforcement ---
    // All custom comparative questions are now unlimited in count and word count.

    // --- Step 2: Fetch External Context (only if regenerating multi-comparison or new questions) --- (REMOVED)
    let externalContext = ''; // externalContext will now always be empty
    // if (shouldRegenerateMultiComparison || (customComparativeQuestions && customComparativeQuestions.length > 0)) {
    //   const externalContextQuery = `${videoTitles.join(' ')} multi-video comparison`;
    //   const fetchExternalContextResponse = await supabaseClient.functions.invoke('fetch-external-context', {
    //     body: { query: externalContextQuery },
    //   });

    //   if (fetchExternalContextResponse.error) {
    //     console.warn("Error fetching external context for multi-comparison:", fetchExternalContextResponse.error);
    //   } else {
    //     externalContext = fetchExternalContextResponse.data.externalSearchResults;
    //   }
    // }

    // --- Step 3: Longcat AI Calls for Multi-Comparative Insights (if regenerating) ---
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
      ${blogPost.ai_analysis_json?.raw_comments_for_chat ? blogPost.ai_analysis_json.raw_comments_for_chat.slice(0, 5).map((c: string, _index: number) => `${_index + 1}. ${c}`).join('\n') : 'No comments available.'}
      --- End Video ${index + 1} Analysis ---
    `;

    const combinedAnalysisContext = analyzedBlogPosts.map((bp, i) => formatAnalysisForAI(bp, i)).join('\n') +
      (externalContext ? `\n\n--- Recent External Information ---\n${externalContext}\n--- End External Information ---` : ''); // externalContext will be empty

    if (shouldRegenerateMultiComparison) {
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

      if (longcatApiKeys.length === 0) {
        return new Response(JSON.stringify({ error: 'Longcat AI API key(s) not configured' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

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
      coreMultiComparisonData = JSON.parse(coreMultiComparisonDataContent);

      // --- AI Call for Multi-Comparative Blog Post Generation ---
      const blogPostMultiComparisonPrompt = `
        Based on the detailed multi-video comparison of the following YouTube videos: ${videoTitles.map(t => `"${t}"`).join(', ')}, generate a comprehensive, SEO-optimized blog post for the SentiVibe platform. This post is intended for content creators and marketers seeking to understand comparative audience reactions across multiple pieces of content.

        ${combinedAnalysisContext}

        Core Multi-Comparison Data:
        ${JSON.stringify(coreMultiComparisonData, null, 2)}

        The blog post should:
        1. Have a compelling, SEO-optimized title (max 70 characters) in the format: "Multi-Video Sentiment Comparison: ${videoTitles.slice(0, 2).join(' vs ')}${videoTitles.length > 2 ? ' and more' : ''} ({{Year}}) | SentiVibe".
        2. Generate a URL-friendly slug from the title (lowercase, hyphen-separated, **without any leading or trailing slashes or path segments**).
        3. Include a concise meta description (max 160 characters).
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
      generatedMultiComparisonBlogPost = JSON.parse(generatedMultiComparisonBlogPostContent);
      lastComparedAt = now.toISOString();
    }

    // --- Process Custom Comparative Questions (always, merging with existing if any) ---
    // Custom question limits are removed, so this section remains as is for processing questions.
    if (customComparativeQuestions && customComparativeQuestions.length > 0) {
      if (!shouldRegenerateMultiComparison && existingMultiComparison) {
        combinedCustomComparativeQaResults = existingMultiComparison.custom_comparative_qa_results || [];
      }

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

        if (longcatApiKeys.length === 0) {
          return new Response(JSON.stringify({ error: 'Longcat AI API key(s) not configured' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }

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

    // Ensure slug is unique (only if new comparison or slug changed during regeneration)
    let finalSlug = generatedMultiComparisonBlogPost.slug;
    if (isNewComparison || shouldRegenerateMultiComparison) {
      finalSlug = await generateUniqueSlug(supabaseClient, generatedMultiComparisonBlogPost.slug);
    }
    generatedMultiComparisonBlogPost.slug = finalSlug;


    // --- Step 4: Save/Update Multi-Comparison to Database ---
    const currentTimestamp = now.toISOString();

    if (existingMultiComparison) {
      // Update existing multi-comparison
      const { data: updatedMultiComparison, error: updateMultiCompError } = await supabaseClient
        .from('multi_comparisons')
        .update({
          title: generatedMultiComparisonBlogPost.title,
          slug: generatedMultiComparisonBlogPost.slug,
          meta_description: generatedMultiComparisonBlogPost.meta_description,
          keywords: generatedMultiComparisonBlogPost.keywords,
          content: generatedMultiComparisonBlogPost.content,
          comparison_data_json: coreMultiComparisonData,
          custom_comparative_qa_results: combinedCustomComparativeQaResults,
          last_compared_at: lastComparedAt,
          updated_at: currentTimestamp,
        })
        .eq('id', existingMultiComparison.id)
        .select()
        .single();

      if (updateMultiCompError) {
        console.error('Supabase Multi-Comparison Update Error:', updateMultiCompError);
        throw new Error(`Failed to update multi-comparison in database: ${updateMultiCompError.message}`);
      }
      existingMultiComparison = updatedMultiComparison;
    } else {
      // Insert new multi-comparison
      const { data: newMultiComparison, error: insertMultiCompError } = await supabaseClient
        .from('multi_comparisons')
        .insert({
          title: generatedMultiComparisonBlogPost.title,
          slug: generatedMultiComparisonBlogPost.slug,
          meta_description: generatedMultiComparisonBlogPost.meta_description,
          keywords: generatedMultiComparisonBlogPost.keywords,
          content: generatedMultiComparisonBlogPost.content,
          author_id: userSubscriptionId, // Use userSubscriptionId (null for anon)
          created_at: currentTimestamp,
          updated_at: currentTimestamp,
          last_compared_at: lastComparedAt,
          comparison_data_json: coreMultiComparisonData,
          custom_comparative_qa_results: combinedCustomComparativeQaResults,
          overall_thumbnail_url: null,
        })
        .select()
        .single();

      if (insertMultiCompError) {
        console.error('Supabase Multi-Comparison Insert Error:', insertMultiCompError);
        throw new Error(`Failed to save multi-comparison to database: ${insertMultiCompError.message}`);
      }
      existingMultiComparison = newMultiComparison;

      // Insert into multi_comparison_videos junction table only for new comparisons
      const multiComparisonVideosData = analyzedBlogPosts.map((bp, index) => ({
        multi_comparison_id: existingMultiComparison.id,
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
    }

    return new Response(JSON.stringify({
      message: `Successfully created multi-video comparison.`,
      id: existingMultiComparison.id,
      title: existingMultiComparison.title,
      slug: existingMultiComparison.slug,
      meta_description: existingMultiComparison.meta_description,
      keywords: existingMultiComparison.keywords,
      content: existingMultiComparison.content,
      created_at: existingMultiComparison.created_at,
      last_compared_at: existingMultiComparison.last_compared_at,
      comparison_data_json: existingMultiComparison.comparison_data_json,
      custom_comparative_qa_results: existingMultiComparison.custom_comparative_qa_results,
      overall_thumbnail_url: existingMultiComparison.overall_thumbnail_url,
      videos: analyzedBlogPosts.map((bp, index) => ({
        blog_post_id: bp.id,
        video_order: index,
        title: bp.title,
        thumbnail_url: bp.thumbnail_url,
        original_video_link: bp.original_video_link,
        raw_comments_for_chat: bp.ai_analysis_json?.raw_comments_for_chat || [],
        slug: bp.slug,
      })),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: unknown) {
    console.error('Edge Function error (multi-video-comparator):', (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});