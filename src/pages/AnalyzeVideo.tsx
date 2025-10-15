import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Youtube, Download, MessageSquare, Link as LinkIcon, PlusCircle, XCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import html2pdf from 'html2pdf.js';
import { Textarea } from "@/components/ui/textarea";
import { Link, useLocation, useNavigate } from "react-router-dom";
import VideoChatDialog from "@/components/VideoChatDialog";
import { useAuth } from '@/integrations/supabase/auth';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLoadingMessages } from '@/hooks/use-loading-messages'; // Import the new hook

interface AiAnalysisResult {
  overall_sentiment: string;
  emotional_tones: string[];
  key_themes: string[];
  summary_insights: string;
}

interface CustomQuestion {
  question: string;
  wordCount: number;
  answer?: string;
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
  custom_qa_results?: CustomQuestion[];
  last_reanalyzed_at?: string;
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
  customQaResults?: CustomQuestion[];
  lastReanalyzedAt?: string;
}

// Define simplified tier limits (only daily analyses remain)
const UNAUTHENTICATED_LIMITS = {
  dailyAnalyses: 1,
};

const AUTHENTICATED_FREE_TIER_LIMITS = {
  dailyAnalyses: 1,
};

const PAID_TIER_LIMITS = {
  dailyAnalyses: 50, // Effectively unlimited
};

// Function to fetch anonymous usage
const fetchAnonUsage = async () => {
  const { data, error } = await supabase.functions.invoke('get-anon-usage');
  if (error) {
    console.error("Error fetching anon usage:", error);
    throw new Error(error.message || "Failed to fetch anonymous usage data.");
  }
  return data;
};

const AnalyzeVideo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialBlogPost = location.state?.blogPost as BlogPost | undefined;
  const openChatImmediately = location.state?.openChat as boolean | undefined;
  const forceReanalyzeFromNav = location.state?.forceReanalyze as boolean | undefined;

  const { user, subscriptionStatus, subscriptionPlanId } = useAuth();

  const [videoLink, setVideoLink] = useState("");
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(() => {
    if (initialBlogPost?.custom_qa_results && initialBlogPost.custom_qa_results.length > 0) {
      return initialBlogPost.custom_qa_results.map(qa => ({
        question: qa.question,
        wordCount: qa.wordCount
      }));
    }
    return [{ question: "", wordCount: 200 }];
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const [analysesToday, setAnalysesToday] = useState<number>(0);
  const analysisReportRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const isPaidTier = subscriptionStatus === 'active' && subscriptionPlanId !== 'free';
  const isAuthenticatedFreeTier = user && !isPaidTier;
  const isUnauthenticated = !user;

  let currentLimits;
  if (isPaidTier) {
    currentLimits = PAID_TIER_LIMITS;
  } else if (isAuthenticatedFreeTier) {
    currentLimits = AUTHENTICATED_FREE_TIER_LIMITS;
  } else {
    currentLimits = UNAUTHENTICATED_LIMITS;
  }

  // Fetch anonymous usage if unauthenticated
  const { data: anonUsage, refetch: refetchAnonUsage } = useQuery({
    queryKey: ['anonUsage'],
    queryFn: fetchAnonUsage,
    enabled: isUnauthenticated,
    refetchOnWindowFocus: false,
  });

  const analyzeVideoMutation = useMutation({
    mutationFn: async (payload: { videoLink: string; customQuestions: CustomQuestion[]; forceReanalyze?: boolean }) => {
      setError(null);
      setIsChatDialogOpen(false);

      const { data, error: invokeError } = await supabase.functions.invoke('youtube-analyzer', {
        body: payload,
      });

      if (invokeError) {
        console.error("Supabase Function Invoke Error:", invokeError);
        if (invokeError.name === 'FunctionsHttpError' && (invokeError.context?.status === 403 || invokeError.context?.status === 400)) {
          try {
            const errorBody = await invokeError.context.json();
            throw new Error(errorBody.error || invokeError.message || "An unexpected error occurred with the analysis function.");
          } catch (jsonError) {
            console.error("Failed to parse error response:", jsonError);
            throw new Error(invokeError.message || "An unexpected error occurred with the analysis function.");
          }
        }
        throw new Error(invokeError.message || "Failed to invoke analysis function.");
      }
      return data;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      queryClient.invalidateQueries({ queryKey: ['myBlogPosts'] });
      if (data.blogPostSlug) {
        queryClient.invalidateQueries({ queryKey: ['blogPost', data.blogPostSlug] });
      }
      if (isUnauthenticated) {
        refetchAnonUsage();
      } else {
        queryClient.invalidateQueries({ queryKey: ['dailyAnalysesCount', user?.id] });
      }
    },
    onError: (err: Error) => {
      setError(err.message);
      setAnalysisResult(null);
    },
  });

  // Fetch daily analysis count for authenticated users
  const { data: authenticatedAnalysesCount } = useQuery<number, Error>({
    queryKey: ['dailyAnalysesCount', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count, error } = await supabase
        .from('blog_posts')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', twentyFourHoursAgo)
        .eq('author_id', user.id);

      if (error) {
        console.error("Error fetching daily analysis count for authenticated user:", error);
        return 0;
      }
      return count || 0;
    },
    enabled: !!user && !isUnauthenticated,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isUnauthenticated) {
      setAnalysesToday(anonUsage?.analyses_count || 0);
    } else if (user) {
      setAnalysesToday(authenticatedAnalysesCount || 0);
    }
  }, [isUnauthenticated, user, anonUsage, authenticatedAnalysesCount]);

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
        customQaResults: initialBlogPost.custom_qa_results,
        lastReanalyzedAt: initialBlogPost.last_reanalyzed_at,
      };
      setAnalysisResult(loadedAnalysis);
      setVideoLink(initialBlogPost.original_video_link || "");

      if (openChatImmediately && !isChatDialogOpen) {
        setIsChatDialogOpen(true);
        navigate(location.pathname, { replace: true, state: { ...location.state, openChat: false } });
      }
      if (forceReanalyzeFromNav) {
        analyzeVideoMutation.mutate({ videoLink: initialBlogPost.original_video_link, customQuestions: [], forceReanalyze: true });
        navigate(location.pathname, { replace: true, state: { ...location.state, forceReanalyze: false } });
      }
    }
  }, [initialBlogPost, openChatImmediately, forceReanalyzeFromNav, analyzeVideoMutation, isChatDialogOpen, navigate, location.pathname, location.state]);

  // Set SEO-optimized browser tab title
  useEffect(() => {
    document.title = "Analyze YouTube Video - SentiVibe: Your Audience, Understood.";
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoLink.trim()) {
      const validQuestions = customQuestions.filter(q => q.question.trim() !== "");
      analyzeVideoMutation.mutate({ videoLink, customQuestions: validQuestions, forceReanalyze: false });
    }
  };

  const handleRefreshAnalysis = () => {
    if (analysisResult?.originalVideoLink) {
      analyzeVideoMutation.mutate({ videoLink: analysisResult.originalVideoLink, customQuestions: [], forceReanalyze: true });
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
    if (field === 'wordCount') {
      (newQuestions[index] as CustomQuestion).wordCount = Number(value);
    } else {
      (newQuestions[index] as CustomQuestion).question = value as string;
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

      const tempDiv = document.createElement('div');
      tempDiv.className = 'pdf-light-mode'; // Apply the new class
      tempDiv.style.position = 'relative';
      tempDiv.style.width = element.offsetWidth + 'px';
      tempDiv.style.height = element.offsetHeight + 'px';
      tempDiv.innerHTML = element.innerHTML;

      // Add header
      const header = document.createElement('div');
      header.style.textAlign = 'center';
      header.style.marginBottom = '1rem';
      header.style.paddingBottom = '0.5rem';
      header.style.borderBottom = '1px solid #ccc';
      header.innerHTML = `
        <img src="/logo.svg" alt="SentiVibe Logo" style="height: 30px; margin-right: 10px; display: inline-block; vertical-align: middle;">
        <span style="font-weight: bold; font-size: 1.2em; vertical-align: middle;">SentiVibe</span>
        <p style="font-size: 0.8em; color: #555; margin-top: 5px;">YouTube Audience Insight Report</p>
      `;
      tempDiv.prepend(header);

      // Add footer
      const footer = document.createElement('div');
      footer.style.textAlign = 'center';
      footer.style.marginTop = '1rem';
      footer.style.paddingTop = '0.5rem';
      footer.style.borderTop = '1px solid #ccc';
      footer.style.fontSize = '0.8em';
      footer.style.color = '#555';
      footer.innerHTML = `
        <p>&copy; ${new Date().getFullYear()} SentiVibe. All rights reserved.</p>
        <p>Analyses generated by AI based on public YouTube comments.</p>
      `;
      tempDiv.appendChild(footer);


      if (!isPaidTier) {
        const watermark = document.createElement('div');
        watermark.style.position = 'absolute';
        watermark.style.top = '50%';
        watermark.style.left = '50%';
        watermark.style.transform = 'translate(-50%, -50%) rotate(-45deg)';
        watermark.style.fontSize = '48px';
        watermark.style.fontWeight = 'bold';
        watermark.style.color = 'rgba(0, 0, 0, 0.1)';
        watermark.style.zIndex = '1000';
        watermark.style.pointerEvents = 'none';
        watermark.textContent = 'SentiVibe - Free Tier';
        tempDiv.appendChild(watermark);
      }

      document.body.appendChild(tempDiv);

      html2pdf().from(tempDiv).set(opt).save().then(() => {
        document.body.removeChild(tempDiv);
      });
    }
  };

  const isAnalysisLimitReached = analysesToday >= currentLimits.dailyAnalyses;

  const areCustomQuestionInputsDisabled = analyzeVideoMutation.isPending;

  const loadingMessage = useLoadingMessages('analysis', analyzeVideoMutation.isPending);

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-6 w-6 text-red-500" /> Analyze a Video: From Comments to Conversation
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
                disabled={analyzeVideoMutation.isPending || isAnalysisLimitReached}
              />
              <p className="text-sm text-muted-foreground mt-2">
                SentiVibe will analyze the available comments. Analysis may take up to 30 seconds.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Analyses today: {analysesToday}/{currentLimits.dailyAnalyses}
                {!isPaidTier && (
                  <span className="ml-2 text-blue-500">
                    <Link to="/upgrade" className="underline">Upgrade to a paid tier</Link> for more analyses.
                  </span>
                )}
              </p>
            </div>

            <Separator />

            <h3 className="text-lg font-semibold mb-2">Ask Unlimited Questions. We don't meter your curiosity.</h3>
            {customQuestions.map((qa, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor={`question-${index}`}>Question {index + 1}</Label>
                  <Textarea
                    id="question-${index}"
                    placeholder="e.g., What are the main criticisms of this video?"
                    value={qa.question}
                    onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                    className="mt-1 min-h-[60px]"
                    disabled={areCustomQuestionInputsDisabled}
                  />
                </div>
                <div className="w-24">
                  <Label htmlFor={`wordCount-${index}`}>Word Count</Label>
                  <Input
                    id="wordCount-${index}"
                    type="number"
                    min="50"
                    step="50"
                    value={qa.wordCount}
                    onChange={(e) => handleQuestionChange(index, 'wordCount', e.target.value)}
                    className="mt-1"
                    disabled={areCustomQuestionInputsDisabled}
                  />
                </div>
                {customQuestions.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveQuestion(index)}
                    disabled={areCustomQuestionInputsDisabled}
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
              disabled={areCustomQuestionInputsDisabled}
              className="w-full flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" /> Add Another Question
            </Button>

            <Button type="submit" className="w-full" disabled={analyzeVideoMutation.isPending || isAnalysisLimitReached}>
              {analyzeVideoMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analyze Comments & Get Answers
            </Button>
            {isAnalysisLimitReached && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Daily Limit Reached</AlertTitle>
                <AlertDescription>
                  You have reached your daily limit of {currentLimits.dailyAnalyses} analyses. Please try again tomorrow or <Link to="/upgrade" className="underline">upgrade to a paid tier</Link> for more analyses.
                </AlertDescription>
              </Alert>
            )}
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
            <span className="text-sm text-gray-500">{loadingMessage}</span>
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
            <Button onClick={handleRefreshAnalysis} className="flex items-center gap-2" disabled={analyzeVideoMutation.isPending}>
              {analyzeVideoMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh Analysis
            </Button>
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
                  alt={`Thumbnail for ${analysisResult.videoTitle}`}
                  className="w-full h-auto rounded-md mb-4 aspect-video object-cover"
                />
              )}
              <CardTitle className="text-2xl">{analysisResult.videoTitle}</CardTitle>
              {analysisResult.creatorName && (
                <p className="text-md text-gray-600 dark:text-gray-400 mt-1">By: {analysisResult.creatorName}</p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{analysisResult.videoDescription}</p>
              {analysisResult.lastReanalyzedAt && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Last Full Analysis: {new Date(analysisResult.lastReanalyzedAt).toLocaleDateString()}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Defensive rendering for aiAnalysis */}
              {analysisResult.aiAnalysis && typeof analysisResult.aiAnalysis === 'object' && 'overall_sentiment' in analysisResult.aiAnalysis && typeof analysisResult.aiAnalysis.overall_sentiment === 'string' ? (
                <>
                  {analysisResult.videoTags && analysisResult.videoTags.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Video Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.videoTags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {String(tag)}
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
                          <p>{String(analysisResult.videoSubtitles)}</p>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Overall Sentiment</h3>
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {String(analysisResult.aiAnalysis.overall_sentiment)}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Emotional Tones</h3>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(analysisResult.aiAnalysis.emotional_tones) && analysisResult.aiAnalysis.emotional_tones.map((tone, index) => (
                        <Badge key={index} variant="outline">
                          {String(tone)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Key Themes</h3>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(analysisResult.aiAnalysis.key_themes) && analysisResult.aiAnalysis.key_themes.map((theme, index) => (
                        <Badge key={index} variant="outline">
                          {String(theme)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Summary Insights</h3>
                    <div className="prose dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {String(analysisResult.aiAnalysis.summary_insights)}
                      </ReactMarkdown>
                    </div>
                  </div>
                </>
              ) : (
                <Alert variant="destructive">
                  <AlertTitle>AI Analysis Data Error</AlertTitle>
                  <AlertDescription>
                    The AI analysis data is malformed or missing expected fields. Please try re-analyzing the video.
                    <pre className="whitespace-pre-wrap break-all text-xs mt-2">
                      {JSON.stringify(analysisResult.aiAnalysis, null, 2)}
                    </pre>
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              {analysisResult.customQaResults && analysisResult.customQaResults.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Questions about this video asked by the community</h3>
                  <div className="space-y-4">
                    {analysisResult.customQaResults.map((qa, index) => (
                      <div key={index} className="border p-3 rounded-md bg-gray-50 dark:bg-gray-700">
                        <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Q{index + 1}: {String(qa.question)}</p>
                        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {String(qa.answer || "No answer generated.")}
                          </ReactMarkdown>
                        </div>
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
                      <li key={index}>{String(comment)}</li>
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