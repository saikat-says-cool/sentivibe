import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Theme is now fixed to 'light'
type Theme = "light";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void; // Still present but will not be used for switching
}

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light", // Default to 'light'
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Always return 'light' as the theme is fixed
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove all known theme-related classes
    root.classList.remove(
      "light", "dark",
      "theme-emerald", "theme-crimson", "theme-yellow", "theme-cyan",
      "theme-deep-blue", "theme-forest-green", "theme-purple-haze"
    );

    // Always apply the light class
    root.classList.add("light");
    // No custom theme classes needed for a fixed light theme
  }, [theme]); // Keep theme in dependency array for consistency, though it's fixed

  const setTheme = (theme: Theme) => {
    // This function will no longer change the theme, but we keep it for interface consistency
    localStorage.setItem(storageKey, theme);
    setThemeState(theme);
  };

  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};