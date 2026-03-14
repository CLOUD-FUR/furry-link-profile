"use client";

const ITEMS = [
  "🌈 여러가지 테마 및 커스텀 테마 제공",
  "🔗 바로가기 버튼 링크 설정 가능",
  "🔐 Discord 로그인으로 누구나 이용 가능",
  "📱 PC 및 모바일 최적화",
  "😺 실시간 지원 및 문의 처리 가능",
];

const STAGGER_MS = 90;

export function HomeFeatureList() {
  return (
    <ul className="mt-8 space-y-3 text-slate-800 dark:text-slate-200">
      {ITEMS.map((t, i) => (
        <li
          key={t}
          className="flex items-center gap-2 opacity-0 animate-slide-in-right"
          style={{ animationDelay: `${i * STAGGER_MS}ms` }}
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-slate-900/70 dark:bg-white/60" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}
