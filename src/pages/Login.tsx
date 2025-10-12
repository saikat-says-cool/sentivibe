import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/'); // Redirect to home if already logged in
    }
  }, [session, navigate]);

  // Set SEO-optimized browser tab title
  useEffect(() => {
    document.title = "Login / Sign Up - SentiVibe";
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-lg shadow-lg border border-border">
        <h2 className="text-2xl font-bold text-center mb-6 text-foreground">
          Welcome to SentiVibe
        </h2>
        <Auth
          supabaseClient={supabase}
          // Added Google provider
          providers={['google']}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--accent))', // Using accent color for brand
                  brandAccent: 'hsl(var(--accent-foreground))', // Using accent-foreground
                  // Adjust other colors to match SentiVibe dark theme
                  defaultButtonBackground: 'hsl(var(--secondary))',
                  defaultButtonBackgroundHover: 'hsl(var(--secondary-foreground))',
                  defaultButtonBorder: 'hsl(var(--border))',
                  defaultButtonText: 'hsl(var(--foreground))',
                  inputBackground: 'hsl(var(--input))',
                  inputBorder: 'hsl(var(--border))',
                  inputText: 'hsl(var(--foreground))',
                  inputLabelText: 'hsl(var(--muted-foreground))',
                  anchorTextColor: 'hsl(var(--accent))',
                  anchorTextHoverColor: 'hsl(var(--accent-foreground))',
                },
              },
            },
          }}
          theme="dark" // Set theme to dark
          redirectTo={window.location.origin + '/'}
          magicLink={true}
        />
      </div>
    </div>
  );
};

export default Login;