export const PLATFORM_ICONS: Record<string, string | null> = {
  x: "/icons/x.png",
  instagram: "/icons/insta.gif",
  youtube: "/icons/youtube.png",
  discord_server: "/icons/discord.png",
  other: null, // 🔗 이모지 사용
};

/** 기타 링크용 표시 아이콘. 예전 데이터(icon 빈값/"other"/"link")는 🔗로 통일 */
export function getOtherLinkDisplayIcon(icon: string | null | undefined): string {
  if (!icon || icon === "link" || icon === "other") return "🔗";
  const chars = Array.from(icon);
  if (chars.length === 1 && /\p{Extended_Pictographic}/u.test(chars[0])) return icon;
  return "🔗";
}
