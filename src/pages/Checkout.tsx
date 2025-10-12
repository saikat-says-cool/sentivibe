import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Checkout = () => {
  return (
    <div className="container mx-auto p-4 max-w-2xl min-h-[calc(100vh-12rem)] flex items-center justify-center">
      <Card className="w-full text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Secure Checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg text-muted-foreground">
            This is where your secure payment process will be integrated.
            We're getting everything ready for you to upgrade!
          </p>
          <p className="text-sm text-gray-500">
            Please ensure your Stripe environment variables are set up.
          </p>
          <Button asChild>
            <Link to="/upgrade">Back to Upgrade Options</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Checkout;