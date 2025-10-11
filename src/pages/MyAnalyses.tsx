import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/integrations/supabase/auth';
import LibraryCopilot from '@/components/LibraryCopilot';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Import Alert components

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
  created_at: string;
  updated_at: string;
  original_video_link: string;
  ai_analysis_json: StoredAiAnalysisContent | null;
  custom_qa_results?: CustomQuestion[]; // New field
  last_reanalyzed_at?: string; // New field
}

const fetchMyBlogPosts = async (userId: string): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('author_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

const MyAnalyses = () => {
  const { user, isLoading: isAuthLoading, subscriptionStatus, subscriptionPlanId } = useAuth();
  const userId = user?.id;

  const isPaidTier = subscriptionStatus === 'active' && subscriptionPlanId !== 'free';

  const { data: blogPosts, isLoading, error } = useQuery<BlogPost[], Error>({
    queryKey: ['myBlogPosts', userId],
    queryFn: () => fetchMyBlogPosts(userId!),
    enabled: !!userId && !isAuthLoading && isPaidTier, // Only fetch if user is logged in AND is on a paid tier
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    if (blogPosts) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const results = blogPosts.filter(post =>
        post.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        (post.creator_name && post.creator_name.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (post.meta_description && post.meta_description.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (post.keywords && post.keywords.some(keyword => keyword.toLowerCase().includes(lowerCaseSearchTerm)))
      );
      setFilteredPosts(results);
    }
  }, [searchTerm, blogPosts]);

  if (isAuthLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">Loading user session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4 max-w-4xl text-center text-gray-500 dark:text-gray-400">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p>Please log in to view your analysis history.</p>
        <Button asChild className="mt-4">
          <Link to="/login">Go to Login</Link>
        </Button>
      </div>
    );
  }

  if (!isPaidTier) {
    return (
      <div className="container mx-auto p-4 max-w-4xl text-center">
        <Alert variant="default" className="max-w-md mx-auto">
          <AlertTitle className="text-xl font-bold">Upgrade to Access "My Analyses"</AlertTitle>
          <AlertDescription className="mt-2">
            Your personal analysis history is a premium feature. Upgrade to a paid tier to save and view all your past video analyses and comparisons.
          </AlertDescription>
          <Button asChild className="mt-4">
            <Link to="/upgrade">Upgrade Now</Link>
          </Button>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">My Analysis History</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="w-full h-40 mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-4xl text-red-500">
        Error loading your analysis history: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">My Analysis History</h1>
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
        <Input
          type="text"
          placeholder="Search your analyses by title, creator, or keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button variant="outline" size="icon" className="sm:hidden">
          <Search className="h-4 w-4" />
        </Button>
        {blogPosts && blogPosts.length > 0 && (
          <LibraryCopilot blogPosts={blogPosts} />
        )}
      </div>

      {filteredPosts.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400">You haven't performed any analyses yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <Link to={`/blog/${post.slug}`} key={post.id}>
            <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="p-0">
                {post.thumbnail_url ? (
                  <img
                    src={post.thumbnail_url}
                    alt={`Thumbnail for ${post.title}`}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-t-lg">
                    <Youtube className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">{post.title}</CardTitle>
                {post.creator_name && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">By: {post.creator_name}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Created: {new Date(post.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MyAnalyses;