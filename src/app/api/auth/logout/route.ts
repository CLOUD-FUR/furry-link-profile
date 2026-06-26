import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeLog } from "@/lib/log";
import { sendAuthLogToDiscord } from "@/lib/discord-webhook";

/** 로그아웃 로그 기록 + 디스코드 웹훅 전송. 클라이언트에서 signOut() 전에 호출 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ ok: true });
  }

  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "";
  const countryCode = req.headers.get("x-vercel-ip-country") ?? "";

  if (user) {
    await writeLog({
      type: "LOGOUT",
      message: `logout (id=${userId}, handle=@${user.handle})`,
      actorUserId: userId,
      targetUserId: userId,
      ip: ip || undefined,
    });

    await sendAuthLogToDiscord({
      event: "logout",
      handle: user.handle,
      ip,
      countryCode,
    });
  }

  return NextResponse.json({ ok: true });
}
