import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react'; // Import useEffect
import PaddleCheckoutButton from '@/components/PaddleCheckoutButton'; // Import PaddleCheckoutButton

const Upgrade = () => {
  // Set SEO-optimized browser tab title
  useEffect(() => {
    document.title = "Upgrade to Paid Tier - SentiVibe";
  }, []);

  const paddleProductId = import.meta.env.VITE_PADDLE_PRODUCT_ID;

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
              <div className="text-2xl font-bold text-accent mb-4">
                $14.99 / month
              </div>
              <PaddleCheckoutButton productId={paddleProductId} className="w-full mt-auto" variant="secondary">
                Upgrade Now
              </PaddleCheckoutButton>
            </div>
          </div>

          <div className="my-8 h-px bg-border" /> {/* Replaced Separator with a div for consistency */}

          <p className="text-sm text-gray-500">
            For a detailed breakdown of all features and limits, please visit our dedicated <Link to="/pricing" className="text-blue-500 hover:underline">Pricing Page</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Upgrade;