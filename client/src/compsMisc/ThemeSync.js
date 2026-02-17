import { useTheme } from "./ThemeContext";
import { useEffect } from "react";

export function ThemeSync() {
  const { theme } = useTheme();

  // This Component Syncs CSS variables with theme values so that css colors can be changed dynamically with theme changes

  useEffect(() => {
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  }, [theme]);

  return null;
}