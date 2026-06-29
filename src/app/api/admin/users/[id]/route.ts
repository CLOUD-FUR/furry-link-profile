import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

/**
 * 관리자 유저 상세 — 단일 유저의 모든 정보를 한 번에 반환
 * 계정 정보 + 링크(클릭수 포함) + 방문 통계(30일) + 최근 로그
 */
export async function GET(
  _req: Request,
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

  // 유저 기본 정보 + 링크
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      links: {
        orderBy: { order: "asc" },
        include: {
          _count: { select: { visits: true } },
        },
      },
      accounts: {
        select: {
          id: true,
          provider: true,
          providerAccountId: true,
          type: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // 총 방문자 수 (고유 sessionId 기준)
  const totalVisits = await prisma.profileVisit.count({
    where: { userId: id },
  });

  // 최근 30일 일별 방문 데이터
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentVisits = await prisma.profileVisit.findMany({
    where: {
      userId: id,
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { createdAt: true, sessionId: true },
  });

  // 일별 groupBy (고유 sessionId 기준)
  const dailyMap: Record<string, Set<string>> = {};
  for (const v of recentVisits) {
    const dayKey = new Date(v.createdAt).toISOString().slice(0, 10); // YYYY-MM-DD
    if (!dailyMap[dayKey]) dailyMap[dayKey] = new Set();
    dailyMap[dayKey].add(v.sessionId);
  }

  const dailyVisits = Object.entries(dailyMap)
    .map(([date, sids]) => ({ date, count: sids.size }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 최근 5분 실시간 방문자 (고유 sessionId)
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const liveVisits = await prisma.profileVisit.findMany({
    where: {
      userId: id,
      createdAt: { gte: fiveMinAgo },
    },
    select: { sessionId: true },
    distinct: ["sessionId"],
  });
  const liveVisitorCount = liveVisits.length;

  // 최근 20개 로그 (actor 또는 target이 해당 유저)
  const recentLogs = await prisma.log.findMany({
    where: {
      OR: [{ actorUserId: id }, { targetUserId: id }],
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      type: true,
      message: true,
      actorUserId: true,
      targetUserId: true,
      ip: true,
      createdAt: true,
    },
  });

  // 링크별 클릭 수
  const linksWithClicks = user.links.map((l) => ({
    id: l.id,
    platform: l.platform,
    title: l.title,
    url: l.url,
    icon: l.icon,
    subtitle: l.subtitle,
    order: l.order,
    enabled: l.enabled,
    createdAt: l.createdAt,
    clicks: l._count.visits,
  }));

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      handle: user.handle,
      bio: user.bio,
      image: user.image,
      discordImage: user.discordImage,
      bannerUrl: user.bannerUrl,
      isPublic: user.isPublic,
      listPublic: user.listPublic,
      profileTag: user.profileTag,
      profileEffect: user.profileEffect,
      theme: user.theme,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastBumpedAt: user.lastBumpedAt,
    },
    accounts: user.accounts,
    links: linksWithClicks,
    stats: {
      totalVisits,
      totalLinks: user.links.length,
      activeLinks: user.links.filter((l) => l.enabled).length,
      totalClicks: linksWithClicks.reduce((sum, l) => sum + l.clicks, 0),
      liveVisitors: liveVisitorCount,
    },
    dailyVisits,
    recentLogs,
  });
}
