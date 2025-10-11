import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Youtube, GitCompare, PlusCircle, XCircle, MessageSquare } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query'; // Import useQueryClient
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
// ComparisonDataDisplay will need to be adapted or replaced for multi-video, keeping it for now
import ComparisonDataDisplay from '@/components/ComparisonDataDisplay'; 
import MultiComparisonChatDialog from '@/components/MultiComparisonChatDialog'; // Import new multi-comparison chat dialog

// New interfaces for multi-comparison
interface MultiComparisonVideo {
  blog_post_id: string; // Reference to an existing blog_post
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

interface MultiComparisonResult {
  id: string;
  title: string;
  slug: string;
  meta_description: string;
  keywords: string[];
  content: string;
  created_at: string;
  last_compared_at: string;
  comparison_data_json: any; // Structured insights for multi-comparison
  custom_comparative_qa_results: CustomComparativeQuestion[];
  overall_thumbnail_url?: string; // A single representative thumbnail
  videos: MultiComparisonVideo[]; // Array of associated videos
}

const CreateMultiComparison = () => {
  const [videoLinks, setVideoLinks] = useState<string[]>(['', '']); // Start with two empty links
  const [customComparativeQuestions, setCustomComparativeQuestions] = useState<CustomComparativeQuestion[]>([{ question: "", wordCount: 200 }]);
  const [multiComparisonResult, setMultiComparisonResult] = useState<MultiComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const queryClient = useQueryClient(); // Initialize queryClient

  const createMultiComparisonMutation = useMutation({
    mutationFn: async (payload: { videoLinks: string[]; customComparativeQuestions: CustomComparativeQuestion[] }) => {
      setError(null);
      setMultiComparisonResult(null);
      setIsChatDialogOpen(false);

      const { data, error: invokeError } = await supabase.functions.invoke('multi-video-comparator', {
        body: payload,
      });

      if (invokeError) {
        console.error("Supabase Function Invoke Error (multi-video-comparator):", invokeError);
        throw new Error(invokeError.message || "Failed to invoke multi-video comparison function.");
      }
      return data;
    },
    onSuccess: (data) => {
      setMultiComparisonResult(data);
      // Invalidate queries for comparison library to show new comparison
      queryClient.invalidateQueries({ queryKey: ['multiComparisons'] }); 
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleAddVideoLink = () => {
    setVideoLinks([...videoLinks, '']);
  };

  const handleRemoveVideoLink = (index: number) => {
    setVideoLinks(videoLinks.filter((_, i) => i !== index));
  };

  const handleVideoLinkChange = (index: number, value: string) => {
    const newLinks = [...videoLinks];
    newLinks[index] = value;
    setVideoLinks(newLinks);
  };

  const handleAddQuestion = () => {
    setCustomComparativeQuestions([...customComparativeQuestions, { question: "", wordCount: 200 }]);
  };

  const handleRemoveQuestion = (index: number) => {
    setCustomComparativeQuestions(customComparativeQuestions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: keyof CustomComparativeQuestion, value: string | number) => {
    const newQuestions = [...customComparativeQuestions];
    if (field === 'wordCount') {
      newQuestions[index][field] = Number(value);
    } else {
      newQuestions[index][field] = value as string;
    }
    setCustomComparativeQuestions(newQuestions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validVideoLinks = videoLinks.filter(link => link.trim() !== '');
    if (validVideoLinks.length < 2) {
      setError("Please provide at least two video links for multi-comparison.");
      return;
    }
    const validQuestions = customComparativeQuestions.filter(q => q.question.trim() !== "");
    createMultiComparisonMutation.mutate({ videoLinks: validVideoLinks, customComparativeQuestions: validQuestions });
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-6 w-6 text-accent" /> Create Multi-Video Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">YouTube Video Links (Min 2)</h3>
            {videoLinks.map((link, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor={`videoLink-${index}`}>Video Link {index + 1}</Label>
                  <Input
                    id={`videoLink-${index}`}
                    type="url"
                    placeholder="e.g., https://www.youtube.com/watch?v=video_id"
                    value={link}
                    onChange={(e) => handleVideoLinkChange(index, e.target.value)}
                    required
                    className="mt-1"
                    disabled={createMultiComparisonMutation.isPending}
                  />
                </div>
                {videoLinks.length > 2 && ( // Allow removing only if more than 2 links
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveVideoLink(index)}
                    disabled={createMultiComparisonMutation.isPending}
                    className="self-end sm:self-auto"
                  >
                    <XCircle className="h-5 w-5 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddVideoLink}
              disabled={createMultiComparisonMutation.isPending}
              className="w-full flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" /> Add Another Video
            </Button>

            <Separator />

            <h3 className="text-lg font-semibold mb-2">Custom Comparative Questions</h3>
            {customComparativeQuestions.map((qa, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor={`comp-question-${index}`}>Question {index + 1}</Label>
                  <Input
                    id={`comp-question-${index}`}
                    placeholder="e.g., What are the common themes across these videos?"
                    value={qa.question}
                    onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                    className="mt-1"
                    disabled={createMultiComparisonMutation.isPending}
                  />
                </div>
                <div className="w-24">
                  <Label htmlFor={`comp-wordCount-${index}`}>Word Count</Label>
                  <Input
                    id={`comp-wordCount-${index}`}
                    type="number"
                    min="50"
                    max="1000"
                    step="50"
                    value={qa.wordCount}
                    onChange={(e) => handleQuestionChange(index, 'wordCount', e.target.value)}
                    className="mt-1"
                    disabled={createMultiComparisonMutation.isPending}
                  />
                </div>
                {customComparativeQuestions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveQuestion(index)}
                    disabled={createMultiComparisonMutation.isPending}
                    className="self-end sm:self-auto"
                  >
                    <XCircle className="h-5 w-5 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddQuestion}
              disabled={createMultiComparisonMutation.isPending}
              className="w-full flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" /> Add Another Comparative Question
            </Button>

            <Button type="submit" className="w-full" disabled={createMultiComparisonMutation.isPending}>
              {createMultiComparisonMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Multi-Video Comparison
            </Button>
          </form>
        </CardContent>
      </Card>

      {createMultiComparisonMutation.isPending && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center space-x-2 mt-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-gray-500">Fetching video data, performing AI multi-comparison, and generating insights...</span>
          </div>
        </Card>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {multiComparisonResult && (
        <>
          <div className="flex flex-wrap justify-end gap-2 mb-4">
            <Button onClick={() => setIsChatDialogOpen(true)} className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Chat with AI
            </Button>
            <Button asChild>
              <Link to={`/multi-comparison/${multiComparisonResult.slug}`}>View Full Multi-Comparison Blog Post</Link>
            </Button>
          </div>
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-wrap justify-center items-center gap-4 mb-4">
                {multiComparisonResult.videos.map((video, index) => (
                  <div key={index} className="flex flex-col items-center text-center w-32">
                    <a href={video.original_video_link} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
                      <img
                        src={video.thumbnail_url}
                        alt={`Thumbnail for ${video.title}`}
                        className="w-full h-20 object-cover rounded-md shadow-md aspect-video"
                      />
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{video.title}</p>
                    </a>
                  </div>
                ))}
              </div>
              <CardTitle className="text-2xl text-center">{multiComparisonResult.title}</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
                Last Compared: {new Date(multiComparisonResult.last_compared_at).toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-md text-gray-700 dark:text-gray-300 mt-4 italic">
                {multiComparisonResult.meta_description}
              </p>
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Comparison Overview</h3>
                {/* For now, display raw JSON. We'll create a dedicated component later. */}
                {multiComparisonResult.comparison_data_json && (
                  <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md text-sm overflow-auto">
                    {JSON.stringify(multiComparisonResult.comparison_data_json, null, 2)}
                  </pre>
                )}
              </div>

              {multiComparisonResult.custom_comparative_qa_results && multiComparisonResult.custom_comparative_qa_results.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Comparative Questions & Answers</h3>
                  <div className="space-y-4">
                    {multiComparisonResult.custom_comparative_qa_results.map((qa, index) => (
                      <div key={index} className="border p-3 rounded-md bg-gray-50 dark:bg-gray-700">
                        <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Q{index + 1}: {qa.question}</p>
                        <p className="text-gray-700 dark:text-gray-300">A{index + 1}: {qa.answer || "No answer generated."}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <MultiComparisonChatDialog
            isOpen={isChatDialogOpen}
            onOpenChange={setIsChatDialogOpen}
            initialMultiComparisonResult={multiComparisonResult}
          />
        </>
      )}
    </div>
  );
};

export default CreateMultiComparison;