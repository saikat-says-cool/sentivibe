import React from 'react';
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
            SentiVibe leverages advanced AI to provide deep insights into YouTube video comments. Here's a quick guide:
          </p>

          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="flex-shrink-0 p-3 bg-accent text-accent-foreground rounded-full">
                <Youtube className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">1. Analyze a Video</h2>
                <p>
                  Paste any public YouTube video link into our analyzer. Our AI will fetch the video details and up to 100 comments.
                  <span className="font-semibold text-red-500"> Note: Videos must have at least 50 comments for a proper analysis.</span>
                </p>
                <p className="mt-2">
                  You can also add custom questions with desired word counts, and our AI will generate answers based on the video's content and comments.
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
                  Input two or more YouTube video links to perform a comparative sentiment analysis. Our AI will highlight commonalities, unique aspects, and overall sentiment trends across your selected videos.
                </p>
                <p className="mt-2">
                  Add custom comparative questions to get specific insights into how different videos resonate with their audiences.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="flex-shrink-0 p-3 bg-accent text-accent-foreground rounded-full">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">3. Get Detailed Reports & Blog Posts</h2>
                <p>
                  Receive a comprehensive report with overall sentiment, emotional tones, key themes, and summary insights. For every analysis or comparison, an SEO-optimized blog post is automatically generated and published to our library.
                </p>
                <p className="mt-2">
                  Reports include answers to your custom questions and the top 10 most popular comments. You can also download your report as a professional PDF.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="flex-shrink-0 p-3 bg-accent text-accent-foreground rounded-full">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">4. Chat with AI</h2>
                <p>
                  Engage in a context-aware conversation with our AI about any video analysis or comparison. Ask follow-up questions, explore specific topics, and even choose an AI persona and desired response word count.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="flex-shrink-0 p-3 bg-accent text-accent-foreground rounded-full">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">5. Explore Libraries & Use Copilots</h2>
                <p>
                  Browse our Analysis Library and Comparison Library for past reports. Use our AI Copilots to semantically search your analyses and get recommendations for new analysis topics.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            SentiVibe makes understanding your audience easier and more efficient than ever before.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HowItWorks;