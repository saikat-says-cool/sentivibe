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

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query) {
      return new Response(JSON.stringify({ error: 'Search query is required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const googleSearchApiKeys = getApiKeys('GOOGLE_SEARCH_API_KEY');
    // @ts-ignore
    const googleSearchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');

    if (googleSearchApiKeys.length === 0 || !googleSearchEngineId) {
      console.error('Google Custom Search API key(s) or engine ID not configured.');
      return new Response(JSON.stringify({ error: 'Google Custom Search API not configured.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    let searchResults = '';
    let googleSearchResponse;

    for (const currentGoogleApiKey of googleSearchApiKeys) {
      const googleSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${currentGoogleApiKey}&cx=${googleSearchEngineId}&q=${encodeURIComponent(query)}&num=5`;
      
      googleSearchResponse = await fetch(googleSearchUrl);
      if (googleSearchResponse.ok) break;
      else if (googleSearchResponse.status === 429 || googleSearchResponse.status === 403) {
        console.warn(`Google Custom Search API key hit quota limit. Trying next key.`);
      } else {
        break;
      }
    }

    if (!googleSearchResponse || !googleSearchResponse.ok) {
      const errorData = googleSearchResponse ? await googleSearchResponse.json() : { message: "No response from Google Custom Search API" };
      console.error('Google Custom Search API error:', errorData);
      return new Response(JSON.stringify({ error: `Failed to fetch external context: ${errorData.error?.message || errorData.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: googleSearchResponse?.status || 500,
      });
    }

    const searchData = await googleSearchResponse.json();
    if (searchData.items && searchData.items.length > 0) {
      searchResults = searchData.items.map((item: any) => `Title: ${item.title}\nLink: ${item.link}\nSnippet: ${item.snippet}`).join('\n\n');
    } else {
      searchResults = 'No relevant external search results found.';
    }

    return new Response(JSON.stringify({ externalSearchResults: searchResults }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: unknown) {
    console.error('Edge Function error (fetch-external-context):', (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});