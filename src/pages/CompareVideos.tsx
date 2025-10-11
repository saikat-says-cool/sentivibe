import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Youtube, GitCompare, PlusCircle, XCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link } from 'react-router-dom';

interface CustomComparativeQuestion {
  question: string;
  wordCount: number;
  answer?: string;
}

interface ComparisonResult {
  comparisonTitle: string;
  comparisonSlug: string;
  comparisonMetaDescription: string;
  comparisonKeywords: string[];
  comparisonContent: string;
  comparisonData: any; // This will hold the structured comparison insights
  customComparativeQaResults: CustomComparativeQuestion[];
  lastComparedAt: string;
}

const CompareVideos = () => {
  const [videoLinkA, setVideoLinkA] = useState('');
  const [videoLinkB, setVideoLinkB] = useState('');
  const [customComparativeQuestions, setCustomComparativeQuestions] = useState<CustomComparativeQuestion[]>([{ question: "", wordCount: 200 }]);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compareVideosMutation = useMutation({
    mutationFn: async (payload: { videoLinkA: string; videoLinkB: string; customComparativeQuestions: CustomComparativeQuestion[] }) => {
      setError(null);
      setComparisonResult(null);

      const { data, error: invokeError } = await supabase.functions.invoke('video-comparator', {
        body: payload,
      });

      if (invokeError) {
        console.error("Supabase Function Invoke Error (video-comparator):", invokeError);
        throw new Error(invokeError.message || "Failed to invoke video comparison function.");
      }
      return data;
    },
    onSuccess: (data) => {
      setComparisonResult(data);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoLinkA.trim() && videoLinkB.trim()) {
      const validQuestions = customComparativeQuestions.filter(q => q.question.trim() !== "");
      compareVideosMutation.mutate({ videoLinkA, videoLinkB, customComparativeQuestions: validQuestions });
    } else {
      setError("Please provide both video links to compare.");
    }
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

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-6 w-6 text-accent" /> Compare YouTube Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="videoLinkA">YouTube Video Link A</Label>
              <Input
                id="videoLinkA"
                type="url"
                placeholder="e.g., https://www.youtube.com/watch?v=videoA"
                value={videoLinkA}
                onChange={(e) => setVideoLinkA(e.target.value)}
                required
                className="mt-1"
                disabled={compareVideosMutation.isPending}
              />
            </div>
            <div>
              <Label htmlFor="videoLinkB">YouTube Video Link B</Label>
              <Input
                id="videoLinkB"
                type="url"
                placeholder="e.g., https://www.youtube.com/watch?v=videoB"
                value={videoLinkB}
                onChange={(e) => setVideoLinkB(e.target.value)}
                required
                className="mt-1"
                disabled={compareVideosMutation.isPending}
              />
            </div>

            <Separator />

            <h3 className="text-lg font-semibold mb-2">Custom Comparative Questions</h3>
            {customComparativeQuestions.map((qa, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor={`comp-question-${index}`}>Question {index + 1}</Label>
                  <Input
                    id={`comp-question-${index}`}
                    placeholder="e.g., Which video had a more positive reception regarding its editing style?"
                    value={qa.question}
                    onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                    className="mt-1"
                    disabled={compareVideosMutation.isPending}
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
                    disabled={compareVideosMutation.isPending}
                  />
                </div>
                {customComparativeQuestions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveQuestion(index)}
                    disabled={compareVideosMutation.isPending}
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
              disabled={compareVideosMutation.isPending}
              className="w-full flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" /> Add Another Comparative Question
            </Button>

            <Button type="submit" className="w-full" disabled={compareVideosMutation.isPending}>
              {compareVideosMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Compare Videos
            </Button>
          </form>
        </CardContent>
      </Card>

      {compareVideosMutation.isPending && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center space-x-2 mt-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-gray-500">Fetching video data, performing AI comparison, and generating insights...</span>
          </div>
        </Card>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {comparisonResult && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{comparisonResult.comparisonTitle}</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Last Compared: {new Date(comparisonResult.lastComparedAt).toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-md text-gray-700 dark:text-gray-300 mt-4 italic">
              {comparisonResult.comparisonMetaDescription}
            </p>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Comparison Overview</h3>
              {/* Render comparisonData here once available */}
              <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-sm overflow-auto">
                {JSON.stringify(comparisonResult.comparisonData, null, 2)}
              </pre>
            </div>

            {comparisonResult.customComparativeQaResults && comparisonResult.customComparativeQaResults.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Comparative Questions & Answers</h3>
                <div className="space-y-4">
                  {comparisonResult.customComparativeQaResults.map((qa, index) => (
                    <div key={index} className="border p-3 rounded-md bg-gray-50 dark:bg-gray-700">
                      <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Q{index + 1}: {qa.question}</p>
                      <p className="text-gray-700 dark:text-gray-300">A{index + 1}: {qa.answer || "No answer generated."}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <Button asChild>
                <Link to={`/comparison/${comparisonResult.comparisonSlug}`}>View Full Comparison Blog Post</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompareVideos;