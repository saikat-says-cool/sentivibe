import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '@/integrations/supabase/auth';

const UpgradeCTA: React.FC = () => {
  const { user, subscriptionStatus, subscriptionPlanId } = useAuth();

  const isPaidTier = subscriptionStatus === 'active' && subscriptionPlanId !== 'free';
  const showCTA = user && !isPaidTier;

  if (!showCTA) {
    return null;
  }

  return (
    <Card className="mt-8 border-2 border-accent bg-accent/10 dark:bg-accent/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2 text-accent-foreground">
          <Sparkles className="h-6 w-6" /> Unlock the Full SentiVibe Experience!
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-lg text-muted-foreground">
          You're currently on the Free Tier. Upgrade to a Paid Tier to enjoy:
        </p>
        <ul className="list-disc list-inside text-left mx-auto max-w-md space-y-1 text-muted-foreground">
          <li>Significantly higher daily analysis and comparison limits</li>
          <li>Unwatermarked, professional PDF reports</li>
          <li>An entirely ad-free experience</li>
          <li>And much more!</li>
        </ul>
        <Link to="/upgrade">
          <Button size="lg" className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
            Upgrade Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <p className="text-sm text-muted-foreground">
          Visit our <Link to="/pricing" className="underline">Pricing Page</Link> for a detailed breakdown of all features.
        </p>
      </CardContent>
    </Card>
  );
};

export default UpgradeCTA;