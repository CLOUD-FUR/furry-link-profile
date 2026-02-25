import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeLog } from "@/lib/log";
import { sendAuthLogToDiscord } from "@/lib/discord-webhook";

const COOKIE_NAME = "fluffy_auth_log_sent";
const SIGNUP_WINDOW_MS = 2 * 60 * 1000; // 2분 이내 가입으로 간주

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const sent = req.cookies.get(COOKIE_NAME)?.value === "1";
  if (sent) {
    return NextResponse.json({ ok: true });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "";
  const countryCode = req.headers.get("x-vercel-ip-country") ?? "";

  const isSignup =
    user.createdAt.getTime() > Date.now() - SIGNUP_WINDOW_MS;
  const event = isSignup ? "signup" : "login";

  await writeLog({
    type: isSignup ? "USER_CREATE" : "LOGIN",
    message: isSignup
      ? `user created (id=${userId}, handle=@${user.handle})`
      : `login (id=${userId})`,
    actorUserId: userId,
    targetUserId: userId,
    ip: ip || undefined,
  });

  await sendAuthLogToDiscord({
    event,
    handle: user.handle,
    ip,
    countryCode,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7일 동안 한 번만 전송
    httpOnly: true,
    sameSite: "lax",
  });
  return res;
}
