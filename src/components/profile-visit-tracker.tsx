"use client";

import { useEffect } from "react";

export function ProfileVisitTracker({ handle }: { handle: string }) {
  useEffect(() => {
    if (!handle) return;
    fetch(`/api/profile-visit?handle=${encodeURIComponent(handle)}`).catch(
      () => {}
    );
  }, [handle]);

  // 페이지 언마운트 시 embed.im 스크립트가 생성한 모든 요소 제거
  // (snow.js / confetti.js 가 SPA 네비게이션 후에도 남아있는 버그 방지)
  // 단순 canvas 제거만으로는 부족하여, 전역 변수/타이머/애니메이션/스크립트까지 정리
  useEffect(() => {
    return () => {
      // 1. requestAnimationFrame 루프 정리를 위해 가능한 모든 rAF 취소
      //    (snow.js 가 내부적으로 rAF 루프를 돌고 있을 수 있음)
      try {
        // snow.js 가 전역에 애니메이션 id를 저장하는 변수명들 시도
        const w = window as any;
        const candidates = [
          w.__embedApp,
          w.__snowApp,
          w.__confettiApp,
          w.embedApp,
          w.snowApp,
          w.confettiApp,
          w.__embedAnimationId,
          w.__snowAnimationId,
          w.__confettiAnimationId,
        ];
        for (const c of candidates) {
          if (typeof c === "number" && c > 0) {
            cancelAnimationFrame(c);
          }
          if (c && typeof c === "object") {
            // 객체에 stop/destroy/destroy/cleanup 메서드가 있으면 호출
            try {
              if (typeof c.stop === "function") c.stop();
            } catch {}
            try {
              if (typeof c.destroy === "function") c.destroy();
            } catch {}
            try {
              if (typeof c.cleanup === "function") c.cleanup();
            } catch {}
            try {
              if (typeof c.pause === "function") c.pause();
            } catch {}
          }
        }
        // 전역 변수 정리
        w.__embedApp = undefined;
        w.__snowApp = undefined;
        w.__confettiApp = undefined;
        w.embedApp = undefined;
        w.snowApp = undefined;
        w.confettiApp = undefined;
        w.__embedAnimationId = undefined;
        w.__snowAnimationId = undefined;
        w.__confettiAnimationId = undefined;
      } catch {}

      // 2. embed.im 계열 canvas 모두 제거 (position: fixed 인 것 + id/class 매칭)
      document.querySelectorAll("canvas").forEach((c) => {
        const id = (c.id || "").toLowerCase();
        const cls = (c.className || "").toString().toLowerCase();
        let style: CSSStyleDeclaration | undefined;
        try {
          style = window.getComputedStyle(c);
        } catch {}
        const isFixed = style?.position === "fixed";
        const matchesEmbed =
          id.includes("embed") ||
          id.includes("snow") ||
          id.includes("confetti") ||
          cls.includes("embed") ||
          cls.includes("snow") ||
          cls.includes("confetti");
        if (isFixed || matchesEmbed) {
          // 내부 애니메이션 정지 시도 후 제거
          try {
            const ctx = (c as HTMLCanvasElement).getContext("2d");
            if (ctx) ctx.clearRect(0, 0, c.width, c.height);
          } catch {}
          c.remove();
        }
      });

      // 3. embed.im 관련 div / svg / 기타 요소 제거
      document
        .querySelectorAll(
          '[id*="embed" i], [class*="embed-im" i], [data-embed], [id*="snow" i], [class*="snow" i], [id*="confetti" i], [class*="confetti" i]'
        )
        .forEach((el) => {
          // body 직접 자식이거나 body 하위에 있으면 제거
          el.remove();
        });

      // 4. 스크립트 자체 제거 (SPA 네비게이션 후에도 남아있을 수 있음)
      document
        .querySelectorAll('script[src*="embed.im"]')
        .forEach((s) => s.remove());

      // 5. 혹시 남아있는 fixed position canvas 재확인 제거
      document.querySelectorAll("canvas").forEach((c) => {
        let style: CSSStyleDeclaration | undefined;
        try {
          style = window.getComputedStyle(c);
        } catch {}
        if (style?.position === "fixed") {
          c.remove();
        }
      });
    };
  }, []);

  return null;
}
