// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to get multiple API keys from environment variables
function getApiKeys(baseName: string): string[] {
  const keys: string[] = []; // Corrected: should be string[]
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

serve(async (req: Request) => { // Explicitly typed 'req' as Request
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
      console.error('Configuration Error: Google Search API key(s) or Engine ID not set in Supabase secrets.');
      return new Response(JSON.stringify({ error: 'Google Search API key(s) or Engine ID not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    let searchResponse;
    let lastErrorData: any = { message: "No response from Google Custom Search API" };

    for (const currentGoogleSearchApiKey of googleSearchApiKeys) {
      const googleSearchApiUrl = `https://www.googleapis.com/customsearch/v1?key=${currentGoogleSearchApiKey}&cx=${googleSearchEngineId}&q=${encodeURIComponent(query)}`;
      searchResponse = await fetch(googleSearchApiUrl);

      if (searchResponse.ok) {
        break; // Key worked, proceed
      } else {
        lastErrorData = await searchResponse.json();
        console.warn(`Google Search API key ${currentGoogleSearchApiKey} failed with status ${searchResponse.status}. Error:`, lastErrorData);
        if (searchResponse.status === 403 || searchResponse.status === 429) {
          if (lastErrorData.error?.errors?.[0]?.reason === 'quotaExceeded') {
            console.warn(`Google Search API key ${currentGoogleSearchApiKey} hit quota limit. Trying next key.`);
            continue; // Try next key
          }
        }
        // If it's not a quota error or another recoverable error, break and report
        break;
      }
    }

    if (!searchResponse || !searchResponse.ok) {
      console.error('Google Custom Search API final error:', lastErrorData);
      return new Response(JSON.stringify({ error: 'Failed to fetch external search results', details: lastErrorData }), {
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

  } catch (error: unknown) { // Explicitly typed 'error' as unknown
    console.error('Edge Function error (fetch-external-context):', (error as Error).message); // Cast to Error
    return new Response(JSON.stringify({ error: (error as Error).message }), { // Cast to Error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});