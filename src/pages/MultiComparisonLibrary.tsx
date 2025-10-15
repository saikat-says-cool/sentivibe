import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, GitCompare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import ComparisonLibraryCopilot from '@/components/ComparisonLibraryCopilot';
import { Badge } from '@/components/ui/badge';
import PaginationControls from '@/components/PaginationControls';
import { TooltipWrapper } from '@/components/ui/tooltip'; // Import TooltipWrapper

interface MultiComparisonVideoSummary {
  title: string;
  thumbnail_url: string;
  original_video_link: string;
}

interface CustomComparativeQuestion {
  question: string;
  wordCount: number;
  answer?: string;
}

interface MultiComparison {
  id: string;
  title: string;
  slug: string;
  meta_description: string;
  keywords: string[];
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  last_compared_at: string;
  comparison_data_json: any;
  custom_comparative_qa_results: CustomComparativeQuestion[];
  overall_thumbnail_url?: string;
  videos: MultiComparisonVideoSummary[];
  videoATitle?: string;
  videoBTitle?: string;
}

const PAGE_SIZE = 9;

const fetchMultiComparisons = async (page: number, pageSize: number, searchTerm: string): Promise<{ data: MultiComparison[], totalCount: number }> => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let query = supabase
    .from('multi_comparisons')
    .select(`
      *,
      multi_comparison_videos (
        video_order,
        blog_posts (title, thumbnail_url, original_video_link)
      )
    `, { count: 'exact' });

  if (searchTerm) {
    const lowerCaseSearchTerm = `%${searchTerm.toLowerCase()}%`;
    query = query.or(`title.ilike.${lowerCaseSearchTerm},meta_description.ilike.${lowerCaseSearchTerm},keywords.cs.{"${searchTerm}"}`);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) {
    throw new Error(error.message);
  }

  const formattedData = (data || []).map(mc => {
    const videos = mc.multi_comparison_videos
      .sort((a: any, b: any) => a.video_order - b.video_order)
      .map((mcv: any) => ({
        title: mcv.blog_posts.title,
        thumbnail_url: mcv.blog_posts.thumbnail_url,
        original_video_link: mcv.blog_posts.original_video_link,
      }));

    return {
      ...mc,
      videos,
      videoATitle: videos[0]?.title,
      videoBTitle: videos[1]?.title,
    };
  });

  return { data: formattedData, totalCount: count || 0 };
};

const MultiComparisonLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useQuery<{ data: MultiComparison[], totalCount: number }, Error>({
    queryKey: ['multiComparisons', currentPage, searchTerm],
    queryFn: () => fetchMultiComparisons(currentPage, PAGE_SIZE, searchTerm),
    refetchOnWindowFocus: false,
  });

  const multiComparisons = data?.data || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Set SEO-optimized browser tab title
  useEffect(() => {
    document.title = "Comparison Library - SentiVibe: See the Full Picture.";
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Comparison Library</h1>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
          <Skeleton className="flex-1 h-10 bg-muted" />
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
        Error loading comparison library: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Comparison Library</h1>
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
        <TooltipWrapper content="Search multi-video comparisons by title, video titles, or keywords.">
          <Input
            type="text"
            placeholder="Search comparisons by title, video titles, or keywords (across all comparisons)..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="flex-1 bg-input text-foreground border-border"
          />
        </TooltipWrapper>
        <TooltipWrapper content="Search comparisons.">
          <Button variant="outline" size="icon" className="sm:hidden">
            <Search className="h-4 w-4" />
          </Button>
        </TooltipWrapper>
        {multiComparisons && multiComparisons.length > 0 && (
          <ComparisonLibraryCopilot comparisons={multiComparisons} />
        )}
      </div>

      {multiComparisons.length === 0 && (
        <p className="text-center text-muted-foreground">No comparisons found matching your criteria.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {multiComparisons.map((comp) => (
          <Link to={`/multi-comparison/${comp.slug}`} key={comp.id}>
            <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200 bg-card text-foreground border-border">
              <CardHeader className="p-0 relative">
                {comp.overall_thumbnail_url ? (
                  <img
                    src={comp.overall_thumbnail_url}
                    alt={`Thumbnail for ${comp.title}`}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-40 bg-muted flex items-center justify-center rounded-t-lg relative">
                    {comp.videos.length > 0 ? (
                      <>
                        <img
                          src={comp.videos[0].thumbnail_url}
                          alt={`Thumbnail for ${comp.videos[0].title}`}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                        {comp.videos.length > 1 && (
                          <Badge className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                            +{comp.videos.length - 1} more
                          </Badge>
                        )}
                      </>
                    ) : (
                      <GitCompare className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">{comp.title}</CardTitle>
                <p className="text-xs text-muted-foreground mt-2">
                  Compared: {new Date(comp.created_at).toLocaleDateString()}
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

export default MultiComparisonLibrary;