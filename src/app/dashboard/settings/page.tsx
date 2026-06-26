"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Container, GlassCard } from "@/components/ui";

type AccountInfo = {
  id: string;
  provider: string;
  providerAccountId: string;
  type: string;
  createdAt: string;
};

const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "1";

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [hasPassword, setHasPassword] = useState(false);
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(true);

  // migration modal
  const [migration, setMigration] = useState<{ provider: string; providerAccountId: string } | null>(null);

  // password modal
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // toast
  const [toast, setToast] = useState<{ kind: "success" | "error" | "info"; message: string } | null>(null);

  function showToast(kind: "success" | "error" | "info", message: string) {
    setToast({ kind, message });
    window.setTimeout(() => setToast(null), 5000);
  }

  // Read URL params for linked/migration_needed/info/error
  useEffect(() => {
    const linked = searchParams.get("linked");
    const migrationNeeded = searchParams.get("migration_needed");
    const providerAccountId = searchParams.get("provider_account_id");
    const info = searchParams.get("info");
    const error = searchParams.get("error");

    if (linked) {
      showToast("success", `${linked === "discord" ? "Discord" : "Google"} 연동이 완료되었어요!`);
      // clean URL
      router.replace("/dashboard/settings");
    } else if (info === "already_linked") {
      showToast("info", "이미 연동되어 있는 계정이에요.");
      router.replace("/dashboard/settings");
    } else if (error) {
      const messages: Record<string, string> = {
        oauth_cancelled: "연동이 취소되었어요.",
        invalid_state: "잘못된 요청이에요. 다시 시도해주세요.",
        missing_params: "필수 정보가 누락되었어요.",
        token_exchange_failed: "인증 토큰 교환에 실패했어요.",
        no_access_token: "액세스 토큰을 가져오지 못했어요.",
        discord_user_fetch_failed: "Discord 사용자 정보를 가져오지 못했어요.",
        google_user_fetch_failed: "Google 사용자 정보를 가져오지 못했어요.",
        no_discord_id: "Discord ID를 가져오지 못했어요.",
        no_google_sub: "Google ID를 가져오지 못했어요.",
        google_not_configured: "Google 로그인이 설정되지 않았어요.",
      };
      showToast("error", messages[error] ?? "오류가 발생했어요.");
      router.replace("/dashboard/settings");
    }

    if (migrationNeeded && providerAccountId) {
      setMigration({ provider: migrationNeeded, providerAccountId });
    }
  }, [searchParams, router]);

  async function fetchAccounts() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/accounts");
      const data = await res.json();
      if (data?.ok) {
        setAccounts(data.accounts);
        setHasPassword(data.hasPassword);
        setHandle(data.handle);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAccounts();
  }, []);

  const hasDiscord = accounts.some((a) => a.provider === "discord");
  const hasGoogle = accounts.some((a) => a.provider === "google");
  const hasCredentials = accounts.some((a) => a.provider === "credentials");

  async function unlinkAccount(provider: string, providerAccountId: string) {
    if (!confirm(`정말로 ${provider === "discord" ? "Discord" : provider === "google" ? "Google" : "아이디/비밀번호"} 연동을 해제할까요?`)) return;
    try {
      const res = await fetch("/api/auth/unlink", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider, providerAccountId }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data?.error ?? "연동 해제에 실패했어요.");
        return;
      }
      showToast("success", "연동을 해제했어요.");
      fetchAccounts();
    } catch {
      showToast("error", "연동 해제 중 오류가 발생했어요.");
    }
  }

  async function doMigration() {
    if (!migration) return;
    setPwLoading(true);
    try {
      const res = await fetch("/api/auth/migrate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          provider: migration.provider,
          providerAccountId: migration.providerAccountId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data?.error ?? "마이그레이션에 실패했어요.");
        setPwLoading(false);
        return;
      }
      showToast("success", "기존 프로필 데이터를 현재 계정으로 옮겼어요!");
      setMigration(null);
      fetchAccounts();
      // Redirect to dashboard to see the migrated data
      router.push("/dashboard");
    } catch {
      showToast("error", "마이그레이션 중 오류가 발생했어요.");
      setPwLoading(false);
    }
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (pwNew.length < 8) {
      setPwError("비밀번호는 8자 이상이어야 해요.");
      return;
    }
    if (!/[a-zA-Z]/.test(pwNew) || !/[0-9]/.test(pwNew)) {
      setPwError("영문과 숫자를 모두 포함해야 해요.");
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwError("비밀번호 확인이 일치하지 않아요.");
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwCurrent || null,
          newPassword: pwNew,
          confirmPassword: pwConfirm,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data?.error ?? "비밀번호 설정에 실패했어요.");
        setPwLoading(false);
        return;
      }
      showToast("success", hasPassword ? "비밀번호를 변경했어요!" : "비밀번호를 설정했어요!");
      setPwModalOpen(false);
      setPwCurrent("");
      setPwNew("");
      setPwConfirm("");
      fetchAccounts();
    } catch {
      setPwError("비밀번호 설정 중 오류가 발생했어요.");
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-pink-200 to-violet-200 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 relative overflow-hidden transition-colors">
      <div className="absolute inset-0 noise opacity-40 dark:opacity-20" />
      <Container className="relative py-10">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl bg-white/60 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-white/80 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
          >
            ← 대시보드로
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            설정 · 연결된 계정
          </h1>
        </div>

        <GlassCard className="bg-white/45 border-white/50 dark:bg-white/10 dark:border-white/15 p-6 max-w-2xl">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-white" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Account list */}
              <section>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  연결된 계정
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  로그인에 사용할 수 있는 계정들이에요.
                </p>

                <div className="mt-4 space-y-3">
                  {/* Credentials */}
                  <AccountRow
                    label="아이디 / 비밀번호"
                    sub={handle ? `@${handle}` : "활성화됨"}
                    connected={hasCredentials || hasPassword}
                    onAction={
                      hasPassword
                        ? { label: "비밀번호 변경", onClick: () => setPwModalOpen(true) }
                        : { label: "비밀번호 설정", onClick: () => setPwModalOpen(true) }
                    }
                    onUnlink={
                      hasCredentials && (hasDiscord || hasGoogle)
                        ? () => unlinkAccount("credentials", handle.toLowerCase())
                        : undefined
                    }
                  />

                  {/* Discord */}
                  <AccountRow
                    label="Discord"
                    sub={hasDiscord ? "연동됨" : "미연동"}
                    connected={hasDiscord}
                    onAction={
                      hasDiscord
                        ? undefined
                        : { label: "Discord 연동", href: "/api/link/discord" }
                    }
                    onUnlink={
                      hasDiscord && (hasGoogle || hasPassword || hasCredentials)
                        ? () => {
                            const acct = accounts.find((a) => a.provider === "discord");
                            if (acct) unlinkAccount("discord", acct.providerAccountId);
                          }
                        : undefined
                    }
                  />

                  {/* Google */}
                  {googleEnabled ? (
                    <AccountRow
                      label="Google"
                      sub={hasGoogle ? "연동됨" : "미연동"}
                      connected={hasGoogle}
                      onAction={
                        hasDiscord
                          ? undefined
                          : { label: "Google 연동", href: "/api/link/google" }
                      }
                      onUnlink={
                        hasGoogle && (hasDiscord || hasPassword || hasCredentials)
                          ? () => {
                              const acct = accounts.find((a) => a.provider === "google");
                              if (acct) unlinkAccount("google", acct.providerAccountId);
                            }
                          : undefined
                      }
                    />
                  ) : null}
                </div>
              </section>
            </div>
          )}
        </GlassCard>
      </Container>

      {/* Migration modal */}
      {migration ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              이미 {migration.provider === "discord" ? "Discord" : "Google"}으로 만들어진 프로필이 있어요!
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              이 소셜 계정으로 이미 가입된 프로필이 존재해요. 기존 프로필의 데이터(링크, 소개글, 테마 등)를 현재 계정으로 옮길 수 있어요.
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              마이그레이션을 진행하면 기존 프로필의 데이터가 현재 계정으로 합쳐지고, 기존 계정은 삭제돼요.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setMigration(null);
                  router.replace("/dashboard/settings");
                }}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
              >
                옮기지 않을래요
              </button>
              <button
                type="button"
                onClick={doMigration}
                disabled={pwLoading}
                className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white hover:opacity-95 disabled:opacity-50 dark:bg-white dark:text-slate-900"
              >
                {pwLoading ? "옮기는 중..." : "이 계정으로 옮기기"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Password modal */}
      {pwModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {hasPassword ? "비밀번호 변경" : "비밀번호 설정"}
            </h2>
            <form onSubmit={submitPassword} className="mt-4 space-y-4">
              {hasPassword ? (
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                    현재 비밀번호
                  </label>
                  <input
                    type="password"
                    value={pwCurrent}
                    onChange={(e) => setPwCurrent(e.target.value)}
                    autoComplete="current-password"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400/60 dark:border-white/15 dark:bg-white/10 dark:text-white"
                  />
                </div>
              ) : null}
              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  value={pwNew}
                  onChange={(e) => setPwNew(e.target.value)}
                  autoComplete="new-password"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400/60 dark:border-white/15 dark:bg-white/10 dark:text-white"
                  placeholder="8자 이상, 영문+숫자"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  value={pwConfirm}
                  onChange={(e) => setPwConfirm(e.target.value)}
                  autoComplete="new-password"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400/60 dark:border-white/15 dark:bg-white/10 dark:text-white"
                />
              </div>
              {pwError ? <p className="text-sm font-semibold text-rose-500">{pwError}</p> : null}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPwModalOpen(false);
                    setPwError("");
                    setPwCurrent("");
                    setPwNew("");
                    setPwConfirm("");
                  }}
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={pwLoading || !pwNew || !pwConfirm}
                  className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white hover:opacity-95 disabled:opacity-50 dark:bg-white dark:text-slate-900"
                >
                  {pwLoading ? "저장 중..." : "저장"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Toast */}
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50">
          <div
            className={`rounded-2xl px-4 py-3 shadow-soft border backdrop-blur-glass text-sm font-semibold ${
              toast.kind === "success"
                ? "bg-emerald-600/90 border-emerald-300/30 text-white"
                : toast.kind === "error"
                  ? "bg-rose-600/90 border-rose-300/30 text-white"
                  : "bg-slate-900/80 border-white/15 text-white"
            }`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AccountRow({
  label,
  sub,
  connected,
  onAction,
  onUnlink,
}: {
  label: string;
  sub: string;
  connected: boolean;
  onAction?: { label: string; onClick?: () => void; href?: string };
  onUnlink?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/45 bg-white/40 p-4 dark:border-white/15 dark:bg-white/10">
      <div>
        <div className="font-bold text-slate-900 dark:text-white">{label}</div>
        <div className="text-xs text-slate-600 dark:text-slate-400">{sub}</div>
      </div>
      <div className="flex items-center gap-2">
        {connected ? (
          <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            ✓ 연결됨
          </span>
        ) : null}
        {onAction ? (
          onAction.href ? (
            <a
              href={onAction.href}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-95 dark:bg-white dark:text-slate-900"
            >
              {onAction.label}
            </a>
          ) : (
            <button
              type="button"
              onClick={onAction.onClick}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-95 dark:bg-white dark:text-slate-900"
            >
              {onAction.label}
            </button>
          )
        ) : null}
        {onUnlink ? (
          <button
            type="button"
            onClick={onUnlink}
            className="rounded-xl border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-400/30 dark:text-rose-400 dark:hover:bg-rose-500/10"
          >
            해제
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-white" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
