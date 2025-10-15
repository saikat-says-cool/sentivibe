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

    const { data: { user } } = await supabaseClient.auth.getUser();
    let isPaidTier = false;

    if (user) {
      const { data: subscriptionData, error: subscriptionError } = await supabaseClient
        .from('subscriptions')
        .select('status, plan_id')
        .eq('id', user.id)
        .single();

      if (!subscriptionError && subscriptionData && subscriptionData.status === 'active' && subscriptionData.plan_id !== 'free') {
        isPaidTier = true;
      }
    }

    const { userQuery, blogPostsData, deepThinkMode: clientDeepThinkMode, deepSearchMode: clientDeepSearchMode } = await req.json();

    // Enforce DeepThink and DeepSearch restrictions for free users
    const effectiveDeepThinkMode = isPaidTier && clientDeepThinkMode;
    const effectiveDeepSearchMode = isPaidTier && clientDeepSearchMode;

    if (!userQuery || !blogPostsData || !Array.isArray(blogPostsData)) {
      return new Response(JSON.stringify({ error: 'User query and blog posts data are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // --- Fetch External Context if DeepSearch is enabled ---
    let externalContext = '';
    if (effectiveDeepSearchMode) {
      const externalContextQuery = `${userQuery} YouTube video analysis`;
      const fetchExternalContextResponse = await supabaseClient.functions.invoke('fetch-external-context', {
        body: { query: externalContextQuery },
      });

      if (fetchExternalContextResponse.error) {
        console.warn("Error fetching external context for library copilot:", fetchExternalContextResponse.error);
        externalContext = `(Note: Failed to fetch external context: ${fetchExternalContextResponse.error.message})`;
      } else {
        externalContext = fetchExternalContextResponse.data.externalSearchResults;
      }
    }

    // Determine which Longcat AI model to use
    const aiModel = effectiveDeepThinkMode ? "LongCat-Flash-Thinking" : "LongCat-Flash-Chat";

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

    const systemPrompt = `You are SentiVibe AI, the dedicated Library Copilot. Your primary role is to be a friendly, helpful, and conversational assistant for discovering video analysis blog posts and recommending new analysis topics.

    **Conversation Guidelines:**
    1.  **Adaptive Length & Conciseness:** Respond with an appropriate length based on the user's query. Be as concise as possible by default, providing direct answers. Expand on topics only when explicitly asked for more detail or when the complexity of the question clearly warrants a longer explanation. For simple greetings, a short, friendly response is sufficient.
    2.  **Completeness:** Always provide a complete, coherent, and well-formed response. **Never cut off sentences or thoughts.**
    3.  **Friendly & Conversational:** Always maintain a friendly, approachable, and human-like tone. Avoid being overly formal or robotic.
    4.  **Understand Intent First:**
        *   **If the user's query is a general greeting (e.g., "Hi", "Hello", "How are you?") or very vague (e.g., "Tell me about the library", "What can you do?"), respond with a friendly greeting and ask how you can specifically assist them today.** Do NOT immediately list blog posts or recommendations. Instead, prompt them for more details, like "What kind of video analysis are you looking for?" or "Are you interested in finding existing analyses or getting ideas for new topics?"
        *   **If the user's query is specific and clearly indicates a search intent (e.g., "Find analyses about product reviews", "Show me videos by Creator X", "What are some popular gaming analyses?"), then proceed with semantic search.**
    5.  **Semantic Search & Relevance (for specific queries):**
        *   Carefully analyze the user's specific query against the provided blog post data (titles, meta descriptions, keywords, creators).
        *   Identify the **1 to 3 most relevant existing blog posts**. If more than 3 are highly relevant, select the top 3.
        *   **If relevant existing posts are found, list them clearly.** Provide a brief, concise justification for their relevance.
        *   **Formatting for Existing Posts:** For each recommended existing blog post, provide its **Title** and a **Markdown hyperlink** to its detail page.
            *   **Strict Link Format:** The link format **MUST** be \`[Title of Blog Post](/blog/slug-of-blog-post)\`.
            *   Example: \`[Understanding Audience Sentiment for 'Product Launch'](/blog/understanding-audience-sentiment-product-launch)\`
    6.  **Analysis Topic Recommendations (after search, or if no results):**
        *   **After presenting search results (or if no relevant posts were found), *offer* to provide new analysis topic recommendations.** You can say something like, "Would you also like some ideas for new analysis topics based on your interests?"
        *   If the user accepts, or if no relevant posts were found and you've stated that, then suggest **1 to 3 new, related analysis topics or video ideas** that the user might find valuable to explore. These should be distinct from the existing posts but logically connected to the user's query or general themes in the library.
        *   Frame these suggestions as compelling questions or potential video titles for analysis.
    7.  **No Results:** If no relevant existing posts are found for a specific search query, politely and clearly state that no matches were found, and then immediately proceed to offer analysis topic recommendations (as per point 4).
    8.  **Integrity:** Do not invent blog posts or provide links to non-existent slugs. Only use the provided \`blogPostsData\` for existing recommendations.
    `;

    const userMessageContent = userQuery; // Use userQuery directly

    // Combine all context into a single string to be part of the system message
    const fullContext = `
    --- Library Context ---
    ${formattedBlogPosts}
    --- End Library Context ---
    ${effectiveDeepSearchMode ? `\n\n--- External Search Results ---\n${externalContext}\n--- End External Search Results ---` : ''}
    `;

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
        headers: { 'Authorization': `Bearer ${currentLongcatApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: aiModel, // Use the dynamically selected AI model
          messages: [
            { role: "system", content: systemPrompt + fullContext }, // Include fullContext in system prompt
            { role: "user", content: userMessageContent }, // Use userMessageContent here
          ],
          max_tokens: 2000, // Increased max_tokens for copilot
          temperature: 0.5, // Slightly higher temperature for more creative recommendations
          stream: true, // <--- Changed to true for streaming
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

    // --- Handle streaming response ---
    const stream = new ReadableStream({
      async start(controller) {
        const reader = longcatResponse.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          controller.error('No readable stream from Longcat AI');
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
              if (line.startsWith('data:')) {
                const jsonStr = line.substring(5).trim();
                if (jsonStr === '[DONE]') {
                  controller.close();
                  return;
                }
                try {
                  const data = JSON.parse(jsonStr);
                  const content = data.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(new TextEncoder().encode(content));
                  }
                } catch (e) {
                  console.error('Error parsing JSON from Longcat AI stream:', e, jsonStr);
                }
              }
            }
          }
        } catch (e) {
          console.error('Error reading from Longcat AI stream:', e);
          controller.error(e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }, // Changed to text/plain for streaming
      status: 200,
    });

  } catch (error: unknown) {
    console.error('Edge Function error (library-copilot-analyzer):', (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});