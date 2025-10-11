/// <reference lib="deno.ns" />
// @deno-types="https://deno.land/std@0.190.0/http/server.d.ts"
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @deno-types="https://esm.sh/@supabase/supabase-js@2.45.0/dist/module.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define tier limits (matching backend for consistency)
const FREE_TIER_LIMITS = {
  dailyAnalyses: 2,
  dailyComparisons: 1,
  dailyCopilotQueries: 5,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    let { data: anonUsage, error: anonError } = await supabaseClient
      .from('anon_usage')
      .select('*')
      .eq('ip_address', clientIp)
      .single();

    if (anonError && anonError.code !== 'PGRST116') {
      console.error("Error fetching anon usage in get-anon-usage:", anonError);
      return new Response(JSON.stringify({ error: 'Failed to fetch anonymous usage data.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    if (!anonUsage || new Date(anonUsage.last_reset_at) < twentyFourHoursAgo) {
      // If no usage found or it's stale, return reset counts
      return new Response(JSON.stringify({
        analyses_count: 0,
        comparisons_count: 0,
        copilot_queries_count: 0,
        limits: FREE_TIER_LIMITS,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({
      analyses_count: anonUsage.analyses_count,
      comparisons_count: anonUsage.comparisons_count,
      copilot_queries_count: anonUsage.copilot_queries_count,
      limits: FREE_TIER_LIMITS,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Edge Function error (get-anon-usage):', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});