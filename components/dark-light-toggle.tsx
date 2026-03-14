"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";

const THEME_KEY = "fluffy-site-theme";

function getStoredTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const t = localStorage.getItem(THEME_KEY);
  return t === "dark" ? "dark" : "light";
}

function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function DarkLightToggle() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const showOnPaths = ["/", "/login", "/user", "/questions"];
  const show = showOnPaths.includes(pathname);

  useEffect(() => {
    const t = getStoredTheme();
    setTheme(t);
    applyTheme(t);
  }, []);

  useEffect(() => {
    if (!show) return;
    const t = getStoredTheme();
    setTheme(t);
  }, [show, pathname]);

  const handleToggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  };

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="fixed top-4 right-4 z-[9999] flex h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/20 shadow-soft backdrop-blur-md transition hover:bg-white/30 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/15"
      aria-label={theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}
      title={theme === "light" ? "다크 모드" : "라이트 모드"}
    >
      <span className="relative flex h-8 w-8 items-center justify-center">
        {/* Sun: visible in light mode (click to switch to dark) */}
        <span
          className={clsx(
            "absolute flex h-8 w-8 items-center justify-center transition-opacity",
            theme === "light" ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          aria-hidden
        >
          <SunIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </span>
        {/* Moon: visible in dark mode (click to switch to light) */}
        <span
          className={clsx(
            "absolute flex h-8 w-8 items-center justify-center transition-opacity",
            theme === "dark" ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          aria-hidden
        >
          <MoonIcon className="h-6 w-6 text-slate-200" />
        </span>
      </span>
    </button>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" className={className} fill="currentColor">
      <path d="M480-280q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Z" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" className={className} fill="currentColor">
      <path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Z" />
    </svg>
  );
}
