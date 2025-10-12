import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Removed unused lucide-react icons: MessageSquare, User, Bot
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AiChatGuide = () => {
  useEffect(() => {
    document.title = "Interact with AI Chat - SentiVibe Guide";
  }, []);

  const content = `
# How to Interact with SentiVibe's AI Chat

SentiVibe's context-aware AI Chat allows you to have dynamic conversations about your video analyses and comparisons. This guide explains how to use it effectively.

## 1. Accessing the AI Chat

You can open the AI Chat dialog from several places:

*   **From a Single Video Analysis Report:** Click the **(Message icon) "Chat with AI"** button on the \`/analyze-video\` page after an analysis is complete.
*   **From a Single Video Blog Post Detail Page:** Click the **(Message icon) "Chat with AI"** button on the \`/blog/:slug\` page.
*   **From a Multi-Video Comparison Report:** Click the **(Message icon) "Chat with AI"** button on the \`/create-multi-comparison\` page after a comparison is complete.
*   **From a Multi-Video Comparison Blog Post Detail Page:** Click the **(Message icon) "Chat with AI"** button on the \`/multi-comparison/:slug\` page.

The chat will open in a pop-up dialog, pre-loaded with the context of the specific analysis or comparison you were viewing.

## 2. Customizing Your AI Chat Experience

Before sending your first message, you can tailor the AI's responses:

*   **Select AI Persona:** Use the "Persona" dropdown to choose how the AI should communicate. Options include:
    *   **Friendly Assistant:** A warm, approachable, and helpful tone.
        *   **Therapist:** Empathetic, reflective, and supportive responses.
    *   **Storyteller:** Imaginative, descriptive, and engaging narratives.
    *   **Motivational Coach:** Encouraging, uplifting, and action-oriented advice.
    *   **Argumentative:** Challenges assumptions, presents counter-arguments, and provokes critical thought.
*   **Set Desired Word Count:** Use the "Response Word Count" input field to specify the approximate length of the AI's answers (e.g., 150, 300, 500 words). The AI will aim to provide a response close to this length.

## 3. Engaging in Conversation

*   **Type Your Message:** Use the input field at the bottom of the chat dialog to type your questions or prompts.
*   **Send Message:** Click the **(Send icon)** button or press Enter to send your message.
*   **Loading Indicator:** While the AI is processing, you'll see a "Thinking..." message with a spinning loader.
*   **Unlimited Messages:** There are no limits on the number of messages you can send in a chat session, regardless of your tier.

## 4. AI's Context and Intelligence

The AI is highly context-aware and synthesizes information from multiple sources to provide comprehensive answers:

*   **Video Analysis / Comparison Report Data:** It has full access to all the structured data from the analysis or comparison (overall sentiment, emotional tones, key themes, summary insights, comparative trends, etc.).
*   **Top Comments:** For single video analyses, it can reference the raw text of the top 10 most popular comments. For multi-comparisons, it has access to the top 10 comments for *each* video.
*   **Community Q&A:** The AI is aware of all pre-generated answers to custom questions (both single video and comparative) and can reference or elaborate on them.
*   **Pre-existing Knowledge:** For general or time-independent questions not directly covered by the video/comparison context, the AI leverages its vast general knowledge.

## 5. Understanding AI Responses

*   **Markdown Formatting:** AI responses are rendered with proper Markdown formatting, including **underlined hyperlinks** for any URLs or resources mentioned. This improves readability and allows you to click directly on links.
*   **Factual & Transparent:** The AI strives to be factual and transparent. If information is not available in the provided context, it will indicate that rather than speculating.
*   **Adherence to Preferences:** Responses will reflect your chosen persona and desired word count.

By utilizing these features, you can have a rich, interactive, and highly informative conversation with SentiVibe's AI to extract even deeper insights from your video analyses and comparisons.
  `;

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Interact with AI Chat</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </CardContent>
      </Card>
    </div>
  );
};

export default AiChatGuide;