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

// Define tier limits for library copilot queries
const FREE_TIER_LIMITS = {
  dailyQueries: 5,
};

const PAID_TIER_LIMITS = {
  dailyQueries: 100,
};

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
    let currentLimits = FREE_TIER_LIMITS;

    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const now = new Date();

    if (user) {
      const { data: subscriptionData, error: subscriptionError } = await supabaseClient
        .from('subscriptions')
        .select('status, plan_id')
        .eq('id', user.id)
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        console.error("Error fetching subscription for user:", user.id, subscriptionError);
      } else if (subscriptionData && subscriptionData.status === 'active' && subscriptionData.plan_id !== 'free') {
        isPaidTier = true;
        currentLimits = PAID_TIER_LIMITS;
      }
    }

    // --- Enforce Daily Query Limit ---
    if (user) { // Authenticated user limit check
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      let { count, error: countError } = await supabaseClient
        .from('copilot_queries_log') // Assuming a new table 'copilot_queries_log' exists for authenticated users
        .select('id', { count: 'exact', head: true })
        .gte('created_at', twentyFourHoursAgo)
        .eq('user_id', user.id);

      if (countError) {
        console.error("Error counting daily copilot queries for authenticated user:", countError);
        return new Response(JSON.stringify({ error: 'Failed to check daily copilot query limit.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      if (count !== null && count >= currentLimits.dailyQueries) {
        return new Response(JSON.stringify({ 
          error: `Daily Library Copilot query limit (${currentLimits.dailyQueries}) exceeded. ${isPaidTier ? 'You have reached your paid tier limit.' : 'Upgrade to a paid tier for more queries.'}` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        });
      }
      // Log query for authenticated user
      await supabaseClient.from('copilot_queries_log').insert({ user_id: user.id, created_at: now.toISOString() });

    } else { // Unauthenticated user IP-based limit check
      let { data: anonUsage, error: anonError } = await supabaseClient
        .from('anon_usage')
        .select('*')
        .eq('ip_address', clientIp)
        .single();

      if (anonError && anonError.code !== 'PGRST116') {
        console.error("Error fetching anon usage for IP:", clientIp, anonError);
        return new Response(JSON.stringify({ error: 'Failed to check anonymous usage data.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      let currentCopilotQueriesCount = 0;
      let lastResetAt = now.toISOString();

      if (anonUsage) {
        if (new Date(anonUsage.last_reset_at) < twentyFourHoursAgo) {
          // Reset counts if older than 24 hours
          currentCopilotQueriesCount = 0;
          lastResetAt = now.toISOString();
        } else {
          currentCopilotQueriesCount = anonUsage.copilot_queries_count;
          lastResetAt = anonUsage.last_reset_at;
        }
      }

      if (currentCopilotQueriesCount >= FREE_TIER_LIMITS.dailyQueries) {
        return new Response(JSON.stringify({ 
          error: `Daily Library Copilot query limit (${FREE_TIER_LIMITS.dailyQueries}) exceeded for your IP address. Upgrade to a paid tier for more queries.` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        });
      }

      // Increment count and update anon_usage
      currentCopilotQueriesCount++;
      const { error: updateAnonError } = await supabaseClient
        .from('anon_usage')
        .upsert({ 
          ip_address: clientIp, 
          analyses_count: anonUsage?.analyses_count || 0, // Preserve other counts
          comparisons_count: anonUsage?.comparisons_count || 0, // Preserve other counts
          copilot_queries_count: currentCopilotQueriesCount, 
          last_reset_at: lastResetAt,
          updated_at: now.toISOString(),
        }, { onConflict: 'ip_address' });

      if (updateAnonError) {
        console.error("Error updating anon usage for IP:", clientIp, updateAnonError);
        return new Response(JSON.stringify({ error: 'Failed to update anonymous usage data.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
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

    const systemPrompt = `You are SentiVibe AI, the dedicated Library Copilot. Your purpose is to efficiently and accurately help users discover relevant video analysis blog posts from their collection, AND to act as an analysis topic recommender.

    **Response Guidelines:**
    1.  **Semantic Search & Relevance:**
        *   Carefully analyze the user's query against the provided blog post data (titles, meta descriptions, keywords, creators).
        *   Identify the **1 to 3 most relevant existing blog posts**. If more than 3 are highly relevant, select the top 3.
        *   **If relevant existing posts are found, list them first.** Provide a brief, concise justification for their relevance.
    2.  **Analysis Topic Recommendations:**
        *   Based on the user's query and the themes present in the provided blog posts, suggest **1 to 3 new, related analysis topics or video ideas** that the user might find valuable to explore. These should be distinct from the existing posts but logically connected.
        *   Frame these suggestions as compelling questions or potential video titles for analysis.
    3.  **Formatting for Existing Posts:** For each recommended existing blog post, provide its **Title** and a **Markdown hyperlink** to its detail page.
        *   **Strict Link Format:** The link format **MUST** be \`[Title of Blog Post](/blog/slug-of-blog-post)\`.
        *   Example: \`[Understanding Audience Sentiment for 'Product Launch'](/blog/understanding-audience-sentiment-product-launch)\`
    4.  **No Results:** If no relevant existing posts are found, politely and clearly state that no matches were found for the query, but still proceed with analysis topic recommendations.
    5.  **Structure:** Start with existing recommendations (if any), then provide a clear section for "Suggested New Analysis Topics." Use clear headings or bullet points for readability.
    6.  **Conciseness:** Keep your overall response concise, helpful, and to the point. Avoid conversational filler or overly verbose explanations.
    7.  **Integrity:** Do not invent blog posts or provide links to non-existent slugs. Only use the provided \`blogPostsData\` for existing recommendations.
    `;

    const userMessage = `Here is the list of available blog posts:\n\n${formattedBlogPosts}\n\nUser's query: "${userQuery}"\n\nWhich blog posts are most relevant to this query, and what new analysis topics would you recommend based on this query and the existing library?`;

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

  } catch (error: unknown) {
    console.error('Edge Function error (library-copilot-analyzer):', (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});