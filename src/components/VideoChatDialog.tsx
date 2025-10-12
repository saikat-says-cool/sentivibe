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
import { Input } from "@/components/ui/input"; // Input is now explicitly needed
import { useAuth } from '@/integrations/supabase/auth';
// import { Link } from 'react-router-dom'; // Removed as it's no longer used
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AiAnalysisResult {
  overall_sentiment: string;
  emotional_tones: string[];
  key_themes: string[];
  summary_insights: string;
}

interface CustomQuestion {
  question: string;
  wordCount: number;
  answer?: string;
}

interface StoredAiAnalysisContent extends AiAnalysisResult {
  raw_comments_for_chat?: string[];
}

interface BlogPost {
  id: string;
  video_id: string;
  title: string;
  slug: string;
  meta_description: string;
  keywords: string[];
  content: string;
  published_at: string;
  author_id: string;
  creator_name: string;
  thumbnail_url: string;
  original_video_link: string;
  created_at: string;
  updated_at: string;
  ai_analysis_json: StoredAiAnalysisContent | null;
  custom_qa_results?: CustomQuestion[];
}

interface AnalysisResponse {
  videoTitle: string;
  videoDescription: string;
  videoThumbnailUrl: string;
  videoTags: string[];
  creatorName: string;
  videoSubtitles: string;
  comments: string[];
  aiAnalysis: AiAnalysisResult;
  blogPostSlug?: string;
  originalVideoLink?: string;
  customQaResults?: CustomQuestion[];
  lastReanalyzedAt?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface VideoChatDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialAnalysisResult?: AnalysisResponse | null;
  initialBlogPost?: BlogPost | null;
}

// Tier limits for chat are now removed from the frontend and backend Edge Functions.
// These constants are no longer needed.

const VideoChatDialog: React.FC<VideoChatDialogProps> = ({
  isOpen,
  onOpenChange,
  initialAnalysisResult,
  initialBlogPost,
}) => {
  const { user, subscriptionStatus, subscriptionPlanId } = useAuth();

  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  // Default desired word count, no longer tied to tier limits
  const [desiredWordCount, setDesiredWordCount] = useState<number>(300); 
  const [selectedPersona, setSelectedPersona] = useState<string>("friendly");
  const [currentExternalContext, setCurrentExternalContext] = useState<string | null>(null);
  const [currentAnalysisResult, setCurrentAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // const isPaidTier = subscriptionStatus === 'active' && subscriptionPlanId !== 'free'; // Removed as it's no longer used

  useEffect(() => {
    if (isOpen) {
      let analysisToUse: AnalysisResponse | null = null;

      if (initialAnalysisResult) {
        analysisToUse = initialAnalysisResult;
      } else if (initialBlogPost && initialBlogPost.ai_analysis_json) {
        analysisToUse = {
          videoTitle: initialBlogPost.title,
          videoDescription: initialBlogPost.meta_description || '',
          videoThumbnailUrl: initialBlogPost.thumbnail_url || '',
          videoTags: initialBlogPost.keywords || [],
          creatorName: initialBlogPost.creator_name || 'Unknown Creator',
          videoSubtitles: '',
          comments: initialBlogPost.ai_analysis_json.raw_comments_for_chat || [],
          aiAnalysis: {
            overall_sentiment: initialBlogPost.ai_analysis_json.overall_sentiment || 'N/A',
            emotional_tones: initialBlogPost.ai_analysis_json.emotional_tones || [],
            key_themes: initialBlogPost.ai_analysis_json.key_themes || [],
            summary_insights: initialBlogPost.ai_analysis_json.summary_insights || 'No insights available.',
          },
          blogPostSlug: initialBlogPost.slug,
          originalVideoLink: initialBlogPost.original_video_link,
          customQaResults: initialBlogPost.custom_qa_results,
        };
      }
      
      setCurrentAnalysisResult(analysisToUse);

      if (analysisToUse) {
        setChatMessages([
          {
            id: 'ai-initial-loaded',
            sender: 'ai',
            text: `Analysis for "${analysisToUse.videoTitle}" loaded. What would you like to know about it?`,
          },
        ]);
        const searchQuery = `${analysisToUse.videoTitle} ${analysisToUse.videoTags.join(' ')}`;
        fetchExternalContextMutation.mutate(searchQuery);
      } else {
        setChatMessages([
          {
            id: 'ai-initial-empty',
            sender: 'ai',
            text: "Hello! I'm ready to chat about a video analysis. Please ensure an analysis is loaded.",
          },
        ]);
      }
      // Reset desired word count to a default, no longer tied to tier's max
      setDesiredWordCount(300); 
      setError(null); // Clear error when dialog opens
    } else {
      setChatMessages([]);
      setCurrentExternalContext(null);
      setCurrentAnalysisResult(null);
      setError(null); // Clear error when dialog closes
    }
  }, [isOpen, initialAnalysisResult, initialBlogPost, user, subscriptionStatus, subscriptionPlanId]);

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
      console.error("Error fetching external context for chat:", err);
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

      if (!currentAnalysisResult) {
        throw new Error("No video analysis loaded to chat about.");
      }

      const { data, error: invokeError } = await supabase.functions.invoke('chat-analyzer', {
        body: {
          userMessage: userMessageText,
          chatMessages: [...chatMessages, newUserMessage],
          analysisResult: currentAnalysisResult,
          externalContext: currentExternalContext,
          desiredWordCount: desiredWordCount, // Still pass desiredWordCount to AI
          selectedPersona: selectedPersona,
          customQaResults: currentAnalysisResult.customQaResults,
        },
      });

      if (invokeError) {
        console.error("Supabase Function Invoke Error:", invokeError);
        throw new Error(invokeError.message || "Failed to invoke chat function.");
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
      console.error("Chat Error:", err);
      setChatMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1 && msg.sender === 'ai' && msg.text === 'Thinking...'
            ? { ...msg, text: `Error: ${(err as Error).message}. Please try again.` }
            : msg
        )
      );
      setError(`Failed to get AI response: ${(err as Error).message}`);
    },
  });

  const handleSendMessage = (messageText: string) => {
    if (messageText.trim() && currentAnalysisResult) {
      setError(null); // Clear previous errors
      chatMutation.mutate(messageText);
    }
  };

  // Simplified disabled logic: only disable if no analysis result or mutation is pending
  const isChatDisabled = !currentAnalysisResult || chatMutation.isPending || fetchExternalContextMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-full max-h-[90vh] w-full max-w-full flex-col sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-500" /> Chat about: {currentAnalysisResult?.videoTitle || "Video Analysis"}
          </DialogTitle>
          <DialogDescription>
            Ask questions about the video analysis, comments, or related topics.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 mt-2 sm:mt-0 mb-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="persona-select" className="text-sm">Persona:</Label>
            <Select
              value={selectedPersona}
              onValueChange={setSelectedPersona}
              disabled={isChatDisabled}
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
          {/* Re-enabling "Response Word Count" input */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="desired-word-count" className="text-sm">Response Word Count:</Label>
            <Input
              id="desired-word-count"
              type="number"
              min="50"
              // Max attribute removed as custom question word count is now unlimited
              step="50"
              value={desiredWordCount}
              onChange={(e) => setDesiredWordCount(Number(e.target.value))}
              className="w-[100px]"
              disabled={isChatDisabled} // Only disable if chat is generally disabled
            />
          </div>
        </div>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Chat Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={chatMutation.isPending || fetchExternalContextMutation.isPending}
            disabled={isChatDisabled}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoChatDialog;