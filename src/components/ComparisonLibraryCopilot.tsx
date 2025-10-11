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
import { useMutation, useQuery } from '@tanstack/react-query'; // Added useQuery
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
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
const UNAUTHENTICATED_LIMITS = {
  dailyQueries: 5,
};

const AUTHENTICATED_FREE_TIER_LIMITS = {
  dailyQueries: 10,
};

const PAID_TIER_LIMITS = {
  dailyQueries: 100,
};

// Function to fetch anonymous usage
const fetchAnonUsage = async () => {
  const { data, error } = await supabase.functions.invoke('get-anon-usage');
  if (error) {
    console.error("Error fetching anon usage:", error);
    throw new Error(error.message || "Failed to fetch anonymous usage data.");
  }
  return data;
};

const ComparisonLibraryCopilot: React.FC<ComparisonLibraryCopilotProps> = ({ comparisons }) => {
  const { user, subscriptionStatus, subscriptionPlanId } = useAuth(); // Get auth and subscription info

  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [queriesToday, setQueriesToday] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const isPaidTier = subscriptionStatus === 'active' && subscriptionPlanId !== 'free';
  const isAuthenticatedFreeTier = user && !isPaidTier; // Authenticated but not paid
  const isUnauthenticated = !user; // Not logged in

  let currentLimits;
  if (isPaidTier) {
    currentLimits = PAID_TIER_LIMITS;
  } else if (isAuthenticatedFreeTier) {
    currentLimits = AUTHENTICATED_FREE_TIER_LIMITS;
  } else { // Unauthenticated
    currentLimits = UNAUTHENTICATED_LIMITS;
  }

  // Fetch anonymous usage if not authenticated
  const { data: anonUsage, refetch: refetchAnonUsage } = useQuery({
    queryKey: ['anonUsageComparisonCopilot'],
    queryFn: fetchAnonUsage,
    enabled: isUnauthenticated, // Only fetch if user is not logged in
    refetchOnWindowFocus: false,
  });

  // Fetch daily copilot query count for authenticated users
  const { data: authenticatedCopilotQueriesCount } = useQuery<number, Error>({
    queryKey: ['dailyCopilotQueriesCount', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count, error } = await supabase
        .from('copilot_queries_log')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', twentyFourHoursAgo)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error fetching daily copilot query count for authenticated user:", error);
        return 0;
      }
      return count || 0;
    },
    enabled: !!user && !isUnauthenticated, // Only fetch if user is logged in
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const updateQueriesToday = async () => {
      if (isUnauthenticated) {
        setQueriesToday(anonUsage?.copilot_queries_count || 0);
      } else if (user) {
        setQueriesToday(authenticatedCopilotQueriesCount || 0);
      }
    };

    if (isOpen) {
      setChatMessages([
        {
          id: 'ai-initial',
          sender: 'ai',
          text: "Hello! I'm your SentiVibe Comparison Copilot. I can help you find video comparisons or suggest new comparison ideas. Tell me what you're looking for!",
        },
      ]);
      updateQueriesToday(); // Fetch initial count when dialog opens
      setError(null); // Clear error when dialog opens
    } else {
      setChatMessages([]);
      setError(null); // Clear error when dialog closes
    }
  }, [isOpen, user, anonUsage, isUnauthenticated, authenticatedCopilotQueriesCount]); // Depend on user, anonUsage, isUnauthenticated, and authenticatedCopilotQueriesCount

  const copilotChatMutation = useMutation({
    mutationFn: async (userQuery: string) => {
      // Check limit before sending to backend
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
        // Check if the error is a FunctionsHttpError with a 403 status
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
      // Update queriesToday after a successful query
      if (isUnauthenticated) {
        refetchAnonUsage(); // Refetch anon usage to get updated count
      } else {
        setQueriesToday(prev => prev + 1); // For authenticated users, update local state
      }
    },
    onError: (err: Error) => {
      console.error("Comparison Library Copilot Chat Error:", err);
      setChatMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1 && msg.sender === 'ai' && msg.text === 'Thinking...'
            ? { ...msg, text: `Error: ${(err as Error).message}. Please try again.` }
            : msg
        )
      )
      setError((err as Error).message); // Set error state on mutation error
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
          <span className="flex items-center gap-2"> {/* Added wrapper span */}
            <GitCompare className="h-4 w-4" /> Comparison Copilot
          </span>
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