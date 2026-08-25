import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const THEME_KEY = "paxivo-theme";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const initialThemeFrame = requestAnimationFrame(() => {
      setTheme(savedTheme ?? getSystemTheme());
    });

    const followSystemTheme = () => {
      if (!localStorage.getItem(THEME_KEY)) {
        setTheme(getSystemTheme());
      }
    };

    mediaQuery.addEventListener("change", followSystemTheme);
    return () => {
      cancelAnimationFrame(initialThemeFrame);
      mediaQuery.removeEventListener("change", followSystemTheme);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, nextTheme);
      return nextTheme;
    });
  };

  return { theme, toggleTheme };
}
