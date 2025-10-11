// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, GitCompare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import ComparisonLibraryCopilot from '@/components/ComparisonLibraryCopilot'; // Import the copilot
import { Badge } from '@/components/ui/badge'; // Import Badge component

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
  videos: MultiComparisonVideoSummary[]; // Flattened video data for display
}

const fetchMultiComparisons = async (): Promise<MultiComparison[]> => {
  const { data, error } = await supabase
    .from('multi_comparisons')
    .select(`
      *,
      multi_comparison_videos (
        video_order,
        blog_posts (title, thumbnail_url, original_video_link)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mc => {
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
      // These are for the copilot to have context, even if not directly displayed
      videoATitle: videos[0]?.title,
      videoBTitle: videos[1]?.title,
    };
  }) || [];
};

const MultiComparisonLibrary = () => {
  const { data: multiComparisons, isLoading, error } = useQuery<MultiComparison[], Error>({
    queryKey: ['multiComparisons'],
    queryFn: fetchMultiComparisons,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredComparisons, setFilteredComparisons] = useState<MultiComparison[]>([]);

  useEffect(() => {
    if (multiComparisons) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const results = multiComparisons.filter(comp =>
        comp.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        (comp.meta_description && comp.meta_description.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (comp.keywords && comp.keywords.some(keyword => keyword.toLowerCase().includes(lowerCaseSearchTerm))) ||
        (comp.videos && comp.videos.some(video => video.title.toLowerCase().includes(lowerCaseSearchTerm)))
      );
      setFilteredComparisons(results);
    }
  }, [searchTerm, multiComparisons]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Comparison Library</h1>
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
        Error loading comparison library: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Comparison Library</h1>
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
        <Input
          type="text"
          placeholder="Search comparisons by title, video titles, or keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button variant="outline" size="icon" className="sm:hidden">
          <Search className="h-4 w-4" />
        </Button>
        {multiComparisons && multiComparisons.length > 0 && (
          <ComparisonLibraryCopilot comparisons={multiComparisons} />
        )}
      </div>

      {filteredComparisons.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400">No comparisons found matching your criteria.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComparisons.map((comp) => (
          <Link to={`/multi-comparison/${comp.slug}`} key={comp.id}>
            <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="p-0 relative"> {/* Added relative for absolute positioning of badge */}
                {comp.overall_thumbnail_url ? (
                  <img
                    src={comp.overall_thumbnail_url}
                    alt={`Thumbnail for ${comp.title}`}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-t-lg relative">
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
                      <GitCompare className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">{comp.title}</CardTitle>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Compared: {new Date(comp.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MultiComparisonLibrary;