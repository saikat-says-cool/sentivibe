import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator'; // Import Separator

const Upgrade = () => {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Upgrade Your SentiVibe Experience</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none text-center">
          <p className="text-lg text-muted-foreground mb-6">
            Unlock the full potential of SentiVibe with a paid subscription!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4 text-primary">Free Tier</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> 1 Single Video Analysis/day</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> 1 Multi-Video Comparison/day</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> Unlimited Custom Questions</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> Unlimited AI Chat Messages</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> Unlimited Copilot Queries</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> Watermarked PDF Reports</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> Ads displayed</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> Access to "My Analyses" History</li>
              </ul>
            </div>

            <div className="bg-primary text-primary-foreground p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4">Paid Tier</h3>
              <ul className="space-y-2">
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2" /> 50 Single Video Analyses/day</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2" /> 20 Multi-Video Comparisons/day</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2" /> Unlimited Custom Questions</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2" /> Unlimited AI Chat Messages</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2" /> Unlimited Copilot Queries</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2" /> Unwatermarked PDF Reports</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2" /> Ad-Free Experience</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2" /> Access to "My Analyses" History</li>
              </ul>
              <Button asChild variant="secondary" className="mt-6 w-full">
                <Link to="/checkout">Upgrade Now</Link> {/* Placeholder for actual checkout */}
              </Button>
            </div>
          </div>

          <Separator className="my-8" /> {/* Added separator */}

          <p className="text-sm text-gray-500">
            For a detailed breakdown of all features and limits, please visit our dedicated <Link to="/pricing" className="text-blue-500 hover:underline">Pricing Page</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Upgrade;