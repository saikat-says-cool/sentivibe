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
import MultiComparisonDataDisplay from '@/components/MultiComparisonDataDisplay';
import MultiComparisonChatDialog from '@/components/MultiComparisonChatDialog';
import html2pdf from 'html2pdf.js';
import { useAuth } from '@/integrations/supabase/auth';
import UpgradeCTA from '@/components/UpgradeCTA';
import { TooltipWrapper } from '@/components/ui/tooltip'; // Import TooltipWrapper

interface MultiComparisonVideo {
  blog_post_id: string;
  video_order: number;
  title: string;
  thumbnail_url: string;
  original_video_link: string;
  raw_comments_for_chat: string[];
  slug: string;
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
  multi_comparison_videos: MultiComparisonVideo[];
  videos: MultiComparisonVideo[];
}

const fetchMultiComparisonBySlug = async (slug: string): Promise<MultiComparison | null> => {
  const { data, error } = await supabase
    .from('multi_comparisons')
    .select(`
      *,
      multi_comparison_videos (
        video_order,
        blog_posts (id, title, thumbnail_url, original_video_link, ai_analysis_json, slug)
      )
    `)
    .eq('slug', slug)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Supabase fetch error:", error);
    throw new Error(error.message);
  }

  if (data) {
    const videos = data.multi_comparison_videos
      .sort((a: any, b: any) => a.video_order - b.video_order)
      .map((mcv: any) => ({
        blog_post_id: mcv.blog_posts.id,
        video_order: mcv.video_order,
        title: mcv.blog_posts.title,
        thumbnail_url: mcv.blog_posts.thumbnail_url,
        original_video_link: mcv.blog_posts.original_video_link,
        raw_comments_for_chat: mcv.blog_posts.ai_analysis_json?.raw_comments_for_chat || [],
        slug: mcv.blog_posts.slug,
      }));
    return { ...data, videos };
  }
  return null;
};

const MultiComparisonDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const comparisonReportRef = useRef<HTMLDivElement>(null);
  const { subscriptionStatus, subscriptionPlanId } = useAuth();
  const isPaidTier = subscriptionStatus === 'active' && subscriptionPlanId !== 'free';

  const { data: multiComparison, isLoading, error } = useQuery<MultiComparison | null, Error>({
    queryKey: ['multiComparison', slug],
    queryFn: () => fetchMultiComparisonBySlug(slug!),
    enabled: !!slug,
  });

  useEffect(() => {
    const head = document.head;
    const domain = "https://sentivibe.online";

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
      updateMetaTag('og:url', `${domain}/multi-comparison/${multiComparison.slug}`, 'og:url');
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
                "url": `${domain}/logo.png`
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `${domain}/multi-comparison/${multiComparison.slug}`
            }
          },
          {
            "@type": "SoftwareApplication",
            "name": "SentiVibe - YouTube Comment Sentiment Analyzer",
            "applicationCategory": "AI Tool",
            "operatingSystem": "Web",
            "url": `${domain}`,
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

  const handleDownloadPdf = () => {
    if (comparisonReportRef.current && multiComparison) {
      const element = comparisonReportRef.current;
      const opt = {
        margin: 1,
        filename: `SentiVibe_MultiComparison_${multiComparison.title.replace(/[^a-z0-9]/gi, '_')}.pdf`,
        image: { type: 'jpeg' as 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as 'portrait' }
      };

      const tempDiv = document.createElement('div');
      tempDiv.className = 'pdf-light-mode';
      tempDiv.style.position = 'relative';
      tempDiv.style.width = element.offsetWidth + 'px';
      tempDiv.style.height = element.offsetHeight + 'px';
      tempDiv.innerHTML = element.innerHTML;

      // Add header
      const header = document.createElement('div');
      header.style.textAlign = 'center';
      header.style.marginBottom = '1rem';
      header.style.paddingBottom = '0.5rem';
      header.style.borderBottom = '1px solid #ccc';
      header.innerHTML = `
        <img src="/logo.svg" alt="SentiVibe Logo" style="height: 30px; margin-right: 10px; display: inline-block; vertical-align: middle;">
        <span style="font-weight: bold; font-size: 1.2em; vertical-align: middle;">SentiVibe</span>
        <p style="font-size: 0.8em; color: #555; margin-top: 5px;">YouTube Audience Insight Report</p>
      `;
      tempDiv.prepend(header);

      // Add footer
      const footer = document.createElement('div');
      footer.style.textAlign = 'center';
      footer.style.marginTop = '1rem';
      footer.style.paddingTop = '0.5rem';
      footer.style.borderTop = '1px solid #ccc';
      footer.style.fontSize = '0.8em';
      footer.style.color = '#555';
      footer.innerHTML = `
        <p>&copy; ${new Date().getFullYear()} SentiVibe. All rights reserved.</p>
        <p>Analyses generated by AI based on public YouTube comments.</p>
      `;
      tempDiv.appendChild(footer);

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
        <Skeleton className="h-8 w-1/4 mb-6 bg-muted" />
        <Skeleton className="h-10 w-full mb-4 bg-muted" />
        <Skeleton className="h-6 w-1/2 mb-4 bg-muted" />
        <Skeleton className="h-4 w-full mb-2 bg-muted" />
        <Skeleton className="h-4 w-full mb-2 bg-muted" />
        <Skeleton className="h-4 w-3/4 bg-muted" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-3xl text-destructive">
        Error loading multi-comparison: {error.message}
      </div>
    );
  }

  if (!multiComparison) {
    return (
      <div className="container mx-auto p-4 max-w-3xl text-center text-muted-foreground">
        <h2 className="text-2xl font-bold mb-4">Multi-Comparison Not Found</h2>
        <p>The multi-comparison you are looking for does not exist or has been removed.</p>
        <Link to="/multi-comparison-library" className="text-accent hover:underline mt-4 flex items-center justify-center">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Comparison Library
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 flex-wrap">
        <TooltipWrapper content="Go back to the multi-comparison library.">
          <Link to="/multi-comparison-library" className="text-accent hover:underline flex items-center w-fit">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Comparison Library
          </Link>
        </TooltipWrapper>
        <div className="flex flex-wrap gap-2">
          {multiComparison && (
            <TooltipWrapper content="Go to the interactive multi-comparison analysis page.">
              <Button
                onClick={() => navigate('/create-multi-comparison', { state: { multiComparison: formattedMultiComparisonResultForChat } })}
                className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                <BarChart className="h-4 w-4" /> Go to Multi-Comparison Analysis
              </Button>
            </TooltipWrapper>
          )}
          <TooltipWrapper content="Re-run the multi-comparison to get the latest insights.">
            <Button
              onClick={() => navigate('/create-multi-comparison', { state: { multiComparison: formattedMultiComparisonResultForChat, forceRecompare: true } })}
              className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              <RefreshCw className="h-4 w-4" /> Refresh Comparison
            </Button>
          </TooltipWrapper>
          {formattedMultiComparisonResultForChat && (
            <TooltipWrapper content="Chat with AI about this multi-video comparison.">
              <Button onClick={() => setIsChatDialogOpen(true)} className="flex items-center gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <MessageSquare className="h-4 w-4" /> Chat with AI
              </Button>
            </TooltipWrapper>
          )}
          <TooltipWrapper content="Download this multi-comparison report as a PDF document.">
            <Button onClick={handleDownloadPdf} className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <Download className="h-4 w-4" /> Download Report PDF
            </Button>
          </TooltipWrapper>
        </div>
      </div>
      <Card ref={comparisonReportRef} className="mb-6 bg-card text-foreground border-border">
        <CardHeader>
          <div className="flex flex-wrap justify-center items-center gap-4 mb-2">
            {multiComparison.videos && multiComparison.videos.map((video, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <TooltipWrapper content={`View individual analysis for ${video.title}.`}>
                  <Link to={`/blog/${video.slug}`} className="block hover:opacity-80 transition-opacity">
                    <img
                      src={video.thumbnail_url}
                      alt={`Thumbnail for ${video.title}`}
                      className="w-32 h-20 object-cover rounded-md shadow-md aspect-video"
                    />
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{video.title}</p>
                  </Link>
                </TooltipWrapper>
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-muted-foreground mb-4">
            Click on any video thumbnail above to view its individual analysis.
          </p>
          <CardTitle className="text-3xl font-bold mb-2 text-center">{multiComparison.title}</CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            Compared on: {new Date(multiComparison.created_at).toLocaleDateString()}
            {multiComparison.updated_at && multiComparison.updated_at !== multiComparison.created_at && (
              <span> (Last updated: {new Date(multiComparison.updated_at).toLocaleDateString()})</span>
            )}
          </p>
          {multiComparison.last_compared_at && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Last Full Comparison: {new Date(multiComparison.last_compared_at).toLocaleDateString()}
            </p>
          )}
          <p className="text-md text-muted-foreground mt-4 italic text-center">
            {multiComparison.meta_description}
          </p>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {contentWithoutDuplicateTitle(multiComparison.content, multiComparison.title)}
          </ReactMarkdown>
        </CardContent>
        {multiComparison.keywords && multiComparison.keywords.length > 0 && (
          <CardContent className="border-t border-border pt-4 mt-4">
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
          <CardContent className="border-t border-border pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">Structured Multi-Comparison Data</h3>
            <MultiComparisonDataDisplay data={multiComparison.comparison_data_json} />
          </CardContent>
        )}
        {multiComparison.custom_comparative_qa_results && multiComparison.custom_comparative_qa_results.length > 0 && (
          <CardContent className="border-t border-border pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">Comparative Questions & Answers</h3>
            <div className="space-y-4">
              {multiComparison.custom_comparative_qa_results.map((qa, index) => (
                <div key={index} className="border border-border p-3 rounded-md bg-secondary">
                  <p className="font-medium text-foreground mb-1">Q{index + 1}: {qa.question}</p>
                  <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {qa.answer || "No answer generated."}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}

        {/* New section for individual video comments */}
        {multiComparison.videos && multiComparison.videos.length > 0 && (
          <CardContent className="border-t border-border pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-4">Top Comments for Each Video</h3>
            <div className="space-y-6">
              {multiComparison.videos.map((video, videoIndex) => (
                <div key={videoIndex} className="border border-border p-4 rounded-md bg-secondary">
                  <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-red-500" /> {video.title}
                  </h4>
                  {video.raw_comments_for_chat && video.raw_comments_for_chat.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {video.raw_comments_for_chat.slice(0, 10).map((comment, commentIndex) => (
                        <li key={commentIndex}>{String(comment)}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-sm">No top comments available for this video.</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
      <UpgradeCTA />
      {formattedMultiComparisonResultForChat && (
        <MultiComparisonChatDialog
          isOpen={isChatDialogOpen}
          onOpenChange={setIsChatDialogOpen}
          initialMultiComparisonResult={formattedMultiComparisonResultForChat}
          isPaidTier={isPaidTier}
        />
      )}
    </div>
  );
};

export default MultiComparisonDetail;