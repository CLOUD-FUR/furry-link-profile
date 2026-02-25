import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Schema = z.object({
  orders: z.array(z.object({ id: z.string().min(1), order: z.number().int().nonnegative() })).max(200),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return Response.json({ error: "unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const body = await req.json();
  const input = Schema.parse(body);

  const ids = input.orders.map(o => o.id);
  const links = await prisma.link.findMany({ where: { id: { in: ids } } });

  // ensure ownership
  if (links.some(l => l.userId !== userId)) return Response.json({ error: "forbidden" }, { status: 403 });

  await prisma.$transaction(
    input.orders.map(o => prisma.link.update({ where: { id: o.id }, data: { order: o.order } }))
  );

  const updated = await prisma.link.findMany({ where: { userId }, orderBy: { order: "asc" } });
  return Response.json({ links: updated });
}
