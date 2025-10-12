import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Removed 'Link' import as it's only used in Markdown, not as a React component.

const AnalyzeVideoGuide = () => {
  useEffect(() => {
    document.title = "Analyze a Single Video - SentiVibe Guide";
  }, []);

  const content = `
# How to Analyze a Single YouTube Video: A Comprehensive Hands-on Guide

This guide will walk you through every step of performing a detailed sentiment analysis on a single YouTube video using SentiVibe, ensuring you extract maximum value from audience feedback.

## 1. Accessing the Analysis Tool

You can initiate a single video analysis from multiple points within the SentiVibe platform:

*   **From the Main Navigation:** Click on **"Analyze a Video"** in the header or mobile navigation menu.
*   **From the Homepage:** Select the **"Analyze a Video"** call-to-action card on the SentiVibe landing page.
*   **From a Saved Blog Post:** If you're viewing a previously generated blog post (e.g., from the Analysis Library or My Analyses), click the **"Go to Video Analysis"** button. This will pre-fill the video link and allow you to re-analyze or add new custom questions.

## 2. Inputting Your Video Link

The first step is to provide the YouTube video you wish to analyze.

*   **Paste the YouTube URL:** In the designated input field, paste the complete URL of any public YouTube video. Ensure the link is valid and accessible.
*   **Important Requirement: Minimum 50 Comments:** Our AI requires a sufficient dataset to perform a robust and meaningful sentiment analysis. Therefore, the video **must have at least 50 comments**. If a video has fewer comments, the analysis will not proceed, and you will receive an error message prompting you to select a video with more audience engagement.
*   **Processing Time:** Please be aware that a full analysis involves fetching comments, processing data with advanced AI models, and generating insights. This process may take up to **30 seconds**. During this time, you'll see dynamic loading messages indicating the AI's progress.

## 3. Adding Custom Questions (Unlimited & Value-Packed)

SentiVibe empowers you to go beyond standard insights by asking specific, tailored questions about the video's content or audience sentiment. Our AI will provide detailed, context-aware answers as an integral part of your report.

*   **How to Add a Question:**
    *   Use the input field labeled "Question" to type your query. Be as precise as possible to get the most relevant answer.
    *   **Set Desired Word Count:** For each question, specify an approximate "Word Count" (e.g., 100, 200, 300, 500 words). The AI will intelligently aim to provide an answer close to this length, ensuring you get the right level of detail without unnecessary verbosity.
*   **Unlimited Questions:** You can add as many custom questions as you need. There are **no limits** on the number of questions you can ask per analysis, nor on the desired word count for each answer, regardless of your subscription tier.
*   **Adding More Questions:** Click the **[+] "Add Another Question"** button to dynamically add more input fields for additional queries.
*   **Removing Questions:** Click the **[X]** icon next to any question to remove it from your list.
*   **Intelligent Merging for Existing Analyses:** If you're re-analyzing a video or loading a saved analysis, any *new* custom questions you add will be processed by the AI, answered, and then **seamlessly merged with any existing custom Q&A results** already stored for that video. This creates a growing "Community Q&A" section, enriching the collective insights over time.

## 4. Initiating the Analysis

Once your video link is entered and all desired custom questions are added:

*   Click the **"Analyze Comments & Get Answers"** button.
*   **Loading State & Dynamic Messages:** The button will transform into a loading spinner, and you'll see dynamic messages (e.g., "Fetching video details...", "Analyzing audience sentiment...", "Answering custom questions with AI...") guiding you through the AI's progress.
*   **Daily Limits & Upgrade Prompt:** Keep a close eye on your "Analyses today" counter.
    *   **Free Tier (Authenticated & Unauthenticated):** Limited to **1 analysis per day**.
    *   **Paid Tier:** Enjoy **50 analyses per day** (effectively unlimited for most users).
    *   If you exceed your daily limit, the button will be disabled, and an alert will prompt you to [upgrade to a paid tier](/upgrade) for more analyses.

## 5. Understanding Your Comprehensive Analysis Report

After a successful analysis, a detailed, value-packed report will be displayed, providing a multi-faceted view of audience sentiment:

*   **Video Thumbnail, Title, Creator, Description:** Prominently displayed for immediate context and visual identification of the analyzed video.
*   **Last Full Analysis Timestamp:** A crucial indicator of data freshness. This timestamp shows when the core sentiment analysis (fetching comments, AI processing) was last performed. If this date is older than 30 days, the system will automatically trigger a re-analysis upon your next request or refresh.
*   **Overall Sentiment:** A high-level classification (e.g., **Positive**, **Negative**, **Neutral**, or **Mixed**). This is derived by giving significantly more weight to comments with higher like counts, ensuring the analysis reflects the most impactful opinions.
*   **Emotional Tones:** Identifies the prevalent emotions expressed in the comments (e.g., Joy, Excitement, Curiosity, Anger, Sadness, Surprise). This helps you understand the emotional landscape of your audience.
*   **Key Themes:** Highlights the main topics, recurring subjects, and dominant narratives discussed within the comment section. This reveals what aspects of your content resonate most or spark the most discussion.
*   **Summary Insights:** A concise, human-readable summary of the AI's overarching findings. This section synthesizes the overall sentiment, emotional tones, and key themes into actionable takeaways, with a clear emphasis on how popular comments influenced the AI's assessment.
*   **Community Q&A Section:** This is where the power of collective inquiry shines. It displays all AI-generated answers to the custom questions you (and potentially other users) have asked about this specific video. Each question and its AI-generated answer are presented clearly, providing targeted insights.
*   **Raw Comments (Top 10, by Popularity):** For direct user review and transparency, the actual text of the 10 most popular comments (sorted by like count) is explicitly listed. This allows you to quickly grasp the direct feedback that shaped the AI's analysis.

## 6. Actions After Analysis: Maximizing Your Insights

Once your report is generated, a suite of action buttons allows you to further explore, share, and interact with your insights:

*   **(YouTube icon) "Original Video" Button:** Click to open the original YouTube video in a new browser tab, allowing you to cross-reference the content with the analysis.
*   **(Link icon) "View Blog Post" Button:** Navigate directly to the full, SEO-optimized blog post generated for this analysis. This post is designed for public consumption and search engine visibility.
*   **(Refresh icon) "Refresh Analysis" Button:** Manually trigger a full re-analysis of the video. This is invaluable if you believe the video's comments or audience sentiment might have changed significantly since the \`Last Full Analysis\` timestamp, or if you simply want the absolute latest data.
*   **(Message icon) "Chat with AI" Button:** Open a dedicated pop-up chat dialog. Here, you can engage in an unlimited, context-aware conversation with SentiVibe's AI, asking follow-up questions about the analysis, comments, or custom Q&A. (For more details, refer to the [Interact with AI Chat Guide](/how-it-works/ai-chat)).
*   **(Download icon) "Download Report PDF" Button:** Save a professional, comprehensive PDF report of your analysis to your device. This report includes all AI-generated insights, custom Q&A, and raw comments, perfect for sharing or archiving. (For more details, refer to the [Download PDF Reports Guide](/how-it-works/pdf-export) for more details).

## 7. Optimal Usage Tips for Single Video Analysis

*   **Choose Engaged Videos:** Always prioritize videos with 50+ comments for the most accurate and insightful analysis.
*   **Targeted Questions:** Use custom questions to address specific hypotheses or areas of concern. For example, "What are the common complaints about X feature?" or "How did the audience react to the creator's stance on Y topic?"
*   **Regular Refresh:** For trending or controversial videos, use the "Refresh Analysis" feature periodically to capture evolving sentiment.
*   **Leverage AI Chat:** Don't just read the report; use the AI chat to ask "why" questions, explore nuances, or brainstorm content ideas based on the insights.
*   **SEO Benefits:** Share the generated blog post widely to drive organic traffic and establish your content authority.

By following this guide, you'll be able to harness the full power of SentiVibe's single video analysis to gain unparalleled insights into your audience.
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