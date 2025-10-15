/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_PADDLE_VENDOR_ID: string; // V1 specific, but keeping for now if needed elsewhere
  readonly VITE_PADDLE_CLIENT_SIDE_TOKEN: string;
  readonly VITE_PADDLE_PRODUCT_ID: string; // This will now be a V2 Price ID
  readonly VITE_GOOGLE_SEARCH_API_KEY: string; // New: Google Custom Search API Key
  readonly VITE_GOOGLE_SEARCH_ENGINE_ID: string; // New: Google Custom Search Engine ID
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Removed explicit augmentation of the Window interface for Paddle
// as direct client-side SDK interaction is no longer needed for checkout.