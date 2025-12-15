import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeLog } from "@/lib/log";
import { z } from "zod";

/* =========================
   유틸
========================= */

// ❌ URL 들어오는 handle 차단 + @ 제거
function normalizeHandleInput(s: string) {
  const v = s.trim().replace(/^@+/, "");
  if (!v) return "";
  if (v.startsWith("http")) {
    throw new Error("아이디만 입력해주세요 (URL ❌)");
  }
  return v;
}

// ✅ encodeURIComponent 절대 사용 X
function buildUrl(
  platform: z.infer<typeof PlatformEnum>,
  handle?: string,
  url?: string
) {
  // Twitter (X)
  if (platform === "x") {
    const h = normalizeHandleInput(handle ?? "");
    if (!h) throw new Error("트위터 (X) 아이디를 입력해주세요 (@ 없이)");
    return `https://x.com/${h}`;
  }

  // Instagram
  if (platform === "instagram") {
    const h = normalizeHandleInput(handle ?? "");
    if (!h) throw new Error("인스타 아이디를 입력해주세요 (@ 없이)");
    return `https://www.instagram.com/${h}/`;
  }

  // 그 외 (youtube, bluesky, other 등)
  const u = (url ?? "").trim();
  if (!u) throw new Error("URL을 입력해주세요");
  return u;
}

function platformIcon(platform: string) {
  const map: Record<string, string> = {
    discord_server: "discord_server",
    x: "x",
    youtube: "youtube",
    instagram: "instagram",
    other: "other",
  };
  return map[platform] ?? "other";
}

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return (session.user as any).id as string;
}

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
   POST (생성)
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
    url = buildUrl(input.platform, input.handle, input.url);
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
   PUT (수정)
========================= */

export async function PUT(req: Request) {
  const userId = await requireUserId();
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  const ip = req.headers.get("x-forwarded-for") ?? "";

  const body = await req.json().catch(() => ({}));
  const input = UpdateSchema.parse(body);

  const link = await prisma.link.findUnique({ where: { id: input.id } });
  if (!link || link.userId !== userId) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  const nextPlatform = input.patch.platform ?? link.platform;
  let nextUrl = input.patch.url ?? link.url;
  const handle = input.patch.handle;

  // ✅ SNS 플랫폼 처리
  if (nextPlatform === "x" || nextPlatform === "instagram") {
    // URL 직접 입력한 경우 → 그대로 사용
    if (typeof nextUrl === "string" && nextUrl.startsWith("http")) {
      // OK
    }
    // handle 입력한 경우 → buildUrl
    else if (typeof handle === "string") {
      try {
        nextUrl = buildUrl(nextPlatform, handle, undefined);
      } catch (e: any) {
        return Response.json(
          { error: e?.message ?? "invalid" },
          { status: 400 }
        );
      }
    }
  }

  const updated = await prisma.link.update({
    where: { id: input.id },
    data: {
      ...input.patch,
      url: nextUrl,
      icon: platformIcon(nextPlatform),
      platform: nextPlatform,
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

  const ip = req.headers.get("x-forwarded-for") ?? "";

  const body = await req.json().catch(() => ({}));
  const input = DeleteSchema.parse(body);

  const link = await prisma.link.findUnique({ where: { id: input.id } });
  if (!link || link.userId !== userId) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  await prisma.link.delete({ where: { id: input.id } });

  await writeLog({
    type: "LINK_DELETE",
    message: `link deleted (id=${input.id})`,
    actorUserId: userId,
    targetUserId: userId,
    ip,
  });

  // order 재정렬
  const links = await prisma.link.findMany({
    where: { userId },
    orderBy: { order: "asc" },
  });

  for (let i = 0; i < links.length; i++) {
    if (links[i].order !== i) {
      await prisma.link
        .update({
          where: { id: links[i].id },
          data: { order: i },
        })
        .catch(() => {});
    }
  }

  const updated = await prisma.link.findMany({
    where: { userId },
    orderBy: { order: "asc" },
  });

  return Response.json({ links: updated });
}
