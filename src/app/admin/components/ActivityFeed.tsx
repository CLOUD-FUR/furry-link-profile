type Activity = {
  id: string;
  type: "user" | "link" | "system" | "alert" | "login";
  message: string;
  time: string;
  actorUserId: string | null;
};

const typeConfig: Record<
  Activity["type"],
  { dot: string; icon: React.ReactNode; label: string }
> = {
  user: {
    dot: "bg-indigo-500",
    label: "사용자",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  link: {
    dot: "bg-purple-500",
    label: "링크",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  system: {
    dot: "bg-zinc-400",
    label: "시스템",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  alert: {
    dot: "bg-amber-500",
    label: "알림",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
    ),
  },
  login: {
    dot: "bg-emerald-500",
    label: "로그인",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" x2="3" y1="12" y2="12" />
      </svg>
    ),
  },
};

export default function ActivityFeed({
  activities = [],
  loading = false,
}: {
  activities?: Activity[];
  loading?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold tracking-tight">최근 활동</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">실시간 시스템 활동</p>
        </div>
        <a
          href="/admin/logs"
          className="text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400"
        >
          전체 보기
        </a>
      </div>

      <div className="relative mt-5">
        {/* Timeline line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            불러오는 중…
          </div>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            활동 기록이 없습니다
          </div>
        ) : (
          <ul className="space-y-4">
            {activities.slice(0, 7).map((a) => {
              const cfg = typeConfig[a.type] ?? typeConfig.system;
              return (
                <li key={a.id} className="relative flex gap-3">
                  <div
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-card text-white ${cfg.dot}`}
                  >
                    {cfg.icon}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-sm leading-snug">
                      <span className="font-semibold text-foreground">{cfg.label}</span>
                      <span className="text-muted-foreground"> {a.message}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{a.time}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
