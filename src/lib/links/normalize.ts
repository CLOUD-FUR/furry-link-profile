// /lib/links/normalize.ts
export function normalizeLink(input: string): string {
  if (!input) return "";

  let url = input.trim();

  try {
    url = decodeURIComponent(url);
  } catch {}

  url = url.replace(/^https?:\/\//, "");
  url = url.replace(/^www\./, "");

  // Twitter / X
  if (url.startsWith("twitter.com/") || url.startsWith("x.com/")) {
    const username = url.split("/")[1];
    return `https://x.com/${username}`;
  }

  // Instagram
  if (url.startsWith("instagram.com/")) {
    const username = url.split("/")[1];
    return `https://instagram.com/${username}`;
  }

  return `https://${url}`;
}
