"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Container, GlassCard } from "@/components/ui";

const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "1";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user) {
      router.replace("/dashboard");
      return;
    }
    setChecking(false);
  }, [session, status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        handle,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("아이디 또는 비밀번호가 올바르지 않아요");
        setLoading(false);
        return;
      }
      router.replace("/dashboard");
    } catch {
      setError("로그인 중 문제가 발생했어요.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-pink-200 to-violet-200 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 relative overflow-hidden transition-colors">
      <div className="absolute inset-0 noise opacity-40 dark:opacity-20" />
      <Container className="relative py-16 pb-28">
        <GlassCard className="bg-white/45 border-white/50 dark:bg-white/10 dark:border-white/15 p-8 max-w-md mx-auto">
          {checking ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-white" />
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Fluffy Link
              </h1>
              <p className="mt-2 text-slate-700 dark:text-slate-300">
                로그인하고 프로필을 관리해보세요!
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                    아이디
                  </label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    autoComplete="username"
                    className="mt-2 w-full rounded-xl border border-white/50 bg-white/60 px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/60 dark:border-white/15 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
                    placeholder="아이디 입력"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="mt-2 w-full rounded-xl border border-white/50 bg-white/60 px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/60 dark:border-white/15 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
                    placeholder="비밀번호 입력"
                  />
                </div>

                {error ? (
                  <p className="text-sm font-semibold text-rose-500">{error}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={loading || !handle || !password}
                  className="w-full rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white shadow-soft transition hover:opacity-95 active:scale-[0.99] disabled:opacity-50 dark:bg-white dark:text-slate-900"
                >
                  {loading ? "로그인 중..." : "로그인"}
                </button>
              </form>

              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-300/60 dark:bg-white/15" />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  또는
                </span>
                <div className="h-px flex-1 bg-slate-300/60 dark:bg-white/15" />
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#5865F2] px-5 py-3 font-semibold text-white shadow-soft transition hover:opacity-95 active:scale-[0.99]"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3.1a.074.074 0 0 0-.079.037c-.34.6-.718 1.385-.982 2.003a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.997-2.003.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  Discord로 로그인
                </button>

                {googleEnabled ? (
                  <button
                    type="button"
                    onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-slate-700 shadow-soft border border-slate-200 transition hover:bg-slate-50 active:scale-[0.99] dark:bg-white/10 dark:text-white dark:border-white/15 dark:hover:bg-white/15"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google로 로그인
                  </button>
                ) : null}
              </div>

              <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                아직 회원이 아니신가요?{" "}
                <a
                  href="/register"
                  className="font-semibold text-violet-600 hover:underline dark:text-violet-400"
                >
                  회원가입하기
                </a>
              </p>
            </>
          )}
        </GlassCard>
      </Container>
    </div>
  );
}
