// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'; // Needed for invoking other functions if DeepSearch is enabled

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

    const longcatApiKeys = getApiKeys('LONGCAT_AI_API_KEY'); // Use Longcat AI keys for Langsearch
    if (longcatApiKeys.length === 0) {
      console.error('Longcat AI API key(s) not configured for Langsearch.');
      return new Response(JSON.stringify({ error: 'Langsearch API not configured.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    let searchResults = '';
    let langsearchResponse;
    const langsearchApiUrl = "https://api.longcat.chat/langsearch/v1/search"; // Langsearch API endpoint

    for (const currentLongcatApiKey of longcatApiKeys) {
      langsearchResponse = await fetch(langsearchApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentLongcatApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          num_results: 5, // Request 5 results, similar to previous Google Search
        }),
      });

      if (langsearchResponse.ok) break;
      else if (langsearchResponse.status === 429 || langsearchResponse.status === 403) {
        console.warn(`Langsearch API key hit quota limit. Trying next key.`);
      } else {
        break;
      }
    }

    if (!langsearchResponse || !langsearchResponse.ok) {
      const errorData = langsearchResponse ? await langsearchResponse.json() : { message: "No response from Langsearch API" };
      console.error('Langsearch API error:', errorData);
      return new Response(JSON.stringify({ error: `Failed to fetch external context from Langsearch: ${errorData.error?.message || errorData.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: langsearchResponse?.status || 500,
      });
    }

    const searchData = await langsearchResponse.json();
    if (searchData.results && searchData.results.length > 0) {
      searchResults = searchData.results.map((item: any) => `Title: ${item.title}\nLink: ${item.link}\nSnippet: ${item.snippet}`).join('\n\n');
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