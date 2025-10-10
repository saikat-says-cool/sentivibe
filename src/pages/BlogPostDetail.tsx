import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Youtube, MessageSquare } from 'lucide-react'; // Added MessageSquare
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface AiAnalysisResult {
  overall_sentiment: string;
  emotional_tones: string[];
  key_themes: string[];
  summary_insights: string;
}

interface StoredAiAnalysisContent extends AiAnalysisResult {
  raw_comments_for_chat?: string[]; // Added for chat context
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
  ai_analysis_json: StoredAiAnalysisContent | null; // Updated to new interface
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
  const navigate = useNavigate(); // Initialize useNavigate
  console.log("Current URL slug from useParams:", slug);

  const { data: blogPost, isLoading, error } = useQuery<BlogPost | null, Error>({
    queryKey: ['blogPost', slug],
    queryFn: () => fetchBlogPostBySlug(slug!),
    enabled: !!slug, // Only run query if slug is available
  });

  console.log("useQuery state - isLoading:", isLoading, "error:", error, "blogPost:", blogPost);

  useEffect(() => {
    const head = document.head;

    // Function to create or update a meta tag
    const updateMetaTag = (name: string, content: string, property?: string) => {
      let tag = document.querySelector(`meta[${property ? `property="${property}"` : `name="${name}"`}]`);
      if (!tag) {
        tag = document.createElement('meta');
        if (property) tag.setAttribute('property', property);
        else tag.setAttribute('name', name);
        head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // Function to remove a meta tag
    const removeMetaTag = (name: string, property?: string) => {
      const tag = document.querySelector(`meta[${property ? `property="${property}"` : `name="${name}"`}]`);
      if (tag) tag.remove();
    };

    if (blogPost) {
      // Update document title
      document.title = blogPost.title;

      // Update meta description
      updateMetaTag('description', blogPost.meta_description);

      // Add Open Graph (OG) tags for social media
      updateMetaTag('og:title', blogPost.title, 'og:title');
      updateMetaTag('og:description', blogPost.meta_description, 'og:description');
      updateMetaTag('og:image', blogPost.thumbnail_url, 'og:image');
      updateMetaTag('og:url', `${window.location.origin}/blog/${blogPost.slug}`, 'og:url');
      updateMetaTag('og:type', 'article', 'og:type');
      updateMetaTag('og:site_name', 'SentiVibe', 'og:site_name');

      // Add JSON-LD Structured Data for BlogPosting
      const schemaData = {
        "@context": "https://schema.org",
        "@graph": [
          {
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
                "url": `${window.location.origin}/logo.png`
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `${window.location.origin}/blog/${blogPost.slug}`
            }
          },
          {
            "@type": "SoftwareApplication",
            "name": "SentiVibe - YouTube Comment Sentiment Analyzer",
            "applicationCategory": "AI Tool",
            "operatingSystem": "Web",
            "url": `${window.location.origin}`, // Link to the main application
            "description": "AI tool to analyze YouTube comments for sentiment and insights.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          }
        ]
      };

      let scriptTag = document.querySelector('script[type="application/ld+json"]');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.setAttribute('type', 'application/ld+json');
        head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schemaData);

    } else {
      // Reset to default if no blog post is loaded
      document.title = "SentiVibe - Video Analysis Library";
      updateMetaTag('description', 'Unlock the true sentiment behind YouTube comments. Analyze, understand, and gain insights into audience reactions with AI-powered sentiment analysis.');

      // Remove OG tags
      removeMetaTag('og:title', 'og:title');
      removeMetaTag('og:description', 'og:description');
      removeMetaTag('og:image', 'og:image');
      removeMetaTag('og:url', 'og:url');
      removeMetaTag('og:type', 'og:type');
      removeMetaTag('og:site_name', 'og:site_name');

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
      <div className="flex justify-between items-center mb-4">
        <Link to="/library" className="text-blue-500 hover:underline flex items-center w-fit">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Analysis Library
        </Link>
        <div className="flex space-x-2"> {/* Group buttons */}
          <Button asChild>
            <Link to="/analyze-video">Analyze a New Video</Link>
          </Button>
          <Button 
            onClick={() => navigate('/analyze-video', { state: { blogPost: blogPost } })} 
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" /> Chat with AI
          </Button>
        </div>
      </div>
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
            {blogPost.updated_at && blogPost.updated_at !== blogPost.published_at && (
              <span> (Last updated: {new Date(blogPost.updated_at).toLocaleDateString()})</span>
            )}
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