"use client";

import { useEffect, useState } from "react";

/**
 * 메인 페이지에 표시되는 실시간 가입자 수.
 * SSR로 전달된 initialCount가 있으면 그것을 먼저 보여주고,
 * 없으면 클라이언트에서 /api/users 로 fetch.
 * 새로고침 시 "수많은 퍼리" → "N명" 깜빡임 방지.
 */
export function HomeUserCount({ initialCount }: { initialCount?: number | null }) {
  const [count, setCount] = useState<number | null>(initialCount ?? null);

  useEffect(() => {
    // SSR 값이 있어도 주기적으로 최신화 (선택적)
    let cancelled = false;
    fetch("/api/users", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        if (typeof d?.users?.length === "number") {
          setCount(d.users.length);
        } else if (typeof d?.ids?.length === "number") {
          setCount(d.ids.length);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (count == null) {
    return (
      <span>
        <strong className="text-slate-900 dark:text-slate-100 font-bold">수많은 퍼리</strong>들이 사용 중 🐾
      </span>
    );
  }

  return (
    <span>
      <strong className="text-slate-900 dark:text-slate-100 font-bold">{count.toLocaleString()}명의 퍼리</strong>가 사용 중 🐾
    </span>
  );
}
