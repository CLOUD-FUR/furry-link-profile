"use client";

import { useEffect } from "react";

/**
 * 전역 스크롤 리빌 오버서버.
 *
 * `reveal` 클래스를 가진 모든 요소를 IntersectionObserver로 감시하고,
 * 뷰포트에 들어오는 순간 `reveal-visible`을 추가해 아래→위로 떠오르게 한다.
 * 개별 지연은 `data-reveal-delay`(ms) 속성으로 지정하며, `--reveal-delay` CSS 변수로 전달된다.
 *
 * 동작 조건 (globals.css 참고):
 * - `html.reveal-ready`(layout head 스크립트)가 없으면 CSS가 숨기지 않아, JS 미지원 시 콘텐츠가 그대로 노출된다.
 * - `prefers-reduced-motion` 사용자는 CSS에서 항상 즉시 노출된다.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    // 관찰 시작 전에 개별 지연을 CSS 변수로 설정해, 진입 애니메이션 delay 로 사용
    for (const el of els) {
      const delay = Number(el.dataset.revealDelay ?? 0);
      if (delay > 0) el.style.setProperty("--reveal-delay", `${delay}ms`);
    }

    // IntersectionObserver 미지원 브라우저는 전부 즉시 노출
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("reveal-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            io.unobserve(entry.target);
          }
        }
      },
      // 발동 기준: 요소의 15%가 뷰포트 하단 -48px 위로 올라오면
      { threshold: 0.15, rootMargin: "0px 0px -48px 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
