import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Youtube } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  original_video_link: string;
  created_at: string;
  updated_at: string;
}

const fetchBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  console.log("Fetching blog post for slug:", slug);
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error("Supabase fetch error:", error);
    throw new Error(error.message);
  }
  console.log("Supabase fetch result:", data);
  return data;
};

const BlogPostDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  console.log("Current URL slug from useParams:", slug);

  const { data: blogPost, isLoading, error } = useQuery<BlogPost | null, Error>({
    queryKey: ['blogPost', slug],
    queryFn: () => fetchBlogPostBySlug(slug!),
    enabled: !!slug, // Only run query if slug is available
  });

  console.log("useQuery state - isLoading:", isLoading, "error:", error, "blogPost:", blogPost);

  useEffect(() => {
    if (blogPost) {
      // Update document title
      document.title = blogPost.title;

      // Update meta description
      let metaDescriptionTag = document.querySelector('meta[name="description"]');
      if (!metaDescriptionTag) {
        metaDescriptionTag = document.createElement('meta');
        metaDescriptionTag.setAttribute('name', 'description');
        document.head.appendChild(metaDescriptionTag);
      }
      metaDescriptionTag.setAttribute('content', blogPost.meta_description);

      // Add JSON-LD Structured Data for BlogPosting
      const schemaData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": blogPost.title,
        "description": blogPost.meta_description,
        "image": blogPost.thumbnail_url,
        "datePublished": blogPost.published_at,
        "dateModified": blogPost.updated_at,
        "author": {
          "@type": "Person",
          "name": blogPost.creator_name || "SentiVibe AI"
        },
        "publisher": {
          "@type": "Organization",
          "name": "SentiVibe",
          "logo": {
            "@type": "ImageObject",
            "url": `${window.location.origin}/logo.png` // Assuming a logo.png in public folder
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `${window.location.origin}/blog/${blogPost.slug}`
        }
      };

      let scriptTag = document.querySelector('script[type="application/ld+json"]');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schemaData);

    } else {
      // Reset to default if no blog post is loaded
      document.title = "SentiVibe - Video Analysis Library";
      const metaDescriptionTag = document.querySelector('meta[name="description"]');
      if (metaDescriptionTag) {
        metaDescriptionTag.setAttribute('content', 'Unlock the true sentiment behind YouTube comments. Analyze, understand, and gain insights into audience reactions with AI-powered sentiment analysis.');
      }
      const scriptTag = document.querySelector('script[type="application/ld+json"]');
      if (scriptTag) {
        scriptTag.remove();
      }
    }
  }, [blogPost]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <Skeleton className="h-8 w-1/4 mb-6" />
        <Skeleton className="h-64 w-full mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-6 w-1/2 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-3xl text-red-500">
        Error loading blog post: {error.message}
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div className="container mx-auto p-4 max-w-3xl text-center text-gray-500 dark:text-gray-400">
        <h2 className="text-2xl font-bold mb-4">Blog Post Not Found</h2>
        <p>The analysis you are looking for does not exist or has been removed.</p>
        <Link to="/library" className="text-blue-500 hover:underline mt-4 flex items-center justify-center">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Analysis Library
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Link to="/library" className="text-blue-500 hover:underline mb-4 flex items-center w-fit">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Analysis Library
      </Link>
      <Card className="mb-6">
        <CardHeader>
          {blogPost.thumbnail_url && (
            <img
              src={blogPost.thumbnail_url}
              alt={`Thumbnail for ${blogPost.title}`}
              className="w-full h-auto rounded-md mb-4"
            />
          )}
          <CardTitle className="text-3xl font-bold mb-2">{blogPost.title}</CardTitle>
          {blogPost.creator_name && (
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">By: {blogPost.creator_name}</p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Published on: {new Date(blogPost.published_at).toLocaleDateString()}
          </p>
          {blogPost.original_video_link && (
            <a 
              href={blogPost.original_video_link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-500 hover:underline flex items-center mt-2 w-fit"
            >
              <Youtube className="h-4 w-4 mr-2" /> View Original Video
            </a>
          )}
          {blogPost.meta_description && (
            <p className="text-md text-gray-700 dark:text-gray-300 mt-4 italic">
              {blogPost.meta_description}
            </p>
          )}
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {blogPost.content}
          </ReactMarkdown>
        </CardContent>
        {blogPost.keywords && blogPost.keywords.length > 0 && (
          <CardContent className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {blogPost.keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default BlogPostDetail;