import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get("handle")?.trim();
  if (!handle) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const handleLower = handle.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { handleLower },
    select: { id: true, isPublic: true },
  });
  if (!user || !user.isPublic) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const sid = (await cookies()).get("fl_sid")?.value;
  if (!sid) {
    return NextResponse.json({ ok: true });
  }

  try {
    await prisma.profileVisit.create({
      data: { userId: user.id, sessionId: sid },
    });
  } catch {
    // already counted for this session (unique constraint)
  }

  return NextResponse.json({ ok: true });
}
