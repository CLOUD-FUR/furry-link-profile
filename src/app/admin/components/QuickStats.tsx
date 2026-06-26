type Widget = {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
};

const widgets: Widget[] = [
  { label: "신규 가입", value: "1,284", change: "+12.3%", trend: "up" },
  { label: "신규 링크", value: "3,472", change: "+8.7%", trend: "up" },
  { label: "평균 링크/유저", value: "4.2", change: "+0.3", trend: "up" },
  { label: "비활성 링크", value: "281", change: "-2.1%", trend: "up" },
];

const linkPlatforms = [
  { name: "Discord", value: 42, color: "bg-indigo-500" },
  { name: "X (Twitter)", value: 23, color: "bg-zinc-500" },
  { name: "YouTube", value: 18, color: "bg-red-500" },
  { name: "Instagram", value: 17, color: "bg-pink-500" },
];

// Precompute donut segments with cumulative start offsets
const donutSegments = (() => {
  let acc = 0;
  return linkPlatforms.map((s) => {
    const start = acc;
    acc += s.value;
    return { ...s, start };
  });
})();

export default function QuickStats() {
  return (
    <div className="space-y-5">
      {/* Quick metrics */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-semibold tracking-tight">핵심 지표</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">이번 주 요약</p>
        <ul className="mt-4 space-y-3.5">
          {widgets.map((w) => (
            <li key={w.label} className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{w.label}</p>
                <p className="mt-0.5 text-lg font-semibold tracking-tight">{w.value}</p>
              </div>
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                  w.trend === "up"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {w.trend === "up" ? (
                  <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 15 6-6 6 6" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                )}
                {w.change}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Platform distribution */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-semibold tracking-tight">플랫폼 분포</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">링크 플랫폼 비율</p>

        {/* Donut */}
        <div className="mt-4 flex items-center justify-center">
          <div className="relative h-32 w-32">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
              {donutSegments.map((s) => (
                <circle
                  key={s.name}
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  className={s.color.replace("bg-", "stroke-")}
                  strokeWidth="4"
                  strokeDasharray={`${s.value} ${100 - s.value}`}
                  strokeDashoffset={-s.start}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-semibold">100%</span>
              <span className="text-[10px] text-muted-foreground">플랫폼</span>
            </div>
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {linkPlatforms.map((s) => (
            <li key={s.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-sm ${s.color}`} />
                <span className="text-muted-foreground">{s.name}</span>
              </div>
              <span className="font-medium">{s.value}%</span>
            </li>
          ))}
        </ul>
      </div>

      {/* System health */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight">시스템 상태</h3>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            정상
          </span>
        </div>
        <ul className="mt-4 space-y-3">
          {[
            { label: "DB 연결", value: 34, unit: "%", color: "bg-emerald-500" },
            { label: "API 응답", value: 58, unit: "ms", color: "bg-indigo-500" },
            { label: "캐시 적중률", value: 92, unit: "%", color: "bg-purple-500" },
            { label: "오류율", value: 21, unit: "%", color: "bg-amber-500" },
          ].map((m) => (
            <li key={m.label}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{m.label}</span>
                <span className="font-medium">{m.value}{m.unit}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${m.color} transition-all`}
                  style={{ width: `${m.value}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
