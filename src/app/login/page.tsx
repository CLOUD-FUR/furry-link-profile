"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Container, GlassCard } from "@/components/ui";
import { SignInButton } from "@/components/signin-button";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user) {
      router.replace("/dashboard");
      return;
    }
    setChecking(false);
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-pink-200 to-violet-200 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 relative overflow-hidden transition-colors">
      <div className="absolute inset-0 noise opacity-40 dark:opacity-20" />
      <Container className="relative py-16 pb-28">
        <GlassCard className="bg-white/45 border-white/50 dark:bg-white/10 dark:border-white/15 p-8">
          {checking ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-white" />
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Discord로 로그인</h1>
              <p className="mt-2 text-slate-700 dark:text-slate-300">
                프로필을 만들기 위해 Discord로 로그인이 필요해요!
              </p>
              <div className="mt-6">
                <SignInButton />
              </div>
              <p className="mt-6 text-xs text-slate-600 dark:text-slate-400">
                로그인 후 디스코드 태그와 프로필 사진을 기본값으로 가져오고 따로 수정할 수 있어요!
              </p>
            </>
          )}
        </GlassCard>
      </Container>
    </div>
  );
}
