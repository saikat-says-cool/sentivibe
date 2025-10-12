import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/integrations/supabase/auth';
import { toast } from 'sonner';

interface PaddleCheckoutButtonProps {
  productId: string; // This is now a V2 Price ID (e.g., pri_...)
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
    const userId = user?.id || undefined;

    window.Paddle.Checkout.open({
      items: [{ priceId: productId, quantity: 1 }],
      customer: {
        email: customerEmail,
      },
      customData: {
        userId: userId, // Pass user ID in customData for V2 webhooks
      },
      settings: {
        displayMode: 'overlay',
        theme: 'dark', // Or 'light'
      },
      success: (data: any) => {
        console.log("Paddle Checkout Success (V2):", data);
        toast.success("Subscription successful! Thank you for upgrading.");
        // In a real application, you would typically verify this with a webhook
        // and update the user's subscription status in your database.
      },
      close: () => {
        console.log("Paddle Checkout Closed (V2).");
        toast.info("Checkout closed. You can upgrade anytime!");
      },
    });
  };

  return (
    <Button onClick={handleCheckout} className={className} variant={variant}>
      {children}
    </Button>
  );
};

export default PaddleCheckoutButton;