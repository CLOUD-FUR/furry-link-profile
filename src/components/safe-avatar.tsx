"use client";

import { useState } from "react";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  fallback?: string;
};

/**
 * 이미지 로드 실패 시 fallback으로 자동 전환되는 안전한 이미지 컴포넌트.
 * - src가 빈 문자열이면 처음부터 fallback 사용
 * - 로드 중 에러 발생 시 fallback으로 교체
 */
export function SafeAvatar({ src, alt = "avatar", className, fallback = "/logo.png" }: Props) {
  const [current, setCurrent] = useState<string>(src && src.trim() ? src : fallback);
  const [failed, setFailed] = useState(false);

  return (
    <img
      src={current}
      alt={alt}
      className={className}
      onError={() => {
        if (!failed && current !== fallback) {
          setCurrent(fallback);
          setFailed(true);
        }
      }}
    />
  );
}
