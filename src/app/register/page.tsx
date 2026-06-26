"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Container, GlassCard } from "@/components/ui";

const HANDLE_REGEX = /^[a-z0-9가-힣._]+$/u;

export default function RegisterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user) {
      window.location.href = "/dashboard";
      return;
    }
    setChecking(false);
  }, [session, status]);

  function validateHandle(h: string): string | null {
    const lower = h.toLowerCase();
    if (lower.length < 3 || lower.length > 20) {
      return "아이디는 3~20자여야 해요.";
    }
    if (!HANDLE_REGEX.test(lower)) {
      return "영어 소문자, 숫자, 한글, _, . 만 사용할 수 있어요.";
    }
    return null;
  }

  function validatePassword(p: string): string | null {
    if (p.length < 8) return "비밀번호는 8자 이상이어야 해요.";
    if (!/[a-zA-Z]/.test(p) || !/[0-9]/.test(p)) {
      return "영문과 숫자를 모두 포함해야 해요.";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const handleErr = validateHandle(handle);
    if (handleErr) {
      setError(handleErr);
      return;
    }
    const passErr = validatePassword(password);
    if (passErr) {
      setError(passErr);
      return;
    }
    if (password !== confirmPassword) {
      setError("비밀번호 확인이 일치하지 않아요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handle, password, confirmPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "회원가입에 실패했어요.");
        setLoading(false);
        return;
      }

      // Auto-login after register — redirect: true로 설정해서 NextAuth가 직접 처리
      signIn("credentials", {
        handle,
        password,
        callbackUrl: "/dashboard",
      });
      // redirect: true이므로 페이지가 자동으로 전환됨 — 여기서 아무것도 하지 않음
    } catch {
      setError("회원가입 중 문제가 발생했어요.");
      setLoading(false);
    }
  }

  const handleErr = validateHandle(handle);
  const passErr = validatePassword(password);
  const confirmErr = confirmPassword && password !== confirmPassword ? "비밀번호 확인이 일치하지 않아요." : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-200 via-sky-200 to-violet-300 dark:from-slate-950 dark:via-indigo-950 dark:to-fuchsia-950 relative overflow-hidden transition-colors">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-pink-300/40 dark:bg-fuchsia-500/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-violet-300/40 dark:bg-indigo-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-sky-300/40 dark:bg-sky-500/10 blur-3xl" />
      <div className="absolute inset-0 noise opacity-[0.35] dark:opacity-[0.15]" />
      <Container className="relative py-16 pb-28">
        <GlassCard className="bg-white/45 border-white/50 dark:bg-white/10 dark:border-white/15 p-8 max-w-md mx-auto">
          {checking ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-white" />
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center mb-2">
                <span className="relative inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-full ring-2 ring-white/70 dark:ring-white/20 shadow-sm mb-3">
                  <Image src="/logo.png" alt="Fluffy Link" width="56" height="56" className="h-full w-full object-cover" priority />
                </span>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  회원가입
                </h1>
                <p className="mt-2 text-slate-700 dark:text-slate-300">
                  Fluffy Link에서 나만의 프로필을 만들어보세요!
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                    아이디 (핸들)
                  </label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    autoComplete="username"
                    maxLength={20}
                    className="mt-2 w-full rounded-xl border border-white/50 bg-white/60 px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/60 dark:border-white/15 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
                    placeholder="예시) cloud"
                  />
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    영어/숫자/한글/_/. 3~20자 (소문자로 저장돼요)
                  </p>
                  {handle && handleErr ? (
                    <p className="mt-1 text-xs font-semibold text-rose-500">{handleErr}</p>
                  ) : null}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="mt-2 w-full rounded-xl border border-white/50 bg-white/60 px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/60 dark:border-white/15 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
                    placeholder="8자 이상, 영문+숫자"
                  />
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    8자 이상, 영문+숫자 필수
                  </p>
                  {password && passErr ? (
                    <p className="mt-1 text-xs font-semibold text-rose-500">{passErr}</p>
                  ) : null}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                    비밀번호 확인
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="mt-2 w-full rounded-xl border border-white/50 bg-white/60 px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/60 dark:border-white/15 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
                    placeholder="비밀번호 다시 입력"
                  />
                  {confirmPassword && confirmErr ? (
                    <p className="mt-1 text-xs font-semibold text-rose-500">{confirmErr}</p>
                  ) : null}
                </div>

                {error ? (
                  <p className="text-sm font-semibold text-rose-500">{error}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={loading || !handle || !password || !confirmPassword}
                  className="w-full rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white shadow-soft transition hover:opacity-95 active:scale-[0.99] disabled:opacity-50 dark:bg-white dark:text-slate-900"
                >
                  {loading ? "가입 중..." : "가입하기"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                이미 회원이신가요?{" "}
                <a
                  href="/login"
                  className="font-semibold text-violet-600 hover:underline dark:text-violet-400"
                >
                  로그인하기
                </a>
              </p>
            </>
          )}
        </GlassCard>
      </Container>
    </div>
  );
}
