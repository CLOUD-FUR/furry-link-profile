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
      url: z.string().min(1).max(2048),
      platform: PlatformEnum,
      subtitle: z.string().max(80).optional(),
      enabled: z.boolean().optional(),
      order: z.number().int().nonnegative(),
    })
  ),
});

function normalizeHandleInput(s: string) {
  return s.trim().replace(/^@+/, "");
}

function buildUrl(platform: string, url: string) {
  const raw = url.trim();

  if (platform === "x") {
    const h = normalizeHandleInput(raw);
    return `https://x.com/${encodeURIComponent(h)}`;
  }

  if (platform === "instagram") {
    const h = normalizeHandleInput(raw);
    return `https://www.instagram.com/${encodeURIComponent(h)}/`;
  }

  return raw;
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const ip = req.headers.get("x-forwarded-for") ?? "";

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  let input: z.infer<typeof BulkSchema>;
  try {
    input = BulkSchema.parse(body);
  } catch {
    return Response.json({ error: "invalid payload" }, { status: 400 });
  }

  // 🔒 소유권 검증
  const ids = input.links.map((l) => l.id);
  const dbLinks = await prisma.link.findMany({
    where: { id: { in: ids }, userId },
  });

  if (dbLinks.length !== ids.length) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  // 🔁 트랜잭션으로 전체 저장
  await prisma.$transaction(
    input.links.map((l) => {
      const finalUrl = buildUrl(l.platform, l.url);

      return prisma.link.update({
        where: { id: l.id },
        data: {
          title: l.title,
          url: finalUrl,
          platform: l.platform,
          subtitle: l.subtitle ?? "",
          enabled: l.enabled ?? true,
          order: l.order,
        },
      });
    })
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
