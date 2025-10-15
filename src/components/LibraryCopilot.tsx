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
import { TooltipWrapper } from '@/components/ui/tooltip';
import { Link } from 'react-router-dom'; // Added Link import

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
  isPaidTier: boolean; // New prop
}

const LibraryCopilot: React.FC<LibraryCopilotProps> = ({ blogPosts, isPaidTier }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [deepThinkMode, setDeepThinkMode] = useState<boolean>(false);
  const [deepSearchMode, setDeepSearchMode] = useState<boolean>(false);
  const [selectedPersona, setSelectedPersona] = useState<string>("friendly");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setChatMessages([
        {
          id: 'ai-initial',
          sender: 'ai',
          text: "Hello! I'm your SentiVibe Library Copilot. I can help you find video analyses. Tell me what kind of video you're looking for, or ask me about specific topics!",
        },
      ]);
      setError(null);
    } else {
      setChatMessages([]);
      setError(null);
      setDeepThinkMode(false);
      setDeepSearchMode(false);
      setSelectedPersona("friendly");
    }
  }, [isOpen]);

  const copilotChatMutation = useMutation({
    mutationFn: async (userQuery: string) => {
      const newUserMessage: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text: userQuery,
      };
      setChatMessages((prev) => [...prev, newUserMessage, { id: Date.now().toString() + '-ai-loading', sender: 'ai', text: '' }]);

      // Prepare a simplified version of blogPosts for the AI
      const simplifiedBlogPosts = blogPosts.map(post => ({
        title: post.title,
        slug: post.slug,
        meta_description: post.meta_description,
        keywords: post.keywords,
        creator_name: post.creator_name,
      }));

      const response = await supabase.functions.invoke('library-copilot-analyzer', {
        body: {
          userQuery: userQuery,
          blogPostsData: simplifiedBlogPosts,
          deepThinkMode: deepThinkMode,
          deepSearchMode: deepSearchMode,
          selectedPersona: selectedPersona,
        },
      });

      if (response.error) {
        console.error("Supabase Function Invoke Error (Library Copilot):", response.error);
        if (response.error.name === 'FunctionsHttpError' && response.error.context?.status === 403) {
          try {
            const errorBody = await response.error.context.json();
            throw new Error(errorBody.error || "Daily limit exceeded. Please upgrade.");
          } catch (jsonError) {
            console.error("Failed to parse 403 error response:", jsonError);
            throw new Error(response.error.message || "Daily limit exceeded. Please upgrade.");
          }
        }
        throw new Error(response.error.message || "Failed to get AI response from copilot.");
      }
      
      return response.data.aiResponse;
    },
    onSuccess: (aiResponse) => {
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id.endsWith('-ai-loading') ? { ...msg, text: aiResponse, id: Date.now().toString() + '-ai-response' } : msg
        )
      );
    },
    onError: (err: Error) => {
      console.error("Library Copilot Chat Error:", err);
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id.endsWith('-ai-loading') ? { ...msg, text: `Error: ${(err as Error).message}. Please try again.`, id: Date.now().toString() + '-ai-error' } : msg
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
      <TooltipWrapper content="Ask AI to help you find analyses or suggest new topics.">
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <MessageSquarePlus className="h-4 w-4" /> Library Copilot
          </Button>
        </DialogTrigger>
      </TooltipWrapper>
      <DialogContent className="flex h-full max-h-[90vh] w-full max-w-full flex-col sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-6 w-6 text-accent" /> SentiVibe Library Copilot
          </DialogTitle>
          <DialogDescription>
            Ask me to help you find specific video analyses from your library or suggest new topics.
            {!isPaidTier && (
              <span className="ml-2 text-accent">
                DeepThink & DeepSearch modes are available for Paid Tier users. <Link to="/upgrade" className="underline">Upgrade now</Link>.
              </span>
            )}
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

export default LibraryCopilot;