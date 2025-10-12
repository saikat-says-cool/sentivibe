import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/integrations/supabase/auth';
// Removed 'toast' import as it's no longer used for direct redirects

interface PaddleCheckoutButtonProps {
  productId: string; // This is a V2 Price ID (e.g., pri_...)
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
    const customerEmail = user?.email || ''; // Ensure email is a string
    const userId = user?.id || ''; // Ensure userId is a string

    // Construct the Paddle hosted checkout URL for V2
    const paddleCheckoutUrl = `https://checkout.paddle.com/checkout/v2/price/${productId}?customer_email=${encodeURIComponent(customerEmail)}&custom_data[userId]=${encodeURIComponent(userId)}`;

    console.log("Redirecting to Paddle Checkout URL:", paddleCheckoutUrl);
    window.location.href = paddleCheckoutUrl;
  };

  return (
    <Button onClick={handleCheckout} className={className} variant={variant}>
      {children}
    </Button>
  );
};

export default PaddleCheckoutButton;