import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { writeLog } from "@/lib/log";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await checkAdminAuth();
    if (!authResult.ok) {
      return NextResponse.json(
        { ok: false, error: authResult.error },
        { status: authResult.error === "unauthorized" ? 401 : 403 }
      );
    }
    const actorId = authResult.actorId;

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const handle = String(body.handle ?? "").trim();
    const bio = String(body.bio ?? "").trim();
    const isPublic = body.isPublic === true || body.isPublic === "true";
    const listPublic = body.listPublic === true || body.listPublic === "true";

    if (!handle) {
      return NextResponse.json({ ok: false, error: "handle is required" }, { status: 400 });
    }

    const before = await prisma.user.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ ok: false, error: "user not found" }, { status: 404 });
    }

    // handle 중복 체크 (자신 제외)
    const handleLower = handle.toLowerCase();
    const dup = await prisma.user.findUnique({ where: { handleLower } });
    if (dup && dup.id !== id) {
      return NextResponse.json({ ok: false, error: "handle already in use" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") ?? "";

    await prisma.user.update({
      where: { id },
      data: {
        handle,
        handleLower,
        bio,
        isPublic,
        listPublic,
      },
    });

    await writeLog({
      type: "ADMIN_USER_UPDATE",
      message: `admin updated user @${before.handle} -> @${handle}`,
      actorUserId: actorId,
      targetUserId: id,
      ip,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/users/update] Unexpected error:", error);
    return NextResponse.json(
      { ok: false, error: "사용자 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
