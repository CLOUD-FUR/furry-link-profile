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
    const ip = req.headers.get("x-forwarded-for") ?? "";

    const link = await prisma.link.findUnique({ where: { id } });
    if (!link) {
      return NextResponse.json({ ok: false, error: "link not found" }, { status: 404 });
    }

    try {
      await prisma.link.delete({ where: { id } });
    } catch (deleteError) {
      console.error(`[admin/links/delete] Failed to delete link id=${id}:`, deleteError);
      return NextResponse.json(
        { ok: false, error: "링크 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    await writeLog({
      type: "ADMIN_LINK_DELETE",
      message: `admin deleted link id=${id}`,
      actorUserId: actorId,
      targetUserId: link.userId,
      ip,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/links/delete] Unexpected error:", error);
    return NextResponse.json(
      { ok: false, error: "링크 삭제 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
