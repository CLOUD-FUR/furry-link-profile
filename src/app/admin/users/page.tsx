"use client";

import { useEffect, useState, useCallback } from "react";

type User = {
  id: string;
  name: string | null;
  handle: string;
  bio: string;
  image: string;
  isPublic: boolean;
  listPublic: boolean;
  createdAt: string;
  _count: { links: number; profileVisits: number };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchBy, setSearchBy] = useState<"handle" | "id">("handle");
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    handle: "",
    bio: "",
    isPublic: true,
    listPublic: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) {
      params.set("q", query);
      params.set("by", searchBy);
    }
    const res = await fetch(`/api/admin/users?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      setError("불러오기 실패");
      setUsers([]);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setUsers(data.users ?? []);
    setError(null);
    setLoading(false);
  }, [query, searchBy]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const startEdit = (u: User) => {
    setEditing(u.id);
    setEditForm({
      handle: u.handle,
      bio: u.bio,
      isPublic: u.isPublic,
      listPublic: u.listPublic,
    });
  };

  const cancelEdit = () => {
    setEditing(null);
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${id}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "수정 실패");
      }
      setEditing(null);
      await fetchUsers();
    } catch (e: any) {
      setError(e?.message ?? "오류");
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (id: string, handle: string) => {
    if (!confirm(`정말 @${handle} 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}/delete`, { method: "POST" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "삭제 실패");
      }
      await fetchUsers();
    } catch (e: any) {
      setError(e?.message ?? "오류");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">사용자 관리</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          사용자를 검색하고 프로필을 수정하거나 삭제할 수 있습니다
        </p>
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
          <select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value as "handle" | "id")}
            className="h-9 rounded-lg border border-border bg-muted/50 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="handle">핸들</option>
            <option value="id">ID</option>
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
            placeholder={searchBy === "handle" ? "@handle 검색..." : "Discord ID 입력..."}
            className="h-9 flex-1 rounded-lg border border-border bg-muted/50 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            onClick={fetchUsers}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            검색
          </button>
          {query && (
            <button
              onClick={() => setQuery("")}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-5 sm:p-6">
          <h3 className="text-base font-semibold tracking-tight">사용자 목록</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {loading ? "불러오는 중..." : `총 ${users.length}명`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">핸들</th>
                <th className="px-3 py-3 font-medium">이름</th>
                <th className="px-3 py-3 font-medium">ID</th>
                <th className="px-3 py-3 font-medium">링크</th>
                <th className="px-3 py-3 font-medium">방문</th>
                <th className="px-3 py-3 font-medium">공개</th>
                <th className="px-3 py-3 font-medium">리스트</th>
                <th className="px-3 py-3 font-medium">가입일</th>
                <th className="px-5 py-3 text-right font-medium">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-muted-foreground">
                    불러오는 중…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-muted-foreground">
                    결과가 없습니다
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="group transition-colors hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <a
                        href={`/@${u.handle}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        @{u.handle}
                      </a>
                    </td>
                    <td className="px-3 py-3 text-foreground">{u.name ?? "-"}</td>
                    <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{u.id}</td>
                    <td className="px-3 py-3 text-muted-foreground">{u._count.links}</td>
                    <td className="px-3 py-3 text-muted-foreground">{u._count.profileVisits}</td>
                    <td className="px-3 py-3">
                      {editing === u.id ? (
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={editForm.isPublic}
                            onChange={(e) => setEditForm({ ...editForm, isPublic: e.target.checked })}
                            className="h-4 w-4 rounded border-border text-indigo-600"
                          />
                        </label>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.isPublic
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-400"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${u.isPublic ? "bg-emerald-500" : "bg-zinc-400"}`} />
                          {u.isPublic ? "ON" : "OFF"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {editing === u.id ? (
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={editForm.listPublic}
                            onChange={(e) => setEditForm({ ...editForm, listPublic: e.target.checked })}
                            className="h-4 w-4 rounded border-border text-indigo-600"
                          />
                        </label>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.listPublic
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-400"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${u.listPublic ? "bg-emerald-500" : "bg-zinc-400"}`} />
                          {u.listPublic ? "ON" : "OFF"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {editing === u.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => saveEdit(u.id)}
                            disabled={saving}
                            className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {saving ? "저장 중..." : "저장"}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="rounded-lg border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2 opacity-60 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => startEdit(u)}
                            className="rounded-lg border border-border px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => deleteUser(u.id, u.handle)}
                            disabled={u.id === "1362203848713703514"}
                            className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-40"
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit panel */}
      {editing && users.find((u) => u.id === editing) && (
        <EditPanel
          user={users.find((u) => u.id === editing)!}
          form={editForm}
          setForm={setEditForm}
          onSave={() => saveEdit(editing)}
          onCancel={cancelEdit}
          saving={saving}
        />
      )}
    </div>
  );
}

function EditPanel({
  user,
  form,
  setForm,
  onSave,
  onCancel,
  saving,
}: {
  user: User;
  form: { handle: string; bio: string; isPublic: boolean; listPublic: boolean };
  setForm: (f: any) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-lg sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold tracking-tight">
          @{user.handle} 수정
        </h3>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">핸들</label>
          <input
            value={form.handle}
            onChange={(e) => setForm({ ...form, handle: e.target.value })}
            maxLength={20}
            className="mt-1 h-9 w-full rounded-lg border border-border bg-muted/50 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">바이오</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            maxLength={500}
            rows={3}
            className="mt-1 w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
              className="h-4 w-4 rounded border-border text-indigo-600"
            />
            프로필 공개
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.listPublic}
              onChange={(e) => setForm({ ...form, listPublic: e.target.checked })}
              className="h-4 w-4 rounded border-border text-indigo-600"
            />
            리스트 노출
          </label>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
        >
          취소
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}
