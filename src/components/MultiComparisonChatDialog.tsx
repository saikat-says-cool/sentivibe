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
}

const MultiComparisonChatDialog: React.FC<MultiComparisonChatDialogProps> = ({
  isOpen,
  onOpenChange,
  initialMultiComparisonResult,
}) => {
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [desiredWordCount, setDesiredWordCount] = useState<number>(300); 
  const [selectedPersona, setSelectedPersona] = useState<string>("friendly");
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

      if (!initialMultiComparisonResult) {
        throw new Error("No multi-video comparison loaded to chat about.");
      }

      const { data, error: invokeError } = await supabase.functions.invoke('multi-comparison-chat-analyzer', {
        body: {
          userMessage: userMessageText,
          chatMessages: [...chatMessages, newUserMessage],
          multiComparisonResult: initialMultiComparisonResult,
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
      setChatMessages((prev) => {
        const lastUserMessageIndex = prev.findLastIndex((msg: Message) => msg.sender === 'user');
        if (lastUserMessageIndex !== -1) {
          const newMessages = [...prev];
          newMessages.splice(lastUserMessageIndex + 1, 0, {
            id: Date.now().toString() + '-ai',
            sender: 'ai',
            text: aiResponseContent,
          });
          return newMessages;
        }
        return [...prev, { id: Date.now().toString() + '-ai', sender: 'ai', text: aiResponseContent }];
      });
    },
    onError: (err: Error) => {
      console.error("Multi-Comparison Chat Error:", err);
      setChatMessages((prev) => {
        const lastUserMessageIndex = prev.findLastIndex((msg: Message) => msg.sender === 'user');
        if (lastUserMessageIndex !== -1) {
          const newMessages = [...prev];
          newMessages.splice(lastUserMessageIndex + 1, 0, {
            id: Date.now().toString() + '-error',
            sender: 'ai',
            text: `Error: ${(err as Error).message}. Please try again.`,
          });
          return newMessages;
        }
        return [...prev, { id: Date.now().toString() + '-error', sender: 'ai', text: `Error: ${(err as Error).message}. Please try again.` }];
      });
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
            <Label htmlFor="desired-word-count" className="text-sm">Response Word Count:</Label>
            <Input
              id="desired-word-count"
              type="number"
              min="50"
              step="50"
              value={desiredWordCount}
              onChange={(e) => setDesiredWordCount(Number(e.target.value))}
              className="w-[100px]"
              disabled={isChatDisabled}
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
            isLoading={chatMutation.isPending}
            disabled={isChatDisabled}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MultiComparisonChatDialog;