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

    const { userMessage, chatMessages, multiComparisonResult, desiredWordCount, selectedPersona } = await req.json(); // Removed deepThinkMode

    if (!userMessage || !multiComparisonResult) {
      return new Response(JSON.stringify({ error: 'User message and multi-comparison result are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const finalDesiredWordCount = desiredWordCount;

    // --- Longcat AI API Call ---
    const longcatApiKeys = getApiKeys('LONGCAT_AI_API_KEY');
    if (longcatApiKeys.length === 0) {
      return new Response(JSON.stringify({ error: 'Longcat AI API key(s) not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const maxTokens = 2000;

    // Determine which Longcat AI model to use
    const aiModel = "LongCat-Flash-Thinking"; // Always use LongCat-Flash-Thinking

    // Base instructions for all personas, emphasizing completeness
    const baseInstructions = `
    You are SentiVibe AI, an insightful, factual, and transparent conversational assistant specializing in multi-video comparative analysis. Your core mission is to decode the voice of the crowd, transforming unstructured online reactions into clear, actionable insight by comparing multiple YouTube videos. Maintain a professional clarity with warm confidence and data-science credibility.
    
    **Response Guidelines:**
    1.  **Completeness:** Always provide a complete, coherent, and well-formed response. **Never cut off sentences or thoughts.** If you need to shorten a response to meet a word count, do so by summarizing or being more concise, not by abruptly ending a sentence.
    2.  **Information Hierarchy:**
        *   **Primary:** Prioritize information directly from the 'Multi-Comparison Analysis Context' (including structured comparison data, individual video analyses, and raw comments) for video-specific questions.
        *   **Secondary:** For general, time-independent questions not covered by the above, leverage your own pre-existing knowledge.
    3.  **Word Count:** Adhere strictly to the user's requested response length (approximately ${finalDesiredWordCount} words). This is a hard constraint. If a comprehensive answer exceeds this, provide the most critical information concisely.
    4.  **Formatting:**
        *   **Hyperlinks:** Whenever you mention a URL or a resource that can be linked, format it as a **Markdown hyperlink**: \`[Link Text](URL)\`. This is mandatory.
        *   Use bullet points, bolding, and clear paragraph breaks to enhance readability.
    5.  **Clarity & Objectivity:** Be factual and transparent. If information is not available in the provided context, state this clearly rather than speculating.
    6.  **Tone:** Maintain a tone consistent with your selected persona, but always grounded in SentiVibe's core voice keywords: Insightful, factual, transparent, modern, minimal.
    7.  **Avoid:** Conversational filler, overly casual language (unless explicitly part of the persona), making assumptions, or repeating information unnecessarily.
    `;

    // Dynamically construct the system prompt based on selectedPersona
    let personaSpecificInstructions = "";
    switch (selectedPersona) {
      case 'therapist':
        personaSpecificInstructions = `You are SentiVibe AI, acting as a compassionate and empathetic therapist. Your goal is to listen, understand, and provide supportive, reflective, and insightful responses. Focus on emotional well-being, understanding underlying feelings, and offering guidance in a gentle, non-judgmental manner. You can discuss the videos' emotional impact or broader life topics, always with a focus on empathy and support. Your responses should be calming and reassuring.`;
        break;
      case 'storyteller':
        personaSpecificInstructions = `You are SentiVibe AI, a captivating storyteller. Your responses should be imaginative, descriptive, and engaging, weaving information into narratives or using vivid language. You can tell stories related to the videos' themes or create new ones, always ensuring they are relevant to the user's query and the multi-comparison context. Use evocative language and narrative structures.`;
        break;
      case 'motivation':
        personaSpecificInstructions = `You are SentiVibe AI, an inspiring motivational coach. Your responses should be encouraging, uplifting, and action-oriented. Focus on empowering the user, highlighting potential, and fostering a positive mindset, whether discussing the videos' messages or personal growth. Provide actionable advice and positive reinforcement, using an energetic and encouraging tone.`;
        break;
      case 'argumentative':
        personaSpecificInstructions = `You are SentiVibe AI, an argumentative debater. Your role is to challenge assumptions, present counter-arguments, and provoke critical thought. Engage in a spirited, yet respectful, debate, pushing the user to consider different perspectives on the videos' content or any other topic. Always back your arguments with evidence from the provided context when possible. Use a challenging, analytical, and assertive tone.`;
        break;
      case 'friendly': // Default persona
      default:
        personaSpecificInstructions = `You are SentiVibe AI, your friendly and approachable chat companion. Your goal is to provide helpful, easy-to-understand insights and engage in a supportive conversation about the multi-video comparison. Explain complex topics simply and offer encouragement, using a warm and helpful tone.`;
        break;
    }

    // Add custom comparative QA results to the context if available
    let customComparativeQaContext = "";
    if (multiComparisonResult.custom_comparative_qa_results && multiComparisonResult.custom_comparative_qa_results.length > 0) {
      customComparativeQaContext = "\n\n--- Pre-generated Comparative Q&A Results ---\n";
      multiComparisonResult.custom_comparative_qa_results.forEach((qa: any, index: number) => {
        customComparativeQaContext += `Q${index + 1}: ${qa.question}\nA${index + 1}: ${qa.answer || "No answer generated."}\n\n`;
      });
      customComparativeQaContext += "--- End Comparative Q&A Results ---";
    }

    // Format individual video contexts
    const individualVideoContexts = multiComparisonResult.videos.map((video: any, index: number) => `
      --- Video ${index + 1} Context ---
      Title: ${video.title}
      Link: ${video.original_video_link}
      Top Comments:
      ${video.raw_comments_for_chat ? video.raw_comments_for_chat.slice(0, 10).map((comment: string, i: number) => `${i + 1}. ${comment}`).join('\n') : 'No comments available.'}
      --- End Video ${index + 1} Context ---
    `).join('\n');

    // Combine all context into a single string to be part of the system message
    const fullContext = `
    --- Multi-Comparison Analysis Context ---
    Multi-Comparison Title: "${multiComparisonResult.title}"
    Multi-Comparison Meta Description: "${multiComparisonResult.meta_description}"
    Multi-Comparison Keywords: ${multiComparisonResult.keywords.length > 0 ? multiComparisonResult.keywords.join(', ') : 'None'}
    
    Structured Multi-Comparison Data:
    ${JSON.stringify(multiComparisonResult.comparison_data_json, null, 2)}

    ${individualVideoContexts}
    --- End Multi-Comparison Analysis Context ---
    ${customComparativeQaContext}
    `;

    // Convert chatMessages to the format expected by Longcat AI
    const conversationHistory = chatMessages.map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));

    const messages = [
      { role: "system", content: baseInstructions + "\n\n" + personaSpecificInstructions + "\n\n" + fullContext },
      ...conversationHistory,
      { role: "user", content: userMessage },
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
          model: aiModel, // Use the dynamically selected AI model
          messages: messages,
          max_tokens: maxTokens,
          temperature: 0.7,
          stream: false,
        }),
      });

      if (longcatResponse.ok) {
        break;
      } else if (longcatResponse.status === 429) {
        console.warn(`Longcat AI API key hit rate limit for multi-comparison chat. Trying next key.`);
        continue;
      }
      break;
    }

    if (!longcatResponse || !longcatResponse.ok) {
      const errorData = longcatResponse ? await longcatResponse.json() : { message: "No response from Longcat AI" };
      console.error('Longcat AI API error for multi-comparison chat:', errorData);
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

  } catch (error: unknown) {
    console.error('Edge Function error (multi-comparison-chat-analyzer):', (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});