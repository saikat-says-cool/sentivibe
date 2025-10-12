-- Drop the copilot_queries_log table
DROP TABLE IF EXISTS public.copilot_queries_log;

-- Remove the copilot_queries_count column from anon_usage
ALTER TABLE public.anon_usage
DROP COLUMN IF EXISTS copilot_queries_count;

-- Update RLS policy for anon_usage if it referenced copilot_queries_count
-- The existing policy "Allow Edge Functions to manage anon usage" ON public.anon_usage FOR ALL USING (true) is broad enough and doesn't need modification.