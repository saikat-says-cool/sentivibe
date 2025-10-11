import React, { useState, useEffect } from 'react';
import { useAuth } from '@/integrations/supabase/auth';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { showSuccess, showError } from '@/utils/toast';
import { Loader2, LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Zod schema for form validation
const profileFormSchema = z.object({
  first_name: z.string().min(1, { message: "First name is required." }).max(50, { message: "First name cannot exceed 50 characters." }).optional().or(z.literal('')),
  last_name: z.string().min(1, { message: "Last name is required." }).max(50, { message: "Last name cannot exceed 50 characters." }).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const AccountCenter = () => {
  const { user, subscriptionTier, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
    },
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setIsProfileLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error("Error fetching profile:", error);
          showError("Failed to load profile data.");
        } else if (data) {
          form.reset({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
          });
        }
        setIsProfileLoading(false);
      }
    };

    if (!isAuthLoading && user) {
      fetchProfile();
    } else if (!isAuthLoading && !user) {
      // If not authenticated, redirect to login
      navigate('/login');
    }
  }, [user, isAuthLoading, navigate, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) {
      showError("You must be logged in to update your profile.");
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: values.first_name,
        last_name: values.last_name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error("Error updating profile:", error);
      showError("Failed to update profile: " + error.message);
    } else {
      showSuccess("Profile updated successfully!");
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
      showError("Failed to log out: " + error.message);
    } else {
      showSuccess("You have been logged out.");
      navigate('/login');
    }
  };

  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading account details...</span>
      </div>
    );
  }

  if (!user) {
    return null; // Should be redirected by useEffect
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <UserIcon className="h-6 w-6 text-primary" /> Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input type="email" value={user.email || ''} disabled className="bg-gray-100 dark:bg-gray-700" />
          </div>

          <div className="grid gap-2">
            <Label>Subscription Tier</Label>
            <Input type="text" value={subscriptionTier?.toUpperCase() || 'N/A'} disabled className="bg-gray-100 dark:bg-gray-700" />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>

          <Button variant="destructive" onClick={handleLogout} className="w-full flex items-center gap-2 mt-6">
            <LogOut className="h-4 w-4" /> Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountCenter;