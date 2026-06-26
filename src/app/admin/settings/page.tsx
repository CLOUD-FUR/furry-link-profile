"use client";

import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [envInfo, setEnvInfo] = useState<{
    adminIds: string[];
    nextAuthUrl: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 간단한 플레이스홀더 — 환경 변수는 서버만 알고 있으므로 클라이언트에선 표시하지 않음
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">설정</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          관리자 콘솔 설정 및 환경 정보
        </p>
      </div>

      {/* Admin info */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold tracking-tight">관리자 정보</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          현재 관리자 권한이 부여된 Discord ID 목록
        </p>

        <div className="mt-4 rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-xs text-muted-foreground">ADMIN_DISCORD_IDS</p>
          <p className="mt-1 font-mono text-sm text-foreground">
            서버 환경 변수에서 설정됨 (.env)
          </p>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-300/40 bg-amber-50 p-4 dark:bg-amber-500/10">
          <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
          <div className="text-sm">
            <p className="font-medium text-amber-900 dark:text-amber-300">
              관리자 ID 추가/변경 방법
            </p>
            <p className="mt-1 text-amber-800 dark:text-amber-400/80">
              프로젝트 루트의 <code className="rounded bg-amber-100 px-1 py-0.5 text-xs dark:bg-amber-500/20">.env</code> 파일에서{" "}
              <code className="rounded bg-amber-100 px-1 py-0.5 text-xs dark:bg-amber-500/20">ADMIN_DISCORD_IDS</code> 값을 쉼표로 구분하여 설정하세요.
            </p>
          </div>
        </div>
      </div>

      {/* Auth config */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold tracking-tight">인증 설정</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          NextAuth + Discord OAuth 구성
        </p>

        <div className="mt-4 space-y-3">
          <ConfigRow label="인증 제공자" value="Discord OAuth" />
          <ConfigRow label="세션 전략" value="JWT" />
          <ConfigRow label="로그인 페이지" value="/login" />
          <ConfigRow label="스코프" value="identify email" />
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-lg border border-indigo-300/40 bg-indigo-50 p-4 dark:bg-indigo-500/10">
          <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <div className="text-sm">
            <p className="font-medium text-indigo-900 dark:text-indigo-300">
              Discord OAuth 설정
            </p>
            <p className="mt-1 text-indigo-800 dark:text-indigo-400/80">
              <code className="rounded bg-indigo-100 px-1 py-0.5 text-xs dark:bg-indigo-500/20">DISCORD_CLIENT_ID</code>,{" "}
              <code className="rounded bg-indigo-100 px-1 py-0.5 text-xs dark:bg-indigo-500/20">DISCORD_CLIENT_SECRET</code>,{" "}
              <code className="rounded bg-indigo-100 px-1 py-0.5 text-xs dark:bg-indigo-500/20">NEXTAUTH_SECRET</code>,{" "}
              <code className="rounded bg-indigo-100 px-1 py-0.5 text-xs dark:bg-indigo-500/20">NEXTAUTH_URL</code> 값을 .env에 설정해야 합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Database */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold tracking-tight">데이터베이스</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Prisma + PostgreSQL (Neon) 구성
        </p>

        <div className="mt-4 space-y-3">
          <ConfigRow label="ORM" value="Prisma 6.x" />
          <ConfigRow label="DB" value="PostgreSQL (Neon)" />
          <ConfigRow label="스키마" value="prisma/schema.prisma" />
          <ConfigRow label="모델" value="User, Link, Visit, ProfileVisit, Log" />
        </div>

        <div className="mt-4 flex gap-2">
          <a
            href="/api/admin/stats"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            stats API 확인
          </a>
          <a
            href="/api/admin/logs"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            logs API 확인
          </a>
        </div>
      </div>

      {/* About */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-indigo-50 to-purple-50 p-5 shadow-sm dark:from-indigo-500/10 dark:to-purple-500/10 sm:p-6">
        <h3 className="text-base font-semibold tracking-tight">Fluffy Link Admin</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          무료 링크인바이오 서비스 관리자 콘솔
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            운영 중
          </span>
          <span>v1.0.0</span>
        </div>
      </div>
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
