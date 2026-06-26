"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";

type AdminProfile = {
  id: string;
  name: string | null;
  handle: string | null;
  image: string | null;
  discordImage: string | null;
};

export default function TopBar({
  dark,
  onToggleDark,
  onToggleSidebar,
}: {
  dark: boolean;
  onToggleDark: () => void;
  onToggleSidebar: () => void;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fetch admin profile from stats API
  useEffect(() => {
    fetch("/api/admin/stats", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.adminUser) setAdmin(d.adminUser);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const avatarUrl = admin
    ? admin.image?.startsWith("http") || admin.image?.startsWith("data:")
      ? admin.image
      : admin.discordImage?.startsWith("http")
        ? admin.discordImage
        : null
    : null;

  const displayName = admin?.name || admin?.handle || "관리자";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    } finally {
      await signOut({ callbackUrl: "/login" });
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        onClick={onToggleSidebar}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
        aria-label="메뉴 열기"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Search */}
      <div className="relative hidden flex-1 sm:block sm:max-w-md">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          placeholder="검색..."
          className="h-9 w-full rounded-lg border border-border bg-muted/50 pl-9 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 select-none rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      <div className="flex flex-1 items-center justify-end gap-1.5 sm:flex-initial">
        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          suppressHydrationWarning
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="테마 전환"
        >
          {dark ? (
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          )}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="알림"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl border border-border bg-card p-2 shadow-lg shadow-black/5 animate-fade-in">
              <div className="flex items-center justify-between px-3 py-2">
                <p className="text-sm font-semibold">알림</p>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  모두 읽음
                </button>
              </div>
              <div className="space-y-1">
                {notifications.map((n, i) => (
                  <div
                    key={i}
                    className="flex gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted"
                  >
                    <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${n.color}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug">{n.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-1">
                <button
                  onClick={() => setNotifOpen(false)}
                  className="w-full rounded-lg px-3 py-2 text-center text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  모든 알림 보기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg p-1 pl-1.5 transition-colors hover:bg-muted"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-semibold text-white">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold leading-tight">{displayName}</p>
              <p className="text-[11px] text-muted-foreground">플러피링크 관리자</p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" className="hidden h-4 w-4 text-muted-foreground sm:block" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-border bg-card p-1.5 shadow-lg shadow-black/5 animate-fade-in">
              <div className="px-3 py-2">
                <p className="text-sm font-semibold">{displayName}</p>
                <p className="text-xs text-muted-foreground">플러피링크 관리자</p>
              </div>
              <div className="my-1 h-px bg-border" />
              <a
                href={admin?.handle ? `/@${admin.handle}` : "/admin"}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                프로필
              </a>
              <a
                href="/admin/settings"
                className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                계정 설정
              </a>
              <a
                href="/admin/logs"
                className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                관리자 로그
              </a>
              <div className="my-1 h-px bg-border" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const notifications = [
  { title: "새 사용자 5명이 가입했습니다", time: "3분 전", color: "bg-indigo-500" },
  { title: "새 링크 12개가 생성되었습니다", time: "1시간 전", color: "bg-emerald-500" },
  { title: "프로필 방문수가 증가했습니다", time: "3시간 전", color: "bg-amber-500" },
  { title: "비활성화된 링크가 발견되었습니다", time: "5시간 전", color: "bg-red-500" },
];
