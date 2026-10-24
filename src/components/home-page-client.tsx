"use client";

import { Container, GlassCard, ButtonLink } from "@/components/ui";
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
              <span className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-2 ring-white/70 dark:ring-white/20 shadow-sm transition-transform group-hover:rotate-6 bg-gradient-to-br from-indigo-500 to-purple-600">
                <img src="/logo.png" alt="Fluffy Link" width="36" height="36" className="h-full w-full object-cover" />
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
                유저 리스트
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
              퍼리·퍼슈터를 위한 링크 모음 서비스
            </div>

            <h1 className="reveal mt-5 text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-slate-50" style={{ wordBreak: "keep-all" }} data-reveal-delay="80">
              모든 링크를
              <span className="block bg-gradient-to-r from-pink-500 via-violet-500 to-sky-500 bg-clip-text text-transparent">
                하나의 링크로
              </span>
            </h1>

            <p className="reveal mt-5 max-w-md text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-relaxed" style={{ wordBreak: "keep-all" }} data-reveal-delay="160">
              Discord로 간편하게 로그인하고, 나만의 프로필을 1분 안에 만들어 보세요. ✨
            </p>

            <div className="reveal mt-7 flex flex-col sm:flex-row gap-3" data-reveal-delay="240">
              <ButtonLink
                href="/login"
                size="lg"
                variant="primary"
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 border-transparent text-white hover:from-indigo-500 hover:via-violet-500 hover:to-fuchsia-500 dark:from-indigo-500 dark:via-violet-500 dark:to-fuchsia-500 dark:text-white dark:border-transparent shadow-[0_15px_35px_-12px_rgba(124,58,237,0.55)]"
              >
                플러피링크 이용하기
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M7.293 4.293a1 1 0 0 1 1.414 0l5 5a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414-1.414L11.586 10 7.293 5.707a1 1 0 0 1 0-1.414Z" clipRule="evenodd" />
                </svg>
              </ButtonLink>
              <ButtonLink href="/@CLOUD" variant="secondary" size="lg" className="w-full sm:w-auto">
                개발자 프로필
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
              플러피링크 기능들
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
              icon="🔗"
              title="무제한 링크"
              desc="Twitter, YouTube, Discord 등 원하는 만큼 링크 추가"
              gradient="from-sky-400 to-indigo-500"
              revealDelay={160}
            />
            <FeatureCard
              icon="🔐"
              title="간편한 로그인"
              desc="Discord 계정으로 빠르고 안전하게 시작"
              gradient="from-violet-400 to-fuchsia-500"
              revealDelay={240}
            />
            <FeatureCard
              icon="📱"
              title="모바일 최적화"
              desc="PC와 모바일에서 모두 완벽한 반응형 디자인"
              gradient="from-emerald-400 to-teal-500"
              revealDelay={320}
            />
            <FeatureCard
              icon="📊"
              title="방문자 통계"
              desc="프로필 조회수와 링크 클릭 수를 한눈에 확인"
              gradient="from-amber-400 to-orange-500"
              revealDelay={400}
            />
            <FeatureCard
              icon="💬"
              title="커뮤니티"
              desc="다른 유저들의 프로필을 탐색하고 영감을 얻으세요"
              gradient="from-cyan-400 to-blue-500"
              revealDelay={480}
            />
          </div>
        </section>

        <section className="mt-24 sm:mt-40">
          <div className="reveal relative overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 dark:from-indigo-700 dark:via-violet-700 dark:to-fuchsia-700 p-8 sm:p-16 text-center shadow-[0_30px_80px_-20px_rgba(124,58,237,0.55)]" data-reveal-delay="0">
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem] [clip-path:inset(0_round_2rem)]">
              <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-pink-400/40 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky-400/40 blur-3xl" />
              <div className="absolute inset-0 noise opacity-20" />
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur">
                지금 바로 시작
              </div>
              <h2 className="mt-5 text-3xl sm:text-5xl font-black tracking-tight text-white" style={{ wordBreak: "keep-all" }}>
                나만의 프로필 페이지를 만들어보세요
              </h2>
              <p className="mt-4 text-white/85 text-base sm:text-lg" style={{ wordBreak: "keep-all" }}>
                깔끔하고 심플한 나만의 페이지를 만들어보세요!
              </p>
              <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3">
                <ButtonLink
                  href="/login"
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto bg-white text-slate-900 border-white hover:bg-slate-100 dark:bg-white/10 dark:text-white dark:border-white/20 dark:hover:bg-white/15 dark:backdrop-blur shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
                >
                  무료로 시작하기
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path fillRule="evenodd" d="M7.293 4.293a1 1 0 0 1 1.414 0l5 5a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414-1.414L11.586 10 7.293 5.707a1 1 0 0 1 0-1.414Z" clipRule="evenodd" />
                  </svg>
                </ButtonLink>
                <ButtonLink
                  href="/user"
                  size="lg"
                  variant="ghost"
                  className="w-full sm:w-auto text-white border-white/30 hover:bg-white/15 dark:text-white dark:hover:bg-white/15"
                >
                  유저 목록 보기
                </ButtonLink>
              </div>
            </div>
          </div>

          <footer className="reveal mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600 dark:text-slate-400" data-reveal-delay="100">
            <div className="flex items-center gap-2">
              <span className="relative inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/60 dark:ring-white/15 bg-gradient-to-br from-indigo-500 to-purple-600">
                <img src="/logo.png" alt="Fluffy Link" width="28" height="28" className="h-full w-full object-cover" />
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-200">Fluffy Link</span>
              <span className="text-slate-500">© {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-5">
              <a href="/terms" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">이용약관</a>
              <a href="/questions" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">문의하기</a>
            </div>
          </footer>
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
  revealDelay = 0,
}: {
  icon: string;
  title: string;
  desc: string;
  gradient: string;
  revealDelay?: number;
}) {
  return (
    <div className="reveal group rounded-3xl border border-white/70 bg-white/65 dark:border-white/10 dark:bg-white/5 p-6 backdrop-blur-glass shadow-[0_20px_50px_-25px_rgba(15,23,42,0.25)] transition-all duration-300 hover:-translate-y-1 hover:bg-white/80 hover:shadow-[0_25px_60px_-25px_rgba(124,58,237,0.35)] dark:hover:bg-white/10 active:scale-[0.97] active:translate-y-0 cursor-pointer" data-reveal-delay={revealDelay}>
      <div
        className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-2xl shadow-[0_8px_20px_-8px_rgba(15,23,42,0.35)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 group-active:scale-95`}
      >
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-black tracking-tight text-slate-900 dark:text-slate-50">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{desc}</p>
    </div>
  );
}