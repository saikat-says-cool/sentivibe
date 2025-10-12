import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { toast } from 'sonner';

interface PaddleContextType {
  isPaddleInitialized: boolean;
}

const PaddleContext = createContext<PaddleContextType | undefined>(undefined);

export const PaddleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPaddleInitialized, setIsPaddleInitialized] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    const tryInitializePaddle = async () => {
      // Check if Paddle.js is loaded and the initialize function is available
      if (typeof window.Paddle !== 'undefined' && typeof window.Paddle.initialize === 'function' && !isPaddleInitialized) {
        clearInterval(intervalId); // Stop polling once found
        try {
          await window.Paddle.initialize({
            environment: 'sandbox', // Use 'sandbox' for testing
            token: import.meta.env.VITE_PADDLE_CLIENT_SIDE_TOKEN,
          });
          setIsPaddleInitialized(true);
          console.log("Paddle Billing (V2) SDK initialized successfully.");
        } catch (error) {
          console.error("Failed to initialize Paddle Billing (V2) SDK:", error);
          toast.error("Failed to initialize payment system. Please try again later.");
        }
      }
    };

    // Start polling for Paddle.initialize to become available
    intervalId = setInterval(tryInitializePaddle, 100); // Check every 100ms

    // Clean up interval on component unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPaddleInitialized]); // Only re-run if initialization status changes

  return (
    <PaddleContext.Provider value={{ isPaddleInitialized }}>
      {children}
    </PaddleContext.Provider>
  );
};

export const usePaddle = () => {
  const context = useContext(PaddleContext);
  if (context === undefined) {
    throw new Error('usePaddle must be used within a PaddleProvider');
  }
  return context;
};