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
    // Load Paddle.js script dynamically
    if (!isScriptLoaded) {
      const script = document.createElement('script');
      script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      script.async = true;
      script.onload = () => {
        setIsScriptLoaded(true);
        console.log("Paddle Billing (V2) SDK script loaded.");
      };
      script.onerror = (e) => {
        console.error("Failed to load Paddle Billing (V2) SDK script:", e);
        toast.error("Failed to load payment system script. Please check your internet connection.");
      };
      document.head.appendChild(script);

      return () => {
        // Clean up script if component unmounts before load
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, [isScriptLoaded]);

  useEffect(() => {
    // Initialize Paddle.js once the script is loaded and Paddle object is available
    if (isScriptLoaded && typeof window.Paddle !== 'undefined' && typeof window.Paddle.initialize === 'function' && !isPaddleInitialized) {
      const initializePaddleSDK = async () => {
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
      };
      initializePaddleSDK();
    }
  }, [isScriptLoaded, isPaddleInitialized]); // Depend on isScriptLoaded and isPaddleInitialized

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