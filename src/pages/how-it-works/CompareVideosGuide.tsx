import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Removed unused lucide-react icons: GitCompare, PlusCircle, RefreshCw, MessageSquare, Download, Youtube
// Removed unused Link import
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Removed 'Link' import as it's only used in Markdown, not as a React component.

const CompareVideosGuide = () => {
  useEffect(() => {
    document.title = "Compare Multiple Videos - SentiVibe Guide";
  }, []);

  const content = `
# How to Compare Multiple YouTube Videos

SentiVibe's multi-video comparison feature allows you to analyze audience sentiment and insights across two or more YouTube videos. This guide explains how to use it.

## 1. Accessing the Comparison Tool

*   Navigate to the **"Compare Videos"** page from the main navigation or the homepage.
*   You can also reach this page by clicking the **"Go to Multi-Comparison Analysis"** button from a saved multi-comparison's detail page.

## 2. Inputting Video Links (Minimum 2)

*   **Add Video URLs:** You'll see input fields for YouTube video links. You need to provide at least two video links to perform a comparison.
*   **Add More Videos:** Click the **[+] "Add Another Video"** button to add more input fields for additional videos. There's no upper limit to the number of videos you can compare.
*   **Remove Videos:** Click the **[X]** icon next to a video link to remove it.
*   **Important Requirement:** Each individual video **must have at least 50 comments** for its analysis to be included in the comparison. If any video has fewer comments, the comparison will not proceed.
*   **Processing Time:** Multi-video comparisons can take longer than single analyses, as each video needs to be processed. Expect up to **30 seconds per video** for the full comparison to complete.

## 3. Adding Custom Comparative Questions (Unlimited)

Beyond the standard comparative insights, you can ask specific questions tailored to your comparison.

*   **Add a Question:** Use the input field labeled "Question" to type your comparative query (e.g., "What are the key differences in audience reaction between Video 1 and Video 3?").
*   **Set Word Count:** Specify a "Word Count" for the AI's answer.
*   **Add More Questions:** Click the **[+] "Add Another Comparative Question"** button to add as many questions as you need. There are no limits on the number of questions or their desired word count.

## 4. Initiating the Comparison

*   Once all video links are entered and any custom questions are added, click the **"Create Multi-Video Comparison"** button.
*   **Loading State:** You will see a loading indicator with messages like "Fetching individual video data...", "Performing AI multi-comparison analysis...", and "Answering custom comparative questions with AI...".
*   **Daily Limits:** Your "Comparisons today" counter tracks your usage. Free Tier users have a daily limit (1 comparison/day). Exceeding this will prompt you to [upgrade](/upgrade).

## 5. Understanding Your Multi-Comparison Report

After a successful comparison, a detailed report will be displayed, including:

*   **Video Thumbnails:** A row of clickable thumbnails for each video in the comparison. Clicking on a thumbnail will take you to that video's individual sentiment analysis report.
*   **Last Compared Timestamp:** Indicates when the full multi-comparison was last performed.
*   **Comparison Overview:**
    *   **Overall Sentiment Trend:** General shifts in sentiment across all videos.
    *   **Common & Divergent Emotional Tones:** Emotions shared across videos or unique to specific ones.
    *   **Common & Unique Themes:** Topics discussed across all videos or specific to one.
    *   **Summary Insights:** A high-level overview of the key comparative findings.
    *   **Individual Video Summaries:** Brief sentiment and theme summaries for each video.
*   **Comparative Q&A Section:** Displays all AI-generated answers to your custom comparative questions.
*   **Top 10 Comments for Each Video:** A dedicated section lists the 10 most popular comments for *each* video included in the comparison, allowing for granular review.

## 6. Actions After Comparison

*   **View Individual Video Analysis:** Click on any video thumbnail in the report to navigate to its dedicated single video analysis page.
*   **View Full Multi-Comparison Blog Post:** Click the **"View Full Multi-Comparison Blog Post"** button to go to the SEO-optimized blog post generated for this comparison in the library.
*   **Refresh Comparison:** Click the **(Refresh icon) "Refresh Comparison"** button to manually trigger a full re-comparison. This is useful if you believe the underlying video comments or sentiment might have changed, or if the \`Last Compared\` timestamp indicates stale data.
*   **Chat with AI:** Click the **(Message icon) "Chat with AI"** button to open a pop-up chat dialog. Here, you can ask follow-up questions about the comparison, individual videos, or custom Q&A. (See the [Interact with AI Chat Guide](/how-it-works/ai-chat) for more details).
*   **Download Report PDF:** Click the **(Download icon) "Download Report PDF"** button to save a professional PDF report of your multi-comparison. (See the [Download PDF Reports Guide](/how-it-works/pdf-export) for more details).

This guide will help you leverage SentiVibe's powerful multi-video comparison features to gain deeper, comparative audience insights.
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