// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const { query } = await req.json();

    if (!query) {
      return new Response(JSON.stringify({ error: 'Search query is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Access Google Search API Key and Engine ID from Supabase Secrets
    // @ts-ignore
    const googleSearchApiKey = Deno.env.get('GOOGLE_SEARCH_API_KEY');
    // @ts-ignore
    const googleSearchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');

    if (!googleSearchApiKey || !googleSearchEngineId) {
      return new Response(JSON.stringify({ error: 'Google Search API keys not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const googleSearchApiUrl = `https://www.googleapis.com/customsearch/v1?key=${googleSearchApiKey}&cx=${googleSearchEngineId}&q=${encodeURIComponent(query)}`;
    const searchResponse = await fetch(googleSearchApiUrl);

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      let externalSearchResults = '';
      if (searchData.items && searchData.items.length > 0) {
        // Take top 3 search results and concatenate their snippets
        externalSearchResults = searchData.items.slice(0, 3).map((item: any) => `Title: ${item.title}\nSnippet: ${item.snippet}\nURL: ${item.link}`).join('\n\n');
      }
      return new Response(JSON.stringify({ externalSearchResults }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      const errorData = await searchResponse.json();
      console.error('Google Custom Search API error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to fetch external search results', details: errorData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: searchResponse.status,
      });
    }

  } catch (error) {
    console.error('Edge Function error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});