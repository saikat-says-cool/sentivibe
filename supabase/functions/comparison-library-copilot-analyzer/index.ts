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
  if (keys.length === 0) {
    // @ts-ignore
    const singleKey = Deno.env.get(baseName);
    if (singleKey) {
      keys.push(singleKey);
    }
  }
  return keys;
}

// Tier limits are no longer enforced in this function, so these constants are unused.

serve(async (req: Request) => {
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
          headers: { Authorization: req.headers.get('Authorization') || '' },
        },
      }
    );

    // User and subscription data are no longer fetched as no limits are enforced based on them in this function.
    // const { data: { user } } = await supabaseClient.auth.getUser();
    // const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    // const now = new Date();

    // --- Daily Query Limit Enforcement Removed ---
    // All copilot queries are now unlimited.
    // Removed interaction with 'copilot_queries_log' and 'anon_usage.copilot_queries_count'.

    const { userQuery, comparisonsData } = await req.json();

    if (!userQuery || !comparisonsData || !Array.isArray(comparisonsData)) {
      return new Response(JSON.stringify({ error: 'User query and comparisons data are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Format comparisons data for the AI prompt
    const formattedComparisons = comparisonsData.map((comp: any, index: number) => `
    --- Comparison ${index + 1} ---
    Title: ${comp.title}
    Slug: ${comp.slug}
    Meta Description: ${comp.meta_description}
    Keywords: ${comp.keywords ? comp.keywords.join(', ') : 'None'}
    Videos Compared: ${comp.videoATitle || 'Video A'} vs ${comp.videoBTitle || 'Video B'}
    --- End Comparison ${index + 1} ---
    `).join('\n');

    const systemPrompt = `You are SentiVibe AI, the dedicated Comparison Library Copilot. Your primary role is to be a friendly, helpful, and conversational assistant for discovering multi-video comparison blog posts and recommending new comparative analysis topics.

    **Conversation Guidelines:**
    1.  **Friendly & Conversational:** Always maintain a friendly, approachable, and human-like tone. Avoid being overly formal or robotic.
    2.  **Understand Intent First:**
        *   **If the user's query is a general greeting (e.g., "Hi", "Hello", "How are you?") or very vague (e.g., "Tell me about comparisons", "What can you do here?"), respond with a friendly greeting and ask how you can specifically assist them today.** Do NOT immediately list comparison blog posts or recommendations. Instead, prompt them for more details, like "What kind of video comparisons are you looking for?" or "Are you interested in finding existing comparisons or getting ideas for new comparative topics?"
        *   **If the user's query is specific and clearly indicates a search intent (e.g., "Find comparisons about tech gadgets", "Show me comparisons involving Creator Y", "What are some popular movie comparisons?"), then proceed with semantic search.**
    3.  **Semantic Search & Relevance (for specific queries):**
        *   Carefully analyze the user's specific query against the provided comparison data (titles, meta descriptions, keywords, videos compared).
        *   Identify the **1 to 3 most relevant existing comparison blog posts**. If more than 3 are highly relevant, select the top 3.
        *   **If relevant existing posts are found, list them clearly.** Provide a brief, concise justification for their relevance.
        *   **Formatting for Existing Posts:** For each recommended existing comparison blog post, provide its **Title** and a **Markdown hyperlink** to its detail page.
            *   **Strict Link Format:** The link format **MUST** be \`[Title of Comparison Blog Post](/multi-comparison/slug-of-comparison-blog-post)\`.
            *   Example: \`[Audience Sentiment: 'Product A Review' vs 'Product B Review'](/multi-comparison/product-a-vs-product-b-sentiment)\`
    4.  **Comparative Analysis Topic Recommendations (after search, or if no results):**
        *   **After presenting search results (or if no relevant posts were found), *offer* to provide new comparative analysis topic recommendations.** You can say something like, "Would you also like some ideas for new comparison topics based on your interests?"
        *   If the user accepts, or if no relevant posts were found and you've stated that, then suggest **1 to 3 new, related comparative analysis topics or video pairs** that the user might find valuable to explore. These should be distinct from the existing comparisons but logically connected to the user's query or general themes in the library.
        *   Frame these suggestions as compelling questions or potential comparison titles for analysis.
    5.  **No Results:** If no relevant existing posts are found for a specific search query, politely and clearly state that no matches were found, and then immediately proceed to offer comparative analysis topic recommendations (as per point 4).
    6.  **Conciseness & Progression:** Keep your responses brief and conversational, guiding the user through the process rather than dumping all information at once. Aim for a natural back-and-forth.
    7.  **Integrity:** Do not invent comparison blog posts or provide links to non-existent slugs. Only use the provided \`comparisonsData\` for existing recommendations.
    `;

    const userMessageContent = `Here is the list of available comparison blog posts:\n\n${formattedComparisons}\n\nUser's query: "${userQuery}"\n\nWhich comparison blog posts are most relevant to this query, and what new comparative analysis topics would you recommend based on this query and the existing library?`;

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
            { role: "user", content: userMessageContent },
          ],
          max_tokens: 750, // Increased tokens to accommodate recommendations
          temperature: 0.5, // Slightly higher temperature for more creative recommendations
          stream: false,
        }),
      });

      if (longcatResponse.ok) {
        break;
      } else if (longcatResponse.status === 429) {
        console.warn(`Longcat AI API key hit rate limit for comparison library copilot. Trying next key.`);
        continue;
      }
      break;
    }

    if (!longcatResponse || !longcatResponse.ok) {
      const errorData = longcatResponse ? await longcatResponse.json() : { message: "No response from Longcat AI" };
      console.error('Longcat AI API error for comparison library copilot:', errorData);
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

  } catch (error: unknown) {
    console.error('Edge Function error (comparison-library-copilot-analyzer):', (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});