/**
 * Discord 웹훅으로 플러피링크 가입/로그인/로그아웃 로그 전송
 * 프로필: FLUFFY LINK, 아바타는 Discord CDN URL 사용
 */

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const AVATAR_URL =
  process.env.DISCORD_WEBHOOK_AVATAR_URL ||
  "https://cdn.discordapp.com/avatars/1362203848713703514/b89a0b5def16807f3a385939b6617ada.png?size=2048";

/** 국가 코드(ISO 3166-1 alpha-2) → 플래그 이모지 (예: KR → 🇰🇷) */
function countryToFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "";
  const a = 0x1f1e6; // Regional Indicator A
  const c1 = countryCode.toUpperCase().charCodeAt(0) - 0x41 + a;
  const c2 = countryCode.toUpperCase().charCodeAt(1) - 0x41 + a;
  if (c1 < a || c1 > a + 25 || c2 < a || c2 > a + 25) return "";
  return String.fromCodePoint(c1, c2);
}

export type AuthEventType = "signup" | "login" | "logout";

export async function sendAuthLogToDiscord(args: {
  event: AuthEventType;
  handle: string;
  ip: string;
  countryCode: string;
}): Promise<void> {
  if (!WEBHOOK_URL?.startsWith("https://discord.com/api/webhooks/")) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[discord-webhook] DISCORD_WEBHOOK_URL 없음 또는 형식 오류. .env 확인 후 서버 재시작했는지 확인하세요.");
    }
    return;
  }

  const unix = Math.floor(Date.now() / 1000);
  const flag = countryToFlag(args.countryCode);
  const countryPart = args.countryCode ? ` ${flag} ${args.countryCode}` : "";
  const ipCountry = `${args.ip || "(unknown)"} ( ${countryPart} )`.trim();

  const eventLabel = args.event === "signup" ? "💙 플러피링크 가입로그" : args.event === "login" ? "🔓 플러피링크 로그인 로그" : "🔐 플러피링크 로그아웃 로그";

  const body = {
    username: "FLUFFY LINK",
    avatar_url: AVATAR_URL || undefined,
    embeds: [
      {
        title: eventLabel,
        timestamp: new Date().toISOString(),
        color: args.event === "signup" ? 0x57f287 : args.event === "login" ? 0x5865f2 : 0xed4245,
        fields: [
          {
            name: "⏰ | 시각",
            value: `<t:${unix}:F> (<t:${unix}:R>)`,
            inline: false,
          },
          {
            name: "💁 | 유저 및 핸들",
            value: `@${args.handle}`,
            inline: true,
          },
          {
            name: "🌎 | IP · 국가",
            value: ipCountry,
            inline: true,
          },
        ],
      },
    ],
  };

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error("[discord-webhook] send failed", res.status, await res.text());
    }
  } catch (e) {
    console.error("[discord-webhook]", e);
  }
}
