import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/integrations/supabase/auth';
import { ModeToggle } from './ModeToggle';

const Header = () => {
  const { session } = useAuth();

  return (
    <header className="bg-background border-b border-border p-4 flex items-center justify-between">
      <Link to="/" className="flex items-center space-x-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-heading">
          <span className="text-foreground">Senti</span>
          <span className="text-accent">Vibe</span>
        </h1>
      </Link>
      <nav className="flex items-center space-x-4">
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
        </ul>
        <ModeToggle />
      </nav>
    </header>
  );
};

export default Header;