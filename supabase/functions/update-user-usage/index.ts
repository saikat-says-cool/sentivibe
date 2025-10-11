// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define daily limits for PDF downloads per tier
const FREE_PDF_DOWNLOAD_LIMIT = 1;

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // @ts-ignore
    const supabaseClient = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user authentication
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Fetch user's subscription tier
    let subscriptionTier: string = 'free'; // Default to 'free' if profile not found
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error("Error fetching user profile for tier:", profileError);
      // Continue with default 'free' tier if there's an error fetching profile
    } else if (profile) {
      subscriptionTier = profile.subscription_tier;
    }

    const { type } = await req.json(); // Expecting { type: 'pdf_download' }

    if (!type) {
      return new Response(JSON.stringify({ error: 'Usage type is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // --- Tiered Access and Limits for PDF Downloads ---
    if (subscriptionTier === 'guest') {
      return new Response(JSON.stringify({ 
        error: 'PDF download is not available for guest users. Please log in or sign up.',
        code: 'PDF_DOWNLOAD_ACCESS_DENIED'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403, // Forbidden
      });
    }

    if (type === 'pdf_download' && subscriptionTier === 'free') {
      const { data: usageData, error: usageError } = await supabaseClient
        .from('user_daily_usage')
        .select('pdf_downloads_count')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (usageError && usageError.code !== 'PGRST116') {
        console.error("Error fetching daily PDF usage:", usageError);
        return new Response(JSON.stringify({ error: 'Failed to check daily PDF download limits.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      const currentPdfDownloads = usageData?.pdf_downloads_count || 0;
      if (currentPdfDownloads >= FREE_PDF_DOWNLOAD_LIMIT) {
        return new Response(JSON.stringify({ 
          error: `Daily PDF download limit exceeded for Free tier. You can download ${FREE_PDF_DOWNLOAD_LIMIT} PDF per day. Please upgrade to Pro for unlimited downloads.`,
          code: 'PDF_DOWNLOAD_LIMIT_EXCEEDED'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403, // Forbidden
        });
      }
    }
    // --- End Tiered Access and Limits ---

    // --- Update Daily Usage Count ---
    let updateObject: { [key: string]: any } = {
      user_id: user.id,
      date: today,
      updated_at: new Date().toISOString(),
    };

    if (type === 'pdf_download') {
      // Increment pdf_downloads_count
      const { data: existingUsage, error: fetchExistingError } = await supabaseClient
        .from('user_daily_usage')
        .select('pdf_downloads_count')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (fetchExistingError && fetchExistingError.code !== 'PGRST116') {
        console.error("Error fetching existing usage for increment:", fetchExistingError);
        return new Response(JSON.stringify({ error: 'Failed to fetch existing usage for increment.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
      updateObject.pdf_downloads_count = (existingUsage?.pdf_downloads_count || 0) + 1;
    } else {
      // If other types of usage are added later, handle them here.
      // For now, if type is not 'pdf_download', we don't increment anything specific.
      return new Response(JSON.stringify({ error: 'Unsupported usage type' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const { error: upsertError } = await supabaseClient
      .from('user_daily_usage')
      .upsert(updateObject, { onConflict: 'user_id,date' });

    if (upsertError) {
      console.error("Error updating daily usage count:", upsertError);
      return new Response(JSON.stringify({ error: 'Failed to update daily usage count.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ message: `Usage for ${type} updated successfully.`, subscriptionTier: subscriptionTier }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Edge Function error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});