type Activity = {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  type: "user" | "link" | "system" | "alert" | "login";
};

const activities: Activity[] = [
  {
    id: "1",
    user: "시스템",
    action: "새 사용자가 가입했습니다",
    target: "@cloud",
    time: "방금 전",
    type: "user",
  },
  {
    id: "2",
    user: "관리자",
    action: "링크를 수정했습니다",
    target: "@cloud",
    time: "5분 전",
    type: "link",
  },
  {
    id: "3",
    user: "시스템",
    action: "사용자가 로그인했습니다",
    target: "@minjun",
    time: "12분 전",
    type: "login",
  },
  {
    id: "4",
    user: "시스템",
    action: "백업이 완료되었습니다",
    target: "",
    time: "1시간 전",
    type: "system",
  },
  {
    id: "5",
    user: "관리자",
    action: "사용자 정보를 업데이트했습니다",
    target: "@seoyeon",
    time: "2시간 전",
    type: "user",
  },
  {
    id: "6",
    user: "시스템",
    action: "비활성 링크가 감지되었습니다",
    target: "",
    time: "3시간 전",
    type: "alert",
  },
  {
    id: "7",
    user: "관리자",
    action: "새 링크를 생성했습니다",
    target: "@jiho",
    time: "5시간 전",
    type: "link",
  },
];

const typeConfig: Record<
  Activity["type"],
  { dot: string; icon: React.ReactNode }
> = {
  user: {
    dot: "bg-indigo-500",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  link: {
    dot: "bg-purple-500",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  system: {
    dot: "bg-zinc-400",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  alert: {
    dot: "bg-amber-500",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
    ),
  },
  login: {
    dot: "bg-emerald-500",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" x2="3" y1="12" y2="12" />
      </svg>
    ),
  },
};

export default function ActivityFeed() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold tracking-tight">최근 활동</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">실시간 시스템 활동</p>
        </div>
        <button className="text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400">
          전체 보기
        </button>
      </div>

      <div className="relative mt-5">
        {/* Timeline line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

        <ul className="space-y-4">
          {activities.map((a) => {
            const cfg = typeConfig[a.type];
            return (
              <li key={a.id} className="relative flex gap-3">
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-card text-white ${cfg.dot}`}
                >
                  {cfg.icon}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-sm leading-snug">
                    <span className="font-semibold text-foreground">{a.user}</span>
                    <span className="text-muted-foreground"> {a.action}</span>
                    {a.target && (
                      <span className="font-medium text-foreground"> {a.target}</span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.time}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
