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

    // Fetch user's subscription tier
    let subscriptionTier: string = 'free'; // Default to 'free' if profile not found
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error("Error fetching user profile for tier:", profileError);
      // Continue with default 'free' tier if there's an error fetching profile
    } else if (profile) {
      subscriptionTier = profile.subscription_tier;
    }
    // console.log(`User ${user.id} has subscription tier: ${subscriptionTier}`); // For debugging

    const { userQuery, blogPostsData } = await req.json();

    if (!userQuery || !blogPostsData || !Array.isArray(blogPostsData)) {
      return new Response(JSON.stringify({ error: 'User query and blog posts data are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // --- Tiered Access and Scope for Library Copilot ---
    if (subscriptionTier === 'guest') {
      return new Response(JSON.stringify({ 
        error: 'Library Copilot is not available for guest users. Please log in or sign up.',
        code: 'LIBRARY_COPILOT_ACCESS_DENIED'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403, // Forbidden
      });
    }

    let filteredBlogPostsData = blogPostsData;
    if (subscriptionTier === 'free') {
      // For free users, only allow searching their own analyses
      filteredBlogPostsData = blogPostsData.filter((post: any) => post.author_id === user.id);
      if (filteredBlogPostsData.length === 0) {
        return new Response(JSON.stringify({ 
          aiResponse: "It looks like you haven't created any analyses yet, or none match your query. Try analyzing a video first!",
          subscriptionTier: subscriptionTier 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    }
    // Pro users (and any other tiers) get full access to blogPostsData as provided by the frontend.
    // --- End Tiered Access and Scope ---

    // Format blog posts data for the AI prompt
    const formattedBlogPosts = filteredBlogPostsData.map((post: any, index: number) => `
    --- Blog Post ${index + 1} ---
    Title: ${post.title}
    Slug: ${post.slug}
    Meta Description: ${post.meta_description}
    Keywords: ${post.keywords ? post.keywords.join(', ') : 'None'}
    Creator: ${post.creator_name || 'Unknown'}
    --- End Blog Post ${index + 1} ---
    `).join('\n');

    const systemPrompt = `You are an intelligent AI assistant for SentiVibe's video analysis library. Your task is to help users find relevant video analyses (blog posts) based on their queries.

    You will be provided with a list of available blog posts and a user's search query.
    
    Your response should:
    1. Acknowledge the user's query.
    2. Identify the 1 to 3 most relevant blog posts from the provided list that best match the user's query.
    3. For each recommended blog post, provide its Title and a **Markdown link to its detail page using its slug**.
       **IMPORTANT: The link format MUST be \`[Title of Blog Post](/blog/slug-of-blog-post)\`.**
       For example: \`[Understanding Audience Sentiment for 'Product Launch'](/blog/understanding-audience-sentiment-product-launch)\`
    4. If no relevant posts are found, politely inform the user.
    5. Keep your response concise and helpful.
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

    return new Response(JSON.stringify({ aiResponse: aiContent, subscriptionTier: subscriptionTier }), {
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