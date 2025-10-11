import React from 'react';
import { useAuth } from '@/integrations/supabase/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface AdBannerProps {
  location: string; // e.g., 'top', 'bottom', 'sidebar', 'inline'
}

const AdBanner: React.FC<AdBannerProps> = ({ location }) => {
  const { subscriptionTier, isLoading: isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return null; // Don't render anything while auth is loading
  }

  // Ads are shown for 'guest' and 'free' tiers
  const shouldShowAd = subscriptionTier === 'guest' || subscriptionTier === 'free';

  if (!shouldShowAd) {
    return null; // No ads for 'pro' users
  }

  return (
    <div className="my-4 p-2 bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-md text-center">
      <Alert className="bg-transparent border-none text-center flex flex-col items-center justify-center">
        <Info className="h-5 w-5 text-blue-500 mb-2" />
        <AlertTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Advertisement ({location})</AlertTitle>
        <AlertDescription className="text-xs text-gray-600 dark:text-gray-400">
          This is a placeholder for an ad. Replace this with your actual ad code from Google AdSense or similar.
          <br />
          <span className="font-medium">Current Tier: {subscriptionTier.toUpperCase()}</span>
        </AlertDescription>
        {/* Placeholder for actual ad code */}
        <div className="mt-2 w-full h-24 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm rounded-sm">
          [Your Ad Code Here]
        </div>
      </Alert>
    </div>
  );
};

export default AdBanner;