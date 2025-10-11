import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, GitCompare, Youtube, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import MultiComparisonDataDisplay from '@/components/MultiComparisonDataDisplay';
import MultiComparisonChatDialog from '@/components/MultiComparisonChatDialog';

interface MultiComparisonVideo {
  blog_post_id: string;
  video_order: number;
  title: string;
  thumbnail_url: string;
  original_video_link: string;
  raw_comments_for_chat: string[];
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
  multi_comparison_videos: MultiComparisonVideo[]; // Joined data from junction table
  videos: MultiComparisonVideo[]; // Added this property to resolve the TypeScript error
}

const fetchMultiComparisonBySlug = async (slug: string): Promise<MultiComparison | null> => {
  const { data, error } = await supabase
    .from('multi_comparisons')
    .select(`
      *,
      multi_comparison_videos (
        video_order,
        blog_post_id,
        blog_posts (title, thumbnail_url, original_video_link, ai_analysis_json)
      )
    `)
    .eq('slug', slug)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Supabase fetch error:", error);
    throw new Error(error.message);
  }

  if (data) {
    // Flatten the nested blog_posts data and add raw_comments_for_chat
    const videos = data.multi_comparison_videos
      .sort((a: any, b: any) => a.video_order - b.video_order)
      .map((mcv: any) => ({
        blog_post_id: mcv.blog_post_id,
        video_order: mcv.video_order,
        title: mcv.blog_posts.title,
        thumbnail_url: mcv.blog_posts.thumbnail_url,
        original_video_link: mcv.blog_posts.original_video_link,
        raw_comments_for_chat: mcv.blog_posts.ai_analysis_json?.raw_comments_for_chat || [],
      }));
    return { ...data, videos };
  }
  return null;
};

const MultiComparisonDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);

  const { data: multiComparison, isLoading, error } = useQuery<MultiComparison | null, Error>({
    queryKey: ['multiComparison', slug],
    queryFn: () => fetchMultiComparisonBySlug(slug!),
    enabled: !!slug,
  });

  useEffect(() => {
    const head = document.head;

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

    const removeMetaTag = (name: string, property?: string) => {
      const tag = document.querySelector(`meta[${property ? `property="${property}"` : `name="${name}"`}]`);
      if (tag) tag.remove();
    };

    if (multiComparison) {
      document.title = multiComparison.title;
      updateMetaTag('description', multiComparison.meta_description);
      updateMetaTag('og:title', multiComparison.title, 'og:title');
      updateMetaTag('og:description', multiComparison.meta_description, 'og:description');
      updateMetaTag('og:image', multiComparison.overall_thumbnail_url || '', 'og:image');
      updateMetaTag('og:url', `${window.location.origin}/multi-comparison/${multiComparison.slug}`, 'og:url');
      updateMetaTag('og:type', 'article', 'og:type');
      updateMetaTag('og:site_name', 'SentiVibe', 'og:site_name');

      const schemaData = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Report",
            "headline": multiComparison.title,
            "description": multiComparison.meta_description,
            "image": multiComparison.overall_thumbnail_url,
            "datePublished": multiComparison.created_at,
            "dateModified": multiComparison.updated_at,
            "author": {
              "@type": "Person",
              "name": multiComparison.author_id ? "Authenticated User" : "SentiVibe AI"
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
              "@id": `${window.location.origin}/multi-comparison/${multiComparison.slug}`
            }
          },
          {
            "@type": "SoftwareApplication",
            "name": "SentiVibe - YouTube Comment Sentiment Analyzer",
            "applicationCategory": "AI Tool",
            "operatingSystem": "Web",
            "url": `${window.location.origin}`,
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
      document.title = "SentiVibe - Multi-Comparison Library";
      updateMetaTag('description', 'Compare multiple YouTube video sentiments and insights with AI-powered analysis.');
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
  }, [multiComparison]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <Skeleton className="h-8 w-1/4 mb-6" />
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
        Error loading multi-comparison: {error.message}
      </div>
    );
  }

  if (!multiComparison) {
    return (
      <div className="container mx-auto p-4 max-w-3xl text-center text-gray-500 dark:text-gray-400">
        <h2 className="text-2xl font-bold mb-4">Multi-Comparison Not Found</h2>
        <p>The multi-comparison you are looking for does not exist or has been removed.</p>
        <Link to="/comparison-library" className="text-blue-500 hover:underline mt-4 flex items-center justify-center">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Comparison Library
        </Link>
      </div>
    );
  }

  const contentWithoutDuplicateTitle = (markdownContent: string, title: string): string => {
    const lines = markdownContent.split('\n');
    if (lines.length > 0 && lines[0].startsWith('#')) {
      const firstLineTitle = lines[0].substring(1).trim();
      if (title.includes(firstLineTitle) || firstLineTitle.includes(title)) {
        return lines.slice(1).join('\n').trim();
      }
    }
    return markdownContent;
  };

  const formattedMultiComparisonResultForChat = multiComparison ? {
    id: multiComparison.id,
    title: multiComparison.title,
    meta_description: multiComparison.meta_description,
    keywords: multiComparison.keywords || [],
    comparison_data_json: multiComparison.comparison_data_json,
    custom_comparative_qa_results: multiComparison.custom_comparative_qa_results || [],
    videos: multiComparison.videos || [],
  } : null;

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
        <Link to="/multi-comparison-library" className="text-blue-500 hover:underline flex items-center w-fit">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Comparison Library
        </Link>
        {formattedMultiComparisonResultForChat && (
          <Button onClick={() => setIsChatDialogOpen(true)} className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Chat with AI
          </Button>
        )}
      </div>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-wrap justify-center items-center gap-4 mb-4">
            {multiComparison.videos && multiComparison.videos.map((video, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <a href={video.original_video_link} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
                  <img
                    src={video.thumbnail_url}
                    alt={`Thumbnail for ${video.title}`}
                    className="w-32 h-20 object-cover rounded-md shadow-md aspect-video"
                  />
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{video.title}</p>
                </a>
              </div>
            ))}
          </div>
          <CardTitle className="text-3xl font-bold mb-2 text-center">{multiComparison.title}</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Compared on: {new Date(multiComparison.created_at).toLocaleDateString()}
            {multiComparison.updated_at && multiComparison.updated_at !== multiComparison.created_at && (
              <span> (Last updated: {new Date(multiComparison.updated_at).toLocaleDateString()})</span>
            )}
          </p>
          <p className="text-md text-gray-700 dark:text-gray-300 mt-4 italic text-center">
            {multiComparison.meta_description}
          </p>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {contentWithoutDuplicateTitle(multiComparison.content, multiComparison.title)}
          </ReactMarkdown>
        </CardContent>
        {multiComparison.keywords && multiComparison.keywords.length > 0 && (
          <CardContent className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {multiComparison.keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}
        {multiComparison.comparison_data_json && (
          <CardContent className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">Structured Multi-Comparison Data</h3>
            <MultiComparisonDataDisplay data={multiComparison.comparison_data_json} />
          </CardContent>
        )}
        {multiComparison.custom_comparative_qa_results && multiComparison.custom_comparative_qa_results.length > 0 && (
          <CardContent className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">Comparative Questions & Answers</h3>
            <div className="space-y-4">
              {multiComparison.custom_comparative_qa_results.map((qa, index) => (
                <div key={index} className="border p-3 rounded-md bg-gray-50 dark:bg-gray-700">
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Q{index + 1}: {qa.question}</p>
                  <p className="text-gray-700 dark:text-gray-300">A{index + 1}: {qa.answer || "No answer generated."}</p>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
      {formattedMultiComparisonResultForChat && (
        <MultiComparisonChatDialog
          isOpen={isChatDialogOpen}
          onOpenChange={setIsChatDialogOpen}
          initialMultiComparisonResult={formattedMultiComparisonResultForChat}
        />
      )}
    </div>
  );
};

export default MultiComparisonDetail;