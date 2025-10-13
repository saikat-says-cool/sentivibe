import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import HowItWorksCopilot from '@/components/HowItWorksCopilot'; // Import the new copilot

import productDocumentationContent from '/docs/PRODUCT_DOCUMENTATION.md?raw';
import technicalDocumentationContent from '/docs/TECHNICAL_DOCUMENTATION.md?raw';

const content = `
## Welcome to the SentiVibe Platform Overview

SentiVibe is an innovative web application designed to provide deep insights into public sentiment surrounding YouTube videos. Our platform leverages advanced AI to analyze video comments, extracting crucial data on overall sentiment, emotional tones, and key discussion themes.

### What You Can Do:
*   **Analyze Single Videos:** Get detailed sentiment analysis, emotional tones, key themes, and actionable insights for any YouTube video.
*   **Compare Multiple Videos:** Understand audience sentiment across two or more videos to identify commonalities and unique aspects.
*   **Interact with AI Chat:** Engage in context-aware conversations with our AI about any video analysis or comparison.
*   **Explore Libraries:** Browse and search public and personal collections of generated video analyses and comparisons.
*   **Download PDF Reports:** Get professional, shareable PDF reports of your analyses.

Our mission is to decode the voice of the crowd, transforming unstructured online reactions into clear, actionable insight. We aim to empower content creators, marketers, and researchers with the tools they need to truly understand their audience.
`;

const Overview = () => {
  useEffect(() => {
    document.title = "Overview - How SentiVibe Works";
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-5xl flex flex-col md:flex-row gap-6">
      {/* HowItWorksSidebar is rendered by the parent HowItWorks.tsx */}
      <Card className="flex-1 mb-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Platform Overview</CardTitle>
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

export default Overview;