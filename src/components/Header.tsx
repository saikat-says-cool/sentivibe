import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/integrations/supabase/auth';

const Header = () => {
  const { session } = useAuth();

  return (
    <header className="bg-background border-b border-border p-4 flex items-center justify-between">
      <Link to="/" className="flex items-center space-x-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">SentiVibe</h1>
      </Link>
      <nav>
        <ul className="flex space-x-4">
          {session && (
            <li>
              <Button asChild variant="ghost">
                <Link to="/library">Analysis Library</Link>
              </Button>
            </li>
          )}
          {/* You can add other navigation links or user info here later */}
        </ul>
      </nav>
    </header>
  );
};

export default Header;