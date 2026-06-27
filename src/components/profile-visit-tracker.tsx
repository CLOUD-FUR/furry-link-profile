"use client";

import { useEffect } from "react";

export function ProfileVisitTracker({ handle }: { handle: string }) {
  useEffect(() => {
    if (!handle) return;
    fetch(`/api/profile-visit?handle=${encodeURIComponent(handle)}`).catch(
      () => {}
    );
  }, [handle]);

  // 페이지 언마운트 시 embed.im 스크립트가 생성한 canvas/요소 제거
  // (snow.js / confetti.js 가 SPA 네비게이션 후에도 남아있는 버그 방지)
  useEffect(() => {
    return () => {
      // embed.im 계열 canvas 제거
      document.querySelectorAll("canvas").forEach((c) => {
        const id = c.id || "";
        const style = c.style;
        if (
          id.includes("embed") ||
          id.includes("snow") ||
          id.includes("confetti") ||
          (style && style.position === "fixed")
        ) {
          c.remove();
        }
      });
      // embed.im 관련 전역 변수/타이머 정리
      try {
        if ((window as any).__embedApp) {
          (window as any).__embedApp = undefined;
        }
      } catch {}
    };
  }, []);

  return null;
}
