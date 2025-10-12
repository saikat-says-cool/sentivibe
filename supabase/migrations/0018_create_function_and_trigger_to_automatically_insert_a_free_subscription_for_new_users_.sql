-- Create function to insert a default 'free' subscription when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.subscriptions (id, status, plan_id)
  VALUES (new.id, 'active', 'free'); -- Default to active free plan
  RETURN new;
END;
$$;

-- Trigger the function on user creation
-- Drop if exists to prevent errors on re-execution
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();