import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Removed 'Link' import as it's only used in Markdown, not as a React component.

const CompareVideosGuide = () => {
  useEffect(() => {
    document.title = "Compare Multiple Videos - SentiVibe Guide";
  }, []);

  const content = `
# How to Compare Multiple YouTube Videos: A Deep Dive into Comparative Insights

This guide provides a comprehensive, hands-on walkthrough of SentiVibe's multi-video comparison feature, enabling you to analyze and understand audience sentiment across two or more YouTube videos. Uncover trends, divergences, and unique insights to inform your content strategy.

## 1. Accessing the Comparison Tool

You can initiate a multi-video comparison from several convenient locations:

*   **From the Main Navigation:** Click on **"Compare Videos"** in the header or mobile navigation menu.
*   **From the Homepage:** Select the **"Compare Videos"** call-to-action card on the SentiVibe landing page.
*   **From a Saved Multi-Comparison:** If you're viewing a previously generated multi-comparison blog post, click the **"Go to Multi-Comparison Analysis"** button. This will pre-fill the video links and allow you to re-compare or add new custom questions.

## 2. Inputting Video Links (Minimum 2, Max 3 for Reliable Performance)

The foundation of a multi-comparison is providing the YouTube video links you wish to analyze.

*   **Add Video URLs:** You'll initially see input fields for two YouTube video links. Paste the complete URL of each public YouTube video you want to include in your comparison.
*   **Minimum Requirement:** You must provide **at least two video links** to perform a comparison.
*   **Maximum for Reliability:** For reliable and stable performance, multi-video comparisons are currently limited to a **maximum of 3 videos simultaneously**. While the system might attempt more, performance and stability cannot be guaranteed beyond this limit due to underlying infrastructure constraints.
*   **Adding More Videos:** Click the **[+] "Add Another Video"** button to dynamically add more input fields. This button will be disabled once you reach the 3-video limit.
*   **Removing Videos:** Click the **[X]** icon next to a video link to remove it from your comparison list.
*   **Important Requirement: Each Video Needs 50+ Comments:** For the AI to perform a robust sentiment analysis for each individual video within the comparison, **each video must have at least 50 comments**. If any video in your list has fewer comments, the entire multi-comparison will not proceed, and an error message will guide you to select more engaged videos.
*   **Processing Time:** Multi-video comparisons are resource-intensive as they involve analyzing each video individually and then performing a comparative AI analysis. Expect the process to take up to **30 seconds per video** included in the comparison. Dynamic loading messages will keep you informed of the AI's progress.

## 3. Adding Custom Comparative Questions (Unlimited & Targeted)

Beyond the standard comparative insights, SentiVibe allows you to ask specific questions tailored to your comparison, receiving AI-generated answers that provide deeper, targeted context.

*   **How to Add a Question:**
    *   Use the input field labeled "Question" to type your comparative query (e.g., "What are the key differences in audience reaction between Video 1 and Video 3 regarding product features?").
    *   **Set Desired Word Count:** For each question, specify an approximate "Word Count" (e.g., 100, 200, 300 words). The AI will intelligently aim to provide an answer close to this length, ensuring concise and relevant information.
*   **Unlimited Questions:** You can add as many custom comparative questions as you need. There are **no limits** on the number of questions or their desired word count, regardless of your subscription tier.
*   **Adding More Questions:** Click the **[+] "Add Another Comparative Question"** button to dynamically add more input fields.
*   **Removing Questions:** Click the **[X]** icon next to any question to remove it.
*   **Intelligent Merging for Existing Comparisons:** If you're re-comparing videos or loading a saved comparison, any *new* custom questions you add will be processed by the AI, answered, and then **seamlessly merged with any existing custom Q&A results** already stored for that multi-comparison. This continuously enriches the comparative insights.

## 4. Initiating the Comparison

Once all video links are entered and all desired custom comparative questions are added:

*   Click the **"Create Multi-Video Comparison"** button.
*   **Loading State & Dynamic Messages:** The button will display a loading spinner, and you'll see dynamic messages (e.g., "Fetching individual video data...", "Performing AI multi-comparison analysis...", "Answering custom comparative questions with AI...") guiding you through the AI's progress.
*   **Daily Limits & Upgrade Prompt:** Monitor your "Comparisons today" counter.
    *   **Free Tier (Authenticated & Unauthenticated):** Limited to **1 comparison per day**.
    *   **Paid Tier:** Enjoy **20 comparisons per day** (designed to be effectively unlimited for typical usage).
    *   If you exceed your daily limit, the button will be disabled, and an alert will prompt you to [upgrade to a paid tier](/upgrade) for more comparisons.

## 5. Understanding Your Comprehensive Multi-Comparison Report

After a successful comparison, a detailed, value-packed report will be displayed, offering a holistic view of audience sentiment across your selected videos:

*   **Video Thumbnails (Clickable):** A prominent row of clickable thumbnails for each video included in the comparison. Clicking on any thumbnail will seamlessly navigate you to that video's **individual sentiment analysis report**, allowing for deep dives into specific content.
*   **Last Compared Timestamp:** This timestamp indicates when the full multi-comparison (including individual video analysis refreshes and comparative AI processing) was last performed, ensuring transparency about data freshness.
*   **Comparison Overview (Structured Multi-Comparison Data):** This section provides the core AI-generated comparative insights:
    *   **Overall Sentiment Trend:** A high-level summary of how audience sentiment evolves or differs across the compared videos.
    *   **Common Emotional Tones:** Identifies emotions consistently present across multiple videos.
    *   **Divergent Emotional Tones:** Highlights emotions that are unique or significantly more prevalent in specific videos.
    *   **Common Themes:** Pinpoints recurring topics and discussion points across the entire set of videos.
    *   **Unique Themes:** Reveals themes that are specific to individual videos, indicating distinct audience interests or content focus.
    *   **Summary Insights:** A concise, human-readable summary that synthesizes all comparative findings into actionable takeaways.
    *   **Individual Video Summaries:** Brief sentiment and theme summaries for each video within the comparison, providing quick context.
*   **Comparative Q&A Section:** Displays all AI-generated answers to the custom comparative questions you (and potentially other users) have asked about this specific multi-comparison. This provides targeted, in-depth answers to your most pressing comparative queries.
*   **Top 10 Comments for Each Video:** For granular review and transparency, a dedicated section lists the actual text of the 10 most popular comments (by like count) for *each* video included in the comparison. This allows you to directly examine the audience feedback that shaped the AI's insights.

## 6. Actions After Comparison: Deepening Your Analysis

Once your multi-comparison report is generated, a suite of action buttons allows you to further explore, share, and interact with your insights:

*   **View Individual Video Analysis (via Thumbnails):** As mentioned, clicking on any video thumbnail in the report will take you to its dedicated single video analysis page.
*   **(Link icon) "View Full Multi-Comparison Blog Post" Button:** Navigate directly to the comprehensive, SEO-optimized blog post generated for this multi-comparison. This post is designed for public consumption and search engine visibility.
*   **(Refresh icon) "Refresh Comparison" Button:** Manually trigger a full re-comparison. This is invaluable if you believe the underlying video comments or audience sentiment might have changed significantly since the \`Last Compared\` timestamp, or if you simply want the absolute latest comparative data.
*   **(Message icon) "Chat with AI" Button:** Open a dedicated pop-up chat dialog. Here, you can engage in an unlimited, context-aware conversation with SentiVibe's AI, asking follow-up questions about the multi-comparison, individual videos, or custom Q&A. (For more details, refer to the [Interact with AI Chat Guide](/how-it-works/ai-chat)).
*   **(Download icon) "Download Report PDF" Button:** Save a professional, comprehensive PDF report of your multi-comparison to your device. This report includes all AI-generated insights, custom Q&A, and raw comments for each video, perfect for sharing or archiving. (For more details, refer to the [Download PDF Reports Guide](/how-it-works/pdf-export) for more details).

## 7. Optimal Usage Tips for Multi-Video Comparison

*   **Strategic Grouping:** Compare videos that are thematically similar, part of a series, or represent different approaches to the same topic to identify meaningful trends.
*   **Targeted Comparative Questions:** Use custom questions to directly address your comparative hypotheses. Examples: "Which video generated more positive sentiment regarding the creator's authenticity?", "What are the unique emotional responses to Video A versus Video B?", "How do the key themes differ between the early and late videos in this series?"
*   **Monitor Evolving Trends:** For ongoing campaigns or series, use the "Refresh Comparison" feature to track shifts in audience perception over time.
*   **Leverage Individual Analysis:** Don't forget to click on individual video thumbnails to dive deeper into specific video insights before drawing overall comparative conclusions.
*   **Content Strategy:** Use comparative insights to refine your content strategy, identify successful elements, and understand audience expectations across different video types.

By mastering this guide, you'll unlock the full potential of SentiVibe's multi-video comparison feature, gaining a strategic edge in understanding complex audience dynamics.
  `;

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Compare Multiple Videos</CardTitle>
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

export default CompareVideosGuide;