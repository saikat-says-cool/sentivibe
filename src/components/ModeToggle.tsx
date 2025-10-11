import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {/* Wrap children in a single span to resolve React.Children.only error */}
          <span>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Removed Light option */}
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("emerald")}>
          Emerald
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("crimson")}>
          Crimson
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("yellow")}>
          Yellow
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("cyan")}>
          Cyan
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("deep-blue")}>
          Deep Blue
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("forest-green")}>
          Forest Green
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("purple-haze")}>
          Purple Haze
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}