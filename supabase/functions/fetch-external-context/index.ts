// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

    // Access Google Search API Keys and Engine ID from Supabase Secrets
    const googleSearchApiKeys = getApiKeys('GOOGLE_SEARCH_API_KEY');
    // @ts-ignore
    const googleSearchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');

    if (googleSearchApiKeys.length === 0 || !googleSearchEngineId) {
      return new Response(JSON.stringify({ error: 'Google Search API key(s) or Engine ID not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    let searchResponse;
    for (const currentGoogleSearchApiKey of googleSearchApiKeys) {
      const googleSearchApiUrl = `https://www.googleapis.com/customsearch/v1?key=${currentGoogleSearchApiKey}&cx=${googleSearchEngineId}&q=${encodeURIComponent(query)}`;
      searchResponse = await fetch(googleSearchApiUrl);

      if (searchResponse.ok) {
        break; // Key worked, proceed
      } else if (searchResponse.status === 403 || searchResponse.status === 429) {
        const errorData = await searchResponse.json();
        if (errorData.error?.errors?.[0]?.reason === 'quotaExceeded') {
          console.warn(`Google Search API key ${currentGoogleSearchApiKey} hit quota limit. Trying next key.`);
          continue; // Try next key
        }
      }
      break;
    }

    if (!searchResponse || !searchResponse.ok) {
      const errorData = searchResponse ? await searchResponse.json() : { message: "No response from Google Custom Search API" };
      console.error('Google Custom Search API error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to fetch external search results', details: errorData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: searchResponse?.status || 500,
      });
    }

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

  } catch (error) {
    console.error('Edge Function error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});