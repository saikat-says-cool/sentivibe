import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light" | "system" | "emerald" | "crimson" | "yellow" | "cyan"; // Added new themes

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove all known theme-related classes
    root.classList.remove("light", "dark", "theme-emerald", "theme-crimson", "theme-yellow", "theme-cyan");

    const systemMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

    if (theme === "system") {
      root.classList.add(systemMode);
    } else if (theme === "light" || theme === "dark") {
      root.classList.add(theme);
    } else { // Custom theme like "emerald", "crimson", "yellow", "cyan"
      // Apply the base light/dark class first, then the custom theme class
      root.classList.add(systemMode); // This ensures .dark .theme-emerald styles apply correctly
      root.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  const setTheme = (theme: Theme) => {
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