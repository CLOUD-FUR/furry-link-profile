"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import StatCard from "@/app/admin/components/StatCard";

type LinkItem = {
  id: string;
  platform: string;
  title: string;
  url: string;
  icon: string;
  subtitle: string;
  order: number;
  enabled: boolean;
  createdAt: string;
  clicks: number;
};

type AccountItem = {
  id: string;
  provider: string;
  providerAccountId: string;
  type: string;
  createdAt: string;
};

type LogItem = {
  id: string;
  type: string;
  message: string;
  actorUserId: string | null;
  targetUserId: string | null;
  ip: string;
  createdAt: string;
};

type UserDetail = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    handle: string;
    bio: string;
    image: string;
    discordImage: string;
    bannerUrl: string;
    isPublic: boolean;
    listPublic: boolean;
    profileTag: string | null;
    profileEffect: string | null;
    theme: string;
    createdAt: string;
    updatedAt: string;
    lastBumpedAt: string | null;
  };
  accounts: AccountItem[];
  links: LinkItem[];
  stats: {
    totalVisits: number;
    totalLinks: number;
    activeLinks: number;
    totalClicks: number;
    liveVisitors: number;
  };
  dailyVisits: { date: string; count: number }[];
  recentLogs: LogItem[];
};

const PLATFORM_LABELS: Record<string, string> = {
  discord_server: "Discord Server",
  x: "X (Twitter)",
  youtube: "YouTube",
  bluesky: "Bluesky",
  instagram: "Instagram",
  other: "기타",
};

const TAG_LABELS: Record<string, string> = {
  furry: "퍼슈터",
  artist: "아티스트",
  maker: "메이커",
  developer: "개발자",
  photo: "사진사",
  musician: "뮤지션",
  supporter: "서포터",
};

const EFFECT_LABELS: Record<string, string> = {
  snow: "눈",
  confetti: "색종이",
  stars: "별",
  bubbles: "버블",
  fireworks: "불꽃놀이",
};

