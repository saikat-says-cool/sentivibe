import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import HowItWorksCopilot from '@/components/HowItWorksCopilot';

import productDocumentationContent from '/docs/PRODUCT_DOCUMENTATION.md?raw';
import technicalDocumentationContent from '/docs/TECHNICAL_DOCUMENTATION.md?raw';
import { useAuth } from '@/integrations/supabase/auth'; // Import useAuth

const content = `
## How to Interact with AI Chat

SentiVibe's context-aware AI Chat allows you to ask follow-up questions about your video analyses and comparisons.

### Key Features:
*   **Context-Aware:** The AI synthesizes information from your analysis report (sentiment, themes, summary, top comments, custom Q&A) to provide relevant answers.
*   **Customizable Persona:** Choose from various AI personas (Friendly Assistant, Therapist, Storyteller, Motivational Coach, Argumentative) to tailor the AI's tone.
*   **Unlimited Messages:** Ask an unlimited number of questions per session on any tier.
*   **DeepThink Mode (Paid Feature):** Toggle "DeepThink" mode for more nuanced and in-depth responses, utilizing a more powerful AI model. **This feature is available only for Paid Tier users.**
*   **DeepSearch Mode (Paid Feature):** Toggle "DeepSearch" mode to include real-time external search results from Google Custom Search in the AI's context for more comprehensive and up-to-date answers. **This feature is available only for Paid Tier users.**

### Steps:
1.  **Open Chat Dialog:** After any video analysis or comparison, click the "Chat with AI" button. This will open a pop-up chat interface.
2.  **Select Persona:** Use the "Persona" dropdown to choose your preferred AI conversational style.
3.  **Toggle DeepThink (Optional, Paid Feature):** Use the "DeepThink" switch to enable or disable the advanced AI model for more detailed responses. This will be disabled for Free Tier users.
4.  **Toggle DeepSearch (Optional, Paid Feature):** Use the "DeepSearch" switch to enable or disable the inclusion of real-time external search results. This will be disabled for Free Tier users.
5.  **Ask Questions:** Type your questions into the input field and press "Send." The AI will respond based on the loaded analysis context and your chosen settings.

The AI Chat is designed to help you explore your analysis data more interactively and get specific answers to your queries.
`;

const AiChatGuide = () => {
  useEffect(() => {
    document.title = "Interact with AI Chat - SentiVibe Guide";
  }, []);

  const { subscriptionStatus, subscriptionPlanId } = useAuth();
  const isPaidTier = subscriptionStatus === 'active' && subscriptionPlanId !== 'free';

  return (
    <div className="container mx-auto p-4 max-w-5xl flex flex-col md:flex-row gap-6 bg-background text-foreground">
      {/* HowItWorksSidebar is rendered by the parent HowItWorks.tsx */}
      <Card className="flex-1 mb-6 bg-card border-border">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Interact with AI Chat</CardTitle>
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

export default AiChatGuide;