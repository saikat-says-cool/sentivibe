import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightIcon, GitCompare } from 'lucide-react'; // Import GitCompare icon

function Index() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4 py-8 bg-gradient-to-br from-background to-muted">
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-foreground">
        Unlock Video Insights with SentiVibe
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-10">
        Transform any YouTube video into a comprehensive, SEO-optimized blog post, complete with AI-powered analysis, summaries, and custom Q&A. Start exploring the power of video content analysis today!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl w-full">
        <Card className="flex flex-col items-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-3xl font-bold mb-2">Analyze a Video</CardTitle>
            <CardDescription className="text-md text-muted-foreground">
              Paste a YouTube link and let our AI generate a detailed blog post.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            <Link to="/analyze-video">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Analyzing <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-3xl font-bold mb-2">Compare Videos</CardTitle>
            <CardDescription className="text-md text-muted-foreground">
              Compare audience sentiment and insights between two YouTube videos.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            <Link to="/compare-videos">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Comparing <GitCompare className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-3xl font-bold mb-2">Explore the Library</CardTitle>
            <CardDescription className="text-md text-muted-foreground">
              Browse a collection of AI-generated video analyses and blog posts.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            <Link to="/library">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                View Analysis Library <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-3xl font-bold mb-2">View Comparisons</CardTitle>
            <CardDescription className="text-md text-muted-foreground">
              Browse and review past comparative video analyses.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            <Link to="/comparison-library">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                View Comparison Library <GitCompare className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <p className="text-sm text-muted-foreground mt-12 max-w-2xl">
        No account needed to get started. Experience the full potential of SentiVibe and upgrade for unlimited access and advanced features.
      </p>
    </div>
  );
}

export default Index;