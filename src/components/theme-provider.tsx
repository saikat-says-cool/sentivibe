// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "system" | "emerald" | "crimson" | "yellow" | "cyan" | "deep-blue" | "forest-green" | "purple-haze"; // Removed 'light', added new dark themes

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
  defaultTheme = "dark", // Default to 'dark' since light mode is disabled
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const storedThemeRaw = localStorage.getItem(storageKey); // Get as string | null

    // If an old 'light' theme was stored, or 'system' (which we now treat as dark),
    // or any other invalid/non-dark theme, default to 'dark'.
    // Otherwise, use the stored dark theme.
    
    // First, handle explicit old 'light' setting or 'system'
    if (storedThemeRaw === "light" || storedThemeRaw === "system") {
      return "dark"; // Force to 'dark' if old 'light' or 'system' was stored
    }

    // Now, check if the storedThemeRaw is one of the *current* valid dark themes.
    // If it is, use it. Otherwise, fall back to defaultTheme ("dark").
    const validThemes: Theme[] = ["dark", "emerald", "crimson", "yellow", "cyan", "deep-blue", "forest-green", "purple-haze"];
    if (storedThemeRaw && validThemes.includes(storedThemeRaw as Theme)) {
      return storedThemeRaw as Theme;
    }

    return defaultTheme; // This is "dark"
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove all known theme-related classes (including old light themes)
    root.classList.remove(
      "light", "dark",
      "theme-emerald", "theme-crimson", "theme-yellow", "theme-cyan",
      "theme-deep-blue", "theme-forest-green", "theme-purple-haze"
    );

    // Always apply the base dark class
    root.classList.add("dark");

    // Apply custom theme class if it's not the default 'dark' or 'system'
    if (theme !== "dark" && theme !== "system") {
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