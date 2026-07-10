"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NotFound() {
  const [sec, setSec] = useState(8);

  useEffect(() => {
    const t = setInterval(() => setSec((s) => Math.max(0, s - 1)), 1000);
    const r = setTimeout(() => {
      window.location.href = "/";
    }, 8000);

    return () => {
      clearInterval(t);
      clearTimeout(r);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-200 via-sky-200 to-violet-300 dark:from-slate-950 dark:via-indigo-950 dark:to-fuchsia-950">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-pink-300/40 blur-3xl dark:bg-fuchsia-500/15" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-violet-300/40 blur-3xl dark:bg-indigo-500/15" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-sky-300/40 blur-3xl dark:bg-sky-500/10" />
      <div className="absolute inset-0 noise opacity-[0.35] dark:opacity-[0.15]" />

      <div className="relative flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg animate-fade-in rounded-[2.5rem] border border-white/50 bg-white/45 p-8 text-center shadow-soft backdrop-blur-glass dark:border-white/15 dark:bg-white/10 sm:p-12">
          {/* Floating fox */}
          <div className="mb-2 flex justify-center">
            <span className="fl-float text-7xl sm:text-8xl" aria-hidden>
              🦊
            </span>
          </div>

          {/* Big gradient 404 */}
          <div className="bg-gradient-to-br from-violet-600 via-pink-500 to-sky-500 bg-clip-text text-7xl font-black tracking-tight text-transparent dark:from-violet-300 dark:via-pink-300 dark:to-sky-300 sm:text-8xl">
            404
          </div>

          <h1 className="mt-4 text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
            앗, 길을 잃었어요!
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-700 dark:text-white/70">
            찾으시는 페이지가 사라졌거나 주소가 바뀐 것 같아요.
            <br />
            발자국을 따라 다시 홈으로 돌아가 볼까요? 🐾
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-soft transition-all duration-200 hover:scale-[1.02] hover:bg-slate-800 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              🏠 홈으로 가기
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-6 py-3 text-sm font-bold text-slate-900 shadow-soft transition-all duration-200 hover:scale-[1.02] hover:bg-white active:scale-[0.98] dark:border-white/20 dark:bg-white/15 dark:text-white dark:hover:bg-white/20"
            >
              ← 뒤로가기
            </button>
          </div>

          {/* Auto redirect countdown */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-slate-600 dark:text-white/50">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <span className="tabular-nums">{sec}</span>초 후 자동으로 홈으로 이동해요
          </div>
        </div>
      </div>
    </div>
  );
}
