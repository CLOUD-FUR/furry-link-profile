"use client";

import { useState } from "react";

type Props = {
  profileUrl: string;
  handle: string;
  bio?: string | null;
};

export function ProfileShareButton({ profileUrl, handle, bio }: Props) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareTitle = `@${handle} | Fluffy Link`;
  const shareText =
    bio?.trim() ||
    `플러피 링크에서 @${handle} 프로필을 확인해보세요!`;

  const handleShare = async () => {
    setError(null);
    const shareData: ShareData = {
      title: shareTitle,
      text: shareText,
      url: profileUrl,
    };

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        setError("공유를 지원하지 않는 브라우저예요.");
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return; // 사용자가 공유 취소
      try {
        await navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        setError("공유에 실패했어요.");
      }
    }
  };

  return (
    <div className="mt-3 flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded-full border border-slate-500/60 bg-slate-800/95 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-slate-700/95 focus:outline-none focus:ring-2 focus:ring-white/40"
        aria-label="프로필 공유하기"
      >
        <span aria-hidden>📤</span>
        {copied ? "링크 복사됨!" : "공유하기"}
      </button>
      {error ? (
        <span className="text-xs text-red-300" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
