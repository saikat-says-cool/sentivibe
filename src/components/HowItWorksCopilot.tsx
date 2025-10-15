import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { LifeBuoy } from 'lucide-react'; // Using LifeBuoy icon for support
import ChatInterface from './ChatInterface';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TooltipWrapper } from '@/components/ui/tooltip'; // Import TooltipWrapper

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface HowItWorksCopilotProps {
  productDocumentation: string;
  technicalDocumentation: string;
  isPaidTier: boolean; // New prop
}

const HowItWorksCopilot: React.FC<HowItWorksCopilotProps> = ({ productDocumentation, technicalDocumentation, isPaidTier }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [deepThinkMode, setDeepThinkMode] = useState<boolean>(false);
  const [deepSearchMode, setDeepSearchMode] = useState<boolean>(false);
  const [selectedPersona, setSelectedPersona] = useState<string>("friendly");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setChatMessages([
        {
          id: 'ai-initial',
          sender: 'ai',
          text: "Hello! I'm your SentiVibe Guide Assistant. I'm here to help you with any questions about how SentiVibe works, its features, or even its underlying code. What can I assist you with today?",
        },
      ]);
      setError(null);
    } else {
      setChatMessages([]);
      setError(null);
      setDeepThinkMode(false);
      setDeepSearchMode(false);
      setSelectedPersona("friendly");
    }
  }, [isOpen]);

  const copilotChatMutation = useMutation({
    mutationFn: async (userQuery: string) => {
      const newUserMessage: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text: userQuery,
      };
      setChatMessages((prev) => [...prev, newUserMessage]);

      const aiPlaceholderMessage: Message = {
        id: Date.now().toString() + '-ai',
        sender: 'ai',
        text: '', // Start with empty text for streaming
      };
      setChatMessages((prev) => [...prev, aiPlaceholderMessage]);

      const response = await supabase.functions.invoke('how-it-works-copilot-analyzer', {
        body: {
          userQuery: userQuery,
          chatMessages: [...chatMessages, newUserMessage],
          productDocumentation: productDocumentation,
          technicalDocumentation: technicalDocumentation,
          deepThinkMode: deepThinkMode,
          deepSearchMode: deepSearchMode,
          selectedPersona: selectedPersona,
        },
      });

      if (response.error) {
        console.error("Supabase Function Invoke Error (How It Works Copilot):", response.error);
        throw new Error(response.error.message || "Failed to get AI response from assistant.");
      }
      
      // Handle streaming response
      const reader = response.data.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        setChatMessages((prev) =>
          prev.map((msg, index) =>
            index === prev.length - 1 && msg.sender === 'ai'
              ? { ...msg, text: accumulatedText }
              : msg
          )
        );

        if (done) break;
      }
      return accumulatedText; // Return the full accumulated text on success
    },
    onSuccess: () => {
      // No need to update messages here, as it's done in the mutationFn
    },
    onError: (err: Error) => {
      console.error("How It Works Copilot Chat Error:", err);
      setChatMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1 && msg.sender === 'ai'
            ? { ...msg, text: `Error: ${(err as Error).message}. Please try again.` }
            : msg
        )
      );
      setError((err as Error).message);
    },
  });

  const handleSendMessage = (messageText: string) => {
    if (messageText.trim()) {
      setError(null);
      copilotChatMutation.mutate(messageText);
    }
  };

  const isCopilotDisabled = copilotChatMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipWrapper content="Ask AI for help with SentiVibe features, how-to guides, or technical questions.">
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
            <LifeBuoy className="h-4 w-4" /> Guide Assistant
          </Button>
        </DialogTrigger>
      </TooltipWrapper>
      <DialogContent className="flex h-full max-h-[90vh] w-full max-w-full flex-col sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LifeBuoy className="h-6 w-6 text-green-600" /> SentiVibe Guide Assistant
          </DialogTitle>
          <DialogDescription>
            Your expert assistant for all things SentiVibe. Ask about features, architecture, or code.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Assistant Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={copilotChatMutation.isPending}
            disabled={isCopilotDisabled}
            deepThinkEnabled={deepThinkMode}
            onToggleDeepThink={setDeepThinkMode}
            deepSearchEnabled={deepSearchMode}
            onToggleDeepSearch={setDeepSearchMode}
            isPaidTier={isPaidTier} // Pass isPaidTier to ChatInterface
            selectedPersona={selectedPersona}
            onPersonaChange={setSelectedPersona}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HowItWorksCopilot;