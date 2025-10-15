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

// Define simplified tier limits (only daily analyses remain)
const UNAUTHENTICATED_LIMITS = {
  dailyAnalyses: 1,
};

const AUTHENTICATED_FREE_TIER_LIMITS = {
  dailyAnalyses: 1,
};

const PAID_TIER_LIMITS = {
  dailyAnalyses: 50, // Effectively unlimited
};

// Define staleness threshold (e.g., 30 days)
const STALENESS_THRESHOLD_DAYS = 30;

// Define categories for tagging
const CATEGORIES = [
  "Product Reviews",
  "Gaming",
  "Tutorials",
  "News",
  "Entertainment",
  "Vlogs",
  "Music",
  "Education",
  "Comedy",
  "Science & Tech",
  "Sports",
  "Travel",
  "Food",
  "DIY",
  "Fashion",
  "Beauty",
  "Finance",
  "Health",
  "Documentary",
];

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
    const { data: _data, error } = await supabaseClient
      .from('blog_posts')
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

serve(async (req: Request) => { // Explicitly typed 'req' as Request
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

    // Refined IP extraction logic
    let clientIp = req.headers.get('x-real-ip'); // Prioritize x-real-ip
    if (!clientIp) {
      const xForwardedFor = req.headers.get('x-forwarded-for');
      if (xForwardedFor) {
        clientIp = xForwardedFor.split(',')[0].trim(); // Take the first IP from x-forwarded-for
      }
    }
    if (!clientIp) {
      clientIp = 'unknown'; // Fallback
    }
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
        currentLimits = AUTHENTICATED_FREE_TIER_LIMITS; // Fallback
      } else if (subscriptionData && subscriptionData.status === 'active' && subscriptionData.plan_id !== 'free') {
        currentLimits = PAID_TIER_LIMITS;
      } else {
        currentLimits = AUTHENTICATED_FREE_TIER_LIMITS;
      }
    } else {
      userSubscriptionId = null;
      currentLimits = UNAUTHENTICATED_LIMITS;
    }

    const youtubeApiKeys = getApiKeys('YOUTUBE_API_KEY');
    const longcatApiKeys = getApiKeys('LONGCAT_AI_API_KEY');

    const youtubeApiUrl = "https://www.googleapis.com/youtube/v3";
    const longcatApiUrl = "https://api.longcat.chat/openai/v1/chat/completions";

    const { videoLink, customQuestions, forceReanalyze, isInternalCall } = await req.json();

    console.log("youtube-analyzer: Received videoLink:", videoLink); // Log received videoLink

    if (!videoLink) {
      console.error("youtube-analyzer: videoLink is empty."); // Log if videoLink is empty
      return new Response(JSON.stringify({ error: 'Video link is required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const videoIdMatch = videoLink.match(/(?:v=|\/videos\/|embed\/|youtu.be\/|\/v\/|\/e\/|watch\?v=|&v=)([^#&?]{11})/);
    console.log("youtube-analyzer: videoIdMatch result:", videoIdMatch); // Log regex match result
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    console.log("youtube-analyzer: Extracted videoId:", videoId); // Log extracted videoId

    if (!videoId) {
      console.error("youtube-analyzer: Invalid YouTube video link provided, videoId could not be extracted."); // Log if videoId is null
      return new Response(JSON.stringify({ error: 'Invalid YouTube video link provided.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // --- Check for existing analysis and determine if re-analysis is needed ---
    let existingBlogPost: any = null;
    const { data: fetchedBlogPost, error: fetchError } = await supabaseClient
      .from('blog_posts')
      .select('*')
      .eq('video_id', videoId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error("Supabase fetch existing blog post error:", fetchError);
      throw new Error(`Failed to check for existing analysis: ${fetchError.message}`);
    }
    existingBlogPost = fetchedBlogPost;

    let shouldPerformFullReanalysis = false;
    let shouldProcessNewCustomQuestions = false;
    let blogPostData: any;
    let combinedCustomQaResults: { question: string; wordCount: number; answer: string }[] = [];

    if (existingBlogPost) {
      const lastReanalyzedDate = new Date(existingBlogPost.last_reanalyzed_at);
      const daysSinceLastReanalysis = (now.getTime() - lastReanalyzedDate.getTime()) / (1000 * 60 * 60 * 24);

      if (forceReanalyze || daysSinceLastReanalysis > STALENESS_THRESHOLD_DAYS) {
        shouldPerformFullReanalysis = true;
        console.log(`Triggering full re-analysis for video ID: ${videoId} due to staleness or forceReanalyze.`);
      } else {
        blogPostData = existingBlogPost;
        combinedCustomQaResults = existingBlogPost.custom_qa_results || [];
        console.log(`Reusing existing analysis for video ID: ${videoId}. Analysis is fresh.`);
      }

      // Always check for new custom questions, even if analysis is fresh
      if (customQuestions && customQuestions.length > 0) {
        const existingQuestionsSet = new Set(combinedCustomQaResults.map((qa: { question: string }) => qa.question));
        const newQuestionsToProcess = customQuestions.filter((qa: { question: string }) => qa.question.trim() !== "" && !existingQuestionsSet.has(qa.question));
        if (newQuestionsToProcess.length > 0) {
          shouldProcessNewCustomQuestions = true;
          console.log(`Processing ${newQuestionsToProcess.length} new custom questions for video ID: ${videoId}.`);
        }
      }
    } else {
      shouldPerformFullReanalysis = true;
      shouldProcessNewCustomQuestions = (customQuestions && customQuestions.length > 0);
      console.log(`No existing analysis found for video ID: ${videoId}. Performing full analysis.`);
    }

    // --- Enforce Daily Analysis Limit (only for new analyses or forced re-analyses) ---
    if (shouldPerformFullReanalysis && !isInternalCall) { // isInternalCall bypasses limits for multi-comp
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

        if (currentAnalysesCount >= UNAUTHENTICATED_LIMITS.dailyAnalyses) {
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
            analyses_count: anonUsage?.analyses_count || 0, // Preserve other counts
            comparisons_count: anonUsage?.comparisons_count || 0, // Preserve other counts
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

    // --- Perform full re-analysis or initial analysis ---
    if (shouldPerformFullReanalysis) {
      let videoDetails: any;
      let commentsResponse: any;

      // YouTube API Call (Video Details)
      let youtubeDetailsResponse;
      for (const currentYoutubeApiKey of youtubeApiKeys) {
        youtubeDetailsResponse = await fetch(`${youtubeApiUrl}/videos?id=${videoId}&part=snippet,statistics&key=${currentYoutubeApiKey}`);
        if (youtubeDetailsResponse.ok) break;
        else if (youtubeDetailsResponse.status === 403) console.warn(`YouTube API key hit quota limit for video details. Trying next key.`);
        else break;
      }
      if (!youtubeDetailsResponse || !youtubeDetailsResponse.ok) {
        const errorData = youtubeDetailsResponse ? await youtubeDetailsResponse.json() : { message: "No response from YouTube API" };
        console.error('YouTube API error (video details):', errorData);
        throw new Error(`Failed to fetch video details from YouTube: ${errorData.error?.message || errorData.message}`);
      }
      const videoDetailsData = await youtubeDetailsResponse.json();
      if (!videoDetailsData.items || videoDetailsData.items.length === 0) {
        throw new Error('Video not found or is unavailable.');
      }
      videoDetails = videoDetailsData.items[0].snippet;

      // YouTube API Call (Comments)
      let youtubeCommentsResponse;
      for (const currentYoutubeApiKey of youtubeApiKeys) {
        youtubeCommentsResponse = await fetch(`${youtubeApiUrl}/commentThreads?videoId=${videoId}&part=snippet&maxResults=100&order=relevance&key=${currentYoutubeApiKey}`);
        if (youtubeCommentsResponse.ok) break;
        else if (youtubeCommentsResponse.status === 403) console.warn(`YouTube API key hit quota limit for comments. Trying next key.`);
        else break;
      }
      if (!youtubeCommentsResponse || !youtubeCommentsResponse.ok) {
        const errorData = youtubeCommentsResponse ? await youtubeCommentsResponse.json() : { message: "No response from YouTube API" };
        console.error('YouTube API error (comments):', errorData);
        throw new Error(`Failed to fetch comments from YouTube: ${errorData.error?.message || errorData.message}`);
      }
      commentsResponse = await youtubeCommentsResponse.json();

      const commentsWithLikes = commentsResponse.items
        .filter((item: any) => item.snippet.topLevelComment)
        .map((item: any) => ({
          text: item.snippet.topLevelComment.snippet.textDisplay,
          likeCount: item.snippet.topLevelComment.snippet.likeCount,
        }));

      commentsWithLikes.sort((a: any, b: any) => b.likeCount - a.likeCount);
      const formattedCommentsForAI = commentsWithLikes.map((comment: any) => `(Likes: ${comment.likeCount}) ${comment.text}`);
      const allFetchedCommentsText = commentsWithLikes.map((comment: any) => comment.text);

      // Removed the 50-comment minimum check
      // if (commentsWithLikes.length < 50) {
      //   return new Response(JSON.stringify({ error: `Video must have at least 50 comments to proceed with analysis. This video has ${commentsWithLikes.length} comments.` }), {
      //     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      //     status: 400,
      //   });
      // }

      // Longcat AI Call (Sentiment Analysis)
      const longcatPrompt = `
        Analyze the sentiment, emotional tones, key themes, and provide a summary insight for the following YouTube video comments.
        The video is titled "${videoDetails.title}" by "${videoDetails.channelTitle}".
        Prioritize comments with higher like counts when assessing overall sentiment.

        Video Description: "${videoDetails.description}"
        Video Tags: ${videoDetails.tags ? videoDetails.tags.join(', ') : 'None'}

        Comments (ordered by likes, highest first):
        ${formattedCommentsForAI.join('\n')}

        Generate a JSON object with the following structure:
        {
          "overall_sentiment": "positive", // or neutral, negative, mixed
          "emotional_tones": ["joy", "excitement", "curiosity"],
          "key_themes": ["product review", "gaming mechanics", "community engagement"],
          "summary_insights": "The audience generally reacted positively, with high engagement around the new features. Popular comments highlighted excitement for future updates, though some expressed minor concerns about pricing."
        }
        Ensure all fields are populated with relevant data derived from the comments and video context.
      `;

      let longcatAnalysisResponse;
      for (const currentLongcatApiKey of longcatApiKeys) {
        longcatAnalysisResponse = await fetch(longcatApiUrl, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${currentLongcatApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: "LongCat-Flash-Chat",
            messages: [{ "role": "system", "content": "You are SentiVibe AI, an expert in YouTube comment sentiment analysis. Your task is to meticulously analyze video comments, extract overall sentiment, emotional tones, and key themes, and provide a concise summary. Prioritize comments with higher like counts. Present your findings in a structured JSON format as specified, ensuring accuracy and conciseness." }, { "role": "user", "content": longcatPrompt }],
            max_tokens: 8000, // Increased max_tokens
            temperature: 0.7,
            response_format: { type: "json_object" }
          }),
        });
        if (longcatAnalysisResponse.ok) break;
        else if (longcatAnalysisResponse.status === 429) console.warn(`Longcat AI API key hit quota limit for analysis. Trying next key.`);
        else break;
      }
      if (!longcatAnalysisResponse || !longcatAnalysisResponse.ok) {
        const errorData = longcatAnalysisResponse ? await longcatAnalysisResponse.json() : { message: "No response from Longcat AI" };
        console.error('Longcat AI Analysis API error:', errorData);
        throw new Error(`Failed to get AI analysis from Longcat AI: ${errorData.message}`);
      }
      const longcatData = await longcatAnalysisResponse.json();
      if (!longcatData.choices || longcatData.choices.length === 0 || !longcatData.choices[0].message || !longcatData.choices[0].message.content) {
        console.error('Longcat AI Analysis API returned unexpected structure:', longcatData);
        throw new Error('Longcat AI Analysis API returned an empty or malformed response.');
      }
      const aiAnalysisContent = stripMarkdownFences(longcatData.choices[0].message.content);
      const aiAnalysis = JSON.parse(aiAnalysisContent);

      // Longcat AI Call (Blog Post Generation)
      const blogPostPrompt = `
        Based on the sentiment analysis of the YouTube video "${videoDetails.title}" by "${videoDetails.channelTitle}", generate a comprehensive, SEO-optimized blog post for the SentiVibe platform. This post is intended for content creators and marketers seeking to understand audience reactions.

        Video Details:
        Title: "${videoDetails.title}"
        Description: "${videoDetails.description}"
        Tags: ${videoDetails.tags ? videoDetails.tags.join(', ') : 'None'}
        Creator: "${videoDetails.channelTitle}"
        Original Video Link: "${videoLink}"

        AI Sentiment Analysis Results:
        Overall Sentiment: ${aiAnalysis.overall_sentiment}
        Emotional Tones: ${aiAnalysis.emotional_tones.join(', ')}
        Key Themes: ${aiAnalysis.key_themes.join(', ')}
        Summary Insights: ${aiAnalysis.summary_insights}

        Top 10 Comments (by popularity):
        ${allFetchedCommentsText.slice(0, 10).map((comment: string, index: number) => `${index + 1}. ${comment}`).join('\n')}

        The blog post should:
        1. Have a compelling, **extremely hooking and click-worthy**, SEO-optimized title (max 70 characters) in the format: "${videoDetails.title}: YouTube Comment Sentiment Analysis ({{Year}}) | SentiVibe". The title should grab attention on Google SERPs.
        2. Generate a URL-friendly slug from the title (lowercase, hyphen-separated, **without any leading or trailing slashes or path segments**).
        3. Include a concise, **highly engaging and click-inducing** meta description (max 160 characters) summarizing the sentiment and insights. This description should make users want to click from the search results.
        4. List 5-10 relevant keywords as an array, combining video tags and analysis themes. **Crucially, also include ONE primary category from the following list that best describes the video's content: ${CATEGORIES.filter(c => c !== "All").join(', ')}. This category should be a distinct element in the keywords array.**
        5. Be structured with an H1 (the title), H2s for sections, and H3s for sub-sections.
        6. Be at least 800 words long.
        7. Discuss the overall sentiment, emotional tones, key themes, and summary insights, leveraging SentiVibe's AI.
        8. Incorporate insights from the top comments naturally to support the analysis.
        9. Conclude with a strong call to action, encouraging readers to use SentiVibe for their own video analysis.
        10. Be written in Markdown format.

        Respond in a structured JSON format:
        {
          "title": "SEO Optimized Blog Post Title",
          "slug": "seo-optimized-blog-post-title",
          "meta_description": "A concise meta description for search engines.",
          "keywords": ["keyword1", "keyword2", "keyword3", "Primary Category"],
          "content": "# H1 Title\\n\\nIntroduction...\\n\\n## H2 Section\\n\\nContent...\\n\\n### H3 Sub-section\\n\\nMore content...\\n\\n## Conclusion\\n\\nCall to action..."
        }
      `;

      let longcatBlogPostResponse;
      for (const currentLongcatApiKey of longcatApiKeys) {
        longcatBlogPostResponse = await fetch(longcatApiUrl, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${currentLongcatApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: "LongCat-Flash-Chat",
            messages: [{ "role": "system", "content": "You are SentiVibe AI, an expert SEO content strategist and writer. Your task is to generate a high-quality, detailed, and SEO-optimized blog post in Markdown format based on a YouTube video sentiment analysis. The content must be engaging, insightful, and directly leverage the provided analysis data. Ensure the output is a valid, well-formed JSON object, strictly adhering to the provided schema, and ready for immediate publication. Avoid generic phrases or fluff; focus on actionable insights and clear, professional language. The blog post should be compelling and provide genuine value to the reader, encouraging them to explore SentiVibe further. Crucially, the title and meta description must be extremely hooking and click-worthy for Google SERPs, designed to maximize click-through rates while remaining relevant and within character limits." }, { "role": "user", "content": blogPostPrompt }],
            max_tokens: 8000, // Increased max_tokens
            temperature: 0.7,
            response_format: { type: "json_object" }
          }),
        });
        if (longcatBlogPostResponse.ok) break;
        else if (longcatBlogPostResponse.status === 429) console.warn(`Longcat AI API key hit quota limit for blog post. Trying next key.`);
        else break;
      }
      if (!longcatBlogPostResponse || !longcatBlogPostResponse.ok) {
        const errorData = longcatBlogPostResponse ? await longcatBlogPostResponse.json() : { message: "No response from Longcat AI" };
        console.error('Longcat AI Blog Post API error:', errorData);
        throw new Error(`Failed to generate blog post from Longcat AI: ${errorData.message}`);
      }
      const longcatBlogPostData = await longcatBlogPostResponse.json();
      if (!longcatBlogPostData.choices || longcatBlogPostData.choices.length === 0 || !longcatBlogPostData.choices[0].message || !longcatBlogPostData.choices[0].message.content) {
        console.error('Longcat AI Blog Post API returned unexpected structure:', longcatBlogPostData);
        throw new Error('Longcat AI Blog Post API returned an empty or malformed response.');
      }
      const generatedBlogPostContent = stripMarkdownFences(longcatBlogPostData.choices[0].message.content);
      const generatedBlogPost = JSON.parse(generatedBlogPostContent);

      // Ensure slug is unique
      const finalSlug = await generateUniqueSlug(supabaseClient, generatedBlogPost.slug);
      generatedBlogPost.slug = finalSlug;

      blogPostData = {
        video_id: videoId,
        title: generatedBlogPost.title,
        slug: generatedBlogPost.slug,
        meta_description: generatedBlogPost.meta_description,
        keywords: generatedBlogPost.keywords,
        content: generatedBlogPost.content,
        published_at: now.toISOString(),
        author_id: userSubscriptionId, // Use userSubscriptionId (null for anon)
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        creator_name: videoDetails.channelTitle,
        thumbnail_url: videoDetails.thumbnails.high.url,
        original_video_link: videoLink,
        ai_analysis_json: { ...aiAnalysis, raw_comments_for_chat: allFetchedCommentsText },
        custom_qa_results: [], // Initialize empty, will be populated below
        last_reanalyzed_at: now.toISOString(),
      };

      if (existingBlogPost) {
        // Update existing blog post
        const { error: updateError } = await supabaseClient
          .from('blog_posts')
          .update({
            title: blogPostData.title,
            slug: blogPostData.slug,
            meta_description: blogPostData.meta_description,
            keywords: blogPostData.keywords,
            content: blogPostData.content,
            updated_at: now.toISOString(),
            creator_name: blogPostData.creator_name,
            thumbnail_url: blogPostData.thumbnail_url,
            original_video_link: blogPostData.original_video_link,
            ai_analysis_json: blogPostData.ai_analysis_json,
            last_reanalyzed_at: now.toISOString(), // Update last reanalyzed timestamp
          })
          .eq('id', existingBlogPost.id);

        if (updateError) {
          console.error('Supabase Blog Post Update Error:', updateError);
          throw new Error(`Failed to update blog post in database: ${updateError.message}`);
        }
        blogPostData.id = existingBlogPost.id; // Ensure ID is set for subsequent Q&A processing
      } else {
        // Insert new blog post
        const { data: newBlogPost, error: insertError } = await supabaseClient
          .from('blog_posts')
          .insert(blogPostData)
          .select()
          .single();

        if (insertError) {
          console.error('Supabase Blog Post Insert Error:', insertError);
          throw new Error(`Failed to save blog post to database: ${insertError.message}`);
        }
        blogPostData = newBlogPost;
      }
    } else {
      // If not performing full re-analysis, ensure blogPostData is set from existingBlogPost
      blogPostData = existingBlogPost;
    }

    // --- Process Custom Questions (always, merging with existing if any) ---
    if (shouldProcessNewCustomQuestions) {
      // If not a full re-analysis, ensure combinedCustomQaResults is initialized from existingBlogPost
      if (!shouldPerformFullReanalysis && existingBlogPost) {
        combinedCustomQaResults = existingBlogPost.custom_qa_results || [];
      }

      const existingQuestionsSet = new Set(combinedCustomQaResults.map((qa: { question: string }) => qa.question));
      const newQuestionsToProcess = customQuestions.filter((qa: { question: string }) => qa.question.trim() !== "" && !existingQuestionsSet.has(qa.question));

      for (const qa of newQuestionsToProcess) {
        const customQuestionPrompt = `
          Based on the sentiment analysis of the YouTube video "${blogPostData.title}" by "${blogPostData.creator_name}", answer the user's custom question.

          Video Description: "${blogPostData.meta_description}"
          Video Tags: ${blogPostData.keywords ? blogPostData.keywords.join(', ') : 'None'}

          AI Sentiment Analysis Results:
          Overall Sentiment: ${blogPostData.ai_analysis_json?.overall_sentiment || 'N/A'}
          Emotional Tones: ${blogPostData.ai_analysis_json?.emotional_tones ? blogPostData.ai_analysis_json.emotional_tones.join(', ') : 'None'}
          Key Themes: ${blogPostData.ai_analysis_json?.key_themes ? blogPostData.ai_analysis_json.key_themes.join(', ') : 'None'}
          Summary Insights: ${blogPostData.ai_analysis_json?.summary_insights || 'No insights available.'}

          Top 10 Comments (by popularity):
          ${blogPostData.ai_analysis_json?.raw_comments_for_chat ? blogPostData.ai_analysis_json.raw_comments_for_chat.slice(0, 10).map((c: string, index: number) => `${index + 1}. ${c}`).join('\n') : 'No comments available.'}

          User's Question: "${qa.question}"
          
          Please provide an answer that is approximately ${qa.wordCount} words long. Your answer should primarily draw from the provided video analysis and comments. If the information is not present, indicate that. Ensure the answer is complete and directly addresses the question.
        `;

        let customQaResponse;
        for (const currentLongcatApiKey of longcatApiKeys) {
          customQaResponse = await fetch(longcatApiUrl, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentLongcatApiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: "LongCat-Flash-Chat",
              messages: [{ "role": "system", "content": "You are SentiVibe AI, an insightful and precise AI assistant. Your task is to answer specific user questions about a YouTube video analysis. Your answers must be accurate, directly derived from the provided context, and strictly adhere to the requested word count. If the information is not present, indicate that. Ensure the answer is comprehensive within the word limit, providing a complete and well-structured response." }, { "role": "user", "content": customQuestionPrompt }],
              max_tokens: 8000, // Increased max_tokens
              temperature: 0.5,
              stream: false,
            }),
          });
          if (customQaResponse.ok) break;
          else if (customQaResponse.status === 429) console.warn(`Longcat AI API key hit rate limit for custom QA. Trying next key.`);
          else break;
        }

        if (!customQaResponse || !customQaResponse.ok) {
          const errorData = customQaResponse ? await customQaResponse.json() : { message: "No response from Longcat AI" };
          console.error('Longcat AI Custom QA API error:', errorData);
          combinedCustomQaResults.push({ ...qa, answer: `Error generating answer: ${errorData.message || 'Unknown error'}` });
        } else {
          const customQaData = await customQaResponse.json();
          if (!customQaData.choices || customQaData.choices.length === 0 || !customQaData.choices[0].message || !customQaData.choices[0].message.content) {
            console.error('Longcat AI Custom QA API returned unexpected structure:', customQaData);
            combinedCustomQaResults.push({ ...qa, answer: `Error generating answer: AI returned empty or malformed response.` });
          } else {
            const answerContent = customQaData.choices[0].message.content;
            combinedCustomQaResults.push({ ...qa, answer: answerContent });
          }
        }
      }

      // Update the blog post with the combined custom QA results
      const { error: updateQaError } = await supabaseClient
        .from('blog_posts')
        .update({
          custom_qa_results: combinedCustomQaResults,
          updated_at: now.toISOString(),
        })
        .eq('id', blogPostData.id);

      if (updateQaError) {
        console.error('Supabase Custom QA Update Error:', updateQaError);
        throw new Error(`Failed to update custom Q&A in database: ${updateQaError.message}`);
      }
      blogPostData.custom_qa_results = combinedCustomQaResults; // Update local object
    }

    return new Response(JSON.stringify({
      message: `Successfully analyzed video and generated insights.`,
      videoTitle: blogPostData.title,
      videoDescription: blogPostData.meta_description,
      videoThumbnailUrl: blogPostData.thumbnail_url,
      videoTags: blogPostData.keywords,
      creatorName: blogPostData.creator_name,
      videoSubtitles: '', // Subtitles are not currently fetched
      comments: blogPostData.ai_analysis_json?.raw_comments_for_chat || [],
      aiAnalysis: blogPostData.ai_analysis_json,
      blogPostSlug: blogPostData.slug,
      originalVideoLink: blogPostData.original_video_link,
      customQaResults: blogPostData.custom_qa_results,
      lastReanalyzedAt: blogPostData.last_reanalyzed_at,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: unknown) { // Explicitly typed 'error' as unknown
    console.error('Edge Function error (youtube-analyzer):', (error as Error).message); // Cast to Error
    return new Response(JSON.stringify({ error: (error as Error).message }), { // Cast to Error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});