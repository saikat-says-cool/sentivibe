import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Youtube, GitCompare, MessageSquare, FileText, Search } from 'lucide-react';

const HowItWorks = () => {
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">How SentiVibe Works</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p className="text-lg text-muted-foreground mb-6 text-center">
            SentiVibe leverages advanced AI to provide deep insights into YouTube video comments. Here's a quick guide to our powerful features:
          </p>

          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="flex-shrink-0 p-3 bg-accent text-accent-foreground rounded-full">
                <Youtube className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">1. Analyze a Single Video</h2>
                <p>
                  Simply paste any public YouTube video link into our analyzer. Our AI will intelligently fetch video details, up to 100 comments, and apply a weighted sentiment analysis, prioritizing comments with higher likes.
                  <span className="font-semibold text-red-500"> Important: Videos must have at least 50 comments for a robust analysis. Analysis may take up to 30 seconds.</span>
                </p>
                <p className="mt-2">
                  Enhance your insights by adding custom questions with desired word counts. Our AI will generate precise answers, which are then integrated into your report and saved for the community. We also employ smart caching and staleness logic to ensure your analyses are always fresh and efficient.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="flex-shrink-0 p-3 bg-accent text-accent-foreground rounded-full">
                <GitCompare className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">2. Compare Multiple Videos</h2>
                <p>
                  Gain a competitive edge by comparing audience sentiment and engagement across two or more YouTube videos. Our AI identifies commonalities, highlights unique aspects, and reveals overall sentiment trends across your selected content.
                </p>
                <p className="mt-2">
                  <span className="font-semibold text-red-500">Important: Each video must have at least 50 comments for a robust analysis. Analysis may take up to 30 seconds per video.</span> Submit custom comparative questions to delve deeper into specific aspects of the videos. SentiVibe intelligently caches comparisons and refreshes stale data, ensuring your multi-video insights are always current and relevant.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="flex-shrink-0 p-3 bg-accent text-accent-foreground rounded-full">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">3. Get Detailed Reports & SEO-Optimized Blog Posts</h2>
                <p>
                  Receive a comprehensive, structured report detailing overall sentiment, emotional tones, key themes, and actionable summary insights. For every analysis or comparison, SentiVibe automatically generates and publishes an SEO-optimized blog post to our public library.
                </p>
                <p className="mt-2">
                  Reports include all AI-generated answers to your custom questions and the top 10 most popular comments. You can also download your complete report as a professional, branded PDF for easy sharing and archiving.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="flex-shrink-0 p-3 bg-accent text-accent-foreground rounded-full">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">4. Chat with Our Context-Aware AI</h2>
                <p>
                  Engage in dynamic, context-aware conversations with our AI about any video analysis or comparison. Ask follow-up questions, explore specific topics, and even customize the AI's persona and desired response word count.
                </p>
                <p className="mt-2">
                  Our AI synthesizes information from the video analysis, top comments, pre-generated community Q&A, and up-to-date external search results to provide comprehensive and insightful answers, complete with clickable Markdown links.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="flex-shrink-0 p-3 bg-accent text-accent-foreground rounded-full">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">5. Explore Libraries & Use AI Copilots</h2>
                <p>
                  Browse our dedicated Analysis Library and Comparison Library for all past reports. Utilize our intelligent AI Copilots to semantically search your analyses and get proactive recommendations for new, related analysis topics or video ideas.
                </p>
                <p className="mt-2">
                  These copilots provide direct, clickable links to relevant blog posts, streamlining your research and content discovery process.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            SentiVibe makes understanding your audience easier and more efficient than ever before, empowering you with data-driven decisions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HowItWorks;