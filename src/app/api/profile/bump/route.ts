import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const BUMP_COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12시간

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, listPublic: true, lastBumpedAt: true },
  });

  if (!user || !user.listPublic) {
    return NextResponse.json(
      { error: "유저 리스트에 공개된 경우에만 끌어올리기를 사용할 수 있어요." },
      { status: 400 }
    );
  }

  const now = Date.now();
  const lastBumped = user.lastBumpedAt?.getTime() ?? 0;
  const nextAllowedAt = lastBumped + BUMP_COOLDOWN_MS;

  if (now < nextAllowedAt) {
    const remainingMs = nextAllowedAt - now;
    return NextResponse.json(
      { ok: false, nextBumpAt: new Date(nextAllowedAt).toISOString(), remainingMs },
      { status: 429 }
    );
  }

  await prisma.user.update({
    where: { id: userId },
    data: { lastBumpedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
