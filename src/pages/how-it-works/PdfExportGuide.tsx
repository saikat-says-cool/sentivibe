import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Removed unused lucide-react icons: Download, FileText
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Removed 'Link' import as it's only used in Markdown, not as a React component.

const PdfExportGuide = () => {
  useEffect(() => {
    document.title = "Download PDF Reports - SentiVibe Guide";
  }, []);

  const content = `
# How to Download PDF Reports

SentiVibe allows you to export your detailed video analysis and multi-comparison reports as professional PDF documents. This guide explains how to do it and what to expect.

## 1. Where to Download Reports

You can download a PDF report from:

*   **Single Video Analysis Report Page:** After performing an analysis on the \`/analyze-video\` page.
*   **Single Video Blog Post Detail Page:** On the \`/blog/:slug\` page for any individual video analysis.
*   **Multi-Video Comparison Report Page:** After performing a comparison on the \`/create-multi-comparison\` page.
*   **Multi-Video Comparison Blog Post Detail Page:** On the \`/multi-comparison/:slug\` page for any multi-video comparison.

Look for the **(Download icon) "Download Report PDF"** button.

## 2. Content of the PDF Report

The generated PDF report is a comprehensive document that includes:

*   **Branded Header:** A professional header featuring the SentiVibe logo and the tagline "YouTube Audience Insight Report."
*   **Video/Comparison Details:** All key information about the video(s) or comparison, including titles, thumbnails, creators, descriptions, and relevant timestamps.
*   **AI-Generated Insights:** The full sentiment analysis (for single videos) or structured comparative data (for multi-videos), including overall sentiment, emotional tones, key themes, and summary insights.
*   **Community Q&A:** All AI-generated answers to custom questions (single video) or custom comparative questions (multi-video) are included.
*   **Top Raw Comments:** The top 10 most popular comments for the single video, or for each video in a multi-comparison, are listed.
*   **Full Blog Post Content:** The complete SEO-optimized blog post content is also included.
*   **Branded Footer:** A footer with copyright information and a disclaimer that analyses are AI-generated.

## 3. Free Tier vs. Paid Tier PDF Reports

SentiVibe offers different PDF report experiences based on your subscription tier:

*   **Free Tier Reports:** If you are using the Free Tier (either unauthenticated or authenticated free user), your PDF reports will include a **"SentiVibe - Free Tier" watermark**. This watermark is subtly placed across the report pages.
*   **Paid Tier Reports:** Users with an active Paid Tier subscription receive **unwatermarked, professional PDF reports**. This is one of the premium benefits of upgrading.

## 4. Tips for Downloading

*   **Ensure Content is Loaded:** Make sure the full report content is visible on the page before clicking the download button to ensure all data is captured in the PDF.
*   **Filename:** The PDF filename is automatically generated based on the video or comparison title for easy organization.
*   **Sharing & Archiving:** These PDF reports are ideal for sharing insights with clients, team members, or for archiving your research findings.

By following these steps, you can easily generate and utilize professional PDF reports from SentiVibe.
  `;

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Download PDF Reports</CardTitle>
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

export default PdfExportGuide;