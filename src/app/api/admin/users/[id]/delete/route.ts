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

  // owner 보호
  if (id === "1362203848713703514") {
    return NextResponse.json({ error: "cannot delete owner" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for") ?? "";

  await prisma.user.delete({ where: { id } }).catch(() => {});

  await writeLog({
    type: "ADMIN_USER_DELETE",
    message: `admin deleted user id=${id}`,
    actorUserId: actorId,
    targetUserId: id,
    ip,
  });

  return NextResponse.json({ ok: true });
}
