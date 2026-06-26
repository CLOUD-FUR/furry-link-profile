"use client";

import { useEffect, useState, type ReactNode } from "react";

type Platform = {
  name: string;
  handle: string;
  gradient: string;
  icon: ReactNode;
};

const PLATFORMS: Platform[] = [
  {
    name: "Twitter",
    handle: "@fluffy_cloud",
    gradient: "from-sky-400 to-sky-600",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-5 w-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    handle: "@fluffy-cloud",
    gradient: "from-red-500 to-rose-600",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-5 w-5">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    handle: "@fluffy.cloud",
    gradient: "from-fuchsia-500 via-pink-500 to-amber-400",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-5 w-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.069 1.646.069 4.85s-.011 3.584-.069 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.069-4.85.069s-3.584-.011-4.85-.069c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311C8.416 2.175 8.796 2.163 12 2.163zm0 5.351a4.486 4.486 0 1 0 0 8.972 4.486 4.486 0 0 0 0-8.972zm0 7.397a2.911 2.911 0 1 1 0-5.822 2.911 2.911 0 0 1 0 5.822zm5.706-7.58a1.048 1.048 0 1 1-2.096 0 1.048 1.048 0 0 1 2.096 0z" />
      </svg>
    ),
  },
  {
    name: "Discord",
    handle: "fluffy_cloud",
    gradient: "from-indigo-500 to-violet-600",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-5 w-5">
        <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3.2a.074.074 0 0 0-.079.037c-.34.607-.719 1.396-.984 2.013a18.27 18.27 0 0 0-5.487 0 12.51 12.51 0 0 0-.997-2.013.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 4.677 4.37a.07.07 0 0 0-.032.027C1.533 9.045.69 13.58 1.103 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.992 3.03.078.078 0 0 0 .084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.128 12.299 12.299 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.42 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.974 0c-1.183 0-2.157-1.086-2.157-2.42 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z" />
      </svg>
    ),
  },
];

export function HomePreviewCard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative">
      {/* Outer soft glow */}
      <div className="pointer-events-none absolute -inset-6 bg-gradient-to-br from-pink-300/40 via-violet-300/30 to-sky-300/40 dark:from-fuchsia-500/15 dark:via-violet-500/15 dark:to-sky-500/15 rounded-[3rem] blur-2xl" />

      {/* === Card === */}
      <div
        className={`relative mx-auto max-w-sm rounded-[2.25rem] border border-white/60 bg-white/55 dark:border-white/15 dark:bg-white/10 pb-5 shadow-soft transition-transform duration-700 ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
        style={{ overflow: "hidden", isolation: "isolate" }}
      >
        {/* === Banner (gradient sits cleanly inside the card's rounded top corners) === */}
        <div className="relative h-32 bg-gradient-to-r from-pink-300 via-violet-300 to-sky-300 dark:from-pink-500/50 dark:via-violet-500/50 dark:to-sky-500/50">
          {/* Subtle sparkle texture on banner */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage: `
                radial-gradient(1px 1px at 18% 30%, rgba(255,255,255,0.9), transparent 60%),
                radial-gradient(1.5px 1.5px at 38% 60%, rgba(255,255,255,0.7), transparent 60%),
                radial-gradient(1px 1px at 62% 25%, rgba(255,255,255,0.8), transparent 60%),
                radial-gradient(1.2px 1.2px at 82% 55%, rgba(255,255,255,0.7), transparent 60%),
                radial-gradient(1px 1px at 50% 80%, rgba(255,255,255,0.6), transparent 60%)
              `,
            }}
          />

          {/* Live Preview badge */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 dark:bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white dark:text-slate-900 shadow-soft">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Preview
            </div>
          </div>
        </div>

        {/* Avatar (overlaps banner) */}
        <div className="relative z-20 -mt-10 flex justify-center">
          <div className="h-20 w-20 rounded-full border-4 border-white dark:border-slate-900 bg-gradient-to-br from-pink-400 to-violet-500 shadow-glow flex items-center justify-center text-3xl leading-none">
            🦊
          </div>
        </div>

        {/* Name */}
        <div className="mt-3 text-center">
          <div className="text-lg font-black text-slate-900 dark:text-slate-50">@fluffy_cloud</div>
          <div className="mt-1 text-xs text-slate-700 dark:text-slate-200">
            여러개의 링크를 한 곳에 ✨
          </div>
        </div>

        {/* Links */}
        <div className="mt-4 grid gap-2.5 px-5">
          {PLATFORMS.map((p, i) => (
            <button
              key={p.name}
              type="button"
              tabIndex={-1}
              className="group flex items-center gap-3 rounded-2xl border border-white/70 bg-white/70 dark:border-white/10 dark:bg-white/10 px-3.5 py-2.5 text-left transition-all hover:bg-white dark:hover:bg-white/15 hover:shadow-soft cursor-default"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span
                className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${p.gradient} text-white shadow-sm`}
              >
                {p.icon}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold text-slate-900 dark:text-slate-50">
                  {p.name}
                </span>
                <span className="block text-xs text-slate-700 dark:text-slate-300 truncate">
                  {p.handle}
                </span>
              </span>
              <svg className="h-4 w-4 text-slate-500 dark:text-slate-400 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M7.293 4.293a1 1 0 0 1 1.414 0l5 5a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414-1.414L11.586 10 7.293 5.707a1 1 0 0 1 0-1.414Z" clipRule="evenodd" />
              </svg>
            </button>
          ))}
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-600 dark:text-slate-400">
          * 실제 서비스 화면 예시예요.
        </p>
      </div>
    </div>
  );
}
