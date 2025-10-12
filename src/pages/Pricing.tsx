import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
// Removed: import { Separator } from '@/components/ui/separator';

const Pricing = () => {
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center mb-4">Choose Your SentiVibe Plan</CardTitle>
          <p className="text-lg text-muted-foreground text-center">
            Unlock deeper insights and more analyses with our flexible plans.
          </p>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {/* Free Tier Card */}
            <Card className="flex flex-col p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-3xl font-bold text-primary">Free Tier</CardTitle>
                <p className="text-muted-foreground">Perfect for trying out SentiVibe and occasional use.</p>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <ul className="space-y-3 text-gray-700 dark:text-gray-300 mb-6">
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /> 1 Single Video Analysis/day</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /> 1 Multi-Video Comparison/day</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /> Unlimited Custom Questions</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /> Unlimited AI Chat Messages</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /> Unlimited Copilot Queries</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /> Watermarked PDF Reports</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /> Ads displayed</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /> Access to "My Analyses" History</li>
                </ul>
                <Button asChild variant="outline" className="w-full mt-auto">
                  <Link to="/login">Sign In / Sign Up (Free)</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Paid Tier Card */}
            <Card className="flex flex-col p-6 shadow-lg border-2 border-accent dark:border-accent">
              <CardHeader className="pb-4">
                <CardTitle className="text-3xl font-bold text-accent">Paid Tier</CardTitle>
                <p className="text-muted-foreground">For power users and professionals seeking comprehensive insights.</p>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <ul className="space-y-3 text-gray-700 dark:text-gray-300 mb-6">
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /> 50 Single Video Analyses/day</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /> 20 Multi-Video Comparisons/day</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /> Unlimited Custom Questions</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /> Unlimited AI Chat Messages</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /> Unlimited Copilot Queries</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /> Unwatermarked PDF Reports</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /> Ad-Free Experience</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /> Access to "My Analyses" History</li>
                </ul>
                <Button asChild className="w-full mt-auto">
                  <Link to="/upgrade">Upgrade Now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pricing;