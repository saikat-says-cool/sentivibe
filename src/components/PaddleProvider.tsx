import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { toast } from 'sonner';

interface PaddleContextType {
  isPaddleInitialized: boolean;
}

const PaddleContext = createContext<PaddleContextType | undefined>(undefined);

export const PaddleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPaddleInitialized, setIsPaddleInitialized] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    console.log("PaddleProvider: Script loading effect triggered.");
    // Load Paddle.js script dynamically
    if (!isScriptLoaded) {
      const script = document.createElement('script');
      script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      script.async = true;
      script.onload = () => {
        setIsScriptLoaded(true);
        console.log("Paddle Billing (V2) SDK script loaded. Current window.Paddle:", window.Paddle);
      };
      script.onerror = (e) => {
        console.error("Failed to load Paddle Billing (V2) SDK script:", e);
        toast.error("Failed to load payment system script. Please check your internet connection.");
      };
      document.head.appendChild(script);

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, [isScriptLoaded]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    const attemptInitialization = async () => {
      console.log(`PaddleProvider: Attempting initialization. isScriptLoaded: ${isScriptLoaded}, typeof window.Paddle: ${typeof window.Paddle}, typeof window.Paddle?.initialize: ${typeof window.Paddle?.initialize}, isPaddleInitialized: ${isPaddleInitialized}`);

      if (isScriptLoaded && typeof window.Paddle !== 'undefined' && typeof window.Paddle.initialize === 'function' && !isPaddleInitialized) {
        clearInterval(intervalId); // Stop polling
        console.log("PaddleProvider: Paddle.initialize function found. Attempting to call initialize.");
        try {
          await window.Paddle.initialize({
            environment: 'sandbox', // Use 'sandbox' for testing
            token: import.meta.env.VITE_PADDLE_CLIENT_SIDE_TOKEN,
          });
          setIsPaddleInitialized(true);
          console.log("Paddle Billing (V2) SDK initialized successfully.");
        } catch (error) {
          console.error("Failed to initialize Paddle Billing (V2) SDK during call:", error);
          toast.error("Failed to initialize payment system. Please try again later.");
        }
      } else if (isScriptLoaded && typeof window.Paddle !== 'undefined' && typeof window.Paddle.initialize !== 'function') {
        console.warn("PaddleProvider: Paddle object found, but Paddle.initialize is not a function yet. Retrying...");
      }
    };

    if (isScriptLoaded && !isPaddleInitialized) {
      intervalId = setInterval(attemptInitialization, 100); // Poll every 100ms
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isScriptLoaded, isPaddleInitialized]);

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