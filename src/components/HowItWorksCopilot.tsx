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
import { LifeBuoy } from 'lucide-react'; // Using LifeBuoy icon for support
import ChatInterface from './ChatInterface';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface HowItWorksCopilotProps {
  productDocumentation: string;
  technicalDocumentation: string;
}

const HowItWorksCopilot: React.FC<HowItWorksCopilotProps> = ({ productDocumentation, technicalDocumentation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  // Removed: const [deepThinkMode, setDeepThinkMode] = useState<boolean>(false);
  const [desiredWordCount, setDesiredWordCount] = useState<number>(300);
  const [selectedPersona, setSelectedPersona] = useState<string>("friendly");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setChatMessages([
        {
          id: 'ai-initial',
          sender: 'ai',
          text: "Hello! I'm your SentiVibe Guide Assistant. I'm here to help you with any questions about how SentiVibe works, its features, or even its underlying code. What can I assist you with today?",
        },
      ]);
      setError(null);
    } else {
      setChatMessages([]);
      setError(null);
      // Removed: setDeepThinkMode(false);
    }
  }, [isOpen]);

  const copilotChatMutation = useMutation({
    mutationFn: async (userQuery: string) => {
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

      const { data, error: invokeError } = await supabase.functions.invoke('how-it-works-copilot-analyzer', {
        body: {
          userQuery: userQuery,
          chatMessages: [...chatMessages, newUserMessage],
          productDocumentation: productDocumentation,
          technicalDocumentation: technicalDocumentation,
          // Removed: deepThinkMode: deepThinkMode,
          desiredWordCount: desiredWordCount,
          selectedPersona: selectedPersona,
        },
      });

      if (invokeError) {
        console.error("Supabase Function Invoke Error (How It Works Copilot):", invokeError);
        throw new Error(invokeError.message || "Failed to get AI response from assistant.");
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
      console.error("How It Works Copilot Chat Error:", err);
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

  const isCopilotDisabled = copilotChatMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
          <LifeBuoy className="h-4 w-4" /> Guide Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-full max-h-[90vh] w-full max-w-full flex-col sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LifeBuoy className="h-6 w-6 text-green-600" /> SentiVibe Guide Assistant
          </DialogTitle>
          <DialogDescription>
            Your expert assistant for all things SentiVibe. Ask about features, architecture, or code.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 mt-2 sm:mt-0 mb-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="persona-select" className="text-sm">Persona:</Label>
            <Select
              value={selectedPersona}
              onValueChange={setSelectedPersona}
              disabled={isCopilotDisabled}
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
              disabled={isCopilotDisabled}
            />
          </div>
        </div>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Assistant Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={copilotChatMutation.isPending}
            disabled={isCopilotDisabled}
            // Removed: deepThinkEnabled={deepThinkMode}
            // Removed: onToggleDeepThink={setDeepThinkMode}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HowItWorksCopilot;