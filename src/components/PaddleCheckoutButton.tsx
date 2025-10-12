import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/integrations/supabase/auth';
import { toast } from 'sonner';

interface PaddleCheckoutButtonProps {
  productId: string;
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
    if (typeof window.Paddle === 'undefined') {
      toast.error("Paddle.js is not loaded. Please refresh the page.");
      console.error("Paddle.js is not loaded.");
      return;
    }

    const customerEmail = user?.email || undefined;

    window.Paddle.Checkout.open({
      product: productId,
      customer_email: customerEmail,
      successCallback: (data: any) => {
        console.log("Paddle Checkout Success:", data);
        toast.success("Subscription successful! Thank you for upgrading.");
        // In a real application, you would typically verify this with a webhook
        // and update the user's subscription status in your database.
      },
      closeCallback: () => {
        console.log("Paddle Checkout Closed.");
        toast.info("Checkout closed. You can upgrade anytime!");
      },
      // You can add more options here, e.g., passthrough data, coupon codes, etc.
      // theme: 'dark', // Or 'light'
    });
  };

  return (
    <Button onClick={handleCheckout} className={className} variant={variant}>
      {children}
    </Button>
  );
};

export default PaddleCheckoutButton;