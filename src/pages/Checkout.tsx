import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const Checkout = () => {
  // Set SEO-optimized browser tab title
  useEffect(() => {
    document.title = "Checkout - SentiVibe";
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-2xl min-h-[calc(100vh-12rem)] flex items-center justify-center bg-background text-foreground">
      <Card className="w-full text-center bg-card border-border">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Secure Checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg text-muted-foreground">
            This is where your secure payment process will be integrated.
            We're getting everything ready for you to upgrade!
          </p>
          <p className="text-sm text-muted-foreground">
            Please ensure your Stripe environment variables are set up.
          </p>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/upgrade">Back to Upgrade Options</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Checkout;