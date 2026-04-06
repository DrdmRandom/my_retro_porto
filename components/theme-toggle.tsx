"use client";

import { useEffect, useState } from "react";

type ThemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "portfolio-theme";

function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = preference === "system" ? (isDark ? "dark" : "light") : preference;
  root.setAttribute("data-theme", resolved);
  root.setAttribute("data-theme-preference", preference);
}

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const nextPref: ThemePreference =
      stored === "light" || stored === "dark" || stored === "system" ? stored : "system";

    setPreference(nextPref);
    applyTheme(nextPref);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const pref = (localStorage.getItem(STORAGE_KEY) as ThemePreference | null) ?? "system";
      if (pref === "system") {
        applyTheme("system");
      }
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const onSelect = (nextPref: ThemePreference) => {
    localStorage.setItem(STORAGE_KEY, nextPref);
    setPreference(nextPref);
    applyTheme(nextPref);
  };

  return (
    <div className="theme-toggle" aria-label="Theme mode">
      <button
        type="button"
        className={preference === "system" ? "active" : ""}
        onClick={() => onSelect("system")}
      >
        Auto
      </button>
      <button
        type="button"
        className={preference === "light" ? "active" : ""}
        onClick={() => onSelect("light")}
      >
        Light
      </button>
      <button
        type="button"
        className={preference === "dark" ? "active" : ""}
        onClick={() => onSelect("dark")}
      >
        Dark
      </button>
    </div>
  );
}
