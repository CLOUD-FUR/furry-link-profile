"use client";

import { useState } from "react";

type Props = {
  handle: string;
  bio?: string | null;
  profileUrl: string;
  isDark: boolean;
  className?: string;
};

export function ProfileHandleShare({
  handle,
  bio,
  profileUrl,
  isDark,
  className = "",
}: Props) {
  const [copied, setCopied] = useState(false);

  const shareTitle = `@${handle} | Fluffy Link`;
  const shareText =
    bio?.trim() ||
    `플러피 링크에서 @${handle} 프로필을 확인해보세요!`;

  const getOgImageUrl = () => {
    try {
      const { origin } = new URL(profileUrl);
      return `${origin.replace(/\/$/, "")}/p/${encodeURIComponent(handle)}/og-image`;
    } catch {
      return "";
    }
  };

  const handleShare = async () => {
    const shareData: ShareData = {
      title: shareTitle,
      text: shareText,
      url: profileUrl,
    };

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        const ogImageUrl = getOgImageUrl();
        if (ogImageUrl) {
          try {
            const res = await fetch(ogImageUrl);
            if (res.ok) {
              const blob = await res.blob();
              const file = new File([blob], "profile.png", { type: blob.type || "image/png" });
              const withFiles = { ...shareData, files: [file] };
              if (navigator.canShare && navigator.canShare(withFiles)) {
                await navigator.share(withFiles);
                return;
              }
            }
          } catch {
            // 이미지 없이 공유
          }
        }
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // ignore
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`cursor-pointer border-none bg-transparent p-0 text-left outline-none focus:ring-0 ${className}`}
      aria-label="프로필 공유하기"
      title="클릭하면 공유해요"
    >
      @{handle}
      {copied ? (
        <span className="ml-1.5 text-sm font-normal opacity-80">(복사됨)</span>
      ) : null}
    </button>
  );
}