function formatDate(s: string) {
  const d = new Date(s);
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(s: string) {
  const diff = Date.now() - new Date(s).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  return `${day}일 전`;
}

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setUserId(p.id));
  }, [params]);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users/${userId}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        if (res.status === 404) setError("유저를 찾을 수 없습니다");
        else setError("불러오기 실패");
        setData(null);
        return;
      }
      const d = await res.json();
      setData(d);
      setError(null);
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 실시간 방문자 30초 갱신
  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const d = await res.json();
          setData((prev) =>
            prev
              ? {
                  ...d,
                  // 로그/링크 등은 첫 로드만 유지 (깜빡임 방지)
                  links: prev.links,
                  recentLogs: prev.recentLogs,
                  accounts: prev.accounts,
                }
              : d
          );
        }
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const avatarUrl = data
    ? data.user.image?.startsWith("http") || data.user.image?.startsWith("data:")
      ? data.user.image
      : data.user.discordImage?.startsWith("http")
        ? data.user.discordImage
        : null
    : null;

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">불러오는 중...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push("/admin/users")}
          className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ← 사용자 목록으로
        </button>
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {error || "데이터를 불러올 수 없습니다"}
          </p>
        </div>
      </div>
    );
  }

  const { user, stats, links, accounts, dailyVisits, recentLogs } = data;

  // 일별 방문 차트 최대값
  const maxDaily = Math.max(1, ...dailyVisits.map((d) => d.count));

  return (
    <div className="space-y-6">
      {/* 뒤로가기 */}
      <button
        onClick={() => router.push("/admin/users")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        사용자 목록
      </button>

      {/* 헤더 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user.handle}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-border"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white">
              {user.handle.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              @{user.handle}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {user.name || "이름 없음"} · 가입 {formatDate(user.createdAt)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {user.profileTag && (
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                  {TAG_LABELS[user.profileTag] || user.profileTag}
                </span>
              )}
              {user.profileEffect && (
                <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-500/10 dark:text-purple-400">
                  효과: {EFFECT_LABELS[user.profileEffect] || user.profileEffect}
                </span>
              )}
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-400">
                테마: {user.theme}
              </span>
              {user.isPublic ? (
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  공개
                </span>
              ) : (
                <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                  비공개
                </span>
              )}
              {user.listPublic && (
                <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-500/10 dark:text-sky-400">
                  리스트 노출
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 빠른 작업 */}
        <div className="flex flex-wrap gap-2">
          <a
            href={`/@${user.handle}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
            프로필 보기
          </a>
        </div>
      </div>

      {/* 실시간 방문자 배지 */}
      <div className="flex items-center gap-3 rounded-xl border border-emerald-300/40 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
        </span>
        <div>
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
            지금 {stats.liveVisitors}명 접속 중
          </p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400/80">
            최근 5분간 고유 방문자 · 30초마다 갱신
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="총 방문자"
          value={stats.totalVisits}
          change="전체"
          trend="up"
          accent="from-indigo-500 to-purple-600"
          icon={
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          }
        />
        <StatCard
          label="총 클릭수"
          value={stats.totalClicks}
          change="링크 클릭"
          trend="up"
          accent="from-emerald-500 to-teal-600"
          icon={
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          }
        />
        <StatCard
          label="활성 링크"
          value={stats.activeLinks}
          change={`/ ${stats.totalLinks}개`}
          trend="up"
          accent="from-sky-500 to-blue-600"
          icon={
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          }
        />
        <StatCard
          label="연동 계정"
          value={accounts.length}
          change="OAuth"
          trend="up"
          accent="from-amber-500 to-orange-600"
          icon={
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" x2="3" y1="12" y2="12" />
            </svg>
          }
        />
      </div>

      {/* 방문 통계 차트 */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold tracking-tight">최근 30일 방문자</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">일별 고유 방문자 수</p>
        <div className="mt-6 flex h-40 items-end gap-1">
          {dailyVisits.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              최근 30일간 방문 기록이 없습니다
            </div>
          ) : (
            dailyVisits.map((d) => {
              const height = Math.max(2, (d.count / maxDaily) * 100);
              return (
                <div
                  key={d.date}
                  className="group relative flex flex-1 flex-col items-center justify-end"
                  style={{ height: "100%" }}
                >
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-indigo-500 to-purple-500 transition-all hover:from-indigo-600 hover:to-purple-600"
                    style={{ height: `${height}%` }}
                  />
                  <div className="pointer-events-none absolute -top-8 z-10 hidden whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-[10px] font-medium text-background group-hover:block">
                    {d.date.slice(5)}: {d.count}명
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 링크 목록 */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold tracking-tight">링크 목록</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              총 {links.length}개 (활성 {stats.activeLinks})
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {links.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              등록된 링크가 없습니다
            </div>
          ) : (
            links.map((l) => (
              <div
                key={l.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-xs font-bold uppercase">
                  {PLATFORM_LABELS[l.platform]?.charAt(0) || "🔗"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{l.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {l.subtitle || l.url}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-400">
                    {l.clicks} 클릭
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      l.enabled
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-500/10 dark:text-zinc-500"
                    }`}
                  >
                    {l.enabled ? "활성" : "비활성"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 연동 계정 */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold tracking-tight">연동 계정</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">OAuth / 인증 정보</p>
        <div className="mt-4 space-y-2">
          {accounts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              연동된 계정이 없습니다
            </div>
          ) : (
            accounts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold capitalize text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                    {a.provider}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {a.providerAccountId}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(a.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 최근 로그 */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold tracking-tight">최근 활동 로그</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">해당 유저 관련 최근 20개</p>
        <div className="mt-4 space-y-1.5">
          {recentLogs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              로그가 없습니다
            </div>
          ) : (
            recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 rounded-lg px-3 py-2 hover:bg-muted/50"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">{log.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {log.type} · {timeAgo(log.createdAt)}
                    {log.ip && ` · ${log.ip}`}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
