import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Youtube, MessageSquare, BarChart, RefreshCw, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import VideoChatDialog from '@/components/VideoChatDialog'; // Import VideoChatDialog
import html2pdf from 'html2pdf.js'; // Import html2pdf
import { useAuth } from '@/integrations/supabase/auth'; // Import useAuth

interface AiAnalysisResult {
  overall_sentiment: string;
  emotional_tones: string[];
  key_themes: string[];
  summary_insights: string;
}

interface CustomQuestion {
  question: string;
  wordCount: number;
  answer?: string; // AI-generated answer
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
  original_video_link: string;
  created_at: string;
  updated_at: string;
  ai_analysis_json: StoredAiAnalysisContent | null;
  custom_qa_results?: CustomQuestion[]; // New field
  last_reanalyzed_at?: string; // New field
}

const fetchBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  console.log("Fetching blog post for slug:", slug);
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Supabase fetch error:", error);
    throw new Error(error.message);
  }
  console.log("Supabase fetch result:", data);
  return data;
};

const BlogPostDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false); // State for chat dialog
  const analysisReportRef = useRef<HTMLDivElement>(null); // Ref for PDF download
  const { subscriptionStatus, subscriptionPlanId } = useAuth(); // Get subscription info
  const isPaidTier = subscriptionStatus === 'active' && subscriptionPlanId !== 'free';

  console.log("Current URL slug from useParams:", slug);

  const { data: blogPost, isLoading, error } = useQuery<BlogPost | null, Error>({
    queryKey: ['blogPost', slug],
    queryFn: () => fetchBlogPostBySlug(slug!),
    enabled: !!slug,
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

  const handleDownloadPdf = () => {
    if (analysisReportRef.current && blogPost) {
      const element = analysisReportRef.current;
      const opt = {
        margin: 1,
        filename: `SentiVibe_BlogPost_${blogPost.title.replace(/[^a-z0-9]/gi, '_')}.pdf`,
        image: { type: 'jpeg' as 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as 'portrait' }
      };

      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'relative';
      tempDiv.style.width = element.offsetWidth + 'px';
      tempDiv.style.height = element.offsetHeight + 'px';
      tempDiv.innerHTML = element.innerHTML;

      if (!isPaidTier) {
        const watermark = document.createElement('div');
        watermark.style.position = 'absolute';
        watermark.style.top = '50%';
        watermark.style.left = '50%';
        watermark.style.transform = 'translate(-50%, -50%) rotate(-45deg)';
        watermark.style.fontSize = '48px';
        watermark.style.fontWeight = 'bold';
        watermark.style.color = 'rgba(0, 0, 0, 0.1)';
        watermark.style.zIndex = '1000';
        watermark.style.pointerEvents = 'none';
        watermark.textContent = 'SentiVibe - Free Tier';
        tempDiv.appendChild(watermark);
      }

      document.body.appendChild(tempDiv);

      html2pdf().from(tempDiv).set(opt).save().then(() => {
        document.body.removeChild(tempDiv);
      });
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 flex-wrap">
        <Link to="/library" className="text-blue-500 hover:underline flex items-center w-fit">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Analysis Library
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/analyze-video">Analyze a New Video</Link>
          </Button>
          <Button
            onClick={() => navigate('/analyze-video', { state: { blogPost: blogPost, openChat: false } })}
            className="flex items-center gap-2"
          >
            <BarChart className="h-4 w-4" /> Go to Video Analysis
          </Button>
          <Button
            onClick={() => navigate('/analyze-video', { state: { blogPost: blogPost, openChat: false, forceReanalyze: true } })}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Analysis
          </Button>
          <Button
            onClick={() => setIsChatDialogOpen(true)} // Directly set state to open chat
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" /> Chat with AI
          </Button>
          <Button onClick={handleDownloadPdf} className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Download Report PDF
          </Button>
        </div>
      </div>
      <Card ref={analysisReportRef} className="mb-6">
        <CardHeader>
          {blogPost.thumbnail_url && (
            <img
              src={blogPost.thumbnail_url}
              alt={`Thumbnail for ${blogPost.title}`}
              className="w-full h-auto rounded-md mb-4 aspect-video object-cover"
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
          {blogPost.last_reanalyzed_at && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Last Full Analysis: {new Date(blogPost.last_reanalyzed_at).toLocaleDateString()}
            </p>
          )}
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
            {contentWithoutDuplicateTitle(blogPost.content, blogPost.title)}
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
        {blogPost.custom_qa_results && blogPost.custom_qa_results.length > 0 && (
          <CardContent className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">Questions about this video asked by the community</h3>
            <div className="space-y-4">
              {blogPost.custom_qa_results.map((qa, index) => (
                <div key={index} className="border p-3 rounded-md bg-gray-50 dark:bg-gray-700">
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Q{index + 1}: {qa.question}</p>
                  <p className="text-gray-700 dark:text-gray-300">A{index + 1}: {qa.answer || "No answer generated."}</p>
                </div>
              ))}
            </div>
          </CardContent>
        )}
        {blogPost.ai_analysis_json?.raw_comments_for_chat && blogPost.ai_analysis_json.raw_comments_for_chat.length > 0 && (
          <CardContent className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">Raw Comments (First 10, by popularity)</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              {blogPost.ai_analysis_json.raw_comments_for_chat.slice(0, 10).map((comment, index) => (
                <li key={index}>{comment}</li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>
      {blogPost && (
        <VideoChatDialog
          isOpen={isChatDialogOpen}
          onOpenChange={setIsChatDialogOpen}
          initialBlogPost={blogPost}
        />
      )}
    </div>
  );
};

export default BlogPostDetail;