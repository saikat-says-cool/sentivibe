// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { userMessage, chatMessages, analysisResult, externalContext, outputLengthPreference } = await req.json(); // Receive outputLengthPreference

    if (!userMessage || !analysisResult) {
      return new Response(JSON.stringify({ error: 'User message and analysis result are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // --- Longcat AI API Call ---
    // @ts-ignore
    const longcatApiKey = Deno.env.get('LONGCAT_AI_API_KEY');
    if (!longcatApiKey) {
      return new Response(JSON.stringify({ error: 'Longcat AI API key not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Determine max_tokens based on outputLengthPreference
    let maxTokens = 500; // Default to a reasonable standard length
    switch (outputLengthPreference) {
      case 'concise':
        maxTokens = 150;
        break;
      case 'standard':
        maxTokens = 500;
        break;
      case 'detailed':
        maxTokens = 1000;
        break;
      default:
        maxTokens = 500; // Fallback
    }

    // Construct the AI prompt with full context
    let systemPrompt = `Hey there! I'm SentiVibe AI, your friendly chat companion. I'm here to help you explore insights from YouTube videos and chat about anything else that comes to mind, just like a friend would.
    When you ask a question:
    - I'll always start by checking the video analysis (including those top comments!) and any recent external info I have to give you the most relevant answers about the video.
    - But don't feel limited! If your question goes beyond the video or the external context, I'm happy to share my general knowledge and chat about broader topics.
    I'll try to keep my answers clear and to the point, but I can also dive into more detail if you ask, or if the topic is complex. I'll also keep your preferred response length in mind. Let's chat!`;

    let conversationHistory = chatMessages.map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));

    // Ensure the initial analysis context is always at the beginning of the conversation for the AI
    // Now includes the top comments explicitly
    const analysisContext = `
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
    `;

    let userPromptContent = `Based on the video analysis and our conversation so far, please answer my question.`;

    if (externalContext) { // Use the received externalContext
      userPromptContent += `\n\n--- Recent External Information ---\n${externalContext}\n--- End External Information ---`;
      userPromptContent += `\n\nMy question: ${userMessage}`;
    } else {
      userPromptContent += `\n\nMy question: ${userMessage}`;
    }

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: analysisContext + userPromptContent }, // Combine analysis context with the user's prompt
    ];

    // If there's existing chat history, append it after the initial context
    if (conversationHistory.length > 0) {
      // Remove the last user message from conversationHistory as it's already in userPromptContent
      const lastMessage = conversationHistory[conversationHistory.length - 1];
      if (lastMessage.role === 'user' && lastMessage.content === userMessage) {
        conversationHistory = conversationHistory.slice(0, -1);
      }
      messages.push(...conversationHistory);
    }
    
    // Add the current user message as the last message in the conversation
    messages.push({ role: "user", content: userMessage });


    const longcatApiUrl = "https://api.longcat.chat/openai/v1/chat/completions";
    const longcatResponse = await fetch(longcatApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${longcatApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "LongCat-Flash-Chat",
        messages: messages,
        max_tokens: maxTokens, // Use dynamic maxTokens
        temperature: 0.7,
      }),
    });

    if (!longcatResponse.ok) {
      const errorData = await longcatResponse.json();
      console.error('Longcat AI API error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to get AI response from Longcat AI', details: errorData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: longcatResponse.status,
      });
    }

    const longcatData = await longcatResponse.json();
    const aiResponseContent = longcatData.choices[0].message.content;

    return new Response(JSON.stringify({
      aiResponse: aiResponseContent,
    }), {
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