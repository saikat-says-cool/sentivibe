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
          {session && (
            <>
              <li>
                <Button asChild variant="ghost">
                  <Link to="/library">Analysis Library</Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="ghost">
                  <Link to="/my-analyses">My Analyses</Link> {/* New link */}
                </Button>
              </li>
            </>
          )}
        </ul>
        <ModeToggle />
      </nav>
    </header>
  );
};

export default Header;