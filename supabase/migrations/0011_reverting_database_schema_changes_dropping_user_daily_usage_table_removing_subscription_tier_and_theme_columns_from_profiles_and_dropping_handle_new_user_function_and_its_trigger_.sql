-- Drop policies related to user_daily_usage
DROP POLICY IF EXISTS "Users can update their own daily usage" ON public.user_daily_usage;
DROP POLICY IF EXISTS "Users can insert their own daily usage" ON public.user_daily_usage;
DROP POLICY IF EXISTS "Users can view their own daily usage" ON public.user_daily_usage;
DROP POLICY IF EXISTS "Users can delete their own daily usage" ON public.user_daily_usage;

-- Drop the user_daily_usage table
DROP TABLE IF EXISTS public.user_daily_usage;

-- Drop the trigger for handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the handle_new_user function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Remove subscription_tier column from profiles
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS subscription_tier;

-- Remove theme column from profiles
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS theme;