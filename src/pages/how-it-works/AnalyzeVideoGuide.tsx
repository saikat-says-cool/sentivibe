import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Removed unused lucide-react icons: Youtube, PlusCircle, RefreshCw, MessageSquare, Download
// Removed unused Link import
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Removed 'Link' import as it's only used in Markdown, not as a React component.

const AnalyzeVideoGuide = () => {
  useEffect(() => {
    document.title = "Analyze a Single Video - SentiVibe Guide";
  }, []);

  const content = `
# How to Analyze a Single YouTube Video

This guide will walk you through the process of performing a sentiment analysis on a single YouTube video using SentiVibe.

## 1. Accessing the Analysis Tool

*   Navigate to the **"Analyze a Video"** page from the main navigation or the homepage.
*   You can also reach this page by clicking the **"Go to Video Analysis"** button from a saved blog post's detail page.

## 2. Inputting Your Video Link

*   **Paste the YouTube URL:** In the designated input field, paste the complete URL of the public YouTube video you wish to analyze.
*   **Important Requirement:** The video **must have at least 50 comments** for our AI to perform a robust and meaningful sentiment analysis. If a video has fewer comments, the analysis will not proceed, and you will receive an error message.
*   **Processing Time:** Please note that analysis may take up to **30 seconds** as our AI fetches comments, processes data, and generates insights.

## 3. Adding Custom Questions (Unlimited)

SentiVibe allows you to ask specific questions about the video's content or audience sentiment, and our AI will provide detailed answers as part of your report.

*   **Add a Question:** Use the input field labeled "Question" to type your query.
*   **Set Word Count:** For each question, specify a "Word Count" (e.g., 200, 300, 500 words). The AI will aim to provide an answer of approximately that length.
*   **Add More Questions:** Click the **[+] "Add Another Question"** button to add as many questions as you need. There are no limits on the number of questions or their desired word count.
*   **Remove Questions:** Click the **[X]** icon next to a question to remove it.

## 4. Initiating the Analysis

*   Once your video link is entered and any custom questions are added, click the **"Analyze Comments & Get Answers"** button.
*   **Loading State:** During the analysis, you will see a loading indicator with messages like "Fetching video details...", "Analyzing audience sentiment...", and "Answering custom questions with AI...".
*   **Daily Limits:** Keep an eye on your "Analyses today" counter. Free Tier users have a daily limit (1 analysis/day). If you exceed this, you'll be prompted to [upgrade](/upgrade).

## 5. Understanding Your Analysis Report

After a successful analysis, a detailed report will be displayed, including:

*   **Video Thumbnail, Title, Creator, Description:** Key information about the video.
*   **Last Full Analysis Timestamp:** Indicates when the core sentiment analysis was last performed, helping you gauge data freshness.
*   **Overall Sentiment:** A general classification (e.g., Positive, Negative, Neutral, Mixed).
*   **Emotional Tones:** Identifies prevalent emotions expressed in comments (e.g., Joy, Excitement, Anger).
*   **Key Themes:** Highlights the main topics and recurring subjects discussed by the audience.
*   **Summary Insights:** A concise, human-readable summary of the AI's findings, emphasizing how popular comments influenced the assessment.
*   **Community Q&A Section:** This section displays all AI-generated answers to the custom questions you (or other users) have asked about this specific video.
*   **Raw Comments (Top 10):** The actual text of the 10 most popular comments (by like count) is listed for direct review.

## 6. Actions After Analysis

*   **View Original Video:** Click the **(YouTube icon) "Original Video"** button to open the YouTube video in a new tab.
*   **View Blog Post:** Click the **(Link icon) "View Blog Post"** button to navigate to the full, SEO-optimized blog post generated for this analysis in the library.
*   **Refresh Analysis:** Click the **(Refresh icon) "Refresh Analysis"** button to manually trigger a full re-analysis. This is useful if you believe the video's comments or sentiment might have changed significantly since the last analysis, or if the \`Last Full Analysis\` timestamp indicates stale data.
*   **Chat with AI:** Click the **(Message icon) "Chat with AI"** button to open a pop-up chat dialog. Here, you can ask follow-up questions about the analysis, comments, or custom Q&A. (See the [Interact with AI Chat Guide](/how-it-works/ai-chat) for more details).
*   **Download Report PDF:** Click the **(Download icon) "Download Report PDF"** button to save a professional PDF report of your analysis. (See the [Download PDF Reports Guide](/how-it-works/pdf-export) for more details).

This comprehensive guide should help you make the most of SentiVibe's single video analysis capabilities!
  `;

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Analyze a Single Video</CardTitle>
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

export default AnalyzeVideoGuide;