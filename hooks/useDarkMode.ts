// hooks/useDarkMode.ts
import { useEffect, useState } from "react";

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => {
    // Prefer stored preference in localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("theme");
      if (stored) return stored === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      document.documentElement.setAttribute('data-mode', 'dark');
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      document.documentElement.setAttribute('data-mode', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return { darkMode, toggleDarkMode };
}