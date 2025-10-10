// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user authentication (optional, but good practice for protected functions)
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { videoLink, customInstructions } = await req.json(); // Destructure customInstructions
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

    // Access the YouTube API Key from Supabase Secrets
    // @ts-ignore
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!youtubeApiKey) {
      return new Response(JSON.stringify({ error: 'YouTube API key not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // --- Fetch Video Details (Title, Description, Thumbnails, Tags, Channel Title) ---
    const videoDetailsApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${youtubeApiKey}`;
    const videoDetailsResponse = await fetch(videoDetailsApiUrl);

    if (!videoDetailsResponse.ok) {
      const errorData = await videoDetailsResponse.json();
      console.error('YouTube Video Details API error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to fetch video details from YouTube API', details: errorData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: videoDetailsResponse.status,
      });
    }
    const videoDetailsData = await videoDetailsResponse.json();
    const videoSnippet = videoDetailsData.items?.[0]?.snippet;

    const videoTitle = videoSnippet?.title || 'Unknown Title';
    const videoDescription = videoSnippet?.description || 'No description available.';
    const videoThumbnailUrl = videoSnippet?.thumbnails?.high?.url || videoSnippet?.thumbnails?.medium?.url || '';
    const videoTags = videoSnippet?.tags || [];
    const creatorName = videoSnippet?.channelTitle || 'Unknown Creator'; // Extract creator name

    const videoSubtitles = ''; // No subtitles will be fetched for now.


    // --- Fetch Comments ---
    const youtubeCommentsApiUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${youtubeApiKey}&maxResults=100`;
    const youtubeCommentsResponse = await fetch(youtubeCommentsApiUrl);

    if (!youtubeCommentsResponse.ok) {
      const errorData = await youtubeCommentsResponse.json();
      console.error('YouTube Comments API error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to fetch comments from YouTube API', details: errorData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: youtubeCommentsResponse.status,
      });
    }

    const youtubeCommentsData = await youtubeCommentsResponse.json();
    let commentsWithLikes = youtubeCommentsData.items
      ? youtubeCommentsData.items.map((item: any) => ({
          text: item.snippet.topLevelComment.snippet.textOriginal,
          likeCount: item.snippet.topLevelComment.snippet.likeCount,
        }))
      : [];

    // Enforce 50-comment minimum
    if (commentsWithLikes.length < 50) {
      return new Response(JSON.stringify({ error: `Video must have at least 50 comments to proceed with analysis. This video has ${commentsWithLikes.length} comments.` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Sort comments by likeCount in descending order for consistent processing and display
    commentsWithLikes.sort((a: any, b: any) => b.likeCount - a.likeCount);

    // Prepare comments for AI, including their like counts
    const formattedCommentsForAI = commentsWithLikes.map((comment: any) => `(Likes: ${comment.likeCount}) ${comment.text}`);
    const allFetchedCommentsText = commentsWithLikes.map((comment: any) => comment.text); // Keep all fetched comments text for display

    // Access the Longcat AI API Key from Supabase Secrets
    // @ts-ignore
    const longcatApiKey = Deno.env.get('LONGCAT_AI_API_KEY');
    if (!longcatApiKey) {
      return new Response(JSON.stringify({ error: 'Longcat AI API key not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Prepare prompt for Longcat AI, instructing it to consider like counts as weights and subtitles as additional context
    let longcatPrompt = `Analyze the following YouTube video content. When determining the overall sentiment, emotional tones, key themes, and summary insights, please give significantly more weight and importance to comments that have a higher 'Likes' count. This should reflect a weighted average sentiment where more popular comments have a greater influence on the final analysis.
    
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

    // Add custom instructions if provided
    if (customInstructions) {
      longcatPrompt += `\n\nUser's Custom Instructions: ${customInstructions}\n`;
    }

    longcatPrompt += `\n\nNote: Subtitles were not available for this video. Please base your analysis solely on the comments, video title, description, tags, and creator name.`;


    const longcatApiUrl = "https://api.longcat.chat/openai/v1/chat/completions";
    const longcatResponse = await fetch(longcatApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${longcatApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "LongCat-Flash-Chat",
        messages: [
          { "role": "system", "content": "You are an expert sentiment analysis AI. Your task is to analyze a YouTube video's comments, providing a concise summary of sentiment, emotional tone, key themes, and overall insights. Prioritize popular comments and use video title, description, tags, and creator name for broader context. Respond in a structured JSON format." },
          { "role": "user", "content": longcatPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: "json_object" } // Request JSON output
      }),
    });

    if (!longcatResponse.ok) {
      const errorData = await longcatResponse.json();
      console.error('Longcat AI API error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to get analysis from Longcat AI', details: errorData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: longcatResponse.status,
      });
    }

    const longcatData = await longcatResponse.json();
    let aiContent = longcatData.choices[0].message.content;

    // Remove markdown code block fences if present
    if (aiContent.startsWith('```json') && aiContent.endsWith('```')) {
      aiContent = aiContent.substring(7, aiContent.length - 3).trim();
    }

    const aiAnalysis = JSON.parse(aiContent);

    // --- Generate SEO-optimized blog post ---
    const currentYear = new Date().getFullYear();
    const slugifiedVideoTitle = videoTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');
    const blogPostPrompt = `Based on the following YouTube video analysis, generate a comprehensive, SEO-optimized blog post.
    
    Video Title: "${videoTitle}"
    Video Description: "${videoDescription}"
    Video Creator: "${creatorName}"
    Video Tags: ${videoTags.length > 0 ? videoTags.join(', ') : 'None'}
    Overall Sentiment: ${aiAnalysis.overall_sentiment}
    Emotional Tones: ${aiAnalysis.emotional_tones.join(', ')}
    Key Themes: ${aiAnalysis.key_themes.join(', ')}
    Summary Insights: ${aiAnalysis.summary_insights}
    Top Comments (for reference, do not list all):
    ${allFetchedCommentsText.slice(0, 5).map((comment: string, index: number) => `- ${comment}`).join('\n')}

    The blog post should adhere to the following SEO guidelines:
    1.  **Title Tag (max 60 chars):** "{{VideoTitle}}" YouTube Comment Sentiment Analysis (${currentYear}) | SentiVibe
        *   Example: "MrBeast Latest Video" YouTube Comment Sentiment Analysis (2024) | SentiVibe
    2.  **Meta Description (max 155 chars):** Analyze YouTube comments on "{{VideoTitle}}" to discover audience sentiment, insights, and reactions instantly with AI.
        *   Example: Analyze YouTube comments on MrBeast's latest video to discover audience sentiment, insights, and reactions instantly with AI.
    3.  **URL Slug:** /analyze/youtube-comments/${slugifiedVideoTitle} (already handled by the system, just for context)
    4.  **Header Tag Hierarchy:** Use exactly one H1, several H2s, and optionally H3s under each H2.
        *   H1: Sentiment Analysis of "{{VideoTitle}}" Comments
        *   H2: Overall Sentiment Score
        *   H3: Positive vs Negative Breakdown
        *   H2: Top Insights from Viewers
        *   H3: Common Keywords & Topics
        *   H2: About "{{creatorName}}"
    5.  **Keyword Strategy:** Sprinkle variations of "YouTube comment analysis", "YouTube sentiment analyzer", "YouTube AI comment analyzer", "Analyze {{VideoTitle}} comments", "Sentiment breakdown for {{creatorName}}" naturally in the text body and headings. Avoid stuffing.
    6.  **Internal Linking Logic:** Include links to the "Analysis Library" and "Analyze Your Own Video" pages.
    7.  **Content Block Layout:**
        *   Intro Paragraph (50–100 words): Describe the video & purpose of analysis.
        *   Sentiment Summary Section (H2 "Overall Sentiment Score", H3 "Positive vs Negative Breakdown"): Discuss overall sentiment, positive/negative balance.
        *   Top Keywords & Topics Section (H2 "Top Insights from Viewers", H3 "Common Keywords & Topics"): Summarize key themes and recurring topics.
        *   About Creator Section (H2 "About {{creatorName}}"): Briefly introduce the creator and their channel.
        *   Conclusion / CTA: Invite users to analyze their own video.
    8.  **Content Freshness:** Include a small timestamp like "Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}" at the end of the content.
    9.  **CTR Optimization:** Ensure the generated title and meta description are compelling and trigger curiosity.

    The blog post content should be at least 500 words long and written entirely in Markdown format.

    Respond in a structured JSON format:
    {
      "title": "SEO Optimized Blog Post Title",
      "slug": "seo-optimized-blog-post-title",
      "meta_description": "A concise meta description for search engines.",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "content": "# H1 Title\\n\\nIntroduction...\\n\\n## H2 Section\\n\\nContent...\\n\\n### H3 Sub-section\\n\\nMore content...\\n\\nLast updated: [Date]"
    }
    `;

    const blogPostResponse = await fetch(longcatApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${longcatApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "LongCat-Flash-Chat", // Or a more capable model if available
        messages: [
          { "role": "system", "content": "You are an expert SEO content writer. Your task is to generate a detailed, SEO-optimized blog post in Markdown format based on provided video analysis data and strict SEO guidelines. Ensure the output is a valid JSON object." },
          { "role": "user", "content": blogPostPrompt }
        ],
        max_tokens: 2000, // Increased tokens for a longer blog post
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!blogPostResponse.ok) {
      const errorData = await blogPostResponse.json();
      console.error('Longcat AI Blog Post API error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to generate blog post from Longcat AI', details: errorData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: blogPostResponse.status,
      });
    }

    const blogPostData = await blogPostResponse.json();
    let blogPostContent = blogPostData.choices[0].message.content;

    if (blogPostContent.startsWith('```json') && blogPostContent.endsWith('```')) {
      blogPostContent = blogPostContent.substring(7, blogPostContent.length - 3).trim();
    }
    const generatedBlogPost = JSON.parse(blogPostContent);

    // Ensure the slug is correctly formatted with the prefix
    const finalSlug = `/analyze/youtube-comments/${generatedBlogPost.slug}`;

    // Insert the generated blog post into the database
    const { error: insertError } = await supabaseClient
      .from('blog_posts')
      .insert({
        video_id: videoId,
        original_video_link: videoLink, // Store the original video link
        title: generatedBlogPost.title,
        slug: finalSlug, // Use the prefixed slug
        meta_description: generatedBlogPost.meta_description,
        keywords: generatedBlogPost.keywords,
        content: generatedBlogPost.content,
        published_at: new Date().toISOString(), // Publish immediately
        author_id: user.id, // Link to the user who initiated the analysis
        creator_name: creatorName, // New column
        thumbnail_url: videoThumbnailUrl, // New column
      });

    if (insertError) {
      console.error('Supabase Blog Post Insert Error:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to save blog post to database', details: insertError }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }


    return new Response(JSON.stringify({
      message: `Successfully fetched comments and performed AI analysis for video ID: ${videoId}`,
      videoTitle: videoTitle,
      videoDescription: videoDescription,
      videoThumbnailUrl: videoThumbnailUrl, // Include thumbnail URL
      videoTags: videoTags,               // Include video tags
      creatorName: creatorName,           // Include creator name
      videoSubtitles: videoSubtitles, // Will be an empty string for now
      comments: allFetchedCommentsText,
      aiAnalysis: aiAnalysis,
      blogPostSlug: finalSlug, // Return the prefixed slug for linking
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Edge Function error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});