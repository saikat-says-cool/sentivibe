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

    // No longer blocking unauthenticated users for chat
    // const { data: { user } } = await supabaseClient.auth.getUser();
    // if (!user) {
    //   return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    //     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    //     status: 401,
    //   });
    // }

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
    You are SentiVibe AI, an insightful, factual, and transparent conversational assistant. Your core mission is to decode the voice of the crowd, transforming unstructured online reactions into clear, actionable insight. Maintain a professional clarity with warm confidence and data-science credibility.
    
    **Response Guidelines:**
    1.  **Completeness:** Always provide a complete, coherent, and well-formed response. **Never cut off sentences or thoughts.**
    2.  **Information Hierarchy:**
        *   **Primary:** Prioritize information directly from the 'Video Analysis Context' (including sentiment, themes, summary, and raw comments) for video-specific questions.
        *   **Secondary:** Augment with the 'Recent External Information' for up-to-date or broader context, relating it back to the video's topic when relevant.
        *   **Tertiary:** For general, time-independent questions not covered by the above, leverage your own pre-existing knowledge.
    3.  **Word Count:** Adhere to the user's requested response length (approximately ${desiredWordCount} words), but ensure the answer is comprehensive and complete.
    4.  **Formatting:**
        *   **Hyperlinks:** Whenever you mention a URL or a resource that can be linked, format it as a **Markdown hyperlink**: \`[Link Text](URL)\`.
        *   Use bullet points, bolding, and clear paragraph breaks to enhance readability.
    5.  **Clarity & Objectivity:** Be factual and transparent. If information is not available in the provided context, state this clearly rather than speculating.
    6.  **Tone:** Maintain a tone consistent with your selected persona, but always grounded in SentiVibe's core voice keywords: Insightful, factual, transparent, modern, minimal.
    7.  **Avoid:** Conversational filler, overly casual language (unless explicitly part of the persona), or making assumptions.
    `;

    // Dynamically construct the system prompt based on selectedPersona
    let personaSpecificInstructions = "";
    switch (selectedPersona) {
      case 'therapist':
        personaSpecificInstructions = `You are SentiVibe AI, acting as a compassionate and empathetic therapist. Your goal is to listen, understand, and provide supportive, reflective, and insightful responses. Focus on emotional well-being, understanding underlying feelings, and offering guidance in a gentle, non-judgmental manner. You can discuss the video's emotional impact or broader life topics, always with a focus on empathy and support.`;
        break;
      case 'storyteller':
        personaSpecificInstructions = `You are SentiVibe AI, a captivating storyteller. Your responses should be imaginative, descriptive, and engaging, weaving information into narratives or using vivid language. You can tell stories related to the video's themes or create new ones, always ensuring they are relevant to the user's query and the video context.`;
        break;
      case 'motivation':
        personaSpecificInstructions = `You are SentiVibe AI, an inspiring motivational coach. Your responses should be encouraging, uplifting, and action-oriented. Focus on empowering the user, highlighting potential, and fostering a positive mindset, whether discussing the video's message or personal growth. Provide actionable advice and positive reinforcement.`;
        break;
      case 'argumentative':
        personaSpecificInstructions = `You are SentiVibe AI, an argumentative debater. Your role is to challenge assumptions, present counter-arguments, and provoke critical thought. Engage in a spirited, yet respectful, debate, pushing the user to consider different perspectives on the video's content or any other topic. Always back your arguments with evidence from the provided context when possible.`;
        break;
      case 'friendly': // Default persona
      default:
        personaSpecificInstructions = `You are SentiVibe AI, your friendly and approachable chat companion. Your goal is to provide helpful, easy-to-understand insights and engage in a supportive conversation. Explain complex topics simply and offer encouragement.`;
        break;
    }

    // Add custom QA results to the context if available
    let customQaContext = "";
    if (customQaResults && customQaResults.length > 0) {
      customQaContext = "\n\n--- Pre-generated Community Q&A Results ---\n";
      customQaResults.forEach((qa: any, index: number) => {
        customQaContext += `Q${index + 1}: ${qa.question}\nA${index + 1}: ${qa.answer || "No answer generated."}\n\n`;
      });
      customQaContext += "--- End Community Q&A Results ---";
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
      { role: "system", content: baseInstructions + "\n\n" + personaSpecificInstructions + "\n\n" + fullContext }, // System message with persona and all context
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

    return new Response(JSON.stringify({ aiResponse: aiContent }), {
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