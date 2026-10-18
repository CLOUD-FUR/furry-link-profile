import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const authResult = await checkAdminAuth();
    if (!authResult.ok) {
      return NextResponse.json(
        { ok: false, error: authResult.error },
        { status: authResult.error === "unauthorized" ? 401 : 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "200", 10), 500);

    const logs = await prisma.log.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ ok: true, logs });
  } catch (error) {
    console.error("[admin/logs] Error fetching logs:", error);
    return NextResponse.json(
      { ok: false, error: "로그 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
