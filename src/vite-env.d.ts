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

// Explicitly augment the Window interface
interface Window {
  Paddle: {
    Setup: (options: { vendor: number }) => void;
    Checkout: {
      open: (options: {
        product: string;
        email?: string;
        customer_email?: string;
        successCallback?: (data: any) => void;
        closeCallback?: () => void;
        passthrough?: string;
        allow_quantity?: boolean;
        quantity?: number;
        coupon?: string;
        locale?: string;
        override?: string;
        disable_icon?: boolean;
        theme?: string;
        referring_domain?: string;
        marketing_consent?: string;
        vat_number?: string;
        vat_country?: string;
        vat_state?: string;
        vat_city?: string;
        vat_zip?: string;
        vat_street?: string;
        vat_company_name?: string;
        vat_first_name?: string;
        vat_last_name?: string;
        vat_address?: string;
        vat_country_code?: string;
        vat_state_code?: string;
        vat_city_code?: string;
        vat_zip_code?: string;
        vat_street_code?: string;
        vat_company_name_code?: string;
        vat_first_name_code?: string;
        vat_last_name_code?: string;
        vat_address_code?: string;
      }) => void;
    };
  }
}