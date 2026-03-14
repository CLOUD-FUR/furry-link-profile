"use client";

import { usePathname } from "next/navigation";

export default function LegalButtons() {
  const pathname = usePathname();

  // ✅ 홈(/) 과 로그인(/login) 에서만 표시
  const shouldShow =
    pathname === "/" ||
    pathname === "/login";

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] px-4 pb-4 pt-2">
      <div className="mx-auto flex max-w-full flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-md shadow-soft w-fit">
        <a
          href="/questions"
          className="shrink-0 rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold text-white/90 hover:bg-white/20 whitespace-nowrap"
        >
          ❓ 자주하는 질문
        </a>
        <a
          href="/terms#terms"
          className="shrink-0 rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold text-white/90 hover:bg-white/20 whitespace-nowrap"
        >
          📜 이용약관
        </a>
        <a
          href="/terms#privacy"
          className="shrink-0 rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold text-white/90 hover:bg-white/20 whitespace-nowrap"
        >
          🔒 개인정보처리방침
        </a>
      </div>
    </div>
  );
}
