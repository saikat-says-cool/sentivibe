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

    const { videoLink } = await req.json();
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

    // --- Fetch Video Details (Title, Description) ---
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
    const videoTitle = videoDetailsData.items?.[0]?.snippet?.title || 'Unknown Title';
    const videoDescription = videoDetailsData.items?.[0]?.snippet?.description || 'No description available.';


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

    // Prepare prompt for Longcat AI, instructing it to consider like counts as weights
    const longcatPrompt = `Analyze the following YouTube comments. Each comment is prefixed with its 'Likes' count (e.g., '(Likes: 123) This is a comment.'). When determining the overall sentiment, emotional tones, key themes, and summary insights, please give significantly more weight and importance to comments that have a higher 'Likes' count. This should reflect a weighted average sentiment where more popular comments have a greater influence on the final analysis. Respond in a structured JSON format.

    Example JSON format:
    {
      "overall_sentiment": "positive",
      "emotional_tones": ["joy", "excitement"],
      "key_themes": ["product review", "user experience"],
      "summary_insights": "The comments are overwhelmingly positive, highlighting the product's ease of use and innovative features, with popular comments strongly influencing this assessment."
    }

    YouTube Comments:\n\n${formattedCommentsForAI.join('\n')}`;

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
          { "role": "system", "content": "You are an expert sentiment analysis AI. Your task is to analyze a collection of YouTube comments and provide a concise summary of their sentiment, emotional tone, key themes, and overall insights, giving more weight to popular comments." },
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

    return new Response(JSON.stringify({
      message: `Successfully fetched comments and performed AI analysis for video ID: ${videoId}`,
      videoTitle: videoTitle,
      videoDescription: videoDescription,
      comments: allFetchedCommentsText, // Return all fetched comments for display
      aiAnalysis: aiAnalysis,
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