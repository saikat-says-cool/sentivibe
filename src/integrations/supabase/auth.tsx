import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User, PostgrestError } from '@supabase/supabase-js'; // Import PostgrestError
import { supabase } from './client';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  subscriptionStatus: string; // Added subscription status
  subscriptionPlanId: string; // Added subscription plan ID
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('free'); // Default to 'free'
  const [subscriptionPlanId, setSubscriptionPlanId] = useState<string>('free'); // Default to 'free'

  useEffect(() => {
    const getSessionAndSubscription = async () => {
      setIsLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Error getting session:", sessionError);
      }
      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('status, plan_id')
          .eq('id', session.user.id)
          .single();

        if (subscriptionError && (subscriptionError as PostgrestError).code !== 'PGRST116') { // PGRST116 means no rows found
          console.error("Error fetching subscription:", subscriptionError);
          // Fallback to free if there's an actual error
          setSubscriptionStatus('free');
          setSubscriptionPlanId('free');
        } else if (subscriptionData) {
          setSubscriptionStatus(subscriptionData.status);
          setSubscriptionPlanId(subscriptionData.plan_id);
        } else {
          // If no subscription found (PGRST116), ensure it's set to 'free'
          setSubscriptionStatus('free');
          setSubscriptionPlanId('free');
        }
      } else {
        // If no user, ensure subscription status is 'free'
        setSubscriptionStatus('free');
        setSubscriptionPlanId('free');
      }
      setIsLoading(false);
    };

    getSessionAndSubscription();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // When auth state changes, re-fetch session and subscription
      getSessionAndSubscription();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, isLoading, subscriptionStatus, subscriptionPlanId }}>
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