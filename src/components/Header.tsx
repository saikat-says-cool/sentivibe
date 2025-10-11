import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/integrations/supabase/auth';
import { ModeToggle } from './ModeToggle';
import MobileNav from './MobileNav';

const Header = () => {
  const { session, subscriptionStatus, subscriptionPlanId } = useAuth(); // Get subscription info

  // const isPaidTier = subscriptionStatus === 'active' && subscriptionPlanId !== 'free'; // Removed as no longer used
  // const showUpgradeButton = session && !isPaidTier; // Removed as no longer used
  const showAuthButtons = !session; // Show Sign In/Sign Up if not logged in

  return (
    <header className="bg-background border-b border-border p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <MobileNav />
        <Link to="/" className="flex items-center space-x-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-heading">
            <span className="text-foreground">Senti</span>
            <span className="text-accent">Vibe</span>
          </h1>
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <nav className="hidden md:flex items-center space-x-4">
          <ul className="flex space-x-4">
            <li>
              <Link 
                to="/analyze-video" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 hover:bg-accent hover:text-accent-foreground"
              >
                Analyze a Video
              </Link>
            </li>
            <li>
              <Link 
                to="/library" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 hover:bg-accent hover:text-accent-foreground"
              >
                Analysis Library
              </Link>
            </li>
            <li>
              <Link 
                to="/create-multi-comparison" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 hover:bg-accent hover:text-accent-foreground"
              >
                Compare Videos
              </Link>
            </li>
            <li>
              <Link 
                to="/multi-comparison-library" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 hover:bg-accent hover:text-accent-foreground"
              >
                Comparison Library
              </Link>
            </li>
            {session && (
              <li>
                <Link 
                  to="/my-analyses" 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 hover:bg-accent hover:text-accent-foreground"
                >
                  My Analyses
                </Link>
              </li>
            )}
            {/* Removed Pricing & Upgrade link */}
            <li>
              <Link 
                to="/how-it-works" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 hover:bg-accent hover:text-accent-foreground"
              >
                How It Works
              </Link>
            </li>
            <li>
              <Link 
                to="/about-us" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 hover:bg-accent hover:text-accent-foreground"
              >
                About Us
              </Link>
            </li>
          </ul>
        </nav>
        {showAuthButtons && (
          <Link to="/login">
            <Button variant="outline" className="ml-4">Sign In / Sign Up</Button>
          </Link>
        )}
        {/* Removed Upgrade button from header as pricing is now on index */}
        <ModeToggle />
      </div>
    </header>
  );
};

export default Header;