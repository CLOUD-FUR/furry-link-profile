import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const actorId = (session.user as any).id as string;
  if (!isAdminId(actorId)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Fetch admin user profile
  const adminUser = await prisma.user.findUnique({
    where: { id: actorId },
    select: {
      id: true,
      name: true,
      handle: true,
      image: true,
      discordImage: true,
    },
  });

  // Core metrics
  const [totalUsers, totalLinks, activeLinks, profileVisits, recentLogs] =
    await Promise.all([
      prisma.user.count(),
      prisma.link.count(),
      prisma.link.count({ where: { enabled: true } }),
      prisma.profileVisit.count(),
      prisma.log.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  // ===== Monthly chart data (last 12 months) =====
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  // Users per month
  const usersByMonth = await prisma.user.groupBy({
    by: ["createdAt"],
    _count: { _all: true },
    where: { createdAt: { gte: twelveMonthsAgo } },
  });

  // Links per month
  const linksByMonth = await prisma.link.groupBy({
    by: ["createdAt"],
    _count: { _all: true },
    where: { createdAt: { gte: twelveMonthsAgo } },
  });

  // Profile visits per month
  const visitsByMonth = await prisma.profileVisit.groupBy({
    by: ["createdAt"],
    _count: { _all: true },
    where: { createdAt: { gte: twelveMonthsAgo } },
  });

  // Build month buckets
  const monthLabels: string[] = [];
  const monthBuckets: { year: number; month: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(`${d.getMonth() + 1}월`);
    monthBuckets.push({ year: d.getFullYear(), month: d.getMonth() });
  }

  const monthlyData = monthBuckets.map((bucket, i) => {
    const usersCount = usersByMonth.filter((u) => {
      const d = new Date(u.createdAt);
      return d.getFullYear() === bucket.year && d.getMonth() === bucket.month;
    }).reduce((sum, u) => sum + u._count._all, 0);

    const linksCount = linksByMonth.filter((l) => {
      const d = new Date(l.createdAt);
      return d.getFullYear() === bucket.year && d.getMonth() === bucket.month;
    }).reduce((sum, l) => sum + l._count._all, 0);

    const visitsCount = visitsByMonth.filter((v) => {
      const d = new Date(v.createdAt);
      return d.getFullYear() === bucket.year && d.getMonth() === bucket.month;
    }).reduce((sum, v) => sum + v._count._all, 0);

    return {
      label: monthLabels[i],
      users: usersCount,
      links: linksCount,
      visits: visitsCount,
    };
  });

  // ===== Platform distribution =====
  const platformCounts = await prisma.link.groupBy({
    by: ["platform"],
    _count: { platform: true },
  });

  const platformMap: Record<string, number> = {};
  for (const p of platformCounts) {
    platformMap[p.platform] = p._count.platform;
  }

  // ===== Quick stats =====
  // New users this week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newUsersThisWeek = await prisma.user.count({
    where: { createdAt: { gte: oneWeekAgo } },
  });

  // New links this week
  const newLinksThisWeek = await prisma.link.count({
    where: { createdAt: { gte: oneWeekAgo } },
  });

  // Average links per user
  const avgLinksPerUser = totalUsers > 0 ? totalLinks / totalUsers : 0;

  // Disabled links
  const disabledLinks = await prisma.link.count({
    where: { enabled: false },
  });

  // ===== Live visitors (최근 5분 고유 sessionId) =====
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const liveVisitorRows = await prisma.profileVisit.findMany({
    where: { createdAt: { gte: fiveMinAgo } },
    select: { sessionId: true },
    distinct: ["sessionId"],
  });
  const liveVisitors = liveVisitorRows.length;

  // ===== Recent activity (from logs) =====
  const activities = recentLogs.map((log) => {
    let type: "user" | "link" | "system" | "alert" | "login" = "system";
    if (log.type === "USER_CREATE" || log.type === "ADMIN_USER_UPDATE" || log.type === "ADMIN_USER_DELETE") type = "user";
    else if (log.type === "LINK_CREATE" || log.type === "LINK_UPDATE" || log.type === "LINK_BULK_UPDATE" || log.type === "ADMIN_LINK_CREATE" || log.type === "ADMIN_LINK_UPDATE" || log.type === "ADMIN_LINK_DELETE") type = "link";
    else if (log.type === "LOGIN" || log.type === "LOGOUT") type = "login";
    else if (log.type === "PROFILE_UPDATE") type = "user";

    return {
      id: log.id,
      type,
      message: log.message,
      time: new Date(log.createdAt).toLocaleString("ko-KR"),
      actorUserId: log.actorUserId,
    };
  });

  return NextResponse.json({
    totalUsers,
    totalLinks,
    activeLinks,
    profileVisits,
    recentLogs,
    // Admin profile
    adminUser: adminUser
      ? {
          id: adminUser.id,
          name: adminUser.name,
          handle: adminUser.handle,
          image: adminUser.image,
          discordImage: adminUser.discordImage,
        }
      : null,
    // Monthly chart data
    monthlyData,
    // Platform distribution
    platformDistribution: platformMap,
    // Quick stats
    quickStats: {
      newUsersThisWeek,
      newLinksThisWeek,
      avgLinksPerUser: Math.round(avgLinksPerUser * 10) / 10,
      disabledLinks,
    },
    // Recent activities
    activities,
    // Live visitors (최근 5분)
    liveVisitors,
  });
}
