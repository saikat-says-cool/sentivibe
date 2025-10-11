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
import { MessageSquarePlus, Loader2 } from 'lucide-react';
import ChatInterface from './ChatInterface';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useAuth } from '@/integrations/supabase/auth'; // Import useAuth
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components

interface BlogPost {
  id: string;
  video_id: string;
  title: string;
  slug: string;
  meta_description: string;
  keywords: string[];
  creator_name: string;
  author_id: string; // Added author_id for filtering
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
  const [copilotError, setCopilotError] = useState<string | null>(null);

  const { subscriptionTier, isLoading: isAuthLoading } = useAuth();
  const isGuest = subscriptionTier === 'guest';

  useEffect(() => {
    if (isOpen) {
      setCopilotError(null); // Clear previous errors on open
      if (isGuest) {
        setChatMessages([
          {
            id: 'ai-guest-blocked',
            sender: 'ai',
            text: "Library Copilot is not available for guest users. Please log in or sign up to access this feature.",
          },
        ]);
        setCopilotError("Library Copilot is not available for guest users.");
      } else if (chatMessages.length === 0) {
        setChatMessages([
          {
            id: 'ai-initial',
            sender: 'ai',
            text: "Hello! I'm your SentiVibe Library Copilot. I can help you find video analyses. Tell me what kind of video you're looking for, or ask me about specific topics!",
          },
        ]);
      }
    } else {
      setChatMessages([]);
      setCopilotError(null);
    }
  }, [isOpen, chatMessages.length, isGuest]);

  const copilotChatMutation = useMutation({
    mutationFn: async (userQuery: string) => {
      setCopilotError(null); // Clear error on new message attempt

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

      // Prepare a simplified version of blogPosts for the AI
      const simplifiedBlogPosts = blogPosts.map(post => ({
        title: post.title,
        slug: post.slug,
        meta_description: post.meta_description,
        keywords: post.keywords,
        creator_name: post.creator_name,
        author_id: post.author_id, // Include author_id for backend filtering
      }));

      const { data, error: invokeError } = await supabase.functions.invoke('library-copilot-analyzer', {
        body: {
          userQuery: userQuery,
          blogPostsData: simplifiedBlogPosts,
        },
      });

      if (invokeError) {
        console.error("Supabase Function Invoke Error (Library Copilot):", invokeError);
        if (invokeError.message.includes('LIBRARY_COPILOT_ACCESS_DENIED')) {
          throw new Error(`LIBRARY_COPILOT_ACCESS_DENIED:${invokeError.message}`);
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
    },
    onError: (err: Error) => {
      console.error("Library Copilot Chat Error:", err);
      if (err.message.startsWith('LIBRARY_COPILOT_ACCESS_DENIED:')) {
        setCopilotError(err.message.replace('LIBRARY_COPILOT_ACCESS_DENIED:', ''));
      } else {
        setCopilotError(`Error: ${err.message}. Please try again.`);
      }
      // Remove the "Thinking..." message if an error occurs
      setChatMessages((prev) => prev.filter(msg => !(msg.sender === 'ai' && msg.text === 'Thinking...')));
    },
  });

  const handleSendMessage = (messageText: string) => {
    if (messageText.trim() && !isGuest) {
      copilotChatMutation.mutate(messageText);
    }
  };

  const isChatDisabled = isGuest || copilotChatMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2" disabled={isGuest || isAuthLoading}>
          <MessageSquarePlus className="h-4 w-4" /> Library Copilot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-6 w-6 text-accent" /> SentiVibe Library Copilot
          </DialogTitle>
          <DialogDescription>
            Ask me to help you find specific video analyses from your library.
          </DialogDescription>
        </DialogHeader>
        {copilotError && (
          <Alert variant="destructive" className="mt-2">
            <AlertTitle>Copilot Error</AlertTitle>
            <AlertDescription>{copilotError}</AlertDescription>
          </Alert>
        )}
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={copilotChatMutation.isPending}
            disabled={isChatDisabled} // Pass disabled prop to ChatInterface
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LibraryCopilot;