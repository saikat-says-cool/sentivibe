import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/integrations/supabase/auth';
// ModeToggle is removed from here, it will be in Header directly

interface MobileNavProps {
  onLinkClick?: () => void; // Optional callback for when a link is clicked
}

const MobileNav: React.FC<MobileNavProps> = ({ onLinkClick }) => {
  const { session } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLinkClick = () => {
    setIsOpen(false); // Close the sheet when a link is clicked
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          {/* Ensure Button has only ONE direct child */}
          <span className="flex items-center justify-center">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[250px] sm:w-[300px] flex flex-col">
        <nav className="flex flex-col gap-4 py-6">
          <Link to="/" className="flex items-center space-x-2 mb-4" onClick={handleLinkClick}>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-heading">
              <span className="text-foreground">Senti</span>
              <span className="text-accent">Vibe</span>
            </h1>
          </Link>
          <ul className="flex flex-col gap-2">
            <li>
              <Link 
                to="/analyze-video" 
                className="block px-4 py-2 text-lg font-medium hover:bg-accent hover:text-accent-foreground rounded-md"
                onClick={handleLinkClick}
              >
                Analyze a Video
              </Link>
            </li>
            <li>
              <Link 
                to="/library" 
                className="block px-4 py-2 text-lg font-medium hover:bg-accent hover:text-accent-foreground rounded-md"
                onClick={handleLinkClick}
              >
                Analysis Library
              </Link>
            </li>
            <li>
              <Link 
                to="/create-multi-comparison" 
                className="block px-4 py-2 text-lg font-medium hover:bg-accent hover:text-accent-foreground rounded-md"
                onClick={handleLinkClick}
              >
                Compare Videos
              </Link>
            </li>
            <li>
              <Link 
                to="/multi-comparison-library" 
                className="block px-4 py-2 text-lg font-medium hover:bg-accent hover:text-accent-foreground rounded-md"
                onClick={handleLinkClick}
              >
                Comparison Library
              </Link>
            </li>
            {session && (
              <li>
                <Link 
                  to="/my-analyses" 
                  className="block px-4 py-2 text-lg font-medium hover:bg-accent hover:text-accent-foreground rounded-md"
                  onClick={handleLinkClick}
                >
                  My Analyses
                </Link>
              </li>
            )}
            <li>
              <Link 
                to="/pricing" 
                className="block px-4 py-2 text-lg font-medium hover:bg-accent hover:text-accent-foreground rounded-md"
                onClick={handleLinkClick}
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link 
                to="/how-it-works" 
                className="block px-4 py-2 text-lg font-medium hover:bg-accent hover:text-accent-foreground rounded-md"
                onClick={handleLinkClick}
              >
                How It Works
              </Link>
            </li>
            <li>
              <Link 
                to="/about-us" 
                className="block px-4 py-2 text-lg font-medium hover:bg-accent hover:text-accent-foreground rounded-md"
                onClick={handleLinkClick}
              >
                About Us
              </Link>
            </li>
          </ul>
        </nav>
        {/* ModeToggle is no longer here */}
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;