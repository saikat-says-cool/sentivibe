import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import HowItWorksCopilot from '@/components/HowItWorksCopilot';

import productDocumentationContent from '/docs/PRODUCT_DOCUMENTATION.md?raw';
import technicalDocumentationContent from '/docs/TECHNICAL_DOCUMENTATION.md?raw';
import { useAuth } from '@/integrations/supabase/auth'; // Import useAuth

const content = `
## How to Analyze a Single Video

The "Analyze a Video" feature is your starting point for deep diving into audience sentiment for individual YouTube videos.

### Steps:
1.  **Navigate to "Analyze a Video":** Click on the "Analyze a Video" link in the header or on the homepage.
2.  **Enter Video Link:** Paste the full URL of the YouTube video you want to analyze into the input field.
3.  **Add Custom Questions (Optional):** You can add multiple custom questions about the video. For each question, specify a desired word count for the AI's answer. These questions will be answered by the AI and included in your report.
4.  **Initiate Analysis:** Click the "Analyze Comments & Get Answers" button.
    *   If the video has been analyzed recently, the report will load almost instantly.
    *   If the analysis is stale (older than 30 days) or you force a re-analysis, the system will fetch the latest comments and re-run the AI.
    *   Any new custom questions you add will always be processed and merged with existing community questions for that video.
5.  **Review the Report:** Once complete, a detailed report will display:
    *   Overall sentiment, emotional tones, and key themes.
    *   AI-generated answers to all community questions.
    *   The top 10 most popular raw comments.
6.  **Further Actions:**
    *   **View Blog Post:** Click "View Blog Post" to see the SEO-optimized blog post generated from the analysis.
    *   **Original Video:** Link directly to the YouTube video.
    *   **Refresh Analysis:** Manually trigger a full re-analysis to get the latest data.
    *   **Chat with AI:** Open a chat dialog to ask follow-up questions about the analysis.
    *   **Download Report PDF:** Save the report as a PDF.

This feature provides a comprehensive understanding of how audiences react to specific video content, helping you refine your content strategy.
`;

const AnalyzeVideoGuide = () => {
  useEffect(() => {
    document.title = "Analyze a Single Video - SentiVibe Guide";
  }, []);

  const { subscriptionStatus, subscriptionPlanId } = useAuth();
  const isPaidTier = subscriptionStatus === 'active' && subscriptionPlanId !== 'free';

  return (
    <div className="container mx-auto p-4 max-w-5xl flex flex-col md:flex-row gap-6 bg-background text-foreground">
      {/* HowItWorksSidebar is rendered by the parent HowItWorks.tsx */}
      <Card className="flex-1 mb-6 bg-card border-border">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Analyze a Single Video</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
          <div className="mt-8 flex justify-center">
            <HowItWorksCopilot
              productDocumentation={productDocumentationContent}
              technicalDocumentation={technicalDocumentationContent}
              isPaidTier={isPaidTier} // Pass isPaidTier to HowItWorksCopilot
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyzeVideoGuide;