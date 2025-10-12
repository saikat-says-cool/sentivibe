import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/integrations/supabase/auth';
import { toast } from 'sonner';

interface PaddleCheckoutButtonProps {
  productId: string; // This is now a V1 Product ID (numerical)
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const PaddleCheckoutButton: React.FC<PaddleCheckoutButtonProps> = ({
  productId,
  children,
  className,
  variant = "default",
}) => {
  const { user } = useAuth();

  const handleCheckout = () => {
    if (typeof window.Paddle === 'undefined' || typeof window.Paddle.Checkout === 'undefined') {
      toast.error("Paddle.js is not loaded or initialized correctly. Please refresh the page.");
      console.error("Paddle.js is not loaded or initialized.");
      return;
    }

    const customerEmail = user?.email || undefined;
    const passthroughData = user?.id ? JSON.stringify({ userId: user.id }) : undefined; // Pass user ID

    window.Paddle.Checkout.open({
      product: productId, // V1 expects 'product'
      customer_email: customerEmail,
      passthrough: passthroughData, // Include passthrough data
      successCallback: (data: any) => {
        console.log("Paddle Checkout Success (V1):", data);
        toast.success("Subscription successful! Thank you for upgrading.");
        // In a real application, you would typically verify this with a webhook
        // and update the user's subscription status in your database.
      },
      closeCallback: () => {
        console.log("Paddle Checkout Closed (V1).");
        toast.info("Checkout closed. You can upgrade anytime!");
      },
      // You can add more V1 options here, e.g., coupon codes, etc.
      // theme: 'dark', // V1 theme option
    });
  };

  return (
    <Button onClick={handleCheckout} className={className} variant={variant}>
      {children}
    </Button>
  );
};

export default PaddleCheckoutButton;