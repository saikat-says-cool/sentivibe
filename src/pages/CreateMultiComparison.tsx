import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, GitCompare, PlusCircle, XCircle, MessageSquare, RefreshCw, Youtube } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link, useLocation } from 'react-router-dom';
import MultiComparisonDataDisplay from '@/components/MultiComparisonDataDisplay';
import MultiComparisonChatDialog from '@/components/MultiComparisonChatDialog';
import { useAuth } from '@/integrations/supabase/auth';
import { Skeleton } from '@/components/ui/skeleton';

// New interfaces for multi-comparison
interface MultiComparisonVideo {
  blog_post_id: string;
  video_order: number;
  title: string;
  thumbnail_url: string;
  original_video_link: string;
  raw_comments_for_chat: string[];
  slug: string;
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
  comparison_data_json: any;
  custom_comparative_qa_results: CustomComparativeQuestion[];
  overall_thumbnail_url?: string;
  videos: MultiComparisonVideo[];
}

// Define simplified tier limits (only daily comparisons remain)
const MULTICOMP_UNAUTHENTICATED_LIMITS = {
  dailyComparisons: 1, // 1 comparison per day for unauthenticated users
};

const MULTICOMP_AUTHENTICATED_FREE_TIER_LIMITS = {
  dailyComparisons: 1, // 1 comparison per day for authenticated free users
};

