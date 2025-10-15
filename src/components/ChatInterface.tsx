import React, { useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Sparkles, Activity } from 'lucide-react'; // Only keeping necessary icons
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // For GitHub Flavored Markdown
import { useLoadingMessages } from '@/hooks/use-loading-messages'; // Import the new hook
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TooltipWrapper } from '@/components/ui/tooltip'; // Import TooltipWrapper

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  deepThinkEnabled: boolean;
  onToggleDeepThink: (checked: boolean) => void;
  deepSearchEnabled: boolean;
  onToggleDeepSearch: (checked: boolean) => void;
  selectedPersona: string;
  onPersonaChange: (persona: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  disabled = false, 
  deepThinkEnabled, 
  onToggleDeepThink, 
  deepSearchEnabled, 
  onToggleDeepSearch,
  selectedPersona,
  onPersonaChange,
}) => {
  const [inputMessage, setInputMessage] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll to bottom whenever messages change

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !disabled) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const loadingMessage = useLoadingMessages('chat', isLoading);

  return (
    <div className="flex flex-col h-full bg-background border rounded-lg shadow-sm">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] sm:max-w-[70%] p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-bl-none'
              } prose dark:prose-invert`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[90%] sm:max-w-[70%] p-3 rounded-lg bg-gray-100 dark:bg-gray-700 rounded-bl-none flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-gray-500 dark:text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400">{loadingMessage}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex flex-col p-2 border-t bg-gray-900 rounded-b-lg">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
          <TooltipWrapper content="Choose the AI's conversational style.">
            <div className="flex items-center space-x-2">
              <Label htmlFor="persona-select" className="text-sm text-muted-foreground">Persona:</Label>
              <Select
                value={selectedPersona}
                onValueChange={onPersonaChange}
                disabled={isLoading || disabled}
              >
                <SelectTrigger id="persona-select" className="w-[140px] bg-gray-800 text-white border-gray-700">
                  <SelectValue placeholder="Select persona" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border-gray-700">
                  <SelectItem value="friendly">Friendly Assistant</SelectItem>
                  <SelectItem value="therapist">Therapist</SelectItem>
                  <SelectItem value="storyteller">Storyteller</SelectItem>
                  <SelectItem value="motivation">Motivational Coach</SelectItem>
                  <SelectItem value="argumentative">Argumentative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TooltipWrapper>
          <TooltipWrapper content="Toggle DeepSearch mode to include real-time external search results in AI responses.">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onToggleDeepSearch(!deepSearchEnabled)}
              disabled={isLoading || disabled}
              className={`h-10 w-10 rounded-lg ${deepSearchEnabled ? 'bg-teal-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Toggle DeepSearch</span>
            </Button>
          </TooltipWrapper>
          <TooltipWrapper content="Toggle DeepThink mode for more nuanced and in-depth AI responses.">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onToggleDeepThink(!deepThinkEnabled)}
              disabled={isLoading || disabled}
              className={`h-10 w-10 rounded-lg ${deepThinkEnabled ? 'bg-teal-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
            >
              <Sparkles className="h-5 w-5" />
              <span className="sr-only">Toggle DeepThink</span>
            </Button>
          </TooltipWrapper>
        </div>
        <form onSubmit={handleSend} className="flex items-center w-full">
          <Input
            type="text"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 mr-2 bg-gray-800 text-white border-gray-700 focus:border-teal-500 focus:ring-teal-500 rounded-lg h-10 px-3"
            disabled={isLoading || disabled}
          />
          <TooltipWrapper content="Send your message to the AI.">
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || disabled}
              className="h-10 w-10 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Activity className="h-5 w-5" />}
              <span className="sr-only">Send Message</span>
            </Button>
          </TooltipWrapper>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;