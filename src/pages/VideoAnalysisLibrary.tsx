import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

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
}

const fetchBlogPosts = async (): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

const VideoAnalysisLibrary = () => {
  const { data: blogPosts, isLoading, error } = useQuery<BlogPost[], Error>({
    queryKey: ['blogPosts'],
    queryFn: fetchBlogPosts,
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Analysis Library</h1>
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
        Error loading analysis library: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Analysis Library</h1>
      <div className="flex items-center space-x-2 mb-6">
        <Input
          type="text"
          placeholder="Search by title, creator, or keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {filteredPosts.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400">No analysis found matching your criteria.</p>
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
                  Published: {new Date(post.published_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default VideoAnalysisLibrary;