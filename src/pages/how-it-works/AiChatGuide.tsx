import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AiChatGuide = () => {
  useEffect(() => {
    document.title = "Interact with AI Chat - SentiVibe Guide";
  }, []);

  const content = `
# How to Interact with SentiVibe's AI Chat: Your Conversational Insight Partner

SentiVibe's context-aware AI Chat is designed to be your dynamic conversational partner, allowing you to explore video analyses and comparisons with unprecedented depth. This guide explains every facet of using it effectively, from customization to optimal interaction.

## 1. Accessing the AI Chat Dialog

The AI Chat is seamlessly integrated across your analysis workflow, accessible from multiple points:

*   **From a Single Video Analysis Report:** After performing an analysis on the \`/analyze-video\` page, click the **(Message icon) "Chat with AI"** button.
*   **From a Single Video Blog Post Detail Page:** When viewing a saved analysis on the \`/blog/:slug\` page, click the **(Message icon) "Chat with AI"** button.
*   **From a Multi-Video Comparison Report:** After creating a comparison on the \`/create-multi-comparison\` page, click the **(Message icon) "Chat with AI"** button.
*   **From a Multi-Video Comparison Blog Post Detail Page:** When viewing a saved comparison on the \`/multi-comparison/:slug\` page, click the **(Message icon) "Chat with AI"** button.

In all cases, the chat will open in a dedicated pop-up dialog, pre-loaded with the full context of the specific analysis or comparison you were viewing.

## 2. Customizing Your AI Chat Experience: Tailor the Conversation

Before you even send your first message, SentiVibe allows you to fine-tune the AI's responses to match your specific needs and preferences.

*   **Select AI Persona:** Use the "Persona" dropdown menu to choose how the AI should communicate with you. Each persona offers a distinct tone and conversational style:
    *   **Friendly Assistant:** (Default) A warm, approachable, and helpful tone. Ideal for straightforward questions and easy-to-understand explanations.
    *   **Therapist:** Empathetic, reflective, and supportive responses. Focuses on understanding underlying feelings and offering gentle guidance, particularly useful for exploring emotional impacts of content.
    *   **Storyteller:** Imaginative, descriptive, and engaging narratives. The AI will weave information into compelling stories or use vivid language, great for creative brainstorming.
    *   **Motivational Coach:** Encouraging, uplifting, and action-oriented advice. Focuses on empowering you and fostering a positive mindset, useful for translating insights into growth strategies.
    *   **Argumentative:** Challenges assumptions, presents counter-arguments, and provokes critical thought. Engages in spirited, respectful debate, pushing you to consider different perspectives and strengthen your own analysis.
*   **Set Desired Word Count:** Use the "Response Word Count" input field to specify the approximate length of the AI's answers (e.g., 50, 150, 300, 500 words).
    *   **Precision Control:** The AI will intelligently aim to provide a response close to this length, ensuring you get the right level of detail without unnecessary verbosity or overly brief answers.
    *   **Unlimited Length:** There are **no limits** on the maximum word count you can request, regardless of your subscription tier.

## 3. Engaging in Conversation: Unlimited & Dynamic Interaction

Once your preferences are set, you can begin your interactive dialogue with the AI.

*   **Type Your Message:** Use the input field at the bottom of the chat dialog to type your questions, prompts, or follow-up queries.
*   **Send Message:** Click the **(Send icon)** button or press Enter to send your message.
*   **Loading Indicator:** While the AI is processing your request, you'll see a "Thinking..." message with a spinning loader, indicating that an insightful response is being formulated.
*   **Unlimited Messages:** You can send as many messages as you like within a chat session. There are **no daily or per-session limits** on the number of AI responses you can receive, regardless of your subscription tier.

## 4. AI's Context and Intelligence: Multi-Source Synthesis

The true power of SentiVibe's AI Chat lies in its ability to intelligently synthesize information from multiple, rich data sources to provide comprehensive and highly relevant answers:

*   **Video Analysis / Comparison Report Data:** The AI has full, real-time access to all the structured data from the initial analysis or comparison. This includes:
    *   **Single Video:** Overall sentiment, emotional tones, key themes, summary insights, video title, description, creator, tags, and timestamps.
    *   **Multi-Video Comparison:** Overall sentiment trends, common/divergent emotional tones, common/unique themes, summary insights, individual video summaries, and all comparative data points.
*   **Top Comments (Raw Text):**
    *   **Single Video:** The AI can reference the raw text of the top 10 most popular comments (by like count) for the specific video, allowing it to provide direct examples or deeper context from audience feedback.
    *   **Multi-Video Comparison:** For comparisons, it has access to the top 10 comments for *each* individual video included in the comparison, enabling it to draw nuanced comparative insights directly from audience verbatim.
*   **Community Q&A (Pre-generated Answers):** The AI is fully aware of all pre-generated answers to custom questions (both single video and comparative) that have been asked about the content. This means it can:
    *   Reference these answers directly.
    *   Elaborate on them with additional context.
    *   Synthesize information from multiple Q&A entries to answer broader questions.
*   **Pre-existing Knowledge:** For general or time-independent questions that are not directly covered by the specific video or comparison context, the AI leverages its vast general knowledge base to provide informed responses. **(Note: External search results are no longer used for chat context to optimize for cost-efficiency and reliability, ensuring the AI focuses on the most relevant, internal data.)**

## 5. Understanding AI Responses: Clarity, Formatting, and Adherence

*   **Markdown Formatting:** AI responses are rendered with rich Markdown formatting, significantly improving readability. This includes:
    *   **Bold text** for emphasis.
    *   *Italic text* for nuance.
    *   Bullet points and numbered lists for structured information.
    *   **Crucially, any URLs or resources mentioned by the AI are formatted as clickable Markdown hyperlinks** (e.g., \`[Link Text](URL)\`), allowing for easy navigation to external content if provided.
*   **Factual & Transparent:** The AI strives to be factual and transparent. If specific information is not available within the provided context (analysis data, comments, Q&A), it will clearly indicate this rather than speculating.
*   **Adherence to Preferences:** Responses will consistently reflect your chosen AI persona and the desired word count you specified, ensuring a tailored and efficient interaction.

## 6. Optimal Usage Tips for AI Chat

*   **Start Broad, Then Refine:** Begin with general questions (e.g., "Summarize the key insights from this comparison") and then ask more specific follow-up questions (e.g., "Can you elaborate on the divergent emotional tones in Video A?").
*   **Experiment with Personas:** Try different AI personas to see which style best suits your current analytical needs or creative brainstorming.
*   **Leverage Word Count:** Use lower word counts for quick summaries or definitions, and higher word counts for in-depth explanations or detailed comparative breakdowns.
*   **Ask "Why" and "How":** Don't just ask "what." Ask "Why do you think sentiment shifted?" or "How can I apply these insights to my next video?"
*   **Reference Specifics:** Feel free to reference specific comments, themes, or data points from the report in your questions to guide the AI's focus.
*   **Brainstorming Partner:** Use the AI as a brainstorming partner for new content ideas, marketing angles, or ways to address audience feedback.

By mastering SentiVibe's AI Chat, you transform raw data into dynamic, conversational insights, making your analysis process more interactive, efficient, and profoundly insightful.
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