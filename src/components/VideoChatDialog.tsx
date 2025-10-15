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
// Removed Select, Label, Input imports as they are now handled in ChatInterface
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
  isPaidTier: boolean; // New prop
}

const VideoChatDialog: React.FC<VideoChatDialogProps> = ({
  isOpen,
  onOpenChange,
  initialAnalysisResult,
  initialBlogPost,
  isPaidTier, // Destructure new prop
}) => {
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  // Removed desiredWordCount state
  const [selectedPersona, setSelectedPersona] = useState<string>("friendly"); // Keep state for Edge Function payload
  const [deepThinkMode, setDeepThinkMode] = useState<boolean>(false);
  const [deepSearchMode, setDeepSearchMode] = useState<boolean>(false);
  const [currentAnalysisResult, setCurrentAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
          summary_insights: initialBlogPost.ai_analysis_json.overall_sentiment || 'No insights available.',
        },
        blogPostSlug: initialBlogPost.slug,
        originalVideoLink: initialBlogPost.original_video_link,
        customQaResults: initialBlogPost.custom_qa_results,
      };
    }
    setCurrentAnalysisResult(analysisToUse);
  }, [initialAnalysisResult, initialBlogPost]);

  useEffect(() => {
    if (isOpen && currentAnalysisResult) {
      const initialMessageText = `Analysis for "${currentAnalysisResult.videoTitle}" loaded. What would you like to know about it?`;
      if (chatMessages.length === 0 || chatMessages[0]?.text !== initialMessageText) {
        setChatMessages([
          {
            id: 'ai-initial-loaded',
            sender: 'ai',
            text: initialMessageText,
          },
        ]);
      }
      setError(null);
    } else if (!isOpen) {
      setChatMessages([]);
      setError(null);
      setDeepThinkMode(false);
      setDeepSearchMode(false);
      setSelectedPersona("friendly"); // Reset persona when dialog closes
    }
  }, [isOpen, currentAnalysisResult]);

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
          // Removed desiredWordCount from payload
          selectedPersona: selectedPersona,
          customQaResults: currentAnalysisResult.customQaResults,
          deepThinkMode: deepThinkMode,
          deepSearchMode: deepSearchMode,
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
      setError(null);
      chatMutation.mutate(messageText);
    }
  };

  const isChatDisabled = !currentAnalysisResult || chatMutation.isPending;

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
            isLoading={chatMutation.isPending}
            disabled={isChatDisabled}
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

export default VideoChatDialog;