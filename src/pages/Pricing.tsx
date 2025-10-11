import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing = () => {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">SentiVibe Tier Offerings</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none text-center">
          <p className="text-lg text-muted-foreground mb-6">
            Choose the plan that best fits your needs and unlock deeper insights into YouTube audience sentiment.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4 text-primary">Free Tier</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> 2 Single Video Analyses/day</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> 1 Multi-Video Comparison/day</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> 5 AI Chat Messages/session</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> 1 Custom Question (100 words)/analysis</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> Watermarked PDF Reports</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> Ads displayed</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> No "My Analyses" History</li>
              </ul>
              <Button asChild variant="outline" className="mt-6 w-full">
                <Link to="/login">Sign Up for Free</Link>
              </Button>
            </div>

            <div className="bg-primary text-primary-foreground p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4">Paid Tier</h3>
              <ul className="space-y-2">
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2" /> 50 Single Video Analyses/day</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2" /> 20 Multi-Video Comparisons/day</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2" /> 100 AI Chat Messages/session</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2" /> 5 Custom Questions (500 words)/analysis</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2" /> Unwatermarked PDF Reports</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2" /> Ad-Free Experience</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2" /> Access to "My Analyses" History</li>
              </ul>
              <Button asChild variant="secondary" className="mt-6 w-full">
                <Link to="/upgrade">Upgrade Now</Link> {/* Placeholder for actual checkout */}
              </Button>
            </div>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            Ready to take your video insights to the next level? Upgrade today!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pricing;