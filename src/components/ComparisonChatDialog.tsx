import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { MessageSquare } from 'lucide-react';

interface CustomComparativeQuestion {
  question: string;
  wordCount: number;
  answer?: string;
}

interface ComparisonResultForChat {
  comparisonTitle: string;
  comparisonMetaDescription: string;
  comparisonKeywords: string[];
  comparisonData: any;
  customComparativeQaResults: CustomComparativeQuestion[];
  videoATitle: string;
  videoALink: string;
  videoARawCommentsForChat: string[];
  videoBTitle: string;
  videoBLink: string;
  videoBRawCommentsForChat: string[];
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface ComparisonChatDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialComparisonResult: ComparisonResultForChat | null;
}

const ComparisonChatDialog: React.FC<ComparisonChatDialogProps> = ({
  isOpen,
  onOpenChange,
  initialComparisonResult,
}) => {
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [desiredWordCount, setDesiredWordCount] = React.useState<number>(300);
  const [selectedPersona, setSelectedPersona] = React.useState<string>("friendly");
  // Removed currentExternalContext state as external context is no longer used
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialComparisonResult) {
      const initialMessageText = `Comparison for "${initialComparisonResult.videoATitle}" vs "${initialComparisonResult.videoBTitle}" loaded. What would you like to know about it?`;
      // Only initialize if chatMessages is empty or the context has changed
      if (chatMessages.length === 0 || chatMessages[0]?.text !== initialMessageText) {
        setChatMessages([
          {
            id: 'ai-initial-loaded',
            sender: 'ai',
            text: initialMessageText,
          },
        ]);
      }
      // Removed setDesiredWordCount(300); to allow user input to persist
      setError(null);
    } else if (!isOpen) { // Cleanup when closing
      setChatMessages([]);
      setError(null);
    }
  }, [isOpen, initialComparisonResult]); // Removed useAuth dependencies as they are not relevant for chat message initialization

  // Removed fetchExternalContextMutation as external context is no longer used

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

      if (!initialComparisonResult) {
        throw new Error("No video comparison loaded to chat about.");
      }

      const { data, error: invokeError } = await supabase.functions.invoke('comparison-chat-analyzer', {
        body: {
          userMessage: userMessageText,
          chatMessages: [...chatMessages, newUserMessage],
          comparisonResult: initialComparisonResult,
          // Removed externalContext: currentExternalContext,
          desiredWordCount: desiredWordCount,
          selectedPersona: selectedPersona,
        },
      });

      if (invokeError) {
        console.error("Supabase Function Invoke Error (comparison-chat-analyzer):", invokeError);
        throw new Error(invokeError.message || "Failed to invoke comparison chat function.");
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
      console.error("Comparison Chat Error:", err);
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
    if (messageText.trim() && initialComparisonResult) {
      setError(null);
      chatMutation.mutate(messageText);
    }
  };

  // Simplified disabled logic: removed fetchExternalContextMutation.isPending
  const isChatDisabled = !initialComparisonResult || chatMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-full max-h-[90vh] w-full max-w-full flex-col sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-500" /> Chat about: {initialComparisonResult?.comparisonTitle || "Video Comparison"}
          </DialogTitle>
          <DialogDescription>
            Ask questions about the video comparison, individual video analyses, or related topics.
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

export default ComparisonChatDialog;