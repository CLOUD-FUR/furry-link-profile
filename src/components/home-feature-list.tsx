"use client";

const ITEMS = [
  { icon: "🎨", text: "여러 테마 및 커스텀 컬러" },
  { icon: "🔗", text: "원하는 만큼 링크 추가" },
  { icon: "🔐", text: "Discord 로그인 한 번이면 끝" },
];

const STAGGER_MS = 90;

export function HomeFeatureList() {
  return (
    <ul className="mt-8 flex flex-wrap gap-2 text-slate-800 dark:text-slate-100/90">
      {ITEMS.map((item, i) => (
        <li
          key={item.text}
          className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/55 dark:border-white/15 dark:bg-white/10 backdrop-blur px-3.5 py-1.5 text-sm font-medium opacity-0 animate-slide-in-right"
          style={{ animationDelay: `${i * STAGGER_MS}ms` }}
        >
          <span aria-hidden>{item.icon}</span>
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
  );
}
