import { Container, GlassCard, ButtonLink } from "@/components/ui";
import { HomeFeatureList } from "@/components/home-feature-list";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-sky-200 to-violet-200 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 relative overflow-hidden transition-colors">
      <div className="absolute inset-0 noise opacity-40 dark:opacity-20" />
      <Container className="relative py-12 pb-28">
        <header className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="font-black tracking-tight text-xl text-slate-900 dark:text-white shrink-0">🐾 Fluffy Link</div>
          <nav className="flex shrink-0 items-center gap-2">
            <ButtonLink href="/login" className="whitespace-nowrap bg-white/70 border-white/60 hover:bg-white/85 dark:bg-white/15 dark:border-white/20 dark:hover:bg-white/25 dark:text-white">
              Discord 로그인
            </ButtonLink>
            <ButtonLink href="/@CLOUD" className="whitespace-nowrap bg-slate-900 text-white border-slate-900 dark:bg-white/20 dark:border-white/30 dark:text-white">
              개발자 프로필
            </ButtonLink>
          </nav>
        </header>

        <section className="mt-12 grid gap-8 lg:grid-cols-2">
          <div>
            <h1 className="text-5xl font-black tracking-tight leading-[1.05] text-slate-900 dark:text-white">
              All your links,
              <span className="block">in one link.</span>
            </h1>
            <p className="mt-4 text-slate-700 dark:text-slate-300 text-lg">
              Discord로 로그인하고 프로필 페이지를 바로 만들 수 있어요!
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/dashboard" className="bg-slate-900 text-white border-slate-900 dark:bg-white/20 dark:border-white/30">
                Discord로 시작하기
              </ButtonLink>
              <ButtonLink href="/@CLOUD" className="bg-white/70 border-white/60 hover:bg-white/85 dark:bg-white/15 dark:border-white/20 dark:hover:bg-white/25 dark:text-white">
                개발자 프로필
              </ButtonLink>
            </div>

            <HomeFeatureList />
          </div>

          <GlassCard className="bg-white/35 border-white/45 dark:bg-white/10 dark:border-white/15 p-6">
            <div className="mx-auto max-w-sm rounded-[2rem] border border-white/50 bg-white/30 dark:border-white/20 dark:bg-white/10 p-4 shadow-soft">
              <div className="h-28 rounded-2xl bg-gradient-to-r from-sky-300/60 to-violet-300/60" />
              <div className="-mt-8 flex justify-center">
                <div className="h-20 w-20 rounded-full border-4 border-white/70 bg-white/60 shadow-glow" />
              </div>
              <div className="mt-3 text-center">
                <div className="text-xl font-black text-slate-900 dark:text-white">@handle_name</div>
                <div className="mt-1 text-sm text-slate-700 dark:text-slate-300">여러개의 링크를 한 곳에 ✨</div>
              </div>
              <div className="mt-4 grid gap-3">
                {["Twitter", "Commission", "Instagram", "Discord"].map((t) => (
                  <div
                    key={t}
                    className="rounded-2xl border border-white/50 bg-white/55 dark:border-white/20 dark:bg-white/15 px-4 py-3 font-semibold text-slate-900 dark:text-white hover:bg-white/70 dark:hover:bg-white/20"
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-700 dark:text-slate-400">
              * 해당 프리뷰는 예시에요. 로그인하면 프로필을 직접 세팅할 수 있어요!
            </p>
          </GlassCard>
        </section>
      </Container>
    </div>
  );
}
