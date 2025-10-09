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

    // --- Placeholder for YouTube Data API call ---
    // In a real scenario, you would make a fetch request to the YouTube Data API
    // using the videoId and youtubeApiKey to get comments.
    // Example:
    // const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${youtubeApiKey}&maxResults=100`;
    // const youtubeResponse = await fetch(youtubeApiUrl);
    // const youtubeData = await youtubeResponse.json();
    // const comments = youtubeData.items.map((item: any) => item.snippet.topLevelComment.snippet.textOriginal);
    // -----------------------------------------------

    // For now, we'll return a mock response
    const mockComments = [
      "This video is amazing! So helpful.",
      "I didn't understand a thing, very confusing.",
      "Great content, keep it up!",
      "The audio quality is terrible.",
      "Loved the explanation, very clear.",
    ];

    return new Response(JSON.stringify({
      message: `Successfully processed video ID: ${videoId}`,
      comments: mockComments, // Replace with actual comments from YouTube API
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