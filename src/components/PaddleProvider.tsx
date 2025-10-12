import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { toast } from 'sonner';

interface PaddleContextType {
  isPaddleInitialized: boolean;
}

const PaddleContext = createContext<PaddleContextType | undefined>(undefined);

export const PaddleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPaddleInitialized, setIsPaddleInitialized] = useState(false);

  useEffect(() => {
    const initializePaddleSDK = async () => {
      if (typeof window.Paddle !== 'undefined' && !isPaddleInitialized) {
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

    // Ensure Paddle.js script is loaded before attempting to initialize
    if (document.readyState === 'complete') {
      initializePaddleSDK();
    } else {
      window.addEventListener('load', initializePaddleSDK);
      return () => window.removeEventListener('load', initializePaddleSDK);
    }
  }, [isPaddleInitialized]);

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