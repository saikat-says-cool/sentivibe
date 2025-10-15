import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import HowItWorksCopilot from '@/components/HowItWorksCopilot';

import productDocumentationContent from '/docs/PRODUCT_DOCUMENTATION.md?raw';
import technicalDocumentationContent from '/docs/TECHNICAL_DOCUMENTATION.md?raw';

const content = `
## How to Explore Libraries & AI Copilots

SentiVibe offers dedicated libraries for both single video analyses and multi-video comparisons, each enhanced with an AI Copilot to help you navigate and discover.

### Video Analysis Library:
*   **Purpose:** Browse and search all publicly available single video analysis blog posts.
*   **Access:** Navigate to "Analysis Library" from the header.
*   **Search & Filter:** Use the search bar to find analyses by title, creator, or keywords. You can also filter by category.
*   **Library Copilot:** Click the "Library Copilot" button to open an AI assistant. Ask it to find specific analyses or suggest new video analysis topics based on your interests. This Copilot also supports "DeepThink" mode for more detailed recommendations and "DeepSearch" mode to include real-time external search results.

### Multi-Comparison Library:
*   **Purpose:** Browse and search all publicly available multi-video comparison blog posts.
*   **Access:** Navigate to "Comparison Library" from the header.
*   **Search & Filter:** Use the search bar to find comparisons by title, video titles, or keywords.
*   **Comparison Copilot:** Click the "Comparison Copilot" button to open an AI assistant. Ask it to find specific comparisons or suggest new comparative analysis topics. This Copilot also supports "DeepThink" mode for more detailed recommendations and "DeepSearch" mode to include real-time external search results.

### My Analyses:
*   **Purpose:** For authenticated users, this page lists all your personal single video analyses.
*   **Access:** Log in and navigate to "My Analyses" from the header.
*   **Functionality:** Similar search and Library Copilot features as the public Analysis Library, but focused on your own content.

These libraries and their AI Copilots are designed to make managing and discovering insights from your analyses and comparisons effortless.
`;

const LibrariesGuide = () => {
  useEffect(() => {
    document.title = "Explore Libraries & AI Copilots - SentiVibe Guide";
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-5xl flex flex-col md:flex-row gap-6 bg-background text-foreground">
      {/* HowItWorksSidebar is rendered by the parent HowItWorks.tsx */}
      <Card className="flex-1 mb-6 bg-card border-border">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Explore Libraries & AI Copilots</CardTitle>
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

export default LibrariesGuide;