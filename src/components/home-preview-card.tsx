"use client";

import { useEffect, useState } from "react";
import { SafeAvatar } from "./safe-avatar";

type Link = {
  id: string;
  title: string;
  subtitle: string | null;
  platform: string;
  icon: string | null;
};

type UserProfile = {
  handle: string;
  bio: string | null;
  image: string | null;
  discordImage: string | null;
  bannerUrl: string | null;
  links: Link[];
};

const PLATFORM_ICONS: Record<string, string> = {
  twitter: "/icons/twitter.svg",
  youtube: "/icons/youtube.svg",
  instagram: "/icons/instagram.svg",
  discord: "/icons/discord.svg",
  github: "/icons/github.svg",
  twitch: "/icons/twitch.svg",
  tiktok: "/icons/tiktok.svg",
};

export function HomePreviewCard() {
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);

    // Fetch @CLOUD profile data
    fetch("/api/user/cloud")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setProfile(data.user);
        }
      })
      .catch((err) => {
        console.error("Failed to load preview profile:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="relative">
        <div className="pointer-events-none absolute -inset-6 bg-gradient-to-br from-pink-300/40 via-violet-300/30 to-sky-300/40 dark:from-fuchsia-500/15 dark:via-violet-500/15 dark:to-sky-500/15 rounded-[3rem] blur-2xl" />
        <div className="relative mx-auto max-w-sm rounded-[2.25rem] border border-white/60 bg-white/55 dark:border-white/15 dark:bg-white/10 pb-5 shadow-soft min-h-[400px] flex items-center justify-center">
          <div className="text-slate-600 dark:text-slate-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const avatarSrc = profile.image || profile.discordImage || "/logo.png";

  return (
    <div className="relative">
      {/* Outer soft glow */}
      <div className="pointer-events-none absolute -inset-6 bg-gradient-to-br from-pink-300/40 via-violet-300/30 to-sky-300/40 dark:from-fuchsia-500/15 dark:via-violet-500/15 dark:to-sky-500/15 rounded-[3rem] blur-2xl" />

      {/* === Card === */}
      <div
        className={`relative mx-auto max-w-sm rounded-[2.25rem] border border-white/60 bg-white/55 dark:border-white/15 dark:bg-white/10 pb-5 shadow-soft transition-transform duration-700 ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
        style={{ overflow: "hidden", isolation: "isolate" }}
      >
        {/* === Banner === */}
        <div
          className="relative h-32 bg-gradient-to-r from-pink-300 via-violet-300 to-sky-300 dark:from-pink-500/50 dark:via-violet-500/50 dark:to-sky-500/50"
          style={
            profile.bannerUrl
              ? {
                  backgroundImage: `url(${profile.bannerUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          {/* Subtle sparkle texture on banner */}
          {!profile.bannerUrl && (
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage: `
                  radial-gradient(1px 1px at 18% 30%, rgba(255,255,255,0.9), transparent 60%),
                  radial-gradient(1.5px 1.5px at 38% 60%, rgba(255,255,255,0.7), transparent 60%),
                  radial-gradient(1px 1px at 62% 25%, rgba(255,255,255,0.8), transparent 60%),
                  radial-gradient(1.2px 1.2px at 82% 55%, rgba(255,255,255,0.7), transparent 60%),
                  radial-gradient(1px 1px at 50% 80%, rgba(255,255,255,0.6), transparent 60%)
                `,
              }}
            />
          )}

          {/* Live Preview badge */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 dark:bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white dark:text-slate-900 shadow-soft">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Preview
            </div>
          </div>
        </div>

        {/* Avatar (overlaps banner) */}
        <div className="relative z-20 -mt-10 flex justify-center">
          <SafeAvatar
            src={avatarSrc}
            alt="avatar"
            fallback="/logo.png"
            className="h-20 w-20 rounded-full border-4 border-white dark:border-slate-900 bg-white/60 shadow-glow object-cover"
          />
        </div>

        {/* Name */}
        <div className="mt-3 text-center px-4">
          <div className="text-lg font-black text-slate-900 dark:text-slate-50">@{profile.handle}</div>
          {profile.bio && (
            <div className="mt-1 text-xs text-slate-700 dark:text-slate-200 line-clamp-2">
              {profile.bio}
            </div>
          )}
        </div>

        {/* Links */}
        <div className="mt-4 grid gap-2.5 px-5">
          {profile.links.slice(0, 4).map((link, i) => (
            <a
              key={link.id}
              href={`https://fluffy-link.xyz/@${profile.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-2xl border border-white/70 bg-white/70 dark:border-white/10 dark:bg-white/10 px-3.5 py-2.5 text-left transition-all duration-200 hover:bg-white dark:hover:bg-white/15 hover:shadow-soft active:scale-[0.97]"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/35 dark:bg-white/10">
                {link.platform !== "other" && PLATFORM_ICONS[link.platform] ? (
                  <img
                    src={PLATFORM_ICONS[link.platform]}
                    alt={link.platform}
                    className="h-5 w-5 object-contain"
                  />
                ) : (
                  <span className="text-lg leading-none">{link.icon || "🔗"}</span>
                )}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold text-slate-900 dark:text-slate-50 truncate">
                  {link.title}
                </span>
                {link.subtitle && (
                  <span className="block text-xs text-slate-700 dark:text-slate-300 truncate">
                    {link.subtitle}
                  </span>
                )}
              </span>
              <svg className="h-4 w-4 text-slate-500 dark:text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M7.293 4.293a1 1 0 0 1 1.414 0l5 5a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414-1.414L11.586 10 7.293 5.707a1 1 0 0 1 0-1.414Z" clipRule="evenodd" />
              </svg>
            </a>
          ))}
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-600 dark:text-slate-400">
          * 실제 @{profile.handle} 프로필 화면이에요.
        </p>
      </div>
    </div>
  );
}
