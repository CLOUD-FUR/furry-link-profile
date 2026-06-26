"use client";

import { useState, useMemo } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
  lastActive: string;
  avatarColor: string;
};

const users: User[] = [
  { id: "1", name: "김민준", email: "minjun.kim@example.com", role: "관리자", status: "active", lastActive: "방금 전", avatarColor: "from-indigo-500 to-purple-600" },
  { id: "2", name: "이서연", email: "seoyeon.lee@example.com", role: "편집자", status: "active", lastActive: "3분 전", avatarColor: "from-pink-500 to-rose-600" },
  { id: "3", name: "박지호", email: "jiho.park@example.com", role: "사용자", status: "inactive", lastActive: "2시간 전", avatarColor: "from-amber-500 to-orange-600" },
  { id: "4", name: "최유나", email: "yuna.choi@example.com", role: "편집자", status: "active", lastActive: "10분 전", avatarColor: "from-emerald-500 to-teal-600" },
  { id: "5", name: "정도현", email: "dohyun.jung@example.com", role: "사용자", status: "pending", lastActive: "1일 전", avatarColor: "from-blue-500 to-cyan-600" },
  { id: "6", name: "강예린", email: "yerin.kang@example.com", role: "관리자", status: "active", lastActive: "방금 전", avatarColor: "from-violet-500 to-fuchsia-600" },
  { id: "7", name: "윤준서", email: "junseo.yoon@example.com", role: "사용자", status: "active", lastActive: "30분 전", avatarColor: "from-red-500 to-orange-600" },
  { id: "8", name: "임하늘", email: "haneul.im@example.com", role: "편집자", status: "inactive", lastActive: "3일 전", avatarColor: "from-teal-500 to-cyan-600" },
  { id: "9", name: "서다은", email: "daeun.seo@example.com", role: "사용자", status: "active", lastActive: "5분 전", avatarColor: "from-purple-500 to-indigo-600" },
  { id: "10", name: "배현우", email: "hyunwoo.bae@example.com", role: "사용자", status: "pending", lastActive: "5시간 전", avatarColor: "from-rose-500 to-pink-600" },
];

const statusConfig = {
  active: {
    label: "활성",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  inactive: {
    label: "비활성",
    className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-400",
    dot: "bg-zinc-400",
  },
  pending: {
    label: "대기",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500",
  },
} as const;

type SortKey = "name" | "role" | "status" | "lastActive";
type SortDir = "asc" | "desc";

function SortIcon({
  column,
  sortKey,
  sortDir,
}: {
  column: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
}) {
  if (sortKey !== column) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="ml-1 inline h-3.5 w-3.5 text-muted-foreground/40" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className="ml-1 inline h-3.5 w-3.5 text-foreground" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      {sortDir === "asc" ? <path d="m6 15 6-6 6 6" /> : <path d="m6 9 6 6 6-6" />}
    </svg>
  );
}

export default function UserTable() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<User["status"] | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let result = users.filter(
      (u) =>
        (u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.email.toLowerCase().includes(query.toLowerCase())) &&
        (statusFilter === "all" || u.status === statusFilter)
    );

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name, "ko");
      else if (sortKey === "role") cmp = a.role.localeCompare(b.role, "ko");
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      else if (sortKey === "lastActive") cmp = a.lastActive.localeCompare(b.lastActive);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [query, statusFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((u) => u.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h3 className="text-base font-semibold tracking-tight">사용자 목록</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            총 {users.length}명의 사용자
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="사용자 검색..."
              className="h-9 w-full rounded-lg border border-border bg-muted/50 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:w-56"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as User["status"] | "all")}
            className="h-9 rounded-lg border border-border bg-muted/50 px-3 text-sm text-foreground focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">모든 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="pending">대기</option>
          </select>
          <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            사용자 추가
          </button>
        </div>
      </div>

      {/* Selection bar */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between border-b border-border bg-indigo-50/50 px-5 py-2.5 dark:bg-indigo-500/5">
          <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
            {selected.size}명 선택됨
          </span>
          <div className="flex items-center gap-2">
            <button className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              내보내기
            </button>
            <button className="rounded-md px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10">
              삭제
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="w-10 px-5 py-3">
                <input
                  type="checkbox"
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-border text-indigo-600 focus:ring-indigo-500/20"
                />
              </th>
              <th className="px-3 py-3">
                <button
                  onClick={() => toggleSort("name")}
                  className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                >
                  사용자 <SortIcon column="name" sortKey={sortKey} sortDir={sortDir} />
                </button>
              </th>
              <th className="hidden px-3 py-3 sm:table-cell">
                <button
                  onClick={() => toggleSort("role")}
                  className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                >
                  역할 <SortIcon column="role" sortKey={sortKey} sortDir={sortDir} />
                </button>
              </th>
              <th className="px-3 py-3">
                <button
                  onClick={() => toggleSort("status")}
                  className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                >
                  상태 <SortIcon column="status" sortKey={sortKey} sortDir={sortDir} />
                </button>
              </th>
              <th className="hidden px-3 py-3 lg:table-cell">
                <button
                  onClick={() => toggleSort("lastActive")}
                  className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                >
                  최근 활동 <SortIcon column="lastActive" sortKey={sortKey} sortDir={sortDir} />
                </button>
              </th>
              <th className="w-10 px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <p className="text-sm text-muted-foreground">검색 결과가 없습니다</p>
                </td>
              </tr>
            ) : (
              filtered.map((u) => {
                const sc = statusConfig[u.status];
                return (
                  <tr
                    key={u.id}
                    className={`group transition-colors ${
                      selected.has(u.id) ? "bg-indigo-50/40 dark:bg-indigo-500/5" : "hover:bg-muted/40"
                    }`}
                  >
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(u.id)}
                        onChange={() => toggleOne(u.id)}
                        className="h-4 w-4 rounded border-border text-indigo-600 focus:ring-indigo-500/20"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${u.avatarColor} text-xs font-semibold text-white`}>
                          {u.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{u.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-3 py-3 sm:table-cell">
                      <span className="text-sm text-muted-foreground">{u.role}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${sc.className}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                    </td>
                    <td className="hidden px-3 py-3 text-sm text-muted-foreground lg:table-cell">
                      {u.lastActive}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100">
                        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-5 py-3 sm:px-6">
        <p className="text-xs text-muted-foreground">
          {filtered.length} / {users.length}명 표시
        </p>
        <div className="flex items-center gap-1">
          <button className="inline-flex h-8 items-center rounded-lg border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            이전
          </button>
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-medium text-white">
            1
          </button>
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            2
          </button>
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            3
          </button>
          <button className="inline-flex h-8 items-center rounded-lg border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
