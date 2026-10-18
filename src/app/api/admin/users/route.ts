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
    const actorId = authResult.actorId;

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    const by = searchParams.get("by") === "id" ? "id" : "handle";
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "200", 10), 500);

    const users = await prisma.user.findMany({
      where: q
        ? by === "id"
          ? { id: q }
          : { handle: { contains: q, mode: "insensitive" } }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        handle: true,
        bio: true,
        image: true,
        isPublic: true,
        listPublic: true,
        createdAt: true,
        _count: { select: { links: true, profileVisits: true } },
      },
    });

    // 각 유저별 최근 5분 실시간 방문자 수 (고유 sessionId)
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const userIds = users.map((u) => u.id);
    const liveVisits = await prisma.profileVisit.findMany({
      where: {
        userId: { in: userIds },
        createdAt: { gte: fiveMinAgo },
      },
      select: { userId: true, sessionId: true },
      distinct: ["userId", "sessionId"],
    });

    // userId별 고유 sessionId 카운트
    const liveMap: Record<string, number> = {};
    for (const v of liveVisits) {
      liveMap[v.userId] = (liveMap[v.userId] ?? 0) + 1;
    }

    const usersWithLive = users.map((u) => ({
      ...u,
      liveVisitors: liveMap[u.id] ?? 0,
    }));

    return NextResponse.json({ ok: true, users: usersWithLive });
  } catch (error) {
    console.error("[admin/users] Error fetching users:", error);
    return NextResponse.json(
      { ok: false, error: "사용자 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
