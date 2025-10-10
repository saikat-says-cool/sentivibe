import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2 } from 'lucide-react';
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

// Re-defining interfaces for clarity and self-containment of this component
interface AiAnalysisResult {
  overall_sentiment: string;
  emotional_tones: string[];
  key_themes: string[];
  summary_insights: string;
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
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface VideoChatDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialAnalysisResult?: AnalysisResponse | null; // For AnalyzeVideo page
  initialBlogPost?: BlogPost | null; // For BlogPostDetail page
}

const VideoChatDialog: React.FC<VideoChatDialogProps> = ({
  isOpen,
  onOpenChange,
  initialAnalysisResult,
  initialBlogPost,
}) => {
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [outputLengthPreference, setOutputLengthPreference] = useState<string>("standard");
  const [selectedPersona, setSelectedPersona] = useState<string>("friendly");
  const [currentExternalContext, setCurrentExternalContext] = useState<string | null>(null);
  const [currentAnalysisResult, setCurrentAnalysisResult] = useState<AnalysisResponse | null>(null);

  // Effect to initialize chat and analysis context when dialog opens or initial data changes
  useEffect(() => {
    if (isOpen) {
      let analysisToUse: AnalysisResponse | null = null;

      if (initialAnalysisResult) {
        analysisToUse = initialAnalysisResult;
      } else if (initialBlogPost && initialBlogPost.ai_analysis_json) {
        // Reconstruct AnalysisResponse from BlogPost
        analysisToUse = {
          videoTitle: initialBlogPost.title,
          videoDescription: initialBlogPost.meta_description || '',
          videoThumbnailUrl: initialBlogPost.thumbnail_url || '',
          videoTags: initialBlogPost.keywords || [],
          creatorName: initialBlogPost.creator_name || 'Unknown Creator',
          videoSubtitles: '', // Subtitles are not stored in blog_posts
          comments: initialBlogPost.ai_analysis_json.raw_comments_for_chat || [],
          aiAnalysis: {
            overall_sentiment: initialBlogPost.ai_analysis_json.overall_sentiment || 'N/A',
            emotional_tones: initialBlogPost.ai_analysis_json.emotional_tones || [],
            key_themes: initialBlogPost.ai_analysis_json.key_themes || [],
            summary_insights: initialBlogPost.ai_analysis_json.summary_insights || 'No insights available.',
          },
          blogPostSlug: initialBlogPost.slug,
          originalVideoLink: initialBlogPost.original_video_link,
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
        // Trigger external context fetch for the loaded video
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
    } else {
      // Reset chat state when dialog closes
      setChatMessages([]);
      setCurrentExternalContext(null);
      setCurrentAnalysisResult(null);
    }
  }, [isOpen, initialAnalysisResult, initialBlogPost]);

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
      // Optionally display an error, but don't block chat if external context fails
    },
  });

  const chatMutation = useMutation({
    mutationFn: async (userMessageText: string) => {
      const newUserMessage: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text: userMessageText,
      };
      
      // Add user message immediately
      setChatMessages((prev) => [...prev, newUserMessage]);

      // Prepare a placeholder for the AI's response
      const aiMessageId = Date.now().toString() + '-ai';
      const aiPlaceholderMessage: Message = {
        id: aiMessageId,
        sender: 'ai',
        text: 'Thinking...', // Placeholder text
      };
      setChatMessages((prev) => [...prev, aiPlaceholderMessage]);

      if (!currentAnalysisResult) {
        throw new Error("No video analysis loaded to chat about.");
      }

      const { data, error: invokeError } = await supabase.functions.invoke('chat-analyzer', {
        body: {
          userMessage: userMessageText,
          chatMessages: [...chatMessages, newUserMessage], // Send full history including new user message
          analysisResult: currentAnalysisResult,
          externalContext: currentExternalContext,
          outputLengthPreference: outputLengthPreference,
          selectedPersona: selectedPersona,
        },
      });

      if (invokeError) {
        console.error("Supabase Function Invoke Error:", invokeError);
        throw new Error(invokeError.message || "Failed to invoke chat function.");
      }
      
      // Assuming data is { aiResponse: "..." }
      return data.aiResponse;
    },
    onSuccess: (aiResponseContent: string) => {
      // Update the last AI message with the actual content
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
      // Find the last AI placeholder message and update it with an error
      setChatMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1 && msg.sender === 'ai' && msg.text === 'Thinking...'
            ? { ...msg, text: `Error: ${err.message}. Please try again.` }
            : msg
        )
      );
    },
  });

  const handleSendMessage = (messageText: string) => {
    if (messageText.trim() && currentAnalysisResult) {
      chatMutation.mutate(messageText);
    }
  };

  const isChatDisabled = !currentAnalysisResult || chatMutation.isPending || fetchExternalContextMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
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
          <div className="flex items-center space-x-2">
            <Label htmlFor="output-length" className="text-sm">Response Length:</Label>
            <Select
              value={outputLengthPreference}
              onValueChange={setOutputLengthPreference}
              disabled={isChatDisabled}
            >
              <SelectTrigger id="output-length" className="w-[140px]">
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={chatMutation.isPending || fetchExternalContextMutation.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoChatDialog;