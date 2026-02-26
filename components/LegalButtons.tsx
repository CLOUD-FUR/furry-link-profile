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
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
      <div className="mx-auto flex w-fit items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-md shadow-soft">
        <a
          href="/questions"
          className="rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold text-white/90 hover:bg-white/20"
        >
          자주 묻는 질문
        </a>
        <a
          href="/terms#terms"
          className="rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold text-white/90 hover:bg-white/20"
        >
          이용약관
        </a>
        <a
          href="/terms#privacy"
          className="rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold text-white/90 hover:bg-white/20"
        >
          개인정보처리방침
        </a>
      </div>
    </div>
  );
}
