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

  return NextResponse.json({
    totalUsers,
    totalLinks,
    activeLinks,
    profileVisits,
    recentLogs,
  });
}
