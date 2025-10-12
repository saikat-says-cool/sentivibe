import React, { useState, useEffect } from 'react';
import { useAuth } from '@/integrations/supabase/auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserCircle2, Mail, CreditCard, LogOut } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator'; // Added import for Separator

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

const fetchProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, avatar_url')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error("Error fetching profile:", error);
    throw new Error(error.message);
  }
  return data;
};

const AccountCenter = () => {
  const { user, isLoading: isAuthLoading, subscriptionStatus, subscriptionPlanId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const { data: profile, isLoading: isProfileLoading } = useQuery<Profile | null, Error>({ // Removed 'error: profileError'
    queryKey: ['profile', user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user && !isAuthLoading,
  });

  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate('/login');
    }
  }, [user, isAuthLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
    }
  }, [profile]);

  // Set SEO-optimized browser tab title
  useEffect(() => {
    document.title = "Account Center - SentiVibe";
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: async (newProfileData: { first_name: string; last_name: string }) => {
      if (!user) throw new Error("User not authenticated.");
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...newProfileData, updated_at: new Date().toISOString() }, { onConflict: 'id' });

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success("Profile updated successfully!");
    },
    onError: (err: Error) => {
      toast.error(`Failed to update profile: ${err.message}`);
    },
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ first_name: firstName, last_name: lastName });
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Error signing out: ${error.message}`);
    } else {
      toast.success("You have been signed out.");
      queryClient.clear(); // Clear all queries on sign out
      navigate('/login');
    }
  };

  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg text-muted-foreground">Loading account details...</p>
      </div>
    );
  }

  if (!user) {
    // This case should be handled by useEffect redirect, but as a fallback
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <p className="text-lg text-muted-foreground">Please log in to view your account.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
            <UserCircle2 className="h-8 w-8 text-primary" /> Account Center
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url || undefined} alt="User Avatar" />
              <AvatarFallback className="text-4xl font-semibold">{firstName.charAt(0)}{lastName.charAt(0)}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-semibold">{firstName} {lastName}</h2>
            <p className="text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" /> {user.email}
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" /> Subscription Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <p className="text-lg font-medium capitalize">{subscriptionStatus}</p>
              </div>
              <div>
                <Label>Plan</Label>
                <p className="text-lg font-medium capitalize">{subscriptionPlanId.replace(/_/g, ' ')}</p>
              </div>
            </div>
            {subscriptionPlanId === 'free' && (
              <p className="text-muted-foreground">
                You are currently on the Free Tier. <Link to="/upgrade" className="text-blue-500 hover:underline">Upgrade</Link> for more features!
              </p>
            )}
            {subscriptionPlanId !== 'free' && subscriptionStatus === 'active' && (
              <p className="text-muted-foreground">
                Thank you for being a valued subscriber!
              </p>
            )}
          </div>

          <Separator />

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <h3 className="text-xl font-semibold">Update Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={updateProfileMutation.isPending}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={updateProfileMutation.isPending}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Profile
            </Button>
          </form>

          <Separator />

          <Button variant="destructive" onClick={handleSignOut} className="w-full flex items-center gap-2">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountCenter;