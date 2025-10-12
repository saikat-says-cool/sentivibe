/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_PADDLE_VENDOR_ID: string; // V1 specific, but keeping for now if needed elsewhere
  readonly VITE_PADDLE_CLIENT_SIDE_TOKEN: string;
  readonly VITE_PADDLE_PRODUCT_ID: string; // This will now be a V2 Price ID
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Explicitly augment the Window interface for Paddle Billing (V2)
interface Window {
  Paddle: {
    Initialize: (options: { // Corrected to 'Initialize' (capital 'I')
      environment: 'sandbox' | 'production';
      token: string;
      seller?: {
        id: string;
      };
    }) => Promise<void>;
    Checkout: {
      open: (options: {
        items: Array<{ priceId: string; quantity?: number }>;
        customer?: {
          email?: string;
          id?: string;
        };
        customData?: {
          userId?: string;
        };
        settings?: {
          displayMode?: 'overlay' | 'inline';
          theme?: 'light' | 'dark';
          locale?: string;
          allowQuantity?: boolean;
          showAddTax?: boolean;
          showDiscount?: boolean;
          showPaymentTerms?: boolean;
          showSubscriptionTerms?: boolean;
          showTrialTerms?: boolean;
        };
        success?: (data: any) => void;
        close?: () => void;
      }) => void;
    };
  }
}