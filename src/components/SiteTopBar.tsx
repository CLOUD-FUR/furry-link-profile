"use client";

import NextLink from "next/link";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";

const THEME_KEY = "fluffy-site-theme";

type NavItem = {
  href: string;
  label: string;
  match?: "exact" | "prefix";
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "홈", match: "exact" },
  { href: "/user", label: "유저", match: "prefix" },
  { href: "/dashboard", label: "대시보드", match: "prefix" },
];

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

function isItemActive(pathname: string, item: NavItem): boolean {
  if (item.match === "exact") return pathname === item.href;
  if (pathname === item.href) return true;
  // prefix match but avoid matching "/" for "/dashboard"
  if (item.href === "/") return pathname === "/";
  return pathname.startsWith(item.href + "/") || pathname === item.href;
}

type Props = {
  /** Highlight a specific nav item even if pathname doesn't match (e.g. on dashboard). */
  activePage?: "home" | "user" | "dashboard" | "profile";
  /** Show the user avatar on the right (for dashboard). */
  userAvatarUrl?: string | null;
  /** Hide nav items (e.g. on public profile page where space is tight). */
  showNav?: boolean;
  /** Optional action buttons rendered on the right side (e.g. Save/Revert/Logout for dashboard). */
  actions?: React.ReactNode;
};

export function SiteTopBar({ activePage, userAvatarUrl, showNav = true, actions }: Props) {
  const pathname = usePathname() ?? "/";
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const t = getStoredTheme();
    setTheme(t);
    applyTheme(t);
    setMounted(true);
  }, []);

  const handleToggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  };

  const resolveActive = (item: NavItem) => {
    if (activePage === "home" && item.href === "/") return true;
    if (activePage === "user" && item.href === "/user") return true;
    if (activePage === "dashboard" && item.href === "/dashboard") return true;
    return isItemActive(pathname, item);
  };

  return (
    <header className="sticky top-3 sm:top-4 z-30 px-3 sm:px-4">
      <div className="mx-auto w-full max-w-6xl">
        <div className="relative flex items-center justify-between gap-2 sm:gap-3 rounded-full border border-white/60 dark:border-white/15 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl shadow-soft px-2.5 py-1.5 sm:px-4 sm:py-2">
          {/* Logo */}
          <NextLink
            href="/"
            className="group flex items-center gap-2.5 shrink-0 pl-1"
          >
            <span className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-2 ring-white/70 dark:ring-white/20 shadow-sm transition-transform group-hover:rotate-6">
              <NextImage
                src="/logo.png"
                alt="Fluffy Link"
                width="36"
                height="36"
                className="h-full w-full object-cover"
                priority
              />
            </span>
            <span className="font-black tracking-tight text-lg sm:text-xl text-slate-900 dark:text-slate-50">
              Fluffy Link
            </span>
          </NextLink>

          {/* Desktop nav */}
          {showNav ? (
            <nav className="hidden md:flex shrink-0 items-center gap-1.5">
              {NAV_ITEMS.map((item) => {
                const active = resolveActive(item);
                return (
                  <NextLink
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all",
                      active
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                        : "text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-white/10"
                    )}
                  >
                    {item.label}
                  </NextLink>
                );
              })}
            </nav>
          ) : null}

          {/* Right side */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Custom actions (e.g. Save/Revert/Logout for dashboard) */}
            {actions ? (
              <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">{actions}</div>
            ) : null}

            {/* Theme toggle — hidden on mobile when actions are present to prevent overflow */}
            <button
              type="button"
              onClick={handleToggleTheme}
              className={clsx(
                "relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/70 dark:border-white/15 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/15 transition-all",
                actions ? "hidden sm:inline-flex" : "inline-flex"
              )}
              aria-label={theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}
              title={theme === "light" ? "다크 모드" : "라이트 모드"}
            >
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span
                  className={clsx(
                    "absolute flex h-5 w-5 items-center justify-center transition-all duration-300",
                    mounted && theme === "light"
                      ? "opacity-100 rotate-0 scale-100"
                      : "opacity-0 -rotate-90 scale-50 pointer-events-none"
                  )}
                  aria-hidden
                >
                  <SunIcon className="h-5 w-5 text-amber-500" />
                </span>
                <span
                  className={clsx(
                    "absolute flex h-5 w-5 items-center justify-center transition-all duration-300",
                    mounted && theme === "dark"
                      ? "opacity-100 rotate-0 scale-100"
                      : "opacity-0 rotate-90 scale-50 pointer-events-none"
                  )}
                  aria-hidden
                >
                  <MoonIcon className="h-5 w-5 text-slate-200" />
                </span>
              </span>
            </button>

            {/* User avatar */}
            {userAvatarUrl ? (
              <NextLink
                href="/dashboard"
                className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-2 ring-white/70 dark:ring-white/20 shadow-sm hover:scale-105 transition-transform"
                aria-label="대시보드"
                title="대시보드"
              >
                <img
                  src={userAvatarUrl}
                  alt="avatar"
                  className="h-full w-full object-cover"
                />
              </NextLink>
            ) : null}

            {/* Mobile menu button */}
            {showNav ? (
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/70 dark:border-white/15 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/15 transition-all"
                aria-label="메뉴 열기"
                aria-expanded={mobileOpen}
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  {mobileOpen ? (
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414Z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M3 5a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm0 5a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm0 5a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Z" clipRule="evenodd" />
                  )}
                </svg>
              </button>
            ) : null}
          </div>
        </div>

        {/* Mobile dropdown */}
        {showNav && mobileOpen ? (
          <div className="md:hidden mt-2 mx-auto w-fit rounded-2xl border border-white/60 dark:border-white/15 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-soft px-2 py-2 animate-fade-in">
            {NAV_ITEMS.map((item) => {
              const active = resolveActive(item);
              return (
                <NextLink
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    "block rounded-xl px-4 py-2 text-sm font-semibold transition-all",
                    active
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-white/10"
                  )}
                >
                  {item.label}
                </NextLink>
              );
            })}
            {/* Theme toggle in mobile menu (visible when the top bar theme button is hidden due to actions) */}
            {actions ? (
              <button
                type="button"
                onClick={() => {
                  handleToggleTheme();
                }}
                className="block w-full rounded-xl px-4 py-2 text-sm font-semibold transition-all text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-white/10 text-left"
              >
                {theme === "light" ? "🌙 다크 모드" : "☀️ 라이트 모드"}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
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

export default SiteTopBar;
