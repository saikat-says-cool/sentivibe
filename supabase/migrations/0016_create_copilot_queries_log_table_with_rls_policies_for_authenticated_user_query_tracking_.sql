-- Create copilot_queries_log table
CREATE TABLE public.copilot_queries_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS (REQUIRED)
ALTER TABLE public.copilot_queries_log ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see their own query logs, and insert their own.
-- Edge Functions will handle inserts, but for completeness, we add policies.
CREATE POLICY "Users can view their own copilot query logs" ON public.copilot_queries_log
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own copilot query logs" ON public.copilot_queries_log
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- No update or delete policies needed as logs are append-only.