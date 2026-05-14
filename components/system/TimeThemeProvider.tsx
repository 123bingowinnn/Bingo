"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { pickTimeTheme, type TimeTheme } from "@/lib/time-theme";

const TimeThemeContext = createContext<TimeTheme>("night");

export function useTimeTheme() {
  return useContext(TimeThemeContext);
}

export function TimeThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<TimeTheme>("night");

  useEffect(() => {
    const apply = () => {
      const t = pickTimeTheme();
      setTheme(t);
      document.documentElement.dataset.theme = t;
    };
    apply();
    const id = setInterval(apply, 30 * 60 * 1000); // re-check every 30 min
    return () => clearInterval(id);
  }, []);

  return (
    <TimeThemeContext.Provider value={theme}>
      {children}
    </TimeThemeContext.Provider>
  );
}
