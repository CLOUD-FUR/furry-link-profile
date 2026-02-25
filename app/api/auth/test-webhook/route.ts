import { NextResponse } from "next/server";
import { sendAuthLogToDiscord } from "@/lib/discord-webhook";

/**
 * 웹훅 동작 테스트용. 브라우저에서 GET /api/auth/test-webhook 호출하면
 * 디스코드에 "테스트" 로그인 메시지가 한 번 전송됨.
 */
export async function GET() {
  await sendAuthLogToDiscord({
    event: "login",
    handle: "테스트",
    ip: "127.0.0.1",
    countryCode: "KR",
  });
  return NextResponse.json({
    ok: true,
    message: "웹훅 전송 시도함. 디스코드 채널을 확인하세요. (실패 시 터미널 로그 확인)",
  });
}
