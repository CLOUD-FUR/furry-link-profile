"use client";

import { useEffect, useState, useCallback } from "react";

type Log = {
  id: string;
  type: string;
  message: string;
  actorUserId: string | null;
  targetUserId: string | null;
  ip: string;
  createdAt: string;
};

const typeColors: Record<string, string> = {
  USER_CREATE: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  LOGIN: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  ADMIN_USER_UPDATE: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  ADMIN_USER_DELETE: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  ADMIN_LINK_CREATE: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  ADMIN_LINK_UPDATE: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  ADMIN_LINK_DELETE: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  LINK_CREATE: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  LINK_UPDATE: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(200);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    const res = await fetch(`/api/admin/logs?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      setLogs([]);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setLogs(data.logs ?? []);
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const availableTypes = Array.from(new Set(logs.map((l) => l.type))).sort();

  const filtered = logs.filter((l) => {
    if (typeFilter !== "all" && l.type !== typeFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        l.message.toLowerCase().includes(q) ||
        l.type.toLowerCase().includes(q) ||
        (l.actorUserId ?? "").toLowerCase().includes(q) ||
        (l.targetUserId ?? "").toLowerCase().includes(q) ||
        (l.ip ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">시스템 로그</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          접속, 수정, 삭제 등의 시스템 활동 기록을 확인합니다
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-muted-foreground" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="로그 검색..."
              className="h-9 flex-1 rounded-lg border border-border bg-muted/50 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 rounded-lg border border-border bg-muted/50 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">모든 유형</option>
            {availableTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={String(limit)}
            onChange={(e) => setLimit(parseInt(e.target.value, 10))}
            className="h-9 rounded-lg border border-border bg-muted/50 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="100">100개</option>
            <option value="200">200개</option>
            <option value="500">500개</option>
          </select>
          <button
            onClick={fetchLogs}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            새로고침
          </button>
        </div>
      </div>

      {/* Logs table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-5 sm:p-6">
          <h3 className="text-base font-semibold tracking-tight">로그 목록</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {loading ? "불러오는 중..." : `${filtered.length} / ${logs.length}개 표시`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">시간</th>
                <th className="px-3 py-3 font-medium">유형</th>
                <th className="px-3 py-3 font-medium">행위자</th>
                <th className="px-3 py-3 font-medium">대상</th>
                <th className="px-3 py-3 font-medium">IP</th>
                <th className="px-5 py-3 font-medium">내용</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    불러오는 중…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    로그가 없습니다
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="transition-colors hover:bg-muted/40">
                    <td className="whitespace-nowrap px-5 py-3 text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString("ko-KR")}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2 py-0.5 font-mono text-[11px] ${typeColors[log.type] ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-400"}`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                      {log.actorUserId ?? "-"}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                      {log.targetUserId ?? "-"}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                      {log.ip || "-"}
                    </td>
                    <td className="max-w-[480px] px-5 py-3 text-foreground">
                      {log.message}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
