import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Youtube } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface AiAnalysisResult {
  overall_sentiment: string;
  emotional_tones: string[];
  key_themes: string[];
  summary_insights: string;
}

const AnalyzeVideo = () => {
  const [videoLink, setVideoLink] = useState("");
  const [analysisResult, setAnalysisResult] = useState<{ comments: string[]; aiAnalysis: AiAnalysisResult } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeVideoMutation = useMutation({
    mutationFn: async (link: string) => {
      setError(null); // Clear previous errors
      const { data, error: invokeError } = await supabase.functions.invoke('youtube-analyzer', {
        body: { videoLink: link },
      });

      if (invokeError) {
        console.error("Supabase Function Invoke Error:", invokeError);
        throw new Error(invokeError.message || "Failed to invoke analysis function.");
      }
      return data;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
    },
    onError: (err: Error) => {
      setError(err.message);
      setAnalysisResult(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoLink.trim()) {
      analyzeVideoMutation.mutate(videoLink);
    }
  };

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
            <Button type="submit" className="w-full" disabled={analyzeVideoMutation.isPending}>
              {analyzeVideoMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analyze Comments
            </Button>
          </form>
        </CardContent>
      </Card>

      {analyzeVideoMutation.isPending && (
        <Card className="p-6 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </Card>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
              <h3 className="text-lg font-semibold mb-2">Raw Comments (First 10)</h3>
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
      )}
    </div>
  );
};

export default AnalyzeVideo;