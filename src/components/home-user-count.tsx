"use client";

import { useEffect, useState } from "react";

/**
 * 메인 페이지에 표시되는 실시간 가입자 수.
 * 하이드레이션 전에는 정적 텍스트를 보여주고,
 * 하이드레이션 후 /api/users 에서 실제 수를 가져와 표시합니다.
 */
export function HomeUserCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
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
