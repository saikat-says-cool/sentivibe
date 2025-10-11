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

    // Verify user authentication
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { userQuery, blogPostsData } = await req.json();

    if (!userQuery || !blogPostsData || !Array.isArray(blogPostsData)) {
      return new Response(JSON.stringify({ error: 'User query and blog posts data are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Format blog posts data for the AI prompt
    const formattedBlogPosts = blogPostsData.map((post: any, index: number) => `
    --- Blog Post ${index + 1} ---
    Title: ${post.title}
    Slug: ${post.slug}
    Meta Description: ${post.meta_description}
    Keywords: ${post.keywords ? post.keywords.join(', ') : 'None'}
    Creator: ${post.creator_name || 'Unknown'}
    --- End Blog Post ${index + 1} ---
    `).join('\n');

    const systemPrompt = `You are SentiVibe AI, the dedicated Library Copilot. Your purpose is to efficiently and accurately help users discover relevant video analysis blog posts from their collection.

    **Response Guidelines:**
    1.  **Precision Matching:** Carefully analyze the user's query against the provided blog post data (titles, meta descriptions, keywords, creators).
    2.  **Recommendations:** Identify the **1 to 3 most relevant blog posts**. If more than 3 are highly relevant, select the top 3.
    3.  **Formatting:** For each recommended blog post, provide its **Title** and a **Markdown hyperlink** to its detail page.
        *   **Strict Link Format:** The link format **MUST** be \`[Title of Blog Post](/blog/slug-of-blog-post)\`.
        *   Example: \`[Understanding Audience Sentiment for 'Product Launch'](/blog/understanding-audience-sentiment-product-launch)\`
    4.  **Brief Justification (Optional but encouraged):** Briefly explain *why* a particular blog post is relevant to the user's query (e.g., 'This post discusses X, which aligns with your interest in Y.').
    5.  **No Results:** If no relevant posts are found, politely and clearly state that no matches were found for the query.
    6.  **Conciseness:** Keep your overall response concise, helpful, and to the point. Avoid conversational filler.
    7.  **Integrity:** Do not invent blog posts or provide links to non-existent slugs. Only use the provided \`blogPostsData\`.
    `;

    const userMessage = `Here is the list of available blog posts:\n\n${formattedBlogPosts}\n\nUser's query: "${userQuery}"\n\nWhich blog posts are most relevant to this query?`;

    // --- Longcat AI API Call ---
    const longcatApiKeys = getApiKeys('LONGCAT_AI_API_KEY');
    if (longcatApiKeys.length === 0) {
      return new Response(JSON.stringify({ error: 'Longcat AI API key(s) not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const longcatApiUrl = "https://api.longcat.chat/openai/v1/chat/completions";
    
    let longcatResponse;
    for (const currentLongcatApiKey of longcatApiKeys) {
      longcatResponse = await fetch(longcatApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentLongcatApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "LongCat-Flash-Chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          max_tokens: 500, // Sufficient tokens for recommendations
          temperature: 0.3, // Keep it focused
          stream: false,
        }),
      });

      if (longcatResponse.ok) {
        break;
      } else if (longcatResponse.status === 429) {
        console.warn(`Longcat AI API key hit rate limit for library copilot. Trying next key.`);
        continue;
      }
      break;
    }

    if (!longcatResponse || !longcatResponse.ok) {
      const errorData = longcatResponse ? await longcatResponse.json() : { message: "No response from Longcat AI" };
      console.error('Longcat AI API error for library copilot:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to get AI response from Longcat AI', details: errorData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: longcatResponse?.status || 500,
      });
    }

    const longcatData = await longcatResponse.json();
    const aiContent = longcatData.choices[0].message.content;

    return new Response(JSON.stringify({ aiResponse: aiContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Edge Function error (library-copilot-analyzer):', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});