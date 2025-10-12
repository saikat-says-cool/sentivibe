/// <reference lib="deno.env" />
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};
// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
// @ts-ignore
import CryptoJS from 'https://esm.sh/crypto-js@4.2.0';

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

    // Paddle Classic webhooks are x-www-form-urlencoded and include a p_signature header
    const signature = req.headers.get('X-Paddle-Signature');
    if (!signature) {
      return new Response(JSON.stringify({ error: 'No Paddle signature found.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const textBody = await req.text(); // Read raw body for signature verification

    // Verify the webhook signature
    // Paddle Classic signature verification involves sorting parameters and hashing
    const payload = new URLSearchParams(textBody);
    const sortedParams = Array.from(payload.entries())
      .filter(([key]) => key !== 'p_signature') // Exclude the signature itself
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([, value]) => value); // Get only values in sorted order

    const signString = sortedParams.join('');
    const hmac = CryptoJS.HmacSHA256(signString, webhookSecret);
    const generatedSignature = CryptoJS.enc.Base64.stringify(hmac);

    if (generatedSignature !== signature) {
      console.warn('Webhook signature mismatch. Request potentially tampered with.');
      return new Response(JSON.stringify({ error: 'Invalid webhook signature.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Parse the payload into a usable object
    const webhookData: Record<string, string> = {};
    for (const [key, value] of payload.entries()) {
      webhookData[key] = value;
    }

    const alertName = webhookData.alert_name;
    const userId = webhookData.passthrough ? JSON.parse(webhookData.passthrough).userId : null;
    const paddleSubscriptionId = webhookData.subscription_id;
    const paddlePlanId = webhookData.plan_id; // This is Paddle's plan ID, not our 'free'/'paid_monthly'
    const paddleStatus = webhookData.status;
    const nextBillDate = webhookData.next_bill_date; // YYYY-MM-DD format

    console.log(`Received Paddle webhook: ${alertName} for user: ${userId || 'N/A'} (Paddle Sub ID: ${paddleSubscriptionId})`);

    let subscriptionStatus: string;
    let subscriptionPlanId: string; // Our internal plan ID

    // Map Paddle status to our internal status
    switch (paddleStatus) {
      case 'active':
      case 'trialing':
        subscriptionStatus = 'active';
        break;
      case 'past_due':
        subscriptionStatus = 'past_due';
        break;
      case 'cancelled':
        subscriptionStatus = 'cancelled';
        break;
      default:
        subscriptionStatus = 'inactive'; // Or a more specific default
    }

    // Map Paddle plan ID to our internal plan ID (assuming a single paid plan for now)
    // You might need more complex logic here if you have multiple Paddle plans
    subscriptionPlanId = (paddlePlanId === Deno.env.get('VITE_PADDLE_PRODUCT_ID')) ? 'paid_monthly' : 'free';

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
      // Paddle's next_bill_date is YYYY-MM-DD, convert to ISO string for TIMESTAMP WITH TIME ZONE
      subscriptionUpdate.current_period_end = new Date(nextBillDate).toISOString();
    }

    if (!userId) {
      console.warn('Webhook received without a userId in passthrough. Cannot update subscription in DB.');
      return new Response(JSON.stringify({ message: 'Webhook processed, but no user ID for DB update.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    switch (alertName) {
      case 'subscription_created':
      case 'subscription_updated':
      case 'subscription_payment_succeeded':
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
          console.log(`Subscription for user ${userId} ${alertName === 'subscription_created' ? 'created' : 'updated'} successfully.`);
        }
        break;

      case 'subscription_cancelled':
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
        console.log(`Unhandled Paddle alert: ${alertName}`);
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