import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/integrations/supabase/auth';
import { ModeToggle } from './ModeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { session, user } = useAuth();
  const navigate = useNavigate();

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
                <Link 
                  to="/library" 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 hover:bg-accent hover:text-accent-foreground"
                >
                  Analysis Library
                </Link>
              </li>
            </>
          )}
        </ul>
        <ModeToggle />
        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                <UserCircle className="h-6 w-6" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                {user?.email || "My Account"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/my-analyses">My Analyses</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/account">Account Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild>
            <Link to="/login">Login</Link>
          </Button>
        )}
      </nav>
    </header>
  );
};

export default Header;