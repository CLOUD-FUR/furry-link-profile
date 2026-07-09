import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DAYS = 30;

function dayKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const userId = (session.user as any).id as string;

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (DAYS - 1));

  const links = await prisma.link.findMany({
    where: { userId },
    select: { id: true, title: true, platform: true },
  });
  const linkIds = links.map((l) => l.id);

  const [visits, profileVisits, totals] = await Promise.all([
    linkIds.length
      ? prisma.visit.findMany({
          where: { linkId: { in: linkIds }, createdAt: { gte: since } },
          select: { createdAt: true },
        })
      : Promise.resolve([] as { createdAt: Date }[]),
    prisma.profileVisit.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    linkIds.length
      ? prisma.visit.groupBy({
          by: ["linkId"],
          _count: { linkId: true },
          where: { linkId: { in: linkIds } },
        })
      : Promise.resolve([] as { linkId: string; _count: { linkId: number } }[]),
  ]);

  // 30일 버킷을 만들고 JS에서 날짜별로 집계 (DB 종속 없는 방식)
  const days: { date: string; clicks: number; profileVisits: number }[] = [];
  const idx: Record<string, number> = {};
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const k = dayKey(d);
    idx[k] = days.length;
    days.push({ date: k, clicks: 0, profileVisits: 0 });
  }
  for (const v of visits) {
    const k = dayKey(new Date(v.createdAt));
    if (k in idx) days[idx[k]].clicks++;
  }
  for (const v of profileVisits) {
    const k = dayKey(new Date(v.createdAt));
    if (k in idx) days[idx[k]].profileVisits++;
  }

  const countMap: Record<string, number> = {};
  for (const t of totals) countMap[t.linkId] = t._count.linkId;

  const topLinks = links
    .map((l) => ({ id: l.id, title: l.title, platform: l.platform, clicks: countMap[l.id] ?? 0 }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  return Response.json({ days, topLinks });
}
