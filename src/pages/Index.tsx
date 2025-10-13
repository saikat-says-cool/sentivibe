import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightIcon, GitCompare } from 'lucide-react'; // Import GitCompare icon

function Index() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4 py-8">
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-foreground">
        SentiVibe: Your Audience, Understood.
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-10">
        Transform unstructured YouTube comments into a living, interactive intelligence hub. Get dynamic, conversational AI insights, automate SEO-optimized content, and ensure your audience understanding is always fresh and relevant.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl w-full">
        <Card className="flex flex-col items-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-3xl font-bold mb-2">Analyze a Video</CardTitle>
            <CardDescription className="text-md text-muted-foreground">
              Don't just get a report, start a conversation. Get dynamic AI insights.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center flex-col">
            <Link to="/analyze-video">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Analyzing <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-4 max-w-[250px]">
              Requires 50+ comments. Analysis may take up to 30 seconds.
            </p>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-3xl font-bold mb-2">Compare Videos</CardTitle>
            <CardDescription className="text-md text-muted-foreground">
              See the full picture by comparing sentiment across multiple videos.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center flex-col">
            <Link to="/create-multi-comparison">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Comparing <GitCompare className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-4 max-w-[250px]">
              Each video requires 50+ comments. Analysis may take up to 30 seconds per video.
              <br />
              <span className="font-semibold text-red-500">Note:</span> Reliable for up to 3 videos simultaneously.
            </p>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-3xl font-bold mb-2">Explore the Library</CardTitle>
            <CardDescription className="text-md text-muted-foreground">
              Turn Audience Insight into SEO Power. Every analysis becomes a new asset.
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
            <Link to="/multi-comparison-library">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                View Comparison Library <GitCompare className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <p className="text-sm text-muted-foreground mt-12 max-w-2xl">
        Get real value, right now, for free. Experience the full power of our AI, no credit card required.
      </p>
    </div>
  );
}

export default Index;