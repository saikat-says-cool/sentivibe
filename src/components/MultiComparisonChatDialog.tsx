import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageSquare } from 'lucide-react';
import ChatInterface from './ChatInterface';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/integrations/supabase/auth'; // Import useAuth
import { Link } from 'react-router-dom'; // Import Link for upgrade prompt
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components

interface MultiComparisonVideo {
  blog_post_id: string;
  video_order: number;
  title: string;
  thumbnail_url: string;
  original_video_link: string;
  raw_comments_for_chat: string[];
}

interface CustomComparativeQuestion {
  question: string;
  wordCount: number;
  answer?: string;
}

interface MultiComparisonResultForChat {
  id: string;
  title: string;
  meta_description: string;
  keywords: string[];
  comparison_data_json: any;
  custom_comparative_qa_results: CustomComparativeQuestion[];
  videos: MultiComparisonVideo[];
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface MultiComparisonChatDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialMultiComparisonResult: MultiComparisonResultForChat | null;
}

// Define tier limits for chat (matching backend for consistency)
const UNAUTHENTICATED_LIMITS = {
  chatMessageLimit: 5, // Max AI responses per session
  maxResponseWordCount: 100,
};

const AUTHENTICATED_FREE_TIER_LIMITS = {
  chatMessageLimit: 10, // Max AI responses per session
  maxResponseWordCount: 150,
};

const PAID_TIER_LIMITS = {
  chatMessageLimit: 100, // Max AI responses per session
  maxResponseWordCount: 500,
};

