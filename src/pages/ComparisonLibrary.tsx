import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, GitCompare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface CustomComparativeQuestion {
  question: string;
  wordCount: number;
  answer?: string;
}

interface Comparison {
  id: string;
  video_a_blog_post_id: string;
  video_b_blog_post_id: string;
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
  video_a_thumbnail_url?: string; // New field
  video_b_thumbnail_url?: string; // New field
}

const fetchComparisons = async (): Promise<Comparison[]> => {
  const { data, error } = await supabase
    .from('comparisons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

const ComparisonLibrary = () => {
  const { data: comparisons, isLoading, error } = useQuery<Comparison[], Error>({
    queryKey: ['comparisons'],
    queryFn: fetchComparisons,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredComparisons, setFilteredComparisons] = useState<Comparison[]>([]);

  useEffect(() => {
    if (comparisons) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const results = comparisons.filter(comp =>
        comp.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        (comp.meta_description && comp.meta_description.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (comp.keywords && comp.keywords.some(keyword => keyword.toLowerCase().includes(lowerCaseSearchTerm)))
      );
      setFilteredComparisons(results);
    }
  }, [searchTerm, comparisons]);

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
          placeholder="Search comparisons by title or keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button variant="outline" size="icon" className="sm:hidden">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {filteredComparisons.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400">No comparisons found matching your criteria.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComparisons.map((comp) => (
          <Link to={`/comparison/${comp.slug}`} key={comp.id}>
            <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="p-0">
                {comp.video_a_thumbnail_url && comp.video_b_thumbnail_url ? (
                  <div className="flex w-full h-40 rounded-t-lg overflow-hidden">
                    <img
                      src={comp.video_a_thumbnail_url}
                      alt={`Thumbnail for Video A in ${comp.title}`}
                      className="w-1/2 h-full object-cover"
                    />
                    <img
                      src={comp.video_b_thumbnail_url}
                      alt={`Thumbnail for Video B in ${comp.title}`}
                      className="w-1/2 h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-t-lg">
                    <GitCompare className="h-12 w-12 text-gray-400 dark:text-gray-500" />
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

export default ComparisonLibrary;