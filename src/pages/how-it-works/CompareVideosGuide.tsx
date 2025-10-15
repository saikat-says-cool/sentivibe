import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import HowItWorksCopilot from '@/components/HowItWorksCopilot';

import productDocumentationContent from '/docs/PRODUCT_DOCUMENTATION.md?raw';
import technicalDocumentationContent from '/docs/TECHNICAL_DOCUMENTATION.md?raw';

const content = `
## How to Compare Multiple Videos

The "Compare Videos" feature allows you to analyze and contrast audience sentiment across several YouTube videos. This is ideal for competitive analysis, trend tracking, or understanding different content approaches.

### Steps:
1.  **Navigate to "Compare Videos":** Click on the "Compare Videos" link in the header or on the homepage.
2.  **Enter Video Links:** Paste the full URLs of at least two (and up to three) YouTube videos you wish to compare.
    *   **Note:** For reliable performance, comparisons are currently limited to a **maximum of 3 videos simultaneously**.
3.  **Add Custom Comparative Questions (Optional):** You can add specific questions tailored for comparative insights. These will be answered by the AI and integrated into your comparison report.
4.  **Initiate Comparison:** Click the "Create Multi-Video Comparison" button.
    *   The system will ensure each individual video's analysis is up-to-date, then perform a comprehensive comparative AI analysis.
5.  **Review the Comparison Report:** Once complete, a detailed report will display:
    *   Overall sentiment trends across videos.
    *   Common and divergent emotional tones and themes.
    *   Summary insights highlighting key differences and commonalities.
    *   AI-generated answers to your custom comparative questions.
    *   Top 10 raw comments for *each* video in the comparison.
6.  **Further Actions:**
    *   **View Full Multi-Comparison Blog Post:** See the SEO-optimized blog post generated from the comparison.
    *   **Click Video Thumbnails:** Navigate to the individual analysis report for any video in the comparison.
    *   **Refresh Comparison:** Manually trigger a full re-comparison to get the latest data.
    *   **Chat with AI:** Open a chat dialog to ask follow-up questions about the comparison.
    *   **Download Report PDF:** Save the comparison report as a PDF.

This feature provides a powerful way to understand how different videos resonate with audiences, helping you make data-driven decisions.
`;

const CompareVideosGuide = () => {
  useEffect(() => {
    document.title = "Compare Multiple Videos - SentiVibe Guide";
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-5xl flex flex-col md:flex-row gap-6 bg-background text-foreground">
      {/* HowItWorksSidebar is rendered by the parent HowItWorks.tsx */}
      <Card className="flex-1 mb-6 bg-card border-border">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Compare Multiple Videos</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
          <div className="mt-8 flex justify-center">
            <HowItWorksCopilot
              productDocumentation={productDocumentationContent}
              technicalDocumentation={technicalDocumentationContent}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompareVideosGuide;