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
import { GitCompare, Loader2 } from 'lucide-react'; // Using GitCompare icon
import ChatInterface from './ChatInterface';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom'; // Keep Link for potential future use if AI suggests blog posts

interface Comparison {
  id: string;
  title: string;
  slug: string;
  meta_description: string;
  keywords: string[];
  video_a_thumbnail_url?: string;
  video_b_thumbnail_url?: string;
  videoATitle?: string; // Assuming these might be available from joined data or passed
  videoBTitle?: string; // Assuming these might be available from joined data or passed
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface ComparisonLibraryCopilotProps {
  comparisons: Comparison[];
}

const ComparisonLibraryCopilot: React.FC<ComparisonLibraryCopilotProps> = ({ comparisons }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (isOpen && chatMessages.length === 0) {
      setChatMessages([
        {
          id: 'ai-initial',
          sender: 'ai',
          text: "Hello! I'm your SentiVibe Comparison Copilot. I can help you find video comparisons or suggest new comparison ideas. Tell me what you're looking for!",
        },
      ]);
    }
  }, [isOpen, chatMessages.length]);

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

      // Prepare a simplified version of comparisons for the AI
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
    },
    onError: (err: Error) => {
      console.error("Comparison Library Copilot Chat Error:", err);
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
    if (messageText.trim()) {
      copilotChatMutation.mutate(messageText);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <GitCompare className="h-4 w-4" /> Comparison Copilot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-6 w-6 text-accent" /> SentiVibe Comparison Copilot
          </DialogTitle>
          <DialogDescription>
            Ask me to help you find specific video comparisons or suggest new topics.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={copilotChatMutation.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComparisonLibraryCopilot;