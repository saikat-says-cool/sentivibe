import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/integrations/supabase/auth"; // Import useAuth

export function ModeToggle() {
  const { setTheme, availableThemes } = useTheme();
  const { subscriptionTier } = useAuth();

  const isProUser = subscriptionTier === 'pro';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableThemes.map((themeOption) => (
          <DropdownMenuItem key={themeOption} onClick={() => setTheme(themeOption)}>
            {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
            {!isProUser && themeOption !== 'light' && themeOption !== 'dark' && themeOption !== 'system' && (
              <span className="ml-2 text-xs text-muted-foreground">(Pro)</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}