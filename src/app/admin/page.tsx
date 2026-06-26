"use client";

import { useEffect, useState, useCallback } from "react";
import StatCard from "./components/StatCard";
import Chart from "./components/Chart";
import ActivityFeed from "./components/ActivityFeed";
import QuickStats from "./components/QuickStats";

type Stats = {
  totalUsers: number;
  totalLinks: number;
  activeLinks: number;
  profileVisits: number;
};

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      if (!res.ok) throw new Error("불러오기 실패");
      const data = await res.json();
      setStats(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "오류");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const fmt = (n: number) => n.toLocaleString("ko-KR");

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            대시보드
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            플러피 링크 관리자 콘솔에 오신 것을 환영합니다 👋
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
            새로고침
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-300/40 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
          데이터를 불러오는 중 오류가 발생했습니다: {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="총 사용자 수"
          value={loading ? "…" : fmt(stats?.totalUsers ?? 0)}
          change="실시간"
          trend="up"
          accent="from-indigo-500 to-purple-600"
          icon={
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatCard
          label="총 링크 수"
          value={loading ? "…" : fmt(stats?.totalLinks ?? 0)}
          change="실시간"
          trend="up"
          accent="from-purple-500 to-pink-600"
          icon={
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          }
        />
        <StatCard
          label="활성 링크"
          value={loading ? "…" : fmt(stats?.activeLinks ?? 0)}
          change="활성화됨"
          trend="up"
          accent="from-blue-500 to-cyan-600"
          icon={
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <StatCard
          label="프로필 방문 수"
          value={loading ? "…" : fmt(stats?.profileVisits ?? 0)}
          change="누적"
          trend="up"
          accent="from-amber-500 to-orange-600"
          icon={
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          }
        />
      </div>

      {/* Chart + Quick stats */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Chart />
        </div>
        <div className="lg:col-span-1">
          <QuickStats />
        </div>
      </div>

      {/* Activity feed + Recent logs preview */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
        <div className="lg:col-span-2">
          <RecentLogsCard />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
        <p>© 2026 Fluffy Link. 모든 권리 보유.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="transition-colors hover:text-foreground">개인정보처리방침</a>
          <a href="#" className="transition-colors hover:text-foreground">이용약관</a>
          <a href="#" className="transition-colors hover:text-foreground">지원</a>
        </div>
      </div>
    </div>
  );
}

function RecentLogsCard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/logs?limit=8", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setLogs(d.logs ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold tracking-tight">최근 로그</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">시스템 활동 기록</p>
        </div>
        <a
          href="/admin/logs"
          className="text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400"
        >
          전체 보기
        </a>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="pb-2 pr-3 font-medium">시간</th>
              <th className="pb-2 pr-3 font-medium">유형</th>
              <th className="pb-2 pr-3 font-medium">내용</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={3} className="py-6 text-center text-muted-foreground">
                  불러오는 중…
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-6 text-center text-muted-foreground">
                  로그가 없습니다
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="text-sm">
                  <td className="whitespace-nowrap py-2.5 pr-3 text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString("ko-KR")}
                  </td>
                  <td className="whitespace-nowrap py-2.5 pr-3">
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-mono text-[11px] text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                      {log.type}
                    </span>
                  </td>
                  <td className="py-2.5 text-foreground">{log.message}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
