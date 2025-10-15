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
import { TooltipWrapper } from '@/components/ui/tooltip';
import { Link } from 'react-router-dom'; // Added Link import

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
  isPaidTier: boolean; // New prop
}

const ComparisonLibraryCopilot: React.FC<ComparisonLibraryCopilotProps> = ({ comparisons, isPaidTier }) => {
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
          text: "Hello! I'm your SentiVibe Comparison Copilot. I can help you find video comparisons or suggest new comparison ideas. Tell me what you're looking for!",
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
      setChatMessages((prev) => [...prev, newUserMessage, { id: Date.now().toString() + '-ai-loading', sender: 'ai', text: '' }]);

      const simplifiedComparisons = comparisons.map(comp => ({
        title: comp.title,
        slug: comp.slug,
        meta_description: comp.meta_description,
        keywords: comp.keywords,
        videoATitle: comp.videoATitle,
        videoBTitle: comp.videoBTitle,
      }));

      const response = await supabase.functions.invoke('comparison-library-copilot-analyzer', {
        body: {
          userQuery: userQuery,
          comparisonsData: simplifiedComparisons,
          deepThinkMode: deepThinkMode,
          deepSearchMode: deepSearchMode,
          selectedPersona: selectedPersona,
        },
      });

      if (response.error) {
        console.error("Supabase Function Invoke Error (Comparison Library Copilot):", response.error);
        if (response.error.name === 'FunctionsHttpError' && response.error.context?.status === 403) {
          try {
            const errorBody = await response.error.context.json();
            throw new Error(errorBody.error || "Daily limit exceeded. Please upgrade.");
          } catch (jsonError) {
            console.error("Failed to parse 403 error response:", jsonError);
            throw new Error(response.error.message || "Daily limit exceeded. Please upgrade.");
          }
        }
        throw new Error(response.error.message || "Failed to get AI response from copilot.");
      }
      
      return response.data.aiResponse;
    },
    onSuccess: (aiResponse) => {
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id.endsWith('-ai-loading') ? { ...msg, text: aiResponse, id: Date.now().toString() + '-ai-response' } : msg
        )
      );
    },
    onError: (err: Error) => {
      console.error("Comparison Library Copilot Chat Error:", err);
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id.endsWith('-ai-loading') ? { ...msg, text: `Error: ${(err as Error).message}. Please try again.`, id: Date.now().toString() + '-ai-error' } : msg
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
      <TooltipWrapper content="Ask AI to help you find comparisons or suggest new topics.">
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <GitCompare className="h-4 w-4" /> Comparison Copilot
          </Button>
        </DialogTrigger>
      </TooltipWrapper>
      <DialogContent className="flex h-full max-h-[90vh] w-full max-w-full flex-col sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-6 w-6 text-accent" /> SentiVibe Comparison Copilot
          </DialogTitle>
          <DialogDescription>
            Ask me to help you find specific video comparisons from your library or suggest new topics.
            {!isPaidTier && (
              <span className="ml-2 text-accent">
                DeepThink & DeepSearch modes are available for Paid Tier users. <Link to="/upgrade" className="underline">Upgrade now</Link>.
              </span>
            )}
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

export default ComparisonLibraryCopilot;