import { useState, useEffect } from 'react';

const ANALYSIS_MESSAGES = [
  "Fetching video details from YouTube...",
  "Retrieving comments and preparing for AI analysis...",
  "Analyzing audience sentiment and emotional tones...",
  "Identifying key themes and insights...",
  "Generating SEO-optimized blog post content...",
  "Answering custom questions with AI...",
  "Finalizing report and saving to database...",
];

const COMPARISON_MESSAGES = [
  "Fetching individual video data...",
  "Ensuring all video analyses are up-to-date...",
  "Performing AI multi-comparison analysis...",
  "Identifying commonalities and divergences...",
  "Generating comparative blog post content...",
  "Answering custom comparative questions with AI...",
  "Finalizing comparison report and saving to database...",
];

const CHAT_MESSAGES = [
  "Thinking...",
  "Formulating a response...",
  "Consulting the analysis data...",
  "Crafting an insightful answer...",
];

type MessageType = 'analysis' | 'comparison' | 'chat';

export function useLoadingMessages(type: MessageType, isLoading: boolean) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    switch (type) {
      case 'analysis':
        setMessages(ANALYSIS_MESSAGES);
        break;
      case 'comparison':
        setMessages(COMPARISON_MESSAGES);
        break;
      case 'chat':
        setMessages(CHAT_MESSAGES);
        break;
      default:
        setMessages(["Loading..."]);
    }
    setCurrentMessageIndex(0); // Reset index when type changes
  }, [type]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading && messages.length > 0) {
      interval = setInterval(() => {
        setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
      }, 2000); // Change message every 2 seconds
    } else {
      setCurrentMessageIndex(0); // Reset when not loading
    }

    return () => clearInterval(interval);
  }, [isLoading, messages]);

  return isLoading && messages.length > 0 ? messages[currentMessageIndex] : '';
}