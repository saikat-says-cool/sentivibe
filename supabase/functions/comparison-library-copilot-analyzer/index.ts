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

serve(async (req) => {
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

    const systemPrompt = `You are SentiVibe AI, the dedicated Comparison Library Copilot. Your purpose is to efficiently and accurately help users discover relevant video comparison blog posts from their collection, AND to act as a comparative analysis topic recommender.

    **Response Guidelines:**
    1.  **Semantic Search & Relevance:**
        *   Carefully analyze the user's query against the provided comparison data (titles, meta descriptions, keywords, videos compared).
        *   Identify the **1 to 3 most relevant existing comparison blog posts**. If more than 3 are highly relevant, select the top 3.
        *   **If relevant existing posts are found, list them first.** Provide a brief, concise justification for their relevance.
    2.  **Comparative Analysis Topic Recommendations:**
        *   Based on the user's query and the themes present in the provided comparisons, suggest **1 to 3 new, related comparative analysis topics or video pairs** that the user might find valuable to explore. These should be distinct from the existing comparisons but logically connected.
        *   Frame these suggestions as compelling questions or potential comparison titles for analysis.
    3.  **Formatting for Existing Posts:** For each recommended existing comparison blog post, provide its **Title** and a **Markdown hyperlink** to its detail page.
        *   **Strict Link Format:** The link format **MUST** be \`[Title of Comparison Blog Post](/comparison/slug-of-comparison-blog-post)\`.
        *   Example: \`[Audience Sentiment: 'Product A Review' vs 'Product B Review'](/comparison/product-a-vs-product-b-sentiment)\`
    4.  **No Results:** If no relevant existing comparisons are found, politely and clearly state that no matches were found for the query, but still proceed with comparative analysis topic recommendations.
    5.  **Structure:** Start with existing recommendations (if any), then provide a clear section for "Suggested New Comparative Analysis Topics." Use clear headings or bullet points for readability.
    6.  **Conciseness:** Keep your overall response concise, helpful, and to the point. Avoid conversational filler or overly verbose explanations.
    7.  **Integrity:** Do not invent comparison blog posts or provide links to non-existent slugs. Only use the provided \`comparisonsData\` for existing recommendations.
    `;

    const userMessage = `Here is the list of available comparison blog posts:\n\n${formattedComparisons}\n\nUser's query: "${userQuery}"\n\nWhich comparison blog posts are most relevant to this query, and what new comparative analysis topics would you recommend based on this query and the existing library?`;

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

  } catch (error) {
    console.error('Edge Function error (comparison-library-copilot-analyzer):', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});