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

    const { userQuery, chatMessages, productDocumentation, technicalDocumentation, deepThinkMode, deepSearchMode, selectedPersona } = await req.json(); // Removed desiredWordCount

    if (!userQuery || !productDocumentation || !technicalDocumentation) {
      return new Response(JSON.stringify({ error: 'User query and documentation content are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // --- Fetch External Context if DeepSearch is enabled ---
    let externalContext = '';
    if (deepSearchMode) {
      const externalContextQuery = `${userQuery} SentiVibe documentation`;
      const fetchExternalContextResponse = await supabaseClient.functions.invoke('fetch-external-context', {
        body: { query: externalContextQuery },
      });

      if (fetchExternalContextResponse.error) {
        console.warn("Error fetching external context for How It Works Copilot:", fetchExternalContextResponse.error);
        externalContext = `(Note: Failed to fetch external context: ${fetchExternalContextResponse.error.message})`;
      } else {
        externalContext = fetchExternalContextResponse.data.externalSearchResults;
      }
    }

    // --- Longcat AI API Call ---
    const longcatApiKeys = getApiKeys('LONGCAT_AI_API_KEY');
    if (longcatApiKeys.length === 0) {
      return new Response(JSON.stringify({ error: 'Longcat AI API key(s) not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const maxTokens = 8000; // Set a generous max_tokens, let the AI decide length based on prompt

    // Determine which Longcat AI model to use
    const aiModel = deepThinkMode ? "LongCat-Flash-Thinking" : "LongCat-Flash-Chat";

    // Base instructions for all personas, emphasizing completeness and expert knowledge
    const baseInstructions = `
    You are SentiVibe AI, the highly competent and expert Guide Assistant. Your core mission is to help users understand every aspect of the SentiVibe application, from its high-level product features to its intricate technical architecture and code. You have been trained with the entire product and technical documentation, including all code details, potential loopholes, and blindspots. Your goal is to solve any problem a user might encounter while learning about or using SentiVibe.

    **Response Guidelines:**
    1.  **Expertise & Competence:** Always demonstrate deep expertise in SentiVibe's product features, technical architecture, codebase, and potential issues. Provide comprehensive and accurate solutions to user problems.
    2.  **Adaptive Length & Conciseness:** Respond with an appropriate length based on the user's query. Be as concise as possible by default, providing direct answers. Expand on topics only when explicitly asked for more detail or when the complexity of the question clearly warrants a longer explanation. For simple greetings, a short, friendly response is sufficient.
    3.  **Completeness:** Always provide a complete, coherent, and well-formed response. **Never cut off sentences or thoughts.**
    4.  **Information Hierarchy:**
        *   **Primary:** Prioritize information directly from the provided 'Product Documentation' and 'Technical Documentation' for SentiVibe-specific questions, including code examples where relevant.
        *   **Secondary:** If 'External Search Results' are provided, integrate them to enhance the answer, especially for broader or real-time context.
        *   **Tertiary:** For general, time-independent questions not covered by the above, leverage your own pre-existing knowledge.
    5.  **Formatting:**
        *   **Markdown:** Use Markdown extensively for clarity, including headings, bullet points, bolding, and code blocks for code snippets.
        *   **Hyperlinks:** Whenever you mention a URL or a resource that can be linked, format it as a **Markdown hyperlink**: \`[Link Text](URL)\`. This is mandatory.
    6.  **Clarity & Transparency:** Be factual and transparent. If information is not available in the provided context, state this clearly rather than speculating.
    7.  **Tone:** Maintain a tone consistent with your selected persona, but always grounded in SentiVibe's core voice keywords: Insightful, factual, transparent, modern, minimal.
    8.  **Avoid:** Conversational filler, overly casual language (unless explicitly part of the persona), making assumptions, or repeating information unnecessarily.
    `;

    // Dynamically construct the system prompt based on selectedPersona
    let personaSpecificInstructions = "";
    switch (selectedPersona) {
      case 'therapist':
        personaSpecificInstructions = `You are SentiVibe AI, acting as a compassionate and empathetic therapist. Your goal is to listen, understand, and provide supportive, reflective, and insightful responses. Focus on emotional well-being, understanding underlying feelings, and offering guidance in a gentle, non-judgmental manner. You can discuss the user's learning process or broader challenges, always with a focus on empathy and support. Your responses should be calming and reassuring.`;
        break;
      case 'storyteller':
        personaSpecificInstructions = `You are SentiVibe AI, a captivating storyteller. Your responses should be imaginative, descriptive, and engaging, weaving information into narratives or using vivid language. You can tell stories related to SentiVibe's features or development, always ensuring they are relevant to the user's query and the documentation context. Use evocative language and narrative structures.`;
        break;
      case 'motivation':
        personaSpecificInstructions = `You are SentiVibe AI, an inspiring motivational coach. Your responses should be encouraging, uplifting, and action-oriented. Focus on empowering the user, highlighting potential, and fostering a positive mindset, whether discussing SentiVibe's capabilities or personal growth in using the platform. Provide actionable advice and positive reinforcement, using an energetic and encouraging tone.`;
        break;
      case 'argumentative':
        personaSpecificInstructions = `You are SentiVibe AI, an argumentative debater. Your role is to challenge assumptions, present counter-arguments, and provoke critical thought. Engage in a spirited, yet respectful, debate, pushing the user to consider different perspectives on SentiVibe's design, functionality, or any other topic. Always back your arguments with evidence from the provided documentation when possible. Use a challenging, analytical, and assertive tone.`;
        break;
      case 'friendly': // Default persona
      default:
        personaSpecificInstructions = `You are SentiVibe AI, your friendly and approachable Guide Assistant. Your goal is to provide helpful, easy-to-understand insights and engage in a supportive conversation about SentiVibe. Explain complex topics simply and offer encouragement, using a warm and helpful tone.`;
        break;
    }

    // Combine all context into a single string to be part of the system message
    const fullContext = `
    --- SentiVibe Product Documentation ---
    ${productDocumentation}
    --- End SentiVibe Product Documentation ---

    --- SentiVibe Technical Documentation (including code details, loopholes, blindspots) ---
    ${technicalDocumentation}
    --- End SentiVibe Technical Documentation ---
    ${externalContext ? `\n\n--- External Search Results ---\n${externalContext}\n--- End External Search Results ---` : ''}
    `;

    // Convert chatMessages to the format expected by Longcat AI
    const conversationHistory = chatMessages.map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));

    const messages = [
      { role: "system", content: baseInstructions + "\n\n" + personaSpecificInstructions + "\n\n" + fullContext },
      ...conversationHistory,
      { role: "user", content: userQuery },
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
        console.warn(`Longcat AI API key hit rate limit for How It Works Copilot. Trying next key.`);
        continue;
      }
      break;
    }

    if (!longcatResponse || !longcatResponse.ok) {
      const errorData = longcatResponse ? await longcatResponse.json() : { message: "No response from Longcat AI" };
      console.error('Longcat AI API error for How It Works Copilot:', errorData);
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
    console.error('Edge Function error (how-it-works-copilot-analyzer):', (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});