import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Youtube, Download, MessageSquare, Link as LinkIcon, PlusCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import html2pdf from 'html2pdf.js';
import { Textarea } from "@/components/ui/textarea";
import { Link, useLocation } from "react-router-dom";
import VideoChatDialog from "@/components/VideoChatDialog";

interface AiAnalysisResult {
  overall_sentiment: string;
  emotional_tones: string[];
  key_themes: string[];
  summary_insights: string;
}

interface CustomQuestion {
  question: string;
  wordCount: number;
  answer?: string; // AI-generated answer
}

interface StoredAiAnalysisContent extends AiAnalysisResult {
  raw_comments_for_chat?: string[];
}

interface BlogPost {
  id: string;
  video_id: string;
  title: string;
  slug: string;
  meta_description: string;
  keywords: string[];
  content: string;
  published_at: string;
  author_id: string;
  creator_name: string;
  thumbnail_url: string;
  original_video_link: string;
  created_at: string;
  updated_at: string;
  ai_analysis_json: StoredAiAnalysisContent | null;
  custom_qa_results?: CustomQuestion[]; // New field
}

interface AnalysisResponse {
  videoTitle: string;
  videoDescription: string;
  videoThumbnailUrl: string;
  videoTags: string[];
  creatorName: string;
  videoSubtitles: string;
  comments: string[];
  aiAnalysis: AiAnalysisResult;
  blogPostSlug?: string;
  originalVideoLink?: string;
  customQaResults?: CustomQuestion[]; // New field
}

const AnalyzeVideo = () => {
  const location = useLocation();
  const initialBlogPost = location.state?.blogPost as BlogPost | undefined;

  const [videoLink, setVideoLink] = useState("");
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([{ question: "", wordCount: 200 }]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const analysisReportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialBlogPost) {
      const loadedAnalysis: AnalysisResponse = {
        videoTitle: initialBlogPost.title,
        videoDescription: initialBlogPost.meta_description,
        videoThumbnailUrl: initialBlogPost.thumbnail_url,
        videoTags: initialBlogPost.keywords || [],
        creatorName: initialBlogPost.creator_name || 'Unknown Creator',
        videoSubtitles: '',
        comments: initialBlogPost.ai_analysis_json?.raw_comments_for_chat || [],
        aiAnalysis: {
          overall_sentiment: initialBlogPost.ai_analysis_json?.overall_sentiment || 'N/A',
          emotional_tones: initialBlogPost.ai_analysis_json?.emotional_tones || [],
          key_themes: initialBlogPost.ai_analysis_json?.key_themes || [],
          summary_insights: initialBlogPost.ai_analysis_json?.summary_insights || 'No insights available.',
        },
        blogPostSlug: initialBlogPost.slug,
        originalVideoLink: initialBlogPost.original_video_link,
        customQaResults: initialBlogPost.custom_qa_results, // Load custom QA results
      };
      setAnalysisResult(loadedAnalysis);
      setIsChatDialogOpen(true);
    }
  }, [initialBlogPost]);

  const analyzeVideoMutation = useMutation({
    mutationFn: async (payload: { videoLink: string; customQuestions: CustomQuestion[] }) => {
      setError(null);
      setAnalysisResult(null);
      setIsChatDialogOpen(false);

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
    },
    onError: (err: Error) => {
      setError(err.message);
      setAnalysisResult(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoLink.trim()) {
      const validQuestions = customQuestions.filter(q => q.question.trim() !== "");
      analyzeVideoMutation.mutate({ videoLink, customQuestions: validQuestions });
    }
  };

  const handleAddQuestion = () => {
    setCustomQuestions([...customQuestions, { question: "", wordCount: 200 }]);
  };

  const handleRemoveQuestion = (index: number) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: keyof CustomQuestion, value: string | number) => {
    const newQuestions = [...customQuestions];
    // Ensure wordCount is a number
    if (field === 'wordCount') {
      newQuestions[index][field] = Number(value);
    } else {
      newQuestions[index][field] = value as string;
    }
    setCustomQuestions(newQuestions);
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
                disabled={analyzeVideoMutation.isPending}
              />
            </div>

            <Separator />

            <h3 className="text-lg font-semibold mb-2">Custom Questions for AI</h3>
            {customQuestions.map((qa, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor={`question-${index}`}>Question {index + 1}</Label>
                  <Textarea
                    id={`question-${index}`}
                    placeholder="e.g., What are the main criticisms of this video?"
                    value={qa.question}
                    onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                    className="mt-1 min-h-[60px]"
                    disabled={analyzeVideoMutation.isPending}
                  />
                </div>
                <div className="w-24">
                  <Label htmlFor={`wordCount-${index}`}>Word Count</Label>
                  <Input
                    id={`wordCount-${index}`}
                    type="number"
                    min="50"
                    max="1000"
                    step="50"
                    value={qa.wordCount}
                    onChange={(e) => handleQuestionChange(index, 'wordCount', e.target.value)}
                    className="mt-1"
                    disabled={analyzeVideoMutation.isPending}
                  />
                </div>
                {customQuestions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveQuestion(index)}
                    disabled={analyzeVideoMutation.isPending}
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
              disabled={analyzeVideoMutation.isPending}
              className="w-full flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" /> Add Another Question
            </Button>

            <Button type="submit" className="w-full" disabled={analyzeVideoMutation.isPending}>
              {analyzeVideoMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analyze Comments & Get Answers
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
          <div className="flex items-center space-x-2 mt-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-gray-500">Fetching external context and generating analysis...</span>
          </div>
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
          <div className="flex flex-wrap justify-end gap-2 mb-4">
            {analysisResult.originalVideoLink && (
              <Button asChild variant="outline" className="flex items-center gap-2">
                <a href={analysisResult.originalVideoLink} target="_blank" rel="noopener noreferrer">
                  <Youtube className="h-4 w-4" /> Original Video
                </a>
              </Button>
            )}
            {analysisResult.blogPostSlug && (
              <Button asChild variant="outline" className="flex items-center gap-2">
                <Link to={`/blog/${analysisResult.blogPostSlug}`}>
                  <LinkIcon className="h-4 w-4" /> View Blog Post
                </Link>
              </Button>
            )}
            <Button onClick={() => setIsChatDialogOpen(true)} className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Chat with AI
            </Button>
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
              {analysisResult.creatorName && (
                <p className="text-md text-gray-600 dark:text-gray-400 mt-1">By: {analysisResult.creatorName}</p>
              )}
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

              {analysisResult.customQaResults && analysisResult.customQaResults.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Custom AI Answers</h3>
                  <div className="space-y-4">
                    {analysisResult.customQaResults.map((qa, index) => (
                      <div key={index} className="border p-3 rounded-md bg-gray-50 dark:bg-gray-700">
                        <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Q{index + 1}: {qa.question}</p>
                        <p className="text-gray-700 dark:text-gray-300">A{index + 1}: {qa.answer || "No answer generated."}</p>
                      </div>
                    ))}
                  </div>
                  <Separator className="mt-6" />
                </div>
              )}

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

          <VideoChatDialog
            isOpen={isChatDialogOpen}
            onOpenChange={setIsChatDialogOpen}
            initialAnalysisResult={analysisResult}
          />
        </>
      )}
    </div>
  );
};

export default AnalyzeVideo;