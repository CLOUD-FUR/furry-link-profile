"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";

const FIXED_AVATAR_HANDLE = "cloud";
const FIXED_AVATAR_URL =
  "https://cdn.discordapp.com/avatars/1362203848713703514/b89a0b5def16807f3a385939b6617ada.png?size=2048";

type UserItem = {
  handle: string;
  handleLower: string;
  bio: string | null;
  image: string | null;
  discordImage: string | null;
  bumpedRecently?: boolean;
};

function getAvatarUrl(u: UserItem): string {
  if (u.handleLower === FIXED_AVATAR_HANDLE) return FIXED_AVATAR_URL;
  if (u.image?.startsWith("http") || u.image?.startsWith("data:")) return u.image;
  if (u.discordImage?.startsWith("http")) return u.discordImage;
  return "/logo.png";
}

function matchQuery(u: UserItem, q: string): boolean {
  if (!q.trim()) return true;
  const lower = q.trim().toLowerCase();
  const handleLower = u.handleLower;
  const handle = u.handle;
  const bio = (u.bio ?? "").toLowerCase();
  if (handleLower.includes(lower)) return true;
  if (handle.toLowerCase().includes(lower)) return true;
  if (bio.includes(lower)) return true;
  if (lower.startsWith("@") && (handleLower.includes(lower.slice(1)) || handle.toLowerCase().includes(lower.slice(1)))) return true;
  return false;
}

// 카드용 그라데이션 세트 (인덱스별 순환)
const CARD_GRADIENTS = [
  "from-pink-400/20 to-rose-400/10",
  "from-sky-400/20 to-indigo-400/10",
  "from-violet-400/20 to-fuchsia-400/10",
  "from-amber-400/20 to-orange-400/10",
  "from-emerald-400/20 to-teal-400/10",
  "from-cyan-400/20 to-blue-400/10",
];

export function UserListClient({ users }: { users: UserItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => users.filter((u) => matchQuery(u, query)), [users, query]);

  return (
    <>
      {/* Title section */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/55 dark:border-white/15 dark:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 backdrop-blur mb-4">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {users.length}명의 유저가 함께하고 있어요
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white" style={{ wordBreak: "keep-all" }}>
          플러피링크 유저 리스트
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">
          원하는 유저를 찾아 프로필을 방문해 보세요! 🐾
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-8 flex justify-center">
        <div className="relative w-full max-w-md">
          <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" strokeWidth={2.2} />
              <path strokeLinecap="round" strokeWidth={2.2} d="M16.5 16.5L21 21" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="핸들 또는 이름으로 검색 (예: @CLOUD)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-white/60 bg-white/60 dark:border-white/15 dark:bg-white/10 dark:text-white dark:placeholder:text-slate-400 pl-12 pr-5 py-3 text-slate-900 placeholder:text-slate-500 shadow-soft backdrop-blur-md focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/30 transition"
            aria-label="검색"
          />
        </div>
      </div>

      {/* User grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((u, i) => {
          const gradient = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
          return (
            <Link
              key={u.handleLower}
              href={`/@${u.handle}`}
              className={clsx(
                "group relative overflow-hidden rounded-3xl border backdrop-blur-md transition-all duration-300",
                "border-white/50 bg-white/40 dark:border-white/15 dark:bg-white/8",
                "hover:-translate-y-1 hover:shadow-[0_25px_50px_-20px_rgba(124,58,237,0.35)]",
                "hover:border-violet-300/70 dark:hover:border-violet-400/40",
                "focus:outline-none focus:ring-2 focus:ring-violet-400/40"
              )}
            >
              {/* Gradient overlay */}
              <div className={clsx("absolute inset-0 bg-gradient-to-br opacity-60 group-hover:opacity-100 transition-opacity duration-300", gradient)} />

              {/* Bumped badge */}
              {u.bumpedRecently ? (
                <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  최근 끌어올림
                </span>
              ) : null}

              <div className="relative flex items-center gap-4 p-5">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-violet-400/40 to-fuchsia-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                  <img
                    src={getAvatarUrl(u)}
                    alt={`@${u.handle}`}
                    className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-2 border-white/70 dark:border-white/20 object-cover shadow-md group-hover:scale-105 transition-transform duration-300"
                    width={80}
                    height={80}
                  />
                </div>

                {/* Info */}
                <div className="flex min-w-0 flex-1 flex-col justify-center text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                      @{u.handle}
                    </span>
                  </div>
                  <div className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300/80 leading-relaxed">
                    {u.bio?.trim() || "소개가 없어요"}
                  </div>
                </div>

                {/* Arrow */}
                <span className="shrink-0 self-center text-slate-400 dark:text-slate-500 group-hover:text-violet-500 dark:group-hover:text-violet-300 group-hover:translate-x-1 transition-all duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/50 dark:bg-white/10 mb-4 text-3xl">
            🔍
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-semibold">
            {query.trim() ? "검색 결과가 없어요." : "아직 공개된 유저가 없어요."}
          </p>
          {query.trim() ? (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
              다른 키워드로 검색해 보세요!
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
