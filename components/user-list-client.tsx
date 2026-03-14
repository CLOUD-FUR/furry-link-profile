"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const FIXED_AVATAR_HANDLE = "cloud";
const FIXED_AVATAR_URL =
  "https://cdn.discordapp.com/avatars/1362203848713703514/b89a0b5def16807f3a385939b6617ada.png?size=2048";

type UserItem = {
  handle: string;
  handleLower: string;
  bio: string | null;
  image: string | null;
  discordImage: string | null;
};

function getAvatarUrl(u: UserItem): string {
  if (u.handleLower === FIXED_AVATAR_HANDLE) return FIXED_AVATAR_URL;
  if (u.image?.startsWith("http") || u.image?.startsWith("data:")) return u.image;
  if (u.discordImage?.startsWith("http")) return u.discordImage;
  return "/discord-avatar-placeholder.png";
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

export function UserListClient({ users }: { users: UserItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => users.filter((u) => matchQuery(u, query)), [users, query]);

  return (
    <>
      <header className="mb-8 flex flex-col items-center gap-4">
        <Link href="/" className="font-black tracking-tight text-xl text-slate-900 dark:text-white hover:opacity-90">
          🐾 Fluffy Link
        </Link>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          플러피링크 유저 리스트
        </h1>
        <input
          type="search"
          placeholder="핸들 또는 유저 이름으로 검색 (예시: @CLOUD, 클라우드 ...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md rounded-2xl border border-white/50 bg-white/60 dark:border-white/20 dark:bg-white/15 dark:text-white dark:placeholder:text-slate-400 px-4 py-3 text-slate-900 placeholder:text-slate-500 shadow-soft backdrop-blur-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
          aria-label="검색"
        />
      </header>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((u) => (
          <Link
            key={u.handleLower}
            href={`/@${u.handle}`}
            className="flex overflow-hidden rounded-2xl border border-white/40 bg-white/25 dark:border-white/20 dark:bg-white/10 shadow-soft backdrop-blur-glass transition hover:border-white/60 hover:bg-white/35 dark:hover:border-white/30 dark:hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
          >
            <div className="h-24 w-24 shrink-0 sm:h-28 sm:w-28">
              <img
                src={getAvatarUrl(u)}
                alt={`@${u.handle}`}
                className="h-full w-full object-cover"
                width={112}
                height={112}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center p-4 text-left">
              <div className="text-lg font-black text-slate-900 dark:text-white sm:text-xl">
                @{u.handle}
              </div>
              <div className="mt-0.5 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                {u.bio?.trim() || "소개가 없어요"}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-slate-600 dark:text-slate-400">
          {query.trim() ? "검색 결과가 없어요." : "아직 공개된 유저가 없어요."}
        </p>
      ) : null}
    </>
  );
}