const MultiComparisonChatDialog: React.FC<MultiComparisonChatDialogProps> = ({
  isOpen,
  onOpenChange,
  initialMultiComparisonResult,
}) => {
  const { user, subscriptionStatus, subscriptionPlanId } = useAuth(); // Get auth and subscription info

  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [desiredWordCount, setDesiredWordCount] = useState<number>(300);
  const [selectedPersona, setSelectedPersona] = useState<string>("friendly");
  const [currentExternalContext, setCurrentExternalContext] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null); // Define error state

  const isPaidTier = subscriptionStatus === 'active' && subscriptionPlanId !== 'free';
  const isAuthenticatedFreeTier = user && !isPaidTier; // Authenticated but not paid
  const isUnauthenticated = !user; // Not logged in

  let currentLimits;
  if (isPaidTier) {
    currentLimits = PAID_TIER_LIMITS;
  } else if (isAuthenticatedFreeTier) {
    currentLimits = AUTHENTICATED_FREE_TIER_LIMITS;
  } else if (isUnauthenticated) { // Explicitly use isUnauthenticated
    currentLimits = UNAUTHENTICATED_LIMITS;
  } else { // Fallback, though should not be reached if auth logic is sound
    currentLimits = UNAUTHENTICATED_LIMITS; // Default to most restrictive
  }

  useEffect(() => {
    if (isOpen) {
      if (initialMultiComparisonResult) {
        const videoTitles = initialMultiComparisonResult.videos.map(v => `"${v.title}"`).join(', ');
        setChatMessages([
          {
            id: 'ai-initial-loaded',
            sender: 'ai',
            text: `Multi-video comparison for ${videoTitles} loaded. What would you like to know about it?`,
          },
        ]);
        const searchQuery = `${initialMultiComparisonResult.title} multi-video comparison`;
        fetchExternalContextMutation.mutate(searchQuery);
      } else {
        setChatMessages([
          {
            id: 'ai-initial-empty',
            sender: 'ai',
            text: "Hello! I'm ready to chat about a multi-video comparison. Please ensure a comparison is loaded.",
          },
        ]);
      }
      // Reset desired word count to current tier's max when dialog opens
      setDesiredWordCount(currentLimits.maxResponseWordCount);
      setError(null); // Clear error when dialog opens
    } else {
      setChatMessages([]);
      setCurrentExternalContext(null);
      setError(null); // Clear error when dialog closes
    }
  }, [isOpen, initialMultiComparisonResult, currentLimits.maxResponseWordCount, user, subscriptionStatus, subscriptionPlanId]); // Add currentLimits to dependencies

  const fetchExternalContextMutation = useMutation({
    mutationFn: async (query: string) => {
      const { data, error: invokeError } = await supabase.functions.invoke('fetch-external-context', {
        body: { query },
      });
      if (invokeError) {
        console.error("Supabase Fetch External Context Function Invoke Error:", invokeError);
        throw new Error(invokeError.message || "Failed to fetch external context.");
      }
      return data.externalSearchResults;
    },
    onSuccess: (data) => {
      setCurrentExternalContext(data);
    },
    onError: (err: Error) => {
      console.error("Error fetching external context for multi-comparison chat:", err);
      setError(`Failed to fetch external context: ${(err as Error).message}`);
    },
  });

  const chatMutation = useMutation({
    mutationFn: async (userMessageText: string) => {
      const newUserMessage: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text: userMessageText,
      };
      
      setChatMessages((prev) => [...prev, newUserMessage]);

      const aiMessageId = Date.now().toString() + '-ai';
      const aiPlaceholderMessage: Message = {
        id: aiMessageId,
        sender: 'ai',
        text: 'Thinking...',
      };
      setChatMessages((prev) => [...prev, aiPlaceholderMessage]);

      if (!initialMultiComparisonResult) {
        throw new Error("No multi-video comparison loaded to chat about.");
      }

      const { data, error: invokeError } = await supabase.functions.invoke('multi-comparison-chat-analyzer', {
        body: {
          userMessage: userMessageText,
          chatMessages: [...chatMessages, newUserMessage],
          multiComparisonResult: initialMultiComparisonResult,
          externalContext: currentExternalContext,
          desiredWordCount: desiredWordCount,
          selectedPersona: selectedPersona,
        },
      });

      if (invokeError) {
        console.error("Supabase Function Invoke Error (multi-comparison-chat-analyzer):", invokeError);
        throw new Error(invokeError.message || "Failed to invoke multi-comparison chat function.");
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
      console.error("Multi-Comparison Chat Error:", err);
      setChatMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1 && msg.sender === 'ai' && msg.text === 'Thinking...'
            ? { ...msg, text: `Error: ${(err as Error).message}. Please try again.` }
            : msg
        )
      );
      setError(`Failed to get AI response: ${(err as Error).message}`); // Set error state on chat mutation error
    },
  });

  const handleSendMessage = (messageText: string) => {
    if (messageText.trim() && initialMultiComparisonResult) {
      // Count AI messages in current session to check limit
      const aiMessageCount = chatMessages.filter(msg => msg.sender === 'ai').length;
      if (aiMessageCount >= currentLimits.chatMessageLimit) {
        setError(`Chat message limit (${currentLimits.chatMessageLimit} AI responses) exceeded for this session. ${isPaidTier ? 'You have reached your paid tier limit.' : 'Upgrade to a paid tier for more chat messages.'}`);
        return;
      }
      setError(null); // Clear previous errors
      chatMutation.mutate(messageText);
    }
  };

  const isChatDisabled = !initialMultiComparisonResult || chatMutation.isPending || fetchExternalContextMutation.isPending;
  const aiResponsesInSession = chatMessages.filter(msg => msg.sender === 'ai').length;
  const isChatLimitReached = aiResponsesInSession >= currentLimits.chatMessageLimit;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-full max-h-[90vh] w-full max-w-full flex-col sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-500" /> Chat about: {initialMultiComparisonResult?.title || "Multi-Video Comparison"}
          </DialogTitle>
          <DialogDescription>
            Ask questions about the multi-video comparison, individual video analyses, or related topics.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 mt-2 sm:mt-0 mb-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="persona-select" className="text-sm">Persona:</Label>
            <Select
              value={selectedPersona}
              onValueChange={setSelectedPersona}
              disabled={isChatDisabled || isChatLimitReached}
            >
              <SelectTrigger id="persona-select" className="w-[140px]">
                <SelectValue placeholder="Select persona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly">Friendly Assistant</SelectItem>
                <SelectItem value="therapist">Therapist</SelectItem>
                <SelectItem value="storyteller">Storyteller</SelectItem>
                <SelectItem value="motivation">Motivational Coach</SelectItem>
                <SelectItem value="argumentative">Argumentative</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="desired-word-count" className="text-sm">Response Word Count:</Label>
            <Input
              id="desired-word-count"
              type="number"
              min="50"
              max={currentLimits.maxResponseWordCount} // Dynamically set max based on tier
              step="50"
              value={desiredWordCount}
              onChange={(e) => setDesiredWordCount(Number(e.target.value))}
              className="w-[100px]"
              disabled={isChatDisabled || isChatLimitReached}
            />
          </div>
        </div>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Chat Limit Reached</AlertTitle>
            <AlertDescription>
              {error}
              {!isPaidTier && (
                <span className="ml-2 text-blue-500">
                  <Link to="/upgrade" className="underline">Upgrade to a paid tier</Link> for more chat messages.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}
        <p className="text-sm text-muted-foreground mb-2">
          AI responses remaining: {Math.max(0, currentLimits.chatMessageLimit - aiResponsesInSession)}/{currentLimits.chatMessageLimit}
          {!isPaidTier && isChatLimitReached && (
            <span className="ml-2 text-blue-500">
              <Link to="/upgrade" className="underline">Upgrade to a paid tier</Link> for more chat messages.
            </span>
          )}
        </p>
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={chatMutation.isPending || fetchExternalContextMutation.isPending}
            disabled={isChatDisabled || isChatLimitReached}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MultiComparisonChatDialog;