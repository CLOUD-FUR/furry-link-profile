// lib/links/url.ts
export type Platform =
  | "discord_server"
  | "x"
  | "youtube"
  | "bluesky"
  | "instagram"
  | "other";

export function normalizeHandleInput(input: string) {
  let v = input.trim();

  // URL이 들어오면 아이디만 추출
  if (v.startsWith("http")) {
    try {
      const u = new URL(v);
      v = u.pathname.replace(/^\/+|\/+$/g, "");
    } catch {
      throw new Error("❌ 아이디만 입력해주세요");
    }
  }

  v = v.replace(/^@+/, "");
  return v;
}

export function buildUrl(
  platform: Platform,
  handleOrUrl: string
) {
  if (platform === "x") {
    const h = normalizeHandleInput(handleOrUrl);
    if (!h) throw new Error("트위터 (X) 아이디를 입력해주세요");
    return `https://x.com/${h}`;
  }

  if (platform === "instagram") {
    const h = normalizeHandleInput(handleOrUrl);
    if (!h) throw new Error("인스타 아이디를 입력해주세요");
    return `https://www.instagram.com/${h}/`;
  }

  if (platform === "bluesky") {
    const h = normalizeHandleInput(handleOrUrl);
    if (!h) throw new Error("Bluesky 아이디를 입력해주세요");
    return `https://bsky.app/profile/${h}`;
  }

  // 기타는 URL 그대로
  const u = handleOrUrl.trim();
  if (!u) throw new Error("URL을 입력해주세요");
  return u;
}
