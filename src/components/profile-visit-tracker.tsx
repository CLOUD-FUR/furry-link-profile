"use client";

import { useEffect } from "react";

export function ProfileVisitTracker({ handle }: { handle: string }) {
  useEffect(() => {
    if (!handle) return;
    // fetch의 referer 헤더는 현재 페이지 URL이라 실제 유입 경로를 담지 못함
    // → document.referrer를 쿼리로 넘겨 서버에서 유입 소스로 기록
    const ref = document.referrer
      ? `&ref=${encodeURIComponent(document.referrer)}`
      : "";
    fetch(`/api/profile-visit?handle=${encodeURIComponent(handle)}${ref}`).catch(
      () => {}
    );
  }, [handle]);

  // SPA 네비게이션 후 혹시 남아있을 수 있는 embed.im 잔류 요소 정리
  // (tsParticles는 컴포넌트 언마운트 시 자체 정리되지만, 과거 snow.js/confetti.js
  //  잔여물이 남아있을 수 있어 안전 차원에서 한 번 더 정리)
  useEffect(() => {
    return () => {
      try {
        const w = window as any;
        const candidates = [
          w.__embedApp,
          w.__snowApp,
          w.__confettiApp,
          w.embedApp,
          w.snowApp,
          w.confettiApp,
        ];
        for (const c of candidates) {
          if (c && typeof c === "object") {
            try { if (typeof c.stop === "function") c.stop(); } catch {}
            try { if (typeof c.destroy === "function") c.destroy(); } catch {}
          }
        }
      } catch {}

      document
        .querySelectorAll('script[src*="embed.im"]')
        .forEach((s) => s.remove());
    };
  }, []);

  return null;
}
