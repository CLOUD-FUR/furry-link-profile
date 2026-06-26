"use client";

import { useEffect, useState, useCallback } from "react";

type Link = {
  id: string;
  userId: string;
  platform: string;
  title: string;
  url: string;
  icon: string;
  subtitle: string;
  enabled: boolean;
  createdAt: string;
  user: { id: string; handle: string; name: string | null };
};

type UserOption = {
  id: string;
  handle: string;
  name: string | null;
};

const PLATFORMS = [
  { value: "discord_server", label: "Discord Server" },
  { value: "x", label: "X (Twitter)" },
  { value: "youtube", label: "YouTube" },
  { value: "bluesky", label: "Bluesky" },
  { value: "instagram", label: "Instagram" },
  { value: "other", label: "기타" },
];

export default function AdminLinksPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [handleQuery, setHandleQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (handleQuery) params.set("handle", handleQuery);
    const res = await fetch(`/api/admin/links?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      setError("불러오기 실패");
      setLinks([]);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setLinks(data.links ?? []);
    setError(null);
    setLoading(false);
  }, [handleQuery]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const updateLink = async (id: string, patch: Partial<Link>) => {
    try {
      const res = await fetch(`/api/admin/links/${id}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "수정 실패");
      }
      await fetchLinks();
    } catch (e: any) {
      setError(e?.message ?? "오류");
    }
  };

  const deleteLink = async (id: string, title: string) => {
    if (!confirm(`정말 "${title}" 링크를 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/admin/links/${id}/delete`, { method: "POST" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "삭제 실패");
      }
      await fetchLinks();
    } catch (e: any) {
      setError(e?.message ?? "오류");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">링크 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            모든 링크를 검색, 수정, 삭제하고 사용자 링크를 수동으로 생성할 수 있습니다
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          링크 생성
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-rose-300/40 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-xs underline">닫기</button>
        </div>
      )}

      {/* Search */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={handleQuery}
            onChange={(e) => setHandleQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchLinks()}
            placeholder="유저 핸들로 링크 검색..."
            className="h-9 flex-1 rounded-lg border border-border bg-muted/50 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            onClick={fetchLinks}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            검색
          </button>
          {handleQuery && (
            <button
              onClick={() => setHandleQuery("")}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {/* Links table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-5 sm:p-6">
          <h3 className="text-base font-semibold tracking-tight">링크 목록</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {loading ? "불러오는 중..." : `총 ${links.length}개`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">사용자</th>
                <th className="px-3 py-3 font-medium">플랫폼</th>
                <th className="px-3 py-3 font-medium">제목</th>
                <th className="px-3 py-3 font-medium">URL</th>
                <th className="px-3 py-3 font-medium">부제목</th>
                <th className="px-3 py-3 font-medium">아이콘</th>
                <th className="px-3 py-3 font-medium">활성</th>
                <th className="px-5 py-3 text-right font-medium">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">
                    불러오는 중…
                  </td>
                </tr>
              ) : links.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">
                    결과가 없습니다
                  </td>
                </tr>
              ) : (
                links.map((l) => (
                  <LinkRow
                    key={l.id}
                    link={l}
                    onUpdate={(patch) => updateLink(l.id, patch)}
                    onDelete={() => deleteLink(l.id, l.title)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateLinkModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchLinks();
          }}
        />
      )}
    </div>
  );
}

function LinkRow({
  link,
  onUpdate,
  onDelete,
}: {
  link: Link;
  onUpdate: (patch: Partial<Link>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    platform: link.platform,
    title: link.title,
    url: link.url,
    subtitle: link.subtitle,
    icon: link.icon,
    enabled: link.enabled,
  });

  const save = () => {
    onUpdate({
      platform: form.platform,
      title: form.title,
      url: form.url,
      subtitle: form.subtitle,
      icon: form.icon,
      enabled: form.enabled,
    });
    setEditing(false);
  };

  if (!editing) {
    return (
      <tr className="group transition-colors hover:bg-muted/40">
        <td className="px-5 py-3">
          <a
            href={`/@${link.user.handle}`}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            @{link.user.handle}
          </a>
        </td>
        <td className="px-3 py-3">
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-mono text-[11px] text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
            {link.platform}
          </span>
        </td>
        <td className="px-3 py-3 font-medium text-foreground">{link.title}</td>
        <td className="px-3 py-3 max-w-[280px] truncate text-xs text-muted-foreground">
          {link.url}
        </td>
        <td className="px-3 py-3 text-muted-foreground">{link.subtitle || "-"}</td>
        <td className="px-3 py-3 text-center">{link.icon}</td>
        <td className="px-3 py-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
            link.enabled
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-400"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${link.enabled ? "bg-emerald-500" : "bg-zinc-400"}`} />
            {link.enabled ? "ON" : "OFF"}
          </span>
        </td>
        <td className="px-5 py-3 text-right">
          <div className="flex items-center justify-end gap-2 opacity-60 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg border border-border px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              수정
            </button>
            <button
              onClick={onDelete}
              className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-rose-700"
            >
              삭제
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="bg-indigo-50/40 dark:bg-indigo-500/5">
      <td className="px-5 py-3">
        <a
          href={`/@${link.user.handle}`}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          @{link.user.handle}
        </a>
      </td>
      <td className="px-3 py-3">
        <select
          value={form.platform}
          onChange={(e) => setForm({ ...form, platform: e.target.value })}
          className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs focus:border-indigo-500 focus:outline-none"
        >
          {PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </td>
      <td className="px-3 py-3">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          maxLength={60}
          className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs focus:border-indigo-500 focus:outline-none"
        />
      </td>
      <td className="px-3 py-3">
        <input
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          className="h-8 w-full max-w-[280px] rounded-lg border border-border bg-background px-2 text-xs focus:border-indigo-500 focus:outline-none"
        />
      </td>
      <td className="px-3 py-3">
        <input
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          maxLength={120}
          className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs focus:border-indigo-500 focus:outline-none"
        />
      </td>
      <td className="px-3 py-3">
        <input
          value={form.icon}
          onChange={(e) => setForm({ ...form, icon: e.target.value })}
          maxLength={4}
          disabled={form.platform !== "other"}
          className="h-8 w-14 rounded-lg border border-border bg-background px-2 text-center text-xs focus:border-indigo-500 focus:outline-none disabled:opacity-40"
        />
      </td>
      <td className="px-3 py-3">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
            className="h-4 w-4 rounded border-border text-indigo-600"
          />
        </label>
      </td>
      <td className="px-5 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={save}
            className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
          >
            저장
          </button>
          <button
            onClick={() => setEditing(false)}
            className="rounded-lg border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            취소
          </button>
        </div>
      </td>
    </tr>
  );
}

function CreateLinkModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [userQuery, setUserQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [form, setForm] = useState({
    platform: "discord_server",
    title: "",
    handle: "",
    subtitle: "",
    icon: "",
    enabled: true,
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (userQuery) {
      params.set("q", userQuery);
      params.set("by", "handle");
    }
    params.set("limit", "20");
    fetch(`/api/admin/users?${params.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []))
      .catch(() => {});
  }, [userQuery]);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          platform: form.platform,
          title: form.title,
          handle: form.handle,
          subtitle: form.subtitle,
          icon: form.icon,
          enabled: form.enabled,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "생성 실패");
      }
      onCreated();
    } catch (e: any) {
      setError(e?.message ?? "오류");
    } finally {
      setCreating(false);
    }
  };

  const isOther = form.platform === "other";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold tracking-tight">링크 수동 생성</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-rose-300/40 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-4">
          {/* User selector */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">사용자 선택</label>
            <input
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="핸들로 검색..."
              className="mt-1 h-9 w-full rounded-lg border border-border bg-muted/50 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            {users.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-border bg-background">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setSelectedUserId(u.id);
                      setUserQuery(`@${u.handle}`);
                      setUsers([]);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                      selectedUserId === u.id ? "bg-indigo-50 dark:bg-indigo-500/10" : ""
                    }`}
                  >
                    <span className="font-medium">@{u.handle}</span>
                    <span className="text-xs text-muted-foreground">{u.name ?? ""}</span>
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground">{u.id}</span>
                  </button>
                ))}
              </div>
            )}
            {selectedUserId && (
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                ✓ 선택됨: {selectedUserId}
              </p>
            )}
          </div>

          {/* Platform */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">플랫폼</label>
            <select
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
              className="mt-1 h-9 w-full rounded-lg border border-border bg-muted/50 px-3 text-sm focus:border-indigo-500 focus:outline-none"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">제목</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={60}
              placeholder="링크 제목"
              className="mt-1 h-9 w-full rounded-lg border border-border bg-muted/50 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Handle/URL */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              {isOther ? "URL" : "핸들 또는 URL"}
            </label>
            <input
              value={form.handle}
              onChange={(e) => setForm({ ...form, handle: e.target.value })}
              placeholder={
                isOther
                  ? "https://example.com"
                  : form.platform === "x"
                  ? "@username 또는 URL"
                  : form.platform === "discord_server"
                  ? "초대 URL"
                  : "핸들 또는 URL"
              }
              className="mt-1 h-9 w-full rounded-lg border border-border bg-muted/50 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">부제목 (선택)</label>
            <input
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              maxLength={120}
              placeholder="부제목"
              className="mt-1 h-9 w-full rounded-lg border border-border bg-muted/50 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Icon (only for "other") */}
          {isOther && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">아이콘 (이모지 1개)</label>
              <input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                maxLength={4}
                placeholder="🔗"
                className="mt-1 h-9 w-20 rounded-lg border border-border bg-muted/50 px-3 text-center text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          )}

          {/* Enabled */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
              className="h-4 w-4 rounded border-border text-indigo-600"
            />
            활성화
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            취소
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !selectedUserId || !form.title || !form.handle}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {creating ? "생성 중..." : "링크 생성"}
          </button>
        </div>
      </div>
    </div>
  );
}
