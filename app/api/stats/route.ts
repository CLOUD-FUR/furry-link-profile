import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const links = await prisma.link.findMany({ where: { userId }, select: { id: true } });

  const counts = await prisma.visit.groupBy({
    by: ["linkId"],
    _count: { linkId: true },
    where: { linkId: { in: links.map(l => l.id) } },
  });

  const map: Record<string, number> = {};
  for (const c of counts) map[c.linkId] = c._count.linkId;

  return Response.json({ counts: map });
}
