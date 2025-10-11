import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, GitCompare, Youtube } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Skeleton } from '@/components/ui/skeleton';
import ComparisonDataDisplay from '@/components/ComparisonDataDisplay';

interface CustomComparativeQuestion {
  question: string;
  wordCount: number;
  answer?: string;
}

interface BlogPostSummary {
  id: string;
  title: string;
  thumbnail_url: string;
  original_video_link: string;
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
  videoA?: BlogPostSummary;
  videoB?: BlogPostSummary;
}

const fetchComparisonBySlug = async (slug: string): Promise<Comparison | null> => {
  const { data, error } = await supabase
    .from('comparisons')
    .select(`
      *,
      videoA:blog_posts!video_a_blog_post_id (id, title, thumbnail_url, original_video_link),
      videoB:blog_posts!video_b_blog_post_id (id, title, thumbnail_url, original_video_link)
    `)
    .eq('slug', slug)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Supabase fetch error:", error);
    throw new Error(error.message);
  }
  return data;
};

const ComparisonDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: comparison, isLoading, error } = useQuery<Comparison | null, Error>({
    queryKey: ['comparison', slug],
    queryFn: () => fetchComparisonBySlug(slug!),
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

    if (comparison) {
      document.title = comparison.title;
      updateMetaTag('description', comparison.meta_description);
      updateMetaTag('og:title', comparison.title, 'og:title');
      updateMetaTag('og:description', comparison.meta_description, 'og:description');
      updateMetaTag('og:url', `${window.location.origin}/comparison/${comparison.slug}`, 'og:url');
      updateMetaTag('og:type', 'article', 'og:type');
      updateMetaTag('og:site_name', 'SentiVibe', 'og:site_name');

      const schemaData = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Report", // Using Report schema for comparison
            "headline": comparison.title,
            "description": comparison.meta_description,
            "datePublished": comparison.created_at,
            "dateModified": comparison.updated_at,
            "author": {
              "@type": "Person",
              "name": comparison.author_id ? "Authenticated User" : "SentiVibe AI"
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
              "@id": `${window.location.origin}/comparison/${comparison.slug}`
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
      document.title = "SentiVibe - Video Comparison Library";
      updateMetaTag('description', 'Compare YouTube video sentiments and insights with AI-powered analysis.');
      removeMetaTag('og:title', 'og:title');
      removeMetaTag('og:description', 'og:description');
      removeMetaTag('og:url', 'og:url');
      removeMetaTag('og:type', 'og:type');
      removeMetaTag('og:site_name', 'og:site_name');
      const scriptTag = document.querySelector('script[type="application/ld+json"]');
      if (scriptTag) {
        scriptTag.remove();
      }
    }
  }, [comparison]);

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
        Error loading comparison: {error.message}
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="container mx-auto p-4 max-w-3xl text-center text-gray-500 dark:text-gray-400">
        <h2 className="text-2xl font-bold mb-4">Comparison Not Found</h2>
        <p>The comparison you are looking for does not exist or has been removed.</p>
        <Link to="/comparison-library" className="text-blue-500 hover:underline mt-4 flex items-center justify-center">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Comparison Library
        </Link>
      </div>
    );
  }

  // Function to remove the first H1 from markdown content
  const removeFirstH1 = (markdownContent: string, title: string): string => {
    const lines = markdownContent.split('\n');
    if (lines.length > 0 && lines[0].startsWith('#')) {
      const firstLineTitle = lines[0].substring(1).trim(); // Remove '#' and trim
      // Check if the first H1 roughly matches the comparison title
      // Using a simple includes check for robustness against minor AI variations
      if (title.includes(firstLineTitle) || firstLineTitle.includes(title)) {
        return lines.slice(1).join('\n').trim();
      }
    }
    return markdownContent;
  };

  const contentWithoutDuplicateTitle = removeFirstH1(comparison.content, comparison.title);

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
        <Link to="/comparison-library" className="text-blue-500 hover:underline flex items-center w-fit">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Comparison Library
        </Link>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            {comparison.videoA && (
              <div className="flex flex-col items-center text-center">
                <a href={comparison.videoA.original_video_link} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
                  <img
                    src={comparison.videoA.thumbnail_url}
                    alt={`Thumbnail for ${comparison.videoA.title}`}
                    className="w-32 h-20 object-cover rounded-md shadow-md aspect-video"
                  />
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{comparison.videoA.title}</p>
                </a>
              </div>
            )}
            <GitCompare className="h-8 w-8 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            {comparison.videoB && (
              <div className="flex flex-col items-center text-center">
                <a href={comparison.videoB.original_video_link} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
                  <img
                    src={comparison.videoB.thumbnail_url}
                    alt={`Thumbnail for ${comparison.videoB.title}`}
                    className="w-32 h-20 object-cover rounded-md shadow-md aspect-video"
                  />
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{comparison.videoB.title}</p>
                </a>
              </div>
            )}
          </div>
          <CardTitle className="text-3xl font-bold mb-2 text-center">{comparison.title}</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Compared on: {new Date(comparison.created_at).toLocaleDateString()}
            {comparison.updated_at && comparison.updated_at !== comparison.created_at && (
              <span> (Last updated: {new Date(comparison.updated_at).toLocaleDateString()})</span>
            )}
          </p>
          <p className="text-md text-gray-700 dark:text-gray-300 mt-4 italic text-center">
            {comparison.meta_description}
          </p>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {contentWithoutDuplicateTitle}
          </ReactMarkdown>
        </CardContent>
        {comparison.keywords && comparison.keywords.length > 0 && (
          <CardContent className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {comparison.keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}
        {comparison.comparison_data_json && (
          <CardContent className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">Structured Comparison Data</h3>
            <ComparisonDataDisplay data={comparison.comparison_data_json} />
          </CardContent>
        )}
        {comparison.custom_comparative_qa_results && comparison.custom_comparative_qa_results.length > 0 && (
          <CardContent className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">Comparative Questions & Answers</h3>
            <div className="space-y-4">
              {comparison.custom_comparative_qa_results.map((qa, index) => (
                <div key={index} className="border p-3 rounded-md bg-gray-50 dark:bg-gray-700">
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Q{index + 1}: {qa.question}</p>
                  <p className="text-gray-700 dark:text-gray-300">A{index + 1}: {qa.answer || "No answer generated."}</p>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ComparisonDetail;