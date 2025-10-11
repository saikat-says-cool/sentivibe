import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './client';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  subscriptionTier: string | null; // Added subscriptionTier to context type
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null); // State for subscription tier

  useEffect(() => {
    const getSessionAndProfile = async () => {
      setIsLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
        setSession(null);
        setUser(null);
        setSubscriptionTier('guest'); // Default to guest if no session
        setIsLoading(false);
        return;
      }

      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error("Error fetching profile:", profileError);
          setSubscriptionTier('free'); // Default to 'free' if profile fetch fails (but user is authenticated)
        } else if (profile) {
          setSubscriptionTier(profile.subscription_tier);
        } else {
          // If no profile found but user is authenticated, default to 'free' as per database default
          setSubscriptionTier('free');
        }
      } else {
        // If no user session, it's a guest
        setSubscriptionTier('guest');
      }
      setIsLoading(false);
    };

    getSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching profile on auth state change:", profileError);
          setSubscriptionTier('free');
        } else if (profile) {
          setSubscriptionTier(profile.subscription_tier);
        } else {
          setSubscriptionTier('free');
        }
      } else {
        setSubscriptionTier('guest');
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []); // Empty dependency array to run once on mount

  return (
    <AuthContext.Provider value={{ session, user, isLoading, subscriptionTier }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};