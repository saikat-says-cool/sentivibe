declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};
// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
// Removed Node.js crypto import, using Web Crypto API instead

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for backend operations
    const supabaseAdmin = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Retrieve webhook secret from environment variables
    // @ts-ignore
    const webhookSecret = Deno.env.get('PADDLE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('PADDLE_WEBHOOK_SECRET is not set.');
      return new Response(JSON.stringify({ error: 'Webhook secret not configured.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Paddle Billing (V2) webhooks use 'Paddle-Signature' header and JSON body
    const paddleSignature = req.headers.get('Paddle-Signature');
    if (!paddleSignature) {
      return new Response(JSON.stringify({ error: 'No Paddle-Signature header found.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const requestBody = await req.text(); // Read raw body for signature verification

    // Verify the webhook signature using Web Crypto API (HMAC-SHA256 for Paddle V2)
    const [timestampPart, hmacSignaturePart] = paddleSignature.split(';');
    const timestamp = timestampPart.split('=')[1];
    const hmacSignature = hmacSignaturePart.split('=')[1];
    const signedPayload = `${timestamp}:${requestBody}`;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signedPayload)
    );

    const generatedHmac = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (generatedHmac !== hmacSignature) {
      console.warn('Webhook signature mismatch. Request potentially tampered with.');
      return new Response(JSON.stringify({ error: 'Invalid webhook signature.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const webhookData = JSON.parse(requestBody);
    const eventType = webhookData.event_type;
    const data = webhookData.data; // The actual event data

    console.log(`Received Paddle V2 webhook: ${eventType}`);

    // Extract relevant data for subscription management
    const userId = data.custom_data?.userId; // Custom data passed during checkout
    const status = data.status; // e.g., 'active', 'canceled', 'past_due'
    const priceId = data.items?.[0]?.price?.id; // The price ID of the subscribed product
    const nextBillDate = data.current_billing_period?.ends_at; // ISO 8601 format

    if (!userId) {
      console.warn('Webhook received without a userId in custom_data. Cannot update subscription in DB.');
      return new Response(JSON.stringify({ message: 'Webhook processed, but no user ID for DB update.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    let subscriptionStatus: string;
    let subscriptionPlanId: string; // Our internal plan ID

    // Map Paddle status to our internal status
    switch (status) {
      case 'active':
      case 'trialing':
        subscriptionStatus = 'active';
        break;
      case 'canceled':
        subscriptionStatus = 'cancelled';
        break;
      case 'past_due':
        subscriptionStatus = 'past_due';
        break;
      default:
        subscriptionStatus = 'inactive'; // Or a more specific default
    }

    // Map Paddle price ID to our internal plan ID (assuming VITE_PADDLE_PRODUCT_ID is your paid plan's price ID)
    // @ts-ignore
    subscriptionPlanId = (priceId === Deno.env.get('VITE_PADDLE_PRODUCT_ID')) ? 'paid_monthly' : 'free';

    const subscriptionUpdate: {
      status: string;
      plan_id: string;
      current_period_end?: string;
      updated_at: string;
    } = {
      status: subscriptionStatus,
      plan_id: subscriptionPlanId,
      updated_at: new Date().toISOString(),
    };

    if (nextBillDate) {
      subscriptionUpdate.current_period_end = nextBillDate; // Already ISO 8601
    }

    switch (eventType) {
      case 'subscription.activated':
      case 'subscription.updated':
      case 'subscription.past_due':
      case 'subscription.trialing':
        {
          const { error: upsertError } = await supabaseAdmin
            .from('subscriptions')
            .upsert({
              id: userId,
              ...subscriptionUpdate,
              created_at: new Date().toISOString(), // Only set on creation, upsert handles update
            }, { onConflict: 'id' });

          if (upsertError) {
            console.error('Error upserting subscription:', upsertError);
            throw new Error(`Failed to update subscription: ${upsertError.message}`);
          }
          console.log(`Subscription for user ${userId} ${eventType} successfully.`);
        }
        break;

      case 'subscription.canceled':
        {
          const { error: updateError } = await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'cancelled',
              plan_id: 'free', // Revert to free plan on cancellation
              current_period_end: new Date().toISOString(), // Set end date to now
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          if (updateError) {
            console.error('Error updating cancelled subscription:', updateError);
            throw new Error(`Failed to update cancelled subscription: ${updateError.message}`);
          }
          console.log(`Subscription for user ${userId} cancelled successfully.`);
        }
        break;

      default:
        console.log(`Unhandled Paddle V2 event: ${eventType}`);
        break;
    }

    return new Response(JSON.stringify({ message: 'Webhook processed successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: unknown) {
    console.error('Paddle Webhook Handler error:', (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});