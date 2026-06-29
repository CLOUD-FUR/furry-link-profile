/**
 * Google Indexing API — 색인 생성 요청 스크립트
 *
 * 사용법:
 *   node scripts/google-indexing.mjs               # 모든 공개 유저 프로필 + 주요 페이지
 *   node scripts/google-indexing.mjs https://...   # 특정 URL만
 *
 * 사전 조건:
 *   - scripts/google-indexing-key.json (서비스 계정 키)
 *   - Search Console에서 서비스 계정 이메일을 소유자로 추가
 *   - Indexing API 활성화
 */

import { SignJWT, importPKCS8 } from "jose";
import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";

const KEY_PATH = new URL("./google-indexing-key.json", import.meta.url);
const SITE_URL = process.env.NEXTAUTH_URL ?? "https://fluffy-link.xyz";

const keyJson = JSON.parse(readFileSync(KEY_PATH, "utf8"));
const SCOPES = ["https://www.googleapis.com/auth/indexing"];

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: keyJson.client_email,
    scope: SCOPES.join(" "),
    aud: keyJson.token_uri,
    exp: now + 3600,
    iat: now,
  };

  // private_key에서 PEM 추출 (\n → 실제 줄바꿈)
  const pem = keyJson.private_key.replace(/\\n/g, "\n");
  const keyObject = await importPKCS8(pem, "RS256");

  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(keyObject);

  const tokenRes = await fetch(keyJson.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Token error ${tokenRes.status}: ${err}`);
  }
  const { access_token } = await tokenRes.json();
  return access_token;
}

async function notifyUrl(accessToken, url, type = "URL_UPDATED") {
  const res = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ url, type }),
  });
  const body = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    parsed = body;
  }
  return { status: res.status, ok: res.ok, url, response: parsed };
}

async function getNotificationMetadata(accessToken, url) {
  const res = await fetch(
    `https://indexing.googleapis.com/v3/urlNotifications/metadata?url=${encodeURIComponent(url)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return { status: res.status, body: await res.text() };
}

async function main() {
  const argUrl = process.argv[2];

  console.log("🔑 구글 OAuth 토큰 발급 중...");
  const token = await getAccessToken();
  console.log("✅ 토큰 발급 성공\n");

  let urls = [];

  if (argUrl) {
    urls = [argUrl];
  } else {
    // 정적 페이지
    urls = [
      `${SITE_URL}/`,
      `${SITE_URL}/user`,
      `${SITE_URL}/questions`,
      `${SITE_URL}/terms`,
    ];

    // 동적: 모든 공개 유저 프로필
    const prisma = new PrismaClient();
    try {
      const users = await prisma.user.findMany({
        where: { isPublic: true },
        select: { handle: true },
      });
      for (const u of users) {
        urls.push(`${SITE_URL}/@${encodeURIComponent(u.handle)}`);
      }
    } finally {
      await prisma.$disconnect();
    }
  }

  console.log(`📋 색인 요청할 URL: ${urls.length}개\n`);

  let ok = 0;
  let fail = 0;
  const results = [];

  // 순차 요청 (Rate limit 방지)
  for (const url of urls) {
    const r = await notifyUrl(token, url);
    results.push(r);
    if (r.ok) {
      ok++;
      console.log(`✅ ${url}`);
    } else {
      fail++;
      console.log(`❌ ${url} — ${r.status}`);
      console.log(`   ${JSON.stringify(r.response).slice(0, 200)}`);
    }
    // 0.3s 간격
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\n📊 결과: 성공 ${ok} / 실패 ${fail} / 전체 ${urls.length}`);

  // 실패가 있으면 상세 출력
  if (fail > 0) {
    console.log("\n⚠️ 실패한 URL 상세:");
    for (const r of results.filter((x) => !x.ok)) {
      console.log(`  ${r.url}`);
      console.log(`  → ${JSON.stringify(r.response).slice(0, 300)}`);
    }
  }
}

main().catch((e) => {
  console.error("💥 오류:", e);
  process.exit(1);
});
