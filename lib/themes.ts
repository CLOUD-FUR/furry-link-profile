export type ThemePreset = {
  id: string;
  name: string;
  description: string;
  bg: string;
  card: string;
  button: string;
  accent: string;
  isDark: boolean;
};

export const themes: ThemePreset[] = [
  {
    id: "pastel",
    name: "Pastel Paw",
    description: "부드러운 파스텔 + 글래스 카드",
    bg: "bg-gradient-to-br from-pink-200 via-sky-200 to-violet-200",
    card: "bg-white/40 border-white/40",
    button: "bg-white/55 hover:bg-white/70 border-white/50",
    accent: "text-violet-700",
    isDark: false,
  },
  {
    id: "darkneon",
    name: "Dark Neon",
    description: "딥 다크 + 네온 포인트",
    bg: "bg-gradient-to-br from-slate-950 via-indigo-950 to-fuchsia-950",
    card: "bg-white/10 border-white/15",
    button: "bg-white/10 hover:bg-white/15 border-white/15",
    accent: "text-sky-300",
    isDark: true,
  },
  {
    id: "sky",
    name: "Sky Blue",
    description: "하늘/구름 느낌의 청량 테마",
    bg: "bg-gradient-to-b from-sky-100 via-white to-sky-200",
    card: "bg-white/55 border-white/60",
    button: "bg-white/70 hover:bg-white/85 border-white/60",
    accent: "text-sky-700",
    isDark: false,
  },
  {
    id: "candy",
    name: "Candy Pop",
    description: "민트/핑크 톡톡 튀는 색감",
    bg: "bg-gradient-to-br from-emerald-200 via-yellow-100 to-pink-200",
    card: "bg-white/45 border-white/45",
    button: "bg-white/60 hover:bg-white/75 border-white/50",
    accent: "text-emerald-700",
    isDark: false,
  },
  {
    id: "midnight",
    name: "Midnight Blue",
    description: "차분한 밤하늘 블루",
    bg: "bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950",
    card: "bg-white/10 border-white/15",
    button: "bg-white/10 hover:bg-white/15 border-white/15",
    accent: "text-blue-200",
    isDark: true,
  },
  {
    id: "sunset",
    name: "Soft Sunset",
    description: "노을 그라데이션 + 따뜻한 무드",
    bg: "bg-gradient-to-br from-rose-200 via-amber-100 to-sky-200",
    card: "bg-white/45 border-white/50",
    button: "bg-white/60 hover:bg-white/75 border-white/50",
    accent: "text-rose-700",
    isDark: false,
  },
];

export function getThemeById(id: string | null | undefined) {
  return themes.find((t) => t.id === (id ?? "pastel")) ?? themes[0];
}

export function isDarkTheme(id: string | null | undefined) {
  if (id === "custom") return false;
  return getThemeById(id).isDark;
}
