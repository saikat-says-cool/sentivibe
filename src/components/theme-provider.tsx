import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useAuth } from "@/integrations/supabase/auth"; // Import useAuth
import { supabase } from "@/integrations/supabase/client"; // Import supabase client

type Theme = "dark" | "light" | "system" | "emerald" | "midnight"; // Added new themes

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  availableThemes: Theme[]; // Added availableThemes
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  availableThemes: ["light", "dark", "system", "emerald", "midnight"], // Default available themes
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const { user, subscriptionTier, isLoading: isAuthLoading } = useAuth();
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initial theme load: prioritize local storage, then system, then default
    const storedTheme = localStorage.getItem(storageKey) as Theme;
    if (storedTheme) return storedTheme;
    return defaultTheme;
  });

  const availableThemes: Theme[] = ["light", "dark", "system", "emerald", "midnight"]; // Define available themes

  // Effect to load theme from Supabase for Pro users
  useEffect(() => {
    const loadThemeFromProfile = async () => {
      if (user && subscriptionTier === 'pro' && !isAuthLoading) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('theme')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching theme from profile:", error);
        } else if (profile?.theme && availableThemes.includes(profile.theme as Theme)) {
          setThemeState(profile.theme as Theme);
          localStorage.setItem(storageKey, profile.theme); // Keep local storage in sync
        }
      }
    };

    if (!isAuthLoading) {
      loadThemeFromProfile();
    }
  }, [user, subscriptionTier, isAuthLoading, storageKey, availableThemes]);

  // Effect to apply theme to documentElement
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(...availableThemes); // Remove all possible theme classes

    const currentTheme = theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;

    root.classList.add(currentTheme);
  }, [theme, availableThemes]);

  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);

    // Save to Supabase for Pro users
    if (user && subscriptionTier === 'pro') {
      const { error } = await supabase
        .from('profiles')
        .update({ theme: newTheme })
        .eq('id', user.id);

      if (error) {
        console.error("Error saving theme to profile:", error);
      }
    }
  }, [user, subscriptionTier, storageKey]);

  const value = {
    theme,
    setTheme,
    availableThemes,
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