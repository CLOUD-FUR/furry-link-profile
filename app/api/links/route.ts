import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeLog } from "@/lib/log";
import { z } from "zod";
import { buildUrl } from "@/lib/links/url";

/* =========================
   Schema
========================= */

const PlatformEnum = z.enum([
  "discord_server",
  "x",
  "youtube",
  "bluesky",
  "instagram",
  "other",
]);

const CreateSchema = z.object({
  platform: PlatformEnum,
  title: z.string().min(1).max(60),
  handle: z.string().max(80).optional(),
  url: z.string().max(2048).optional(),
  subtitle: z.string().max(80).optional(),
  enabled: z.boolean().optional(),
});

const UpdateSchema = z.object({
  id: z.string().min(1),
  patch: z.object({
    platform: PlatformEnum.optional(),
    title: z.string().min(1).max(60).optional(),
    handle: z.string().max(80).optional(),
    url: z.string().max(2048).optional(),
    subtitle: z.string().max(80).optional(),
    enabled: z.boolean().optional(),
    order: z.number().int().nonnegative().optional(),
  }),
});

const DeleteSchema = z.object({
  id: z.string().min(1),
});

/* =========================
   Util
========================= */

function platformIcon(platform: string) {
  const map: Record<string, string> = {
    discord_server: "discord_server",
    x: "x",
    youtube: "youtube",
    instagram: "instagram",
    other: "link", // 기타 링크는 기본 🔗, 이모지 커스텀은 대시보드에서만
  };
  return map[platform] ?? "link";
}

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return (session.user as any).id as string;
}

/* =========================
   POST
========================= */

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  const ip = req.headers.get("x-forwarded-for") ?? "";

  const body = await req.json().catch(() => ({}));
  const input = CreateSchema.parse(body);

  const count = await prisma.link.count({ where: { userId } });

  let url: string;
  try {
    url = buildUrl(
      input.platform,
      input.handle ?? input.url ?? ""
    );
  } catch (e: any) {
    return Response.json({ error: e?.message ?? "invalid" }, { status: 400 });
  }

  const created = await prisma.link.create({
    data: {
      userId,
      platform: input.platform,
      title: input.title,
      url,
      icon: platformIcon(input.platform),
      subtitle: input.subtitle ?? "",
      enabled: input.enabled ?? true,
      order: count,
    },
  });

  await writeLog({
    type: "LINK_CREATE",
    message: `link created (${created.platform}) title="${created.title}"`,
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

/* =========================
   PUT
========================= */

export async function PUT(req: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for") ?? "";

  const body = await req.json().catch(() => ({}));
  const input = UpdateSchema.parse(body);

  const link = await prisma.link.findUnique({ where: { id: input.id } });
  if (!link || link.userId !== userId) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  let nextUrl = link.url;

  if (input.patch.handle || input.patch.url || input.patch.platform) {
    try {
      // ✅ 타입을 여기서 확정
      const platform =
        input.patch.platform ??
        (link.platform as z.infer<typeof PlatformEnum>);

      nextUrl = buildUrl(
        platform,
        input.patch.handle ?? input.patch.url ?? link.url
      );
    } catch (e: any) {
      return Response.json(
        { error: e?.message ?? "invalid" },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.link.update({
    where: { id: input.id },
    data: {
      ...input.patch,
      url: nextUrl,
      icon: platformIcon(
        (input.patch.platform ??
          link.platform) as z.infer<typeof PlatformEnum>
      ),
      platform: input.patch.platform ?? link.platform,
      subtitle: input.patch.subtitle ?? link.subtitle,
    },
  });

  await writeLog({
    type: "LINK_UPDATE",
    message: `link updated (${updated.platform}) title="${updated.title}"`,
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

/* =========================
   DELETE
========================= */

export async function DELETE(req: Request) {
  const userId = await requireUserId();
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const input = DeleteSchema.parse(body);

  const link = await prisma.link.findUnique({ where: { id: input.id } });
  if (!link || link.userId !== userId) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  await prisma.link.delete({ where: { id: input.id } });

  const links = await prisma.link.findMany({
    where: { userId },
    orderBy: { order: "asc" },
  });

  for (let i = 0; i < links.length; i++) {
    if (links[i].order !== i) {
      await prisma.link.update({
        where: { id: links[i].id },
        data: { order: i },
      });
    }
  }

  return Response.json({ links });
}
