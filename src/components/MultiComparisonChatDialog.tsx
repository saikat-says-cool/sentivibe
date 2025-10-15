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
  isPaidTier: boolean; // New prop
}

const MultiComparisonChatDialog: React.FC<MultiComparisonChatDialogProps> = ({
  isOpen,
  onOpenChange,
  initialMultiComparisonResult,
  isPaidTier, // Destructure new prop
}) => {
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  // Removed desiredWordCount state
  const [selectedPersona, setSelectedPersona] = useState<string>("friendly"); // Keep state for Edge Function payload
  const [deepThinkMode, setDeepThinkMode] = useState<boolean>(false);
  const [deepSearchMode, setDeepSearchMode] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialMultiComparisonResult) {
      const videoTitles = initialMultiComparisonResult.videos.map(v => `"${v.title}"`).join(', ');
      const initialMessageText = `Multi-video comparison for ${videoTitles} loaded. What would you like to know about it?`;
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
  }, [isOpen, initialMultiComparisonResult]);

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
          // Removed desiredWordCount from payload
          selectedPersona: selectedPersona,
          deepThinkMode: deepThinkMode,
          deepSearchMode: deepSearchMode,
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
      setError(`Failed to get AI response: ${(err as Error).message}`);
    },
  });

  const handleSendMessage = (messageText: string) => {
    if (messageText.trim() && initialMultiComparisonResult) {
      setError(null);
      chatMutation.mutate(messageText);
    }
  };

  const isChatDisabled = !initialMultiComparisonResult || chatMutation.isPending;

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

export default MultiComparisonChatDialog;