import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Removed unused lucide-react icons: Youtube, GitCompare, MessageSquare, FileText, Search
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Overview = () => {
  useEffect(() => {
    document.title = "Overview - How SentiVibe Works";
  }, []);

  const content = `
# SentiVibe Platform Overview: Your Ultimate Guide to Audience Insights

Welcome to the SentiVibe Hands-on Guide! This section provides a high-level, yet comprehensive, overview of our platform's core functionalities and how they empower you to gain deep, actionable insights into YouTube video content. Our goal is to transform the noise of online reactions into clear, strategic intelligence for content creators, marketers, and researchers.

SentiVibe is meticulously designed to decode the "voice of the crowd," leveraging advanced AI to analyze audience sentiment, emotional tones, and key discussion themes across YouTube videos.

## Our Core Features: Unlocking the Power of SentiVibe

1.  **Analyze a Single Video: Deep Dive into Individual Content**
    *   **Effortless Input:** Simply paste any public YouTube video link.
    *   **Robust AI Analysis:** Our AI meticulously processes comments to identify overall sentiment (positive, negative, neutral, mixed), prevalent emotional tones (joy, anger, excitement), and key discussion themes.
    *   **Unlimited Custom Questions:** Ask as many specific questions as you need, and our AI will generate detailed answers, integrated directly into your report.
    *   **Intelligent Caching & Staleness Logic:** Analyses are saved and intelligently refreshed. If an analysis is older than 30 days or explicitly refreshed, our system re-analyzes the video to ensure you always have the freshest data. New custom questions are seamlessly merged with existing ones.

2.  **Compare Multiple Videos: Uncover Trends and Divergences**
    *   **Multi-Video Input:** Compare two or more YouTube video links side-by-side.
    *   **Comparative AI Insights:** Our AI generates structured data highlighting overall sentiment trends, common and divergent emotional tones, shared and unique themes, and summary insights across all selected videos.
    *   **Unlimited Custom Comparative Questions:** Tailor your comparison with unlimited specific questions, receiving AI-generated answers that provide deeper comparative context.
    *   **Smart Caching & Refresh:** Multi-comparisons are also cached and refreshed based on staleness or explicit user request, ensuring up-to-date comparative intelligence.

3.  **Programmatic SEO & Libraries: Maximize Discoverability and Organization**
    *   **Automated Blog Post Generation:** Every new analysis and comparison automatically generates a comprehensive, SEO-optimized blog post, complete with compelling titles, meta descriptions, keywords, and structured Markdown content.
    *   **Public Analysis Library:** Explore a vast, searchable collection of all generated single video analysis blog posts.
    *   **Public Comparison Library:** Browse and search all generated multi-video comparison blog posts.
    *   **"My Analyses" (Personal History):** For all authenticated users, a dedicated section to access and manage your personal history of analyses and comparisons.

4.  **Context-Aware AI Chat: Dynamic Conversations for Deeper Understanding**
    *   **Interactive Q&A:** Engage in dynamic, unlimited conversations with our AI about any video analysis or comparison.
    *   **Customizable AI Persona:** Choose from various AI personas (Friendly Assistant, Therapist, Storyteller, Motivational Coach, Argumentative) to tailor the AI's tone and style.
    *   **Precise Response Length Control:** Specify a desired word count for each AI response, ensuring you get information at the exact level of detail you need.
    *   **Multi-Source Intelligence:** The AI synthesizes information from your analysis reports, top comments, and pre-generated Q&A to provide comprehensive, context-rich answers.

5.  **AI Copilots: Your Smart Assistants for Discovery**
    *   **Library Copilot:** An AI assistant within the Analysis Library (and My Analyses) that helps you semantically search for specific video analyses and proactively recommends new analysis topics based on your interests.
    *   **Comparison Library Copilot:** An AI assistant in the Comparison Library that helps you find specific multi-video comparisons and suggests new comparative analysis topics.
    *   **Unlimited Queries:** Both Copilots offer unlimited queries, allowing for extensive exploration and discovery.

6.  **Professional PDF Reports: Shareable & Branded Insights**
    *   **One-Click Download:** Easily export any analysis or comparison report as a beautifully formatted PDF document.
    *   **Comprehensive Content:** Reports include all AI-generated insights, custom Q&A, raw comments, and the full blog post content.
    *   **Branded & Watermarked:** Features a professional SentiVibe header and footer. Free Tier reports include a subtle watermark, while Paid Tier users receive unwatermarked reports.

## Why SentiVibe? Your Strategic Advantage

SentiVibe is more than just an analysis tool; it's a strategic partner designed to:
*   **Save Time & Resources:** Automate complex analysis, content generation, and research, significantly reducing manual effort and API costs through intelligent caching.
*   **Ensure Data Freshness:** Our staleness logic and refresh options guarantee your insights are always current and relevant.
*   **Provide Deeper, Actionable Understanding:** Go beyond surface-level data with AI-driven insights, interactive conversations, and direct answers to your specific questions.
*   **Boost SEO & Content Strategy:** Automatically generate high-quality, SEO-optimized content, expanding your digital footprint and making your insights discoverable.
*   **Offer a Seamless & Intuitive Experience:** Enjoy a modern, responsive, and user-friendly interface that streamlines your workflow.

Ready to dive deeper? Use the navigation to explore detailed, hands-on guides for each feature and unlock the full potential of SentiVibe!
  `;

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Platform Overview</CardTitle>
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

export default Overview;