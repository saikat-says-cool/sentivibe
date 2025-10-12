// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define simplified tier limits (matching frontend for consistency)
const FREE_TIER_LIMITS = {
  dailyAnalyses: 1,
  dailyComparisons: 1,
};

serve(async (req: Request) => { // Explicitly typed 'req' as Request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Extract client IP, handling x-forwarded-for which can be a comma-separated list
    const xForwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = xForwardedFor ? xForwardedFor.split(',')[0].trim() : req.headers.get('x-real-ip') || 'unknown';

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
        limits: FREE_TIER_LIMITS,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({
      analyses_count: anonUsage.analyses_count,
      comparisons_count: anonUsage.comparisons_count,
      limits: FREE_TIER_LIMITS,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: unknown) { // Explicitly typed 'error' as unknown
    console.error('Edge Function error (get-anon-usage):', (error as Error).message); // Cast to Error
    return new Response(JSON.stringify({ error: (error as Error).message }), { // Cast to Error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});