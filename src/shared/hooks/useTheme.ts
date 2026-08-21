import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "theme";
const THEME_CHANGE_EVENT = "ai-architect-theme-change";
const DARK_MODE_QUERY = "(prefers-color-scheme: dark)";

function readStoredTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function useTheme(): { theme: Theme; setTheme: (theme: Theme) => void; isDark: boolean } {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);
  const [systemIsDark, setSystemIsDark] = useState(() => window.matchMedia(DARK_MODE_QUERY).matches);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const handleThemeChange = (event: Event): void => {
      setThemeState((event as CustomEvent<Theme>).detail);
    };
    const handleStorage = (event: StorageEvent): void => {
      if (event.key === THEME_STORAGE_KEY) setThemeState(readStoredTheme());
    };
    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DARK_MODE_QUERY);
    const handleChange = (event: MediaQueryListEvent): void => setSystemIsDark(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const setTheme = useCallback((nextTheme: Theme): void => {
    setThemeState(nextTheme);
    window.dispatchEvent(new CustomEvent<Theme>(THEME_CHANGE_EVENT, { detail: nextTheme }));
  }, []);

  return { theme, setTheme, isDark: theme === "system" ? systemIsDark : theme === "dark" };
}
