import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Youtube, Download, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import html2pdf from 'html2pdf.js';
import { Textarea } from "@/components/ui/textarea";
import ChatInterface from '@/components/ChatInterface';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AiAnalysisResult {
  overall_sentiment: string;
  emotional_tones: string[];
  key_themes: string[];
  summary_insights: string;
}

interface AnalysisResponse {
  videoTitle: string;
  videoDescription: string;
  videoThumbnailUrl: string;
  videoTags: string[];
  videoSubtitles: string;
  comments: string[];
  aiAnalysis: AiAnalysisResult;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

const AnalyzeVideo = () => {
  const [videoLink, setVideoLink] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [externalContext, setExternalContext] = useState<string | null>(null);
  const [outputLengthPreference, setOutputLengthPreference] = useState<string>("standard");
  const [selectedPersona, setSelectedPersona] = useState<string>("friendly");
  const analysisReportRef = useRef<HTMLDivElement>(null);

  const fetchExternalContextMutation = useMutation({
    mutationFn: async (query: string) => {
      const { data, error: invokeError } = await supabase.functions.invoke('fetch-external-context', {
        body: { query },
      });
      if (invokeError) {
        console.error("Supabase Fetch External Context Function Invoke Error:", invokeError);
        throw new Error(invokeError.message || "Failed to fetch external context.");
      }
      return data.externalSearchResults;
    },
    onSuccess: (data) => {
      setExternalContext(data);
    },
    onError: (err: Error) => {
      console.error("Error fetching external context:", err);
      // Optionally display an error, but don't block chat if external context fails
    },
  });

  const analyzeVideoMutation = useMutation({
    mutationFn: async (payload: { videoLink: string; customInstructions: string }) => {
      setError(null);
      setAnalysisResult(null);
      setChatMessages([]);
      setExternalContext(null);

      const { data, error: invokeError } = await supabase.functions.invoke('youtube-analyzer', {
        body: payload,
      });

      if (invokeError) {
        console.error("Supabase Function Invoke Error:", invokeError);
        throw new Error(invokeError.message || "Failed to invoke analysis function.");
      }
      return data;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      const searchQuery = `${data.videoTitle} ${data.videoTags.join(' ')}`;
      fetchExternalContextMutation.mutate(searchQuery);

      setChatMessages([
        {
          id: 'ai-initial',
          sender: 'ai',
          text: `Analysis complete for "${data.videoTitle}". What would you like to know about it?`,
        },
      ]);
    },
    onError: (err: Error) => {
      setError(err.message);
      setAnalysisResult(null);
      setChatMessages([]);
      setExternalContext(null);
    },
  });

  const chatMutation = useMutation({
    mutationFn: async (userMessageText: string) => {
      const newUserMessage: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text: userMessageText,
      };
      
      // Add user message immediately
      setChatMessages((prev) => [...prev, newUserMessage]);

      // Prepare a placeholder for the AI's streaming response
      const aiMessageId = Date.now().toString() + '-ai';
      const aiPlaceholderMessage: Message = {
        id: aiMessageId,
        sender: 'ai',
        text: '', // Start with empty text
      };
      setChatMessages((prev) => [...prev, aiPlaceholderMessage]);

      // Manually fetch the stream from the Edge Function URL
      const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-analyzer`;
      const streamResponse = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: userMessageText,
          chatMessages: [...chatMessages, newUserMessage], // Send full history including new user message
          analysisResult: analysisResult,
          externalContext: externalContext,
          outputLengthPreference: outputLengthPreference,
          selectedPersona: selectedPersona,
        }),
      });

      if (!streamResponse.ok) {
        const errorData = await streamResponse.json();
        throw new Error(errorData.error?.message || "Failed to get AI response stream.");
      }

      const reader = streamResponse.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      if (!reader) {
        throw new Error('Failed to get readable stream from AI response.');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        // Update the specific AI message with the new chunk
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, text: accumulatedText } : msg
          )
        );
      }
      return { aiResponse: accumulatedText }; // Return the full response for onSuccess
    },
    onSuccess: (data) => {
      // The UI is already updated incrementally, so onSuccess just confirms completion
      console.log("AI streaming complete:", data.aiResponse);
    },
    onError: (err: Error) => {
      console.error("Chat Error:", err);
      // Find the last AI placeholder message and update it with an error
      setChatMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1 && msg.sender === 'ai' && msg.text === ''
            ? { ...msg, text: `Error: ${err.message}. Please try again.` }
            : msg
        )
      );
    },
  });

  const handleSendMessage = (messageText: string) => {
    if (messageText.trim() && analysisResult) {
      chatMutation.mutate(messageText);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoLink.trim()) {
      analyzeVideoMutation.mutate({ videoLink, customInstructions });
    }
  };

  const handleDownloadPdf = () => {
    if (analysisReportRef.current && analysisResult) {
      const element = analysisReportRef.current;
      const opt = {
        margin: 1,
        filename: `SentiVibe_Report_${analysisResult.videoTitle.replace(/[^a-z0-9]/gi, '_')}.pdf`,
        image: { type: 'jpeg' as 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as 'portrait' }
      };
      html2pdf().from(element).set(opt).save();
    }
  };

  const isChatDisabled = !analysisResult || fetchExternalContextMutation.isPending;

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-6 w-6 text-red-500" /> Analyze YouTube Video
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="videoLink">YouTube Video Link</Label>
              <Input
                id="videoLink"
                type="url"
                placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="customInstructions">Custom Instructions (Optional)</Label>
              <Textarea
                id="customInstructions"
                placeholder="e.g., Focus on positive feedback, or summarize for a marketing report."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="mt-1 min-h-[80px]"
              />
            </div>
            <Button type="submit" className="w-full" disabled={analyzeVideoMutation.isPending}>
              {analyzeVideoMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analyze Comments
            </Button>
          </form>
        </CardContent>
      </Card>

      {(analyzeVideoMutation.isPending || fetchExternalContextMutation.isPending) && (
        <Card className="p-6 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
          {fetchExternalContextMutation.isPending && (
            <div className="flex items-center space-x-2 mt-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-gray-500">Fetching external context...</span>
            </div>
          )}
        </Card>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analysisResult && (
        <>
          <div className="flex justify-end mb-4">
            <Button onClick={handleDownloadPdf} className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Download Report PDF
            </Button>
          </div>
          <Card ref={analysisReportRef} className="mb-6">
            <CardHeader>
              {analysisResult.videoThumbnailUrl && (
                <img
                  src={analysisResult.videoThumbnailUrl}
                  alt={analysisResult.videoTitle}
                  className="w-full h-auto rounded-md mb-4"
                />
              )}
              <CardTitle className="text-2xl">{analysisResult.videoTitle}</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{analysisResult.videoDescription}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {analysisResult.videoTags && analysisResult.videoTags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Video Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.videoTags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {analysisResult.videoSubtitles && (
                <div>
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full text-lg font-semibold mb-2">
                      Video Subtitles <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="text-gray-700 dark:text-gray-300 text-sm max-h-60 overflow-y-auto border p-3 rounded-md bg-gray-50 dark:bg-gray-700">
                      <p>{analysisResult.videoSubtitles}</p>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-2">Overall Sentiment</h3>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {analysisResult.aiAnalysis.overall_sentiment}
                </Badge>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Emotional Tones</h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.aiAnalysis.emotional_tones.map((tone, index) => (
                    <Badge key={index} variant="outline">
                      {tone}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Key Themes</h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.aiAnalysis.key_themes.map((theme, index) => (
                    <Badge key={index} variant="outline">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Summary Insights</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {analysisResult.aiAnalysis.summary_insights}
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Raw Comments (First 10, by popularity)</h3>
                {analysisResult.comments.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {analysisResult.comments.slice(0, 10).map((comment, index) => (
                      <li key={index}>{comment}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No comments found or fetched.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-blue-500" /> Chat with AI about this video
              </CardTitle>
              <div className="flex items-center space-x-4">
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
                  <Label htmlFor="output-length" className="text-sm">Response Length:</Label>
                  <Select
                    value={outputLengthPreference}
                    onValueChange={setOutputLengthPreference}
                    disabled={isChatDisabled}
                  >
                    <SelectTrigger id="output-length" className="w-[140px]">
                      <SelectValue placeholder="Select length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concise">Concise</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[500px] p-0">
              <ChatInterface
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                isLoading={chatMutation.isPending || fetchExternalContextMutation.isPending}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AnalyzeVideo;