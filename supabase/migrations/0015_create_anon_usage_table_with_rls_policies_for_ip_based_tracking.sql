-- Create anon_usage table
    CREATE TABLE public.anon_usage (
      ip_address TEXT PRIMARY KEY,
      analyses_count INTEGER DEFAULT 0 NOT NULL,
      comparisons_count INTEGER DEFAULT 0 NOT NULL,
      copilot_queries_count INTEGER DEFAULT 0 NOT NULL,
      last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );

    -- Enable RLS (REQUIRED)
    ALTER TABLE public.anon_usage ENABLE ROW LEVEL SECURITY;

    -- Policies: Only the system (via Edge Functions) should modify this table.
    -- For simplicity, we'll allow authenticated users to read their own (if we later link IP to user)
    -- and allow Edge Functions to manage. For now, we'll make it accessible to anon for read
    -- by the Edge Function, but not directly by client-side anon users.
    -- Edge Functions run with service_role key or can bypass RLS if SECURITY DEFINER.
    -- For direct client access, we'd need more complex policies.
    -- For now, we'll assume Edge Functions handle all interactions.
    CREATE POLICY "Allow Edge Functions to manage anon usage" ON public.anon_usage
    FOR ALL USING (true) WITH CHECK (true); -- This is a temporary broad policy for Edge Functions.
                                            -- In production, you'd refine this with specific function roles.