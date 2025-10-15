import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import PaddleCheckoutButton from '@/components/PaddleCheckoutButton';

const Pricing = () => {
  // Set SEO-optimized browser tab title
  useEffect(() => {
    document.title = "Pricing Plans - SentiVibe: The Most Generous Insight Tool.";
  }, []);

  const paddleProductId = import.meta.env.VITE_PADDLE_PRODUCT_ID;

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <Card className="mb-8 bg-card text-foreground">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center mb-4">Experience SentiVibe: Get Real Value, Right Now.</CardTitle>
          <p className="text-lg text-muted-foreground text-center">
            We don't meter your curiosity. Ask unlimited questions, on any plan.
          </p>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {/* Free Tier Card */}
            <Card className="flex flex-col p-6 shadow-lg border-2 border-secondary bg-secondary text-secondary-foreground">
              <CardHeader className="pb-4">
                <CardTitle className="text-3xl font-bold text-primary-foreground">Free Tier</CardTitle>
                <p className="text-primary-foreground">Experience the full power of our AI, no credit card required.</p>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <p className="text-sm text-primary-foreground mb-4">
                  This tier applies to **unauthenticated users** (visitors without an account) and **authenticated but unpaid users** (those who have signed up but do not have an active paid subscription).
                </p>
                <ul className="space-y-3 text-primary-foreground mb-6">
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" /> 1 Single Video Analysis/day</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" /> 1 Multi-Video Comparison/day</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" /> Unlimited Custom Questions</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" /> Unlimited AI Chat Messages</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" /> Unlimited Copilot Queries</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" /> Watermarked PDF Reports</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" /> Ads displayed</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" /> Access to "My Analyses" History (for authenticated users)</li>
                </ul>
                <Button asChild variant="outline" className="w-full mt-auto bg-primary text-primary-foreground hover:bg-primary/90 border-primary-foreground">
                  <Link to="/login">Sign In / Sign Up (Free)</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Paid Tier Card */}
            <Card className="flex flex-col p-6 shadow-lg border-2 border-accent bg-accent text-accent-foreground">
              <CardHeader className="pb-4">
                <CardTitle className="text-3xl font-bold text-primary-foreground">Paid Tier</CardTitle>
                <p className="text-primary-foreground">For power users and professionals seeking comprehensive insights.</p>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <p className="text-sm text-primary-foreground mb-4">
                  This tier is exclusively for **authenticated users with an active paid subscription**. It removes daily usage limitations for core features and provides an ad-free experience.
                </p>
                <ul className="space-y-3 text-primary-foreground mb-6">
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2 flex-shrink-0" /> 50 Single Video Analyses/day</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2 flex-shrink-0" /> 20 Multi-Video Comparisons/day</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2 flex-shrink-0" /> Unlimited Custom Questions</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2 flex-shrink-0" /> Unlimited AI Chat Messages</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2 flex-shrink-0" /> Unlimited Copilot Queries</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2 flex-shrink-0" /> Unwatermarked PDF Reports</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2 flex-shrink-0" /> Ad-Free Experience</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-200 mr-2 flex-shrink-0" /> Access to "My Analyses" History</li>
                </ul>
                <div className="text-2xl font-bold text-primary-foreground mb-4">
                  $14.99 / month
                </div>
                <PaddleCheckoutButton productId={paddleProductId} className="w-full mt-auto">
                  Upgrade Now
                </PaddleCheckoutButton>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pricing;