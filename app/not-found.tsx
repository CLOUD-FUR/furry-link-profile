"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NotFound() {
  const [sec, setSec] = useState(5);

  useEffect(() => {
    const t = setInterval(() => setSec((s) => Math.max(0, s - 1)), 1000);
    const r = setTimeout(() => {
      window.location.href = "/";
    }, 5000);

    return () => {
      clearInterval(t);
      clearTimeout(r);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-fuchsia-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 noise opacity-30" />
      <div className="relative mx-auto max-w-xl px-6 py-16">
        <div className="rounded-[2rem] border border-white/15 bg-white/10 backdrop-blur-glass p-8 shadow-soft">
          <div className="text-3xl font-black">404</div>
          <p className="mt-2 text-white/70">
            페이지를 찾을 수 없어. {sec}초 후 홈으로 이동해.
          </p>
          <div className="mt-6 flex gap-2">
            <Link href="/" className="rounded-2xl bg-white text-slate-900 px-4 py-2 font-bold">
              홈으로 가기
            </Link>
            <button
              onClick={() => window.history.back()}
              className="rounded-2xl bg-white/15 border border-white/15 px-4 py-2 font-bold text-white"
            >
              뒤로
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
