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
import PaginationControls from '@/components/PaginationControls';
import { useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TooltipWrapper } from '@/components/ui/tooltip'; // Import TooltipWrapper

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
  custom_qa_results?: CustomQuestion[];
  last_reanalyzed_at?: string;
}

const PAGE_SIZE = 9;

const CATEGORIES = [
  "All",
  "Product Reviews",
  "Gaming",
  "Tutorials",
  "News",
  "Entertainment",
  "Vlogs",
  "Music",
  "Education",
  "Comedy",
  "Science & Tech",
  "Sports",
  "Travel",
  "Food",
  "DIY",
  "Fashion",
  "Beauty",
  "Finance",
  "Health",
  "Documentary",
];

const fetchBlogPosts = async (page: number, pageSize: number, searchTerm: string, category: string): Promise<{ data: BlogPost[], totalCount: number }> => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let query = supabase
    .from('blog_posts')
    .select('*', { count: 'exact' });

  if (searchTerm) {
    const lowerCaseSearchTerm = `%${searchTerm.toLowerCase()}%`;
    query = query.or(`title.ilike.${lowerCaseSearchTerm},creator_name.ilike.${lowerCaseSearchTerm},meta_description.ilike.${lowerCaseSearchTerm},keywords.cs.{"${searchTerm}"}`);
  }

  if (category && category !== "All") {
    query = query.contains('keywords', [category]);
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
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useQuery<{ data: BlogPost[], totalCount: number }, Error>({
    queryKey: ['blogPosts', currentPage, searchTerm, selectedCategory],
    queryFn: () => fetchBlogPosts(currentPage, PAGE_SIZE, searchTerm, selectedCategory),
    refetchOnWindowFocus: false,
  });

  const blogPosts = data?.data || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Set SEO-optimized browser tab title
  useEffect(() => {
    document.title = "Analysis Library - SentiVibe: Insights that Build Your Brand.";
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Analysis Library</h1>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
          <Skeleton className="flex-1 h-10 bg-muted" />
          <Skeleton className="h-10 w-[180px] bg-muted" />
          <Skeleton className="h-10 w-10 sm:w-auto px-4 bg-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(PAGE_SIZE)].map((_, i) => (
            <Card key={i} className="bg-card">
              <CardContent className="p-4">
                <Skeleton className="w-full h-40 mb-4 bg-muted" />
                <Skeleton className="h-6 w-3/4 mb-2 bg-muted" />
                <Skeleton className="h-4 w-1/2 bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-10 w-full mt-6 bg-muted" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-4xl text-destructive">
        Error loading analysis library: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Analysis Library</h1>
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
        <TooltipWrapper content="Search video analyses by title, creator, or keywords.">
          <Input
            type="text"
            placeholder="Search by title, creator, or keywords (across all analyses)..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="flex-1 bg-input text-foreground border-border"
          />
        </TooltipWrapper>
        <div className="flex items-center space-x-2">
          <Label htmlFor="category-select" className="sr-only">Category</Label>
          <TooltipWrapper content="Filter analyses by category.">
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger id="category-select" className="w-[180px] bg-input text-foreground border-border">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-card text-foreground border-border">
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TooltipWrapper>
        </div>
        <TooltipWrapper content="Search analyses.">
          <Button variant="outline" size="icon" className="sm:hidden">
            <Search className="h-4 w-4" />
          </Button>
        </TooltipWrapper>
        {blogPosts && blogPosts.length > 0 && (
          <LibraryCopilot blogPosts={blogPosts} />
        )}
      </div>

      {blogPosts.length === 0 && (
        <p className="text-center text-muted-foreground">No analysis found matching your criteria.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <Link to={`/blog/${post.slug}`} key={post.id}>
            <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200 bg-card text-foreground border-border">
              <CardHeader className="p-0">
                {post.thumbnail_url ? (
                  <img
                    src={post.thumbnail_url}
                    alt={`Thumbnail for ${post.title}`}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-40 bg-muted flex items-center justify-center rounded-t-lg">
                    <Youtube className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">{post.title}</CardTitle>
                {post.creator_name && (
                  <p className="text-sm text-muted-foreground line-clamp-1">By: {post.creator_name}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
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