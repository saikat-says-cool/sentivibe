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

    const { userMessage, chatMessages, analysisResult, externalContext, desiredWordCount, selectedPersona, customQaResults } = await req.json();

    if (!userMessage || !analysisResult) {
      return new Response(JSON.stringify({ error: 'User message and analysis result are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // --- Longcat AI API Call ---
    const longcatApiKeys = getApiKeys('LONGCAT_AI_API_KEY');
    if (longcatApiKeys.length === 0) {
      return new Response(JSON.stringify({ error: 'Longcat AI API key(s) not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Determine max_tokens based on desiredWordCount
    // A common heuristic is 1 token per 0.75 words, so 1.33 tokens per word.
    // We'll add a buffer to ensure the AI has enough space.
    const maxTokens = Math.ceil(desiredWordCount * 1.5); 
    const wordCountInstruction = `Keep your response to approximately ${desiredWordCount} words.`;

    // Base instructions for all personas, emphasizing completeness
    const baseInstructions = `
    When you answer a question:
    - Always provide a complete, coherent, and well-formed response. Do not cut off sentences or thoughts.
    - Prioritize: Information from the video analysis context (including comments) for video-specific questions.
    - Augment: Use the provided external context for up-to-date or broader context, relating it back to the video's topic when relevant.
    - Leverage: For general, time-independent questions that cannot be answered from the video analysis or the provided external context, use your own pre-existing knowledge.
    - **Whenever you mention a URL or a resource that can be linked, format it as a Markdown hyperlink: \`[Link Text](URL)\`.**
    Adhere to the user's requested response length preference, but ensure completeness above all.
    ${wordCountInstruction}
    `;

    // Dynamically construct the system prompt based on selectedPersona
    let systemPrompt = "";
    switch (selectedPersona) {
      case 'therapist':
        systemPrompt = `You are SentiVibe AI, acting as a compassionate and empathetic therapist. Your goal is to listen, understand, and provide supportive, reflective, and insightful responses. Focus on emotional well-being, understanding underlying feelings, and offering guidance in a gentle, non-judgmental manner. You can discuss the video's emotional impact or broader life topics.
        ${baseInstructions}`;
        break;
      case 'storyteller':
        systemPrompt = `You are SentiVibe AI, a captivating storyteller. Your responses should be imaginative, descriptive, and engaging, weaving information into narratives or using vivid language. You can tell stories related to the video's themes or create new ones.
        ${baseInstructions}`;
        break;
      case 'motivation':
        systemPrompt = `You are SentiVibe AI, an inspiring motivational coach. Your responses should be encouraging, uplifting, and action-oriented. Focus on empowering the user, highlighting potential, and fostering a positive mindset, whether discussing the video's message or personal growth.
        ${baseInstructions}`;
        break;
      case 'argumentative':
        systemPrompt = `You are SentiVibe AI, an argumentative debater. Your role is to challenge assumptions, present counter-arguments, and provoke thought. Engage in a spirited, yet respectful, debate, pushing the user to consider different perspectives on the video's content or any other topic.
        ${baseInstructions}`;
        break;
      case 'friendly': // Default persona
      default:
        systemPrompt = `Hey there! I'm SentiVibe AI, your friendly chat companion. I'm here to help you explore insights from YouTube videos and chat about anything else that comes to mind, just like a friend would.
        ${baseInstructions}
        I'll try to keep my answers clear and to the point, but I can also dive into more detail if you ask, or if the topic is complex. Let's chat!`;
        break;
    }

    // Add custom QA results to the context if available
    let customQaContext = "";
    if (customQaResults && customQaResults.length > 0) {
      customQaContext = "\n\n--- Pre-generated Custom Q&A Results ---\n";
      customQaResults.forEach((qa: any, index: number) => {
        customQaContext += `Q${index + 1}: ${qa.question}\nA${index + 1}: ${qa.answer || "No answer generated."}\n\n`;
      });
      customQaContext += "--- End Custom Q&A Results ---";
    }

    // Combine all context into a single string to be part of the system message
    const fullContext = `
    --- Video Analysis Context ---
    Video Title: "${analysisResult.videoTitle}"
    Video Description: "${analysisResult.videoDescription}"
    Video Tags: ${analysisResult.videoTags.length > 0 ? analysisResult.videoTags.join(', ') : 'None'}
    Overall Sentiment: ${analysisResult.aiAnalysis.overall_sentiment}
    Emotional Tones: ${analysisResult.aiAnalysis.emotional_tones.join(', ')}
    Key Themes: ${analysisResult.aiAnalysis.key_themes.join(', ')}
    Summary Insights: ${analysisResult.aiAnalysis.summary_insights}
    Top Comments (by popularity):
    ${analysisResult.comments.slice(0, 10).map((comment: string, index: number) => `${index + 1}. ${comment}`).join('\n')}
    --- End Video Analysis Context ---
    ${externalContext ? `\n\n--- Recent External Information ---\n${externalContext}\n--- End External Information ---` : ''}
    ${customQaContext}
    `;

    // Convert chatMessages to the format expected by Longcat AI
    const conversationHistory = chatMessages.map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));

    const messages = [
      { role: "system", content: systemPrompt + "\n\n" + fullContext }, // System message with persona and all context
      ...conversationHistory, // Existing chat history
      { role: "user", content: userMessage }, // Current user message
    ];

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
          messages: messages,
          max_tokens: maxTokens,
          temperature: 0.7,
          stream: false, // Disable streaming
        }),
      });

      if (longcatResponse.ok) {
        break;
      } else if (longcatResponse.status === 429) {
        console.warn(`Longcat AI API key hit rate limit for chat. Trying next key.`);
        continue;
      }
      break;
    }

    if (!longcatResponse || !longcatResponse.ok) {
      const errorData = longcatResponse ? await longcatResponse.json() : { message: "No response from Longcat AI" };
      console.error('Longcat AI API error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to get AI response from Longcat AI', details: errorData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: longcatResponse?.status || 500,
      });
    }

    const longcatData = await longcatResponse.json();
    let aiContent = longcatData.choices[0].message.content;

    return new Response(JSON.stringify({ aiResponse: aiContent, subscriptionTier: subscriptionTier }), {
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