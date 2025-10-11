import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightIcon, GitCompare, CheckCircle2 } from 'lucide-react'; // Import CheckCircle2 icon

function Index() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4 py-8">
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
          <CardContent className="flex-grow flex items-center justify-center flex-col">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/analyze-video">
                <span> {/* Wrap children in a single span */}
                  Start Analyzing <ArrowRightIcon className="ml-2 h-5 w-5" />
                </span>
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-4 max-w-[250px]">
              Requires 50+ comments. Analysis may take up to 30 seconds.
            </p>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-3xl font-bold mb-2">Compare Videos</CardTitle>
            <CardDescription className="text-md text-muted-foreground">
              Compare audience sentiment and insights between two or more YouTube videos.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center flex-col">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/create-multi-comparison">
                <span> {/* Wrap children in a single span */}
                  Start Comparing <GitCompare className="ml-2 h-5 w-5" />
                </span>
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-4 max-w-[250px]">
              Each video requires 50+ comments. Analysis may take up to 30 seconds per video.
            </p>
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
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link to="/library">
                <span> {/* Wrap children in a single span */}
                  View Analysis Library <ArrowRightIcon className="ml-2 h-5 w-5" />
                </span>
              </Link>
            </Button>
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
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link to="/multi-comparison-library">
                <span> {/* Wrap children in a single span */}
                  View Comparison Library <GitCompare className="ml-2 h-5 w-5" />
                </span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* New Pricing & Upgrade Section */}
      <div className="mt-16 w-full max-w-5xl">
        <h2 className="text-4xl font-bold mb-8 text-foreground">Pricing & Upgrade Plans</h2>
        <p className="text-lg text-muted-foreground mb-10">
          Choose the plan that best fits your needs to unlock powerful video insights.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col">
            <h3 className="text-2xl font-semibold mb-4 text-primary">Free Tier</h3>
            <p className="text-4xl font-bold mb-6 text-foreground">$0<span className="text-lg font-normal text-muted-foreground">/month</span></p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 flex-grow">
              <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> 5 Single Video Analyses/day</li>
              <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> 2 Multi-Video Comparisons/day</li>
              <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> 10 AI Chat Messages/session</li>
              <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> 2 Custom Questions (150 words)/analysis</li>
              <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> Watermarked PDF Reports</li>
              <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> Ads displayed</li>
              <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> Access to "My Analyses" History</li>
            </ul>
            <Button asChild variant="outline" className="mt-6 w-full">
              <Link to="/login">Sign Up for Free</Link>
            </Button>
          </div>

          <div className="bg-primary text-primary-foreground p-6 rounded-lg shadow-lg flex flex-col">
            <h3 className="text-2xl font-semibold mb-4">Paid Tier</h3>
            <p className="text-4xl font-bold mb-6">$XX<span className="text-lg font-normal">/month</span></p>
            <ul className="space-y-2 flex-grow">
              <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2" /> 50 Single Video Analyses/day</li>
              <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2" /> 20 Multi-Video Comparisons/day</li>
              <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2" /> 100 AI Chat Messages/session</li>
              <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2" /> 5 Custom Questions (500 words)/analysis</li>
              <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2" /> Unwatermarked PDF Reports</li>
              <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2" /> Ad-Free Experience</li>
              <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2" /> Full Access to "My Analyses" History</li>
            </ul>
            <Button asChild variant="secondary" className="mt-6 w-full">
              <Link to="/checkout">Upgrade Now</Link> {/* Placeholder for actual checkout */}
            </Button>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mt-12 max-w-2xl">
        No account needed to get started. Experience the full potential of SentiVibe and upgrade for unlimited access and advanced features.
      </p>
    </div>
  );
}

export default Index;