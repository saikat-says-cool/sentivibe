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
import { Link } from 'react-router-dom'; // Keep Link for potential future use if AI suggests blog posts
import { useAuth } from '@/integrations/supabase/auth'; // Import useAuth
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components

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

// Define tier limits for library copilot queries (matching backend for consistency)
const FREE_TIER_LIMITS = {
  dailyQueries: 5,
};

const PAID_TIER_LIMITS = {
  dailyQueries: 100,
};

const ComparisonLibraryCopilot: React.FC<ComparisonLibraryCopilotProps> = ({ comparisons }) => {
  const { subscriptionStatus, subscriptionPlanId } = useAuth(); // Get auth and subscription info

  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [queriesToday, setQueriesToday] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const isPaidTier = subscriptionStatus === 'active' && subscriptionPlanId !== 'free';
  const currentLimits = isPaidTier ? PAID_TIER_LIMITS : FREE_TIER_LIMITS;

  useEffect(() => {
    if (isOpen && chatMessages.length === 0) {
      setChatMessages([
        {
          id: 'ai-initial',
          sender: 'ai',
          text: "Hello! I'm your SentiVibe Comparison Copilot. I can help you find video comparisons or suggest new comparison ideas. Tell me what you're looking for!",
        },
      ]);
      setQueriesToday(0);
      setError(null);
    } else if (!isOpen) {
      setError(null);
    }
  }, [isOpen, chatMessages.length]);

  const copilotChatMutation = useMutation({
    mutationFn: async (userQuery: string) => {
      if (queriesToday >= currentLimits.dailyQueries) {
        throw new Error(`Daily Comparison Library Copilot query limit (${currentLimits.dailyQueries}) exceeded. ${isPaidTier ? 'You have reached your paid tier limit.' : 'Upgrade to a paid tier for more queries.'}`);
      }

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
        },
      });

      if (invokeError) {
        console.error("Supabase Function Invoke Error (Comparison Library Copilot):", invokeError);
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
      setQueriesToday(prev => prev + 1);
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

  const isCopilotDisabled = copilotChatMutation.isPending || queriesToday >= currentLimits.dailyQueries;

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
            Ask me to help you find specific video comparisons or suggest new topics.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Query Limit Reached</AlertTitle>
            <AlertDescription>
              {error}
              {!isPaidTier && (
                <span className="ml-2 text-blue-500">
                  <Link to="/upgrade" className="underline">Upgrade to a paid tier</Link> for more queries.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}
        <p className="text-sm text-muted-foreground mb-2">
          Queries remaining today: {Math.max(0, currentLimits.dailyQueries - queriesToday)}/{currentLimits.dailyQueries}
          {!isPaidTier && queriesToday >= currentLimits.dailyQueries && (
            <span className="ml-2 text-blue-500">
              <Link to="/upgrade" className="underline">Upgrade to a paid tier</Link> for more queries.
            </span>
          )}
        </p>
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={copilotChatMutation.isPending}
            disabled={isCopilotDisabled}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComparisonLibraryCopilot;