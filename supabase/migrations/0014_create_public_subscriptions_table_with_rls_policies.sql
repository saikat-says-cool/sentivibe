-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'free', -- e.g., 'active', 'inactive', 'trial', 'free'
  plan_id TEXT NOT NULL DEFAULT 'free', -- e.g., 'free', 'paid_monthly', 'paid_annual'
  current_period_end TIMESTAMP WITH TIME ZONE, -- NULL for 'free' plan
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users to manage their own subscriptions
CREATE POLICY "Subscriptions select policy" ON public.subscriptions
FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Subscriptions insert policy" ON public.subscriptions
FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Subscriptions update policy" ON public.subscriptions
FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Subscriptions delete policy" ON public.subscriptions
FOR DELETE TO authenticated USING (auth.uid() = id);

-- Optional: Policy for anon users to see their 'free' status if they somehow get an ID (less common, but good for completeness)
CREATE POLICY "Subscriptions select anon policy" ON public.subscriptions
FOR SELECT TO anon USING (auth.uid() = id);

-- Optional: Policy for anon users to insert their 'free' status (e.g., if a profile is auto-created on first interaction)
CREATE POLICY "Subscriptions insert anon policy" ON public.subscriptions
FOR INSERT TO anon WITH CHECK (auth.uid() = id AND plan_id = 'free');