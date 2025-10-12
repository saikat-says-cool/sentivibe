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
# SentiVibe Platform Overview

Welcome to the SentiVibe Hands-on Guide! This section provides a high-level overview of our platform's core functionalities and how they empower you to gain deep insights into YouTube video content.

SentiVibe is designed to decode the "voice of the crowd," transforming unstructured online reactions into clear, actionable intelligence. Whether you're a content creator, marketer, or researcher, our AI-powered tools help you understand audience sentiment, emotional tones, and key discussion themes.

## Our Core Features:

1.  **Analyze a Single Video:**
    *   Paste a YouTube link to get detailed sentiment analysis.
    *   Identify overall sentiment, emotional tones, and key themes.
    *   Add unlimited custom questions for AI-generated answers.
    *   Benefit from intelligent caching and staleness logic for fresh data.

2.  **Compare Multiple Videos:**
    *   Conduct comparative sentiment analysis across two or more YouTube videos.
    *   Uncover commonalities, unique aspects, and overall sentiment trends.
    *   Ask unlimited custom comparative questions for tailored insights.
    *   Enjoy smart caching and refresh capabilities for multi-comparisons.

3.  **Programmatic SEO & Libraries:**
    *   Automatically generate SEO-optimized blog posts for every analysis and comparison.
    *   Explore public "Analysis Library" and "Comparison Library" for all reports.
    *   Utilize "My Analyses" for your personal history (available for all authenticated users).

4.  **Context-Aware AI Chat:**
    *   Engage in dynamic conversations with our AI about any analysis or comparison.
    *   Customize AI personas and control response length with desired word counts.
    *   AI synthesizes information from video data, comments, and pre-generated Q&A.

5.  **AI Copilots:**
    *   Use AI assistants in the libraries to semantically search your reports.
    *   Get proactive recommendations for new analysis and comparison topics.

6.  **Professional PDF Reports:**
    *   Download comprehensive, branded PDF reports of your analyses and comparisons.
    *   Reports include all AI-generated answers to custom questions.
    *   Watermarking for Free Tier users, unwatermarked for Paid Tier.

## Why SentiVibe?

SentiVibe saves you time, ensures data freshness, and provides deeper, actionable understanding of your audience. Our platform is built with a public-first approach, offering generous free tier limits and an ad-free, enhanced experience for paid subscribers.

Ready to dive deeper? Use the navigation to explore detailed guides for each feature!
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