const MULTICOMP_PAID_TIER_LIMITS = {
  dailyComparisons: 20, // 20 comparisons per day for paid users (effectively unlimited)
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

const CreateMultiComparison = () => {
  const location = useLocation();
  const initialMultiComparison = location.state?.multiComparison as MultiComparisonResult | undefined;
  const forceRecompareFromNav = location.state?.forceRecompare as boolean | undefined;

  const { user, subscriptionStatus, subscriptionPlanId } = useAuth();

  const [videoLinks, setVideoLinks] = useState<string[]>(['', '']);
  const [customComparativeQuestions, setCustomComparativeQuestions] = useState<CustomComparativeQuestion[]>([{ question: "", wordCount: 200 }]);
  const [multiComparisonResult, setMultiComparisonResult] = useState<MultiComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const [comparisonsToday, setComparisonsToday] = useState<number>(0);
  const queryClient = useQueryClient();

  const isPaidTier = subscriptionStatus === 'active' && subscriptionPlanId !== 'free';
  const isAuthenticatedFreeTier = user && !isPaidTier;
  const isUnauthenticated = !user;

  let currentLimits;
  if (isPaidTier) {
    currentLimits = MULTICOMP_PAID_TIER_LIMITS;
  } else if (isAuthenticatedFreeTier) {
    currentLimits = MULTICOMP_AUTHENTICATED_FREE_TIER_LIMITS;
  } else {
    currentLimits = MULTICOMP_UNAUTHENTICATED_LIMITS;
  }

  // Fetch anonymous usage if not authenticated
  const { data: anonUsage, refetch: refetchAnonUsage } = useQuery({
    queryKey: ['anonUsageMultiComp'],
    queryFn: fetchAnonUsage,
    enabled: isUnauthenticated,
    refetchOnWindowFocus: false,
  });

  const createMultiComparisonMutation = useMutation({
    mutationFn: async (payload: { videoLinks: string[]; customComparativeQuestions: CustomComparativeQuestion[]; forceRecompare?: boolean }) => {
      setError(null);
      setIsChatDialogOpen(false);

      const { data, error: invokeError } = await supabase.functions.invoke('multi-video-comparator', {
        body: payload,
      });

      if (invokeError) {
        console.error("Supabase Function Invoke Error (multi-video-comparator):", invokeError);
        if (invokeError.name === 'FunctionsHttpError' && invokeError.context?.status === 403) {
          try {
            const errorBody = await invokeError.context.json();
            throw new Error(errorBody.error || "Daily limit exceeded. Please upgrade.");
          } catch (jsonError) {
            console.error("Failed to parse 403 error response:", jsonError);
            throw new Error(invokeError.message || "Daily limit exceeded. Please upgrade.");
          }
        }
        throw new Error(invokeError.message || "Failed to invoke multi-video comparison function.");
      }
      return data;
    },
    onSuccess: (data) => {
      setMultiComparisonResult(data);
      queryClient.invalidateQueries({ queryKey: ['multiComparisons'] });
      if (data.slug) {
        queryClient.invalidateQueries({ queryKey: ['multiComparison', data.slug] });
      }
      if (isUnauthenticated) {
        refetchAnonUsage();
      } else {
        queryClient.invalidateQueries({ queryKey: ['dailyComparisonsCount', user?.id] });
      }
    },
    onError: (err: Error) => {
      setError(err.message);
      setMultiComparisonResult(null);
    },
  });

  // Fetch daily comparison count for authenticated users
  const { data: authenticatedComparisonsCount } = useQuery<number, Error>({
    queryKey: ['dailyComparisonsCount', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count, error } = await supabase
        .from('multi_comparisons')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', twentyFourHoursAgo)
        .eq('author_id', user.id);

      if (error) {
        console.error("Error fetching daily comparison count for authenticated user:", error);
        return 0;
      }
      return count || 0;
    },
    enabled: !!user && !isUnauthenticated,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isUnauthenticated) {
      setComparisonsToday(anonUsage?.comparisons_count || 0);
    } else if (user) {
      setComparisonsToday(authenticatedComparisonsCount || 0);
    }
  }, [isUnauthenticated, user, anonUsage, authenticatedComparisonsCount]);

  useEffect(() => {
    if (initialMultiComparison) {
      setMultiComparisonResult(initialMultiComparison);
      setVideoLinks(initialMultiComparison.videos.map(video => video.original_video_link));
      const initialLoadedQuestions = initialMultiComparison.custom_comparative_qa_results.length > 0 
        ? initialMultiComparison.custom_comparative_qa_results.map(qa => ({
            question: qa.question,
            wordCount: qa.wordCount
          }))
        : [{ question: "", wordCount: 200 }];
      setCustomComparativeQuestions(initialLoadedQuestions);
      
      if (forceRecompareFromNav) {
        const validVideoLinks = initialMultiComparison.videos.map(video => video.original_video_link);
        const validQuestions = initialMultiComparison.custom_comparative_qa_results.filter(q => q.question.trim() !== "");
        createMultiComparisonMutation.mutate({ videoLinks: validVideoLinks, customComparativeQuestions: validQuestions, forceRecompare: true });
      }
    } else {
      setCustomComparativeQuestions([{ question: "", wordCount: 200 }]);
    }
  }, [initialMultiComparison, forceRecompareFromNav, createMultiComparisonMutation]);

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
      (newQuestions[index] as CustomComparativeQuestion).wordCount = Number(value);
    } else {
      (newQuestions[index] as CustomComparativeQuestion).question = value as string;
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
    createMultiComparisonMutation.mutate({ videoLinks: validVideoLinks, customComparativeQuestions: validQuestions, forceRecompare: false });
  };

  const handleRefreshComparison = () => {
    if (multiComparisonResult?.videos) {
      const validVideoLinks = multiComparisonResult.videos.map(video => video.original_video_link);
      const validQuestions = multiComparisonResult.custom_comparative_qa_results.filter(q => q.question.trim() !== "");
      createMultiComparisonMutation.mutate({ videoLinks: validVideoLinks, customComparativeQuestions: validQuestions, forceRecompare: true });
    }
  };

  const isComparisonLimitReached = comparisonsToday >= currentLimits.dailyComparisons;

  // Determine if custom question inputs should be disabled
  // Custom questions are now unlimited, so only disable if comparison is pending
  const areCustomQuestionInputsDisabled = createMultiComparisonMutation.isPending;

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
                    disabled={createMultiComparisonMutation.isPending || isComparisonLimitReached}
                  />
                </div>
                {videoLinks.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveVideoLink(index)}
                    disabled={createMultiComparisonMutation.isPending || isComparisonLimitReached}
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
              disabled={createMultiComparisonMutation.isPending || isComparisonLimitReached}
              className="w-full flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" /> Add Another Video
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              <span className="font-semibold text-red-500">Important:</span> Each video must have at least 50 comments for a proper sentiment analysis. Analysis may take up to 30 seconds per video.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Comparisons today: {comparisonsToday}/{currentLimits.dailyComparisons}
              {!isPaidTier && (
                  <span className="ml-2 text-blue-500">
                    <Link to="/upgrade" className="underline">Upgrade to a paid tier</Link> for more comparisons.
                  </span>
              )}
            </p>

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
                    disabled={areCustomQuestionInputsDisabled}
                  />
                </div>
                <div className="w-24">
                  <Label htmlFor={`comp-wordCount-${index}`}>Word Count</Label>
                  <Input
                    id={`comp-wordCount-${index}`}
                    type="number"
                    min="50"
                    step="50"
                    value={qa.wordCount}
                    onChange={(e) => handleQuestionChange(index, 'wordCount', e.target.value)}
                    className="mt-1"
                    disabled={areCustomQuestionInputsDisabled}
                  />
                </div>
                {customComparativeQuestions.length > 0 && (
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
              <PlusCircle className="h-4 w-4" /> Add Another Comparative Question
            </Button>

            <Button type="submit" className="w-full" disabled={createMultiComparisonMutation.isPending || isComparisonLimitReached}>
              {createMultiComparisonMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Multi-Video Comparison
            </Button>
            {isComparisonLimitReached && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Daily Limit Reached</AlertTitle>
                <AlertDescription>
                  You have reached your daily limit of {currentLimits.dailyComparisons} comparisons. Please try again tomorrow or <Link to="/upgrade" className="underline">upgrade to a paid tier</Link> for more comparisons.
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>

      {createMultiComparisonMutation.isPending && (
        <Card className="p-6 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
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
            <Button onClick={handleRefreshComparison} className="flex items-center gap-2" disabled={createMultiComparisonMutation.isPending}>
              {createMultiComparisonMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh Comparison
            </Button>
            <Button onClick={() => setIsChatDialogOpen(true)} className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Chat with AI
            </Button>
            <Button asChild>
              <Link to={`/multi-comparison/${multiComparisonResult.slug}`}>View Full Multi-Comparison Blog Post</Link>
            </Button>
          </div>
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-wrap justify-center items-center gap-4 mb-2">
                {multiComparisonResult.videos.map((video, index) => (
                  <div key={index} className="flex flex-col items-center text-center w-32">
                    <Link to={`/blog/${video.slug}`} className="block hover:opacity-80 transition-opacity">
                      <img
                        src={video.thumbnail_url}
                        alt={`Thumbnail for ${video.title}`}
                        className="w-full h-20 object-cover rounded-md shadow-md aspect-video"
                      />
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{video.title}</p>
                    </Link>
                  </div>
                ))}
              </div>
              <p className="text-xs text-center text-muted-foreground mb-4">
                Click on any video thumbnail above to view its individual analysis.
              </p>
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
                {multiComparisonResult.comparison_data_json && (
                  <MultiComparisonDataDisplay data={multiComparisonResult.comparison_data_json} />
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

              {/* New section for individual video comments in the analysis report */}
              {multiComparisonResult.videos && multiComparisonResult.videos.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-semibold mb-4">Top Comments for Each Video</h3>
                  <div className="space-y-6">
                    {multiComparisonResult.videos.map((video, videoIndex) => (
                      <div key={videoIndex} className="border p-4 rounded-md bg-gray-50 dark:bg-gray-700">
                        <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                          <Youtube className="h-5 w-5 text-red-500" /> {video.title}
                        </h4>
                        {video.raw_comments_for_chat && video.raw_comments_for_chat.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            {video.raw_comments_for_chat.slice(0, 10).map((comment, commentIndex) => (
                              <li key={commentIndex}>{String(comment)}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400 text-sm">No top comments available for this video.</p>
                        )}
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