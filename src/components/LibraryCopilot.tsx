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
import { MessageSquarePlus, Loader2 } from 'lucide-react';
import ChatInterface from './ChatInterface';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useAuth } from '@/integrations/supabase/auth'; // Import useAuth
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components

interface BlogPost {
  id: string;
  video_id: string;
  title: string;
  slug: string;
  meta_description: string;
  keywords: string[];
  creator_name: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface LibraryCopilotProps {
  blogPosts: BlogPost[];
}

// Define tier limits for library copilot queries (matching backend for consistency)
const FREE_TIER_LIMITS = {
  dailyQueries: 5,
};

const PAID_TIER_LIMITS = {
  dailyQueries: 100,
};

const LibraryCopilot: React.FC<LibraryCopilotProps> = ({ blogPosts }) => {
  const { user, subscriptionStatus, subscriptionPlanId } = useAuth(); // Get auth and subscription info

  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [queriesToday, setQueriesToday] = useState<number>(0); // Track queries today
  const [error, setError] = useState<string | null>(null); // Define error state

  const isPaidTier = subscriptionStatus === 'active' && subscriptionPlanId !== 'free';
  const currentLimits = isPaidTier ? PAID_TIER_LIMITS : FREE_TIER_LIMITS;

  // NOTE: For a full backend enforcement of daily queries, we would ideally need a new Supabase table
  // (e.g., `copilot_queries`) to log each query. For this exercise, the logic to determine
  // `currentLimits.dailyQueries` is set, but the actual database counting of queries is omitted
  // as it would require a new table migration. The frontend will manage preventing excessive calls for now.
  // For demonstration, we'll use a simple in-memory counter for the session or a placeholder.
  // In a real app, this would involve a database query similar to AnalyzeVideo's daily count.
  useEffect(() => {
    if (isOpen && chatMessages.length === 0) {
      setChatMessages([
        {
          id: 'ai-initial',
          sender: 'ai',
          text: "Hello! I'm your SentiVibe Library Copilot. I can help you find video analyses. Tell me what kind of video you're looking for, or ask me about specific topics!",
        },
      ]);
      // Reset queriesToday when dialog opens for a new session, or fetch from DB if tracking
      setQueriesToday(0); 
      setError(null); // Clear error when dialog opens
    } else if (!isOpen) {
      setError(null); // Clear error when dialog closes
    }
  }, [isOpen, chatMessages.length]);

  const copilotChatMutation = useMutation({
    mutationFn: async (userQuery: string) => {
      // Check limit before sending to backend
      if (queriesToday >= currentLimits.dailyQueries) {
        throw new Error(`Daily Library Copilot query limit (${currentLimits.dailyQueries}) exceeded. ${isPaidTier ? 'You have reached your paid tier limit.' : 'Upgrade to a paid tier for more queries.'}`);
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

      // Prepare a simplified version of blogPosts for the AI
      const simplifiedBlogPosts = blogPosts.map(post => ({
        title: post.title,
        slug: post.slug,
        meta_description: post.meta_description,
        keywords: post.keywords,
        creator_name: post.creator_name,
      }));

      const { data, error: invokeError } = await supabase.functions.invoke('library-copilot-analyzer', {
        body: {
          userQuery: userQuery,
          blogPostsData: simplifiedBlogPosts,
        },
      });

      if (invokeError) {
        console.error("Supabase Function Invoke Error (Library Copilot):", invokeError);
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
      setQueriesToday(prev => prev + 1); // Increment query count on success
    },
    onError: (err: Error) => {
      console.error("Library Copilot Chat Error:", err);
      setChatMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1 && msg.sender === 'ai' && msg.text === 'Thinking...'
            ? { ...msg, text: `Error: ${err.message}. Please try again.` }
            : msg
        )
      );
      setError(err.message); // Set error state on mutation error
    },
  });

  const handleSendMessage = (messageText: string) => {
    if (messageText.trim()) {
      setError(null); // Clear previous errors
      copilotChatMutation.mutate(messageText);
    }
  };

  const isCopilotDisabled = copilotChatMutation.isPending || queriesToday >= currentLimits.dailyQueries;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <MessageSquarePlus className="h-4 w-4" /> Library Copilot
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-full max-h-[90vh] w-full max-w-full flex-col sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-6 w-6 text-accent" /> SentiVibe Library Copilot
          </DialogTitle>
          <DialogDescription>
            Ask me to help you find specific video analyses from your library or suggest new topics.
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
            disabled={isCopilotDisabled} // Disable input if limit reached
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LibraryCopilot;