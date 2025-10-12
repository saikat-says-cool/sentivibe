import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import LibraryCopilot from '@/components/LibraryCopilot';
import PaginationControls from '@/components/PaginationControls'; // Import PaginationControls

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

const PAGE_SIZE = 9; // Number of items per page

const fetchBlogPosts = async (page: number, pageSize: number, searchTerm: string): Promise<{ data: BlogPost[], totalCount: number }> => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let query = supabase
    .from('blog_posts')
    .select('*', { count: 'exact' });

  if (searchTerm) {
    const lowerCaseSearchTerm = `%${searchTerm.toLowerCase()}%`;
    query = query.or(`title.ilike.${lowerCaseSearchTerm},creator_name.ilike.${lowerCaseSearchTerm},meta_description.ilike.${lowerCaseSearchTerm},keywords.cs.{"${searchTerm}"}`);
  }

  const { data, error, count } = await query
    .order('published_at', { ascending: false })
    .range(start, end);

  if (error) {
    throw new Error(error.message);
  }
  return { data: data || [], totalCount: count || 0 };
};

const VideoAnalysisLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  // filteredPosts is no longer needed as filtering is done server-side
  // const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);

  const { data, isLoading, error } = useQuery<{ data: BlogPost[], totalCount: number }, Error>({
    queryKey: ['blogPosts', currentPage, searchTerm], // Add searchTerm to queryKey
    queryFn: () => fetchBlogPosts(currentPage, PAGE_SIZE, searchTerm), // Pass searchTerm
    refetchOnWindowFocus: false,
  });

  const blogPosts = data?.data || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Removed client-side filtering useEffect as filtering is now server-side
  // useEffect(() => {
  //   if (blogPosts) {
  //     const lowerCaseSearchTerm = searchTerm.toLowerCase();
  //     const results = blogPosts.filter(post =>
  //       post.title.toLowerCase().includes(lowerCaseSearchTerm) ||
  //       (post.creator_name && post.creator_name.toLowerCase().includes(lowerCaseSearchTerm)) ||
  //       (post.meta_description && post.meta_description.toLowerCase().includes(lowerCaseSearchTerm)) ||
  //       (post.keywords && post.keywords.some(keyword => keyword.toLowerCase().includes(lowerCaseSearchTerm)))
  //     );
  //     setFilteredPosts(results);
  //   }
  // }, [searchTerm, blogPosts]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // No need to clear search term here, as it's part of the query key
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Analysis Library</h1>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
          <Skeleton className="flex-1 h-10" />
          <Skeleton className="h-10 w-10 sm:w-auto px-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(PAGE_SIZE)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="w-full h-40 mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-10 w-full mt-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-4xl text-red-500">
        Error loading analysis library: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Analysis Library</h1>
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
        <Input
          type="text"
          placeholder="Search by title, creator, or keywords (across all analyses)..."
          value={searchTerm}
          onChange={handleSearchChange} // Use new handler
          className="flex-1"
        />
        <Button variant="outline" size="icon" className="sm:hidden">
          <Search className="h-4 w-4" />
        </Button>
        {blogPosts && blogPosts.length > 0 && (
          <LibraryCopilot blogPosts={blogPosts} />
        )}
      </div>

      {blogPosts.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400">No analysis found matching your criteria.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
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
                  Published: {new Date(post.published_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default VideoAnalysisLibrary;