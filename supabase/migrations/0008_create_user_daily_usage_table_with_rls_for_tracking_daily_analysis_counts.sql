-- Create user_daily_usage table
CREATE TABLE public.user_daily_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  analyses_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE (user_id, date) -- Ensure only one entry per user per day
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.user_daily_usage ENABLE ROW LEVEL SECURITY;

-- Create secure policies for each operation
CREATE POLICY "Users can view their own daily usage" ON public.user_daily_usage 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily usage" ON public.user_daily_usage 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily usage" ON public.user_daily_usage 
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily usage" ON public.user_daily_usage 
FOR DELETE TO authenticated USING (auth.uid() = user_id);