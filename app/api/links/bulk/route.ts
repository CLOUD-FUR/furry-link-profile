import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeLog } from "@/lib/log";
import { z } from "zod";

const PlatformEnum = z.enum([
  "discord_server",
  "x",
  "youtube",
  "bluesky",
  "instagram",
  "other",
]);

const BulkSchema = z.object({
  links: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1).max(60),
      url: z.string().min(1).max(2048), // 🔥 이미 완성된 URL
      platform: PlatformEnum,
      subtitle: z.string().max(80).optional(),
      enabled: z.boolean().optional(),
      order: z.number().int().nonnegative(),
    })
  ),
});

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const ip = req.headers.get("x-forwarded-for") ?? "";

  const body = await req.json().catch(() => null);
  if (!body) {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const input = BulkSchema.parse(body);

  // 🔒 소유권 검증
  const ids = input.links.map((l) => l.id);
  const dbLinks = await prisma.link.findMany({
    where: { id: { in: ids }, userId },
  });

  if (dbLinks.length !== ids.length) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  // 🔁 트랜잭션 저장 (URL 가공 ❌)
  await prisma.$transaction(
    input.links.map((l) =>
      prisma.link.update({
        where: { id: l.id },
        data: {
          title: l.title,
          url: l.url, // ✅ 그대로 저장
          platform: l.platform,
          subtitle: l.subtitle ?? "",
          enabled: l.enabled ?? true,
          order: l.order,
        },
      })
    )
  );

  await writeLog({
    type: "LINK_BULK_UPDATE",
    message: `bulk link update (${input.links.length})`,
    actorUserId: userId,
    targetUserId: userId,
    ip,
  });

  const links = await prisma.link.findMany({
    where: { userId },
    orderBy: { order: "asc" },
  });

  return Response.json({ links });
}
