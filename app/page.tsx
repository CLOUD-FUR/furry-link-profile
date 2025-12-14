import { Container, GlassCard, ButtonLink } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-sky-200 to-violet-200 relative overflow-hidden">
      <div className="absolute inset-0 noise opacity-40" />
      <Container className="relative py-12">
        <header className="flex items-center justify-between gap-4">
          <div className="font-black tracking-tight text-xl">🐾 Fluffy Link</div>
          <nav className="flex items-center gap-2">
            <ButtonLink href="/dashboard" className="bg-white/70 border-white/60 hover:bg-white/85">
              Discord 로그인
            </ButtonLink>
            <ButtonLink href="/@CLOUD" className="bg-slate-900 text-white border-slate-900">
              개발자 프로필
            </ButtonLink>
          </nav>
        </header>

        <section className="mt-12 grid gap-8 lg:grid-cols-2">
          <div>
            <h1 className="text-5xl font-black tracking-tight leading-[1.05]">
              All your links,
              <span className="block">in one link.</span>
            </h1>
            <p className="mt-4 text-slate-700 text-lg">
              Discord로 로그인하고 프로필 페이지를 바로 만들 수 있어요!
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/dashboard" className="bg-slate-900 text-white border-slate-900">
                Discord로 시작하기
              </ButtonLink>
              <ButtonLink href="/@CLOUD" className="bg-white/70 border-white/60 hover:bg-white/85">
                개발자 프로필
              </ButtonLink>
            </div>

            <ul className="mt-8 space-y-3 text-slate-800">
              {[
                "🌈 여러가지 테마 및 커스텀 테마 제공",
                "🔗 바로가기 버튼 링크 설정 가능",
                "🔐 Discord 로그인으로 누구나 이용 가능",
                "📱 PC 및 모바일 최적화",
                "😺 실시간 지원 및 문의 처리 가능",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-slate-900/70" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <GlassCard className="bg-white/35 border-white/45 p-6">
            <div className="mx-auto max-w-sm rounded-[2rem] border border-white/50 bg-white/30 p-4 shadow-soft">
              <div className="h-28 rounded-2xl bg-gradient-to-r from-sky-300/60 to-violet-300/60" />
              <div className="-mt-8 flex justify-center">
                <div className="h-20 w-20 rounded-full border-4 border-white/70 bg-white/60 shadow-glow" />
              </div>
              <div className="mt-3 text-center">
                <div className="text-xl font-black">@handle_name</div>
                <div className="mt-1 text-sm text-slate-700">여러개의 링크를 한 곳에 ✨</div>
              </div>
              <div className="mt-4 grid gap-3">
                {["Twitter", "Commission", "Instagram", "Discord"].map((t) => (
                  <div
                    key={t}
                    className="rounded-2xl border border-white/50 bg-white/55 px-4 py-3 font-semibold text-slate-900 hover:bg-white/70"
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-700">
              * 해당 프리뷰는 예시에요. 로그인하면 프로필을 직접 세팅할 수 있어요!
            </p>
          </GlassCard>
        </section>
      </Container>
    </div>
  );
}
