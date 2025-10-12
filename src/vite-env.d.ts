/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_PADDLE_VENDOR_ID: string;
  readonly VITE_PADDLE_CLIENT_SIDE_TOKEN: string;
  readonly VITE_PADDLE_PRODUCT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Explicitly augment the Window interface for Paddle Classic (V1)
interface Window {
  Paddle: {
    Setup: (options: {
      vendor: number;
      token?: string; // Token is not required for Setup, but can be passed for some features
    }) => void;
    Checkout: {
      open: (options: {
        product?: string; // V1 product ID (numerical)
        product_id?: string; // Alias for product
        vendor?: number;
        vendor_id?: number; // Alias for vendor
        passthrough?: string;
        customer_email?: string;
        successCallback?: (data: any) => void;
        closeCallback?: () => void;
        // Add other V1 options as needed
      }) => void;
    };
  }
}