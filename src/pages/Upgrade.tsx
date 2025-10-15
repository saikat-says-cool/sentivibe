import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import PaddleCheckoutButton from '@/components/PaddleCheckoutButton';

const Upgrade = () => {
  // Set SEO-optimized browser tab title
  useEffect(() => {
    document.title = "Upgrade - SentiVibe: Unlock the Full Experience.";
  }, []);

  const paddleProductId = import.meta.env.VITE_PADDLE_PRODUCT_ID;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6 bg-card text-foreground">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Unlock the Full SentiVibe Experience!</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none text-center">
          <p className="text-lg text-muted-foreground mb-6">
            Upgrade to a Paid Tier to enjoy significantly higher daily analysis and comparison limits, unwatermarked PDF reports, and an ad-free experience.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-secondary p-6 rounded-lg shadow-md text-secondary-foreground">
              <h3 className="text-2xl font-semibold mb-4 text-primary-foreground">Free Tier</h3>
              <ul className="space-y-2 text-primary-foreground">
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-400 mr-2" /> 5 Single Video Analyses/day</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-400 mr-2" /> 3 Multi-Video Comparisons/day</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-400 mr-2" /> Unlimited Custom Questions</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-400 mr-2" /> Unlimited AI Chat Messages</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-400 mr-2" /> Unlimited Copilot Queries</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-400 mr-2" /> Watermarked PDF Reports</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-400 mr-2" /> Ads displayed</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-400 mr-2" /> Access to "My Analyses" History</li>
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-red-400 mr-2" /> No DeepThink / DeepSearch AI modes</li>
              </ul>
            </div>

            <div className="bg-accent text-accent-foreground p-6 rounded-lg shadow-lg">
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
                <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2" /> DeepThink & DeepSearch AI modes</li>
              </ul>
              <div className="text-2xl font-bold text-primary-foreground mb-4 mt-6">
                $14.99 / month
              </div>
              <PaddleCheckoutButton productId={paddleProductId} className="w-full mt-auto" variant="default">
                Upgrade Now
              </PaddleCheckoutButton>
            </div>
          </div>

          <div className="my-8 h-px bg-border" />

          <p className="text-sm text-muted-foreground">
            For a detailed breakdown of all features and limits, please visit our dedicated <Link to="/pricing" className="text-accent hover:underline">Pricing Page</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Upgrade;