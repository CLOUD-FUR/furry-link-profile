"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const SCROLL_THRESHOLD = 60;

export default function LegalButtons() {
  const pathname = usePathname();
  const [showBar, setShowBar] = useState(false);

  // ✅ 홈(/) 과 로그인(/login) 에서만 표시
  const shouldShow =
    pathname === "/" ||
    pathname === "/login";

  useEffect(() => {
    if (!shouldShow) return;
    const onScroll = () => setShowBar(window.scrollY > SCROLL_THRESHOLD);
    onScroll(); // 초기값
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [shouldShow]);

  if (!shouldShow) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[9999] px-4 pb-4 pt-2 transition-[opacity,transform] duration-300 ease-out"
      style={{
        opacity: showBar ? 1 : 0,
        pointerEvents: showBar ? "auto" : "none",
        transform: showBar ? "translateY(0)" : "translateY(100%)",
      }}
    >
      <div className="mx-auto flex max-w-full flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 dark:border-white/15 dark:bg-white/5 px-3 py-2 backdrop-blur-md shadow-soft w-fit">
        <a
          href="/questions"
          className="shrink-0 rounded-xl bg-white/15 dark:bg-white/10 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white/95 hover:bg-white/20 dark:hover:bg-white/15 whitespace-nowrap"
        >
          ❓ 자주하는 질문
        </a>
        <a
          href="/terms#terms"
          className="shrink-0 rounded-xl bg-white/15 dark:bg-white/10 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white/95 hover:bg-white/20 dark:hover:bg-white/15 whitespace-nowrap"
        >
          📜 이용약관
        </a>
        <a
          href="/terms#privacy"
          className="shrink-0 rounded-xl bg-white/15 dark:bg-white/10 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white/95 hover:bg-white/20 dark:hover:bg-white/15 whitespace-nowrap"
        >
          🔒 개인정보처리방침
        </a>
      </div>
    </div>
  );
}
