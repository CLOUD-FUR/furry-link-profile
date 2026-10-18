import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { writeLog } from "@/lib/log";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await checkAdminAuth();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.error === "unauthorized" ? 401 : 403 }
    );
  }
  const actorId = authResult.actorId;

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
