import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { writeLog } from "@/lib/log";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const actorId = (session.user as any).id as string;
  if (!isAdminId(actorId)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const ip = req.headers.get("x-forwarded-for") ?? "";

  const link = await prisma.link.findUnique({ where: { id } });
  if (!link) {
    return NextResponse.json({ error: "link not found" }, { status: 404 });
  }

  await prisma.link.delete({ where: { id } }).catch(() => {});

  await writeLog({
    type: "ADMIN_LINK_DELETE",
    message: `admin deleted link id=${id}`,
    actorUserId: actorId,
    targetUserId: link.userId,
    ip,
  });

  return NextResponse.json({ ok: true });
}
