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
import { MessageSquarePlus } from 'lucide-react';
import ChatInterface from './ChatInterface';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

const LibraryCopilot: React.FC<LibraryCopilotProps> = ({ blogPosts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Define simplifiedBlogPosts here, so it's always available
  const simplifiedBlogPosts = blogPosts.map(post => ({
    title: post.title,
    slug: post.slug,
    meta_description: post.meta_description,
    keywords: post.keywords,
    creator_name: post.creator_name,
  }));

  useEffect(() => {
    if (isOpen) {
      setChatMessages([
        {
          id: 'ai-initial',
          sender: 'ai',
          text: "Hello! I'm your SentiVibe Library Copilot. I can help you find video analyses. Tell me what kind of video you're looking for, or ask me about specific topics!",
        },
      ]);
      setError(null); // Clear error when dialog opens
    } else {
      setChatMessages([]);
      setError(null); // Clear error when dialog closes
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

      const { data, error: invokeError } = await supabase.functions.invoke('library-copilot-analyzer', {
        body: {
          userQuery: userQuery,
          blogPostsData: simplifiedBlogPosts, // Now correctly referenced
        },
      });

      if (invokeError) {
        console.error("Supabase Function Invoke Error (Library Copilot):", invokeError);
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
      console.error("Library Copilot Chat Error:", err);
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
            <AlertTitle>Copilot Error</AlertTitle>
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
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LibraryCopilot;