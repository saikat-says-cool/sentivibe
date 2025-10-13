import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Removed: import HowItWorksSidebar from '@/components/HowItWorksSidebar';
import HowItWorksCopilot from '@/components/HowItWorksCopilot'; // Import the new copilot

import productDocumentationContent from '/docs/PRODUCT_DOCUMENTATION.md?raw';
import technicalDocumentationContent from '/docs/TECHNICAL_DOCUMENTATION.md?raw';

const content = `
## How to Interact with AI Chat

SentiVibe's context-aware AI Chat allows you to ask follow-up questions about your video analyses and comparisons.

### Key Features:
*   **Context-Aware:** The AI synthesizes information from your analysis report (sentiment, themes, summary, top comments, custom Q&A) to provide relevant answers.
*   **Customizable Persona:** Choose from various AI personas (Friendly Assistant, Therapist, Storyteller, Motivational Coach, Argumentative) to tailor the AI's tone.
*   **Precise Response Length:** Specify a desired word count for each AI response to control the level of detail.
*   **DeepThink Mode:** Toggle "DeepThink" mode for more nuanced and in-depth responses, utilizing a more powerful AI model.

### Steps:
1.  **Open Chat Dialog:** After any video analysis or comparison, click the "Chat with AI" button. This will open a pop-up chat interface.
2.  **Select Persona:** Use the "Persona" dropdown to choose your preferred AI conversational style.
3.  **Set Word Count:** Enter a number in the "Response Word Count" field to control the length of the AI's answers.
4.  **Toggle DeepThink (Optional):** Use the "DeepThink" switch to enable or disable the advanced AI model for more detailed responses.
5.  **Ask Questions:** Type your questions into the input field and press "Send." The AI will respond based on the loaded analysis context and your chosen settings.

The AI Chat is designed to help you explore your analysis data more interactively and get specific answers to your queries.
`;

const AiChatGuide = () => {
  useEffect(() => {
    document.title = "Interact with AI Chat - SentiVibe Guide";
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-5xl flex flex-col md:flex-row gap-6">
      {/* HowItWorksSidebar is rendered by the parent HowItWorks.tsx */}
      <Card className="flex-1 mb-6">
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
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AiChatGuide;