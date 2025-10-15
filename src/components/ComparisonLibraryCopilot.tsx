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
import { GitCompare } from 'lucide-react';
import ChatInterface from './ChatInterface';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MultiComparison {
  id: string;
  title: string;
  slug: string;
  meta_description: string;
  keywords: string[];
  overall_thumbnail_url?: string;
  videoATitle?: string; // Assuming these might be available from joined data or passed
  videoBTitle?: string; // Assuming these might be available from joined data or passed
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface ComparisonLibraryCopilotProps {
  comparisons: MultiComparison[]; // Now expects MultiComparison type
}

const ComparisonLibraryCopilot: React.FC<ComparisonLibraryCopilotProps> = ({ comparisons }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  // Removed: const [deepThinkMode, setDeepThinkMode] = useState<boolean>(false); // New state for DeepThink mode
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setChatMessages([
        {
          id: 'ai-initial',
          sender: 'ai',
          text: "Hello! I'm your SentiVibe Comparison Copilot. I can help you find video comparisons or suggest new comparison ideas. Tell me what you're looking for!",
        },
      ]);
      setError(null); // Clear error when dialog opens
    } else {
      setChatMessages([]);
      setError(null); // Clear error when dialog closes
      // Removed: setDeepThinkMode(false); // Reset DeepThink mode when dialog closes
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
        text: 'Thinking...',
      };
      setChatMessages((prev) => [...prev, aiPlaceholderMessage]);

      const simplifiedComparisons = comparisons.map(comp => ({
        title: comp.title,
        slug: comp.slug,
        meta_description: comp.meta_description,
        keywords: comp.keywords,
        videoATitle: comp.videoATitle,
        videoBTitle: comp.videoBTitle,
      }));

      const { data, error: invokeError } = await supabase.functions.invoke('comparison-library-copilot-analyzer', {
        body: {
          userQuery: userQuery,
          comparisonsData: simplifiedComparisons,
          // Removed: deepThinkMode: deepThinkMode, // Pass deepThinkMode to the Edge Function
        },
      });

      if (invokeError) {
        console.error("Supabase Function Invoke Error (Comparison Library Copilot):", invokeError);
        if (invokeError.name === 'FunctionsHttpError' && invokeError.context?.status === 403) {
          try {
            const errorBody = await invokeError.context.json();
            throw new Error(errorBody.error || "Daily limit exceeded. Please upgrade.");
          } catch (jsonError) {
            console.error("Failed to parse 403 error response:", jsonError);
            throw new Error(invokeError.message || "Daily limit exceeded. Please upgrade.");
          }
        }
        throw new Error(invokeError.message || "Failed to get AI response from copilot.");
      }
      return data.aiResponse;
    },
    onSuccess: (aiResponseContent: string) => {
      setChatMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1 && msg.sender === 'ai' && msg.text === 'Thinking...'
            ? { ...msg, text: aiResponseContent }
            : msg
        )
      );
    },
    onError: (err: Error) => {
      console.error("Comparison Library Copilot Chat Error:", err);
      setChatMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1 && msg.sender === 'ai' && msg.text === 'Thinking...'
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
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <GitCompare className="h-4 w-4" /> Comparison Copilot
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-full max-h-[90vh] w-full max-w-full flex-col sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-6 w-6 text-accent" /> SentiVibe Comparison Copilot
          </DialogTitle>
          <DialogDescription>
            Ask me to help you find specific video comparisons from your library or suggest new topics.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Copilot Error</AlertTitle>
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
            // Removed: deepThinkEnabled={deepThinkMode}
            // Removed: onToggleDeepThink={setDeepThinkMode}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComparisonLibraryCopilot;