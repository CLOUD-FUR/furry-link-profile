"use client";

import Image from "next/image";
import { Container, ButtonLink } from "@/components/ui";
import { HomeFeatureList } from "@/components/home-feature-list";
import { HomePreviewCard } from "@/components/home-preview-card";
import { HomeUserCount } from "@/components/home-user-count";
import ScrollReveal from "@/components/scroll-reveal";

export default function HomePageClient({ initialCount }: { initialCount: number | null }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-200 via-sky-200 to-violet-300 dark:from-slate-950 dark:via-indigo-950 dark:to-fuchsia-950 relative overflow-hidden transition-colors">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-pink-300/40 dark:bg-fuchsia-500/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-violet-300/40 dark:bg-indigo-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-sky-300/40 dark:bg-sky-500/10 blur-3xl" />
      <div className="absolute inset-0 noise opacity-[0.35] dark:opacity-[0.15]" />

      <header className="sticky top-3 sm:top-4 z-30">
        <Container>
          <div className="relative flex items-center justify-between gap-3 rounded-full border border-white/60 dark:border-white/15 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl shadow-soft px-3 py-2 sm:px-4 sm:py-2.5">
            <a href="/" className="group flex items-center gap-2.5 shrink-0 pl-1">
              <span className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-2 ring-white/70 dark:ring-white/20 shadow-sm transition-transform group-hover:rotate-6">
                <Image src="/logo.png" alt="Fluffy Link" width="36" height="36" className="h-full w-full object-cover" priority />
              </span>
              <span className="font-black tracking-tight text-lg sm:text-xl text-slate-900 dark:text-slate-50">
                Fluffy Link
              </span>
            </a>
            <nav className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <ButtonLink href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex rounded-full">
                로그인
              </ButtonLink>
              <ButtonLink href="/user" variant="secondary" size="sm" className="rounded-full">
                유저 목록
              </ButtonLink>
            </nav>
          </div>
        </Container>
      </header>

      <Container className="relative py-8 sm:py-12 pb-32">
        <ScrollReveal />

        <section className="mt-10 sm:mt-20 grid gap-12 lg:gap-16 lg:grid-cols-[1.05fr_0.95fr] items-center">
          <div>
            <div className="reveal inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/55 dark:border-white/15 dark:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 backdrop-blur" data-reveal-delay="0">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              퍼리·퍼슈터 전용
            </div>

            <h1 className="reveal mt-5 text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-slate-50" style={{ wordBreak: "keep-all" }} data-reveal-delay="80">
              여러 개의 링크를
              <span className="block bg-gradient-to-r from-pink-500 via-violet-500 to-sky-500 bg-clip-text text-transparent">
                하나로 쉽게 관리
              </span>
            </h1>

            <p className="reveal mt-5 max-w-md text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-relaxed" style={{ wordBreak: "keep-all" }} data-reveal-delay="160">
              Discord 로그인만으로 1분 만에 나만의 링크 프로필을 만들어보세요. 테마, 통계, 커스텀 컬러 등 다양한 기능을 지원합니다.
            </p>

            <div className="reveal mt-7 flex flex-col sm:flex-row gap-3" data-reveal-delay="240">
              <ButtonLink
                href="/login"
                size="lg"
                variant="primary"
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 border-transparent text-white hover:from-indigo-500 hover:via-violet-500 hover:to-fuchsia-500 dark:from-indigo-500 dark:via-violet-500 dark:to-fuchsia-500 dark:text-white dark:border-transparent shadow-[0_15px_35px_-12px_rgba(124,58,237,0.55)]"
              >
                플러피링크 시작하기
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M7.293 4.293a1 1 0 0 1 1.414 0l5 5a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414-1.414L11.586 10 7.293 5.707a1 1 0 0 1 0-1.414Z" clipRule="evenodd" />
                </svg>
              </ButtonLink>
              <ButtonLink href="/@CLOUD" variant="secondary" size="lg" className="w-full sm:w-auto">
                실제 플러피링크 제작자 프로필 화면이에요.
              </ButtonLink>
            </div>

            <div className="mt-6 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex -space-x-2">
                {["from-pink-400 to-rose-500", "from-sky-400 to-indigo-500", "from-amber-400 to-orange-500", "from-emerald-400 to-teal-500"].map((g, i) => (
                  <span key={i} className={`inline-block h-7 w-7 rounded-full border-2 border-white dark:border-slate-900 bg-gradient-to-br ${g}`} />
                ))}
              </div>
              <span>
                <HomeUserCount initialCount={initialCount} />
              </span>
            </div>

            <HomeFeatureList />
          </div>

          <HomePreviewCard />
        </section>

        <section className="mt-24 sm:mt-40">
          <div className="reveal text-center max-w-2xl mx-auto" data-reveal-delay="0">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">Features</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50" style={{ wordBreak: "keep-all" }}>
              강력한 기능들
            </h2>
            <p className="mt-3 text-slate-700 dark:text-slate-300" style={{ wordBreak: "keep-all" }}>
              프로필을 더욱 특별하게 만들어줄 다양한 기능
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="🎨"
              title="다양한 테마"
              desc="파스텔, 다크, 네온 등 12가지 테마와 커스텀 컬러 지원"
              gradient="from-pink-400 to-rose-500"
              revealDelay={80}
            />
            <FeatureCard
              icon="📊"
              title="방문자 통계"
              desc="프로필 조회수, 링크 클릭 수, 국가별 통계 확인"
              gradient="from-sky-400 to-indigo-500"
              revealDelay={160}
            />
            <FeatureCard
              icon="🎭"
              title="프로필 뱃지"
              desc="퍼슈터, 아티스트, 스트리머 등 나를 표현하는 뱃지"
              gradient="from-violet-400 to-purple-500"
              revealDelay={240}
            />
            <FeatureCard
              icon="✨"
              title="프로필 효과"
              desc="눈 내리는 효과, 색종이, 별똥별 등 화려한 배경 효과"
              gradient="from-fuchsia-400 to-pink-500"
              revealDelay={320}
            />
            <FeatureCard
              icon="🔗"
              title="무제한 링크"
              desc="Twitter, YouTube, Discord 등 원하는 만큼 링크 추가"
              gradient="from-amber-400 to-orange-500"
              revealDelay={400}
            />
            <FeatureCard
              icon="🚀"
              title="빠른 시작"
              desc="Discord 로그인만으로 1분 안에 프로필 완성"
              gradient="from-emerald-400 to-teal-500"
              revealDelay={480}
            />
          </div>
        </section>
      </Container>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  gradient,
  revealDelay,
}: {
  icon: string;
  title: string;
  desc: string;
  gradient: string;
  revealDelay: number;
}) {
  return (
    <div
      className="reveal group rounded-3xl border border-white/60 dark:border-white/15 bg-white/55 dark:bg-white/10 p-6 backdrop-blur-glass shadow-soft transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)]"
      data-reveal-delay={revealDelay}
    >
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-2xl leading-none shadow-sm`}>
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-50">{title}</h3>
      <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{desc}</p>
    </div>
  );
}
