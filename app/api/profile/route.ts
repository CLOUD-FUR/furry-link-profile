import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeLog } from "@/lib/log";
import { z } from "zod";

function normalizeUrl(platform: string, url: string) {
  const raw = url.trim();

  // Instagram
  if (platform === "instagram") {
    return raw.startsWith("http")
      ? raw
      : `https://instagram.com/${raw.replace(/^@/, "")}`;
  }

  // Twitter (X)
  if (platform === "x") {
    return raw.startsWith("http")
      ? raw
      : `https://x.com/${raw.replace(/^@/, "")}`;
  }

  // 그 외 플랫폼은 그대로
  return raw;
}


import { PROFILE_TAGS } from "@/lib/profile-tags";

const PatchSchema = z.object({
  handle: z.string().min(1).max(20).optional(),
  bio: z.string().max(500).optional(),
  theme: z.string().max(32).optional(),

  // ⬇️ 커스텀 테마 배경 (base64)
  themeJson: z.string().max(600_000).optional(),

  // ⬇️ 배너 이미지 (base64)
  bannerUrl: z.string().max(600_000).optional(),

  // ⬇️ 프로필 이미지 (base64)
  image: z.string().max(300_000).optional(),

  isPublic: z.boolean().optional(),

  // ⬇️ 프로필 태그
  profileTag: z.string().optional().nullable(),
});

function normalizeHandleDisplay(handle: string) {
  const trimmed = handle.trim();
  if (!trimmed) return "";

  // 한글, 영어, 숫자, 언더바(_), 마침표(.)만 허용
  const validPattern = /^[A-Za-z0-9가-힣._]+$/u;
  if (!validPattern.test(trimmed)) {
    throw new Error("INVALID_HANDLE_CHARS");
  }

  return trimmed.slice(0, 20);
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({
    where: {
      id: userId, // ✅ 여기
    },
    select: {
      id: true,
      handle: true,
      handleLower: true,
      bio: true,
      image: true,
      bannerUrl: true,
      theme: true,
      themeJson: true,
      isPublic: true,
      profileTag: true,
      links: {
        where: { enabled: true },
        orderBy: { order: "asc" },
      },
    },
  });

  return Response.json({ user });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const body = await req.json().catch(() => ({}));
  let patch: any;
  try {
    patch = PatchSchema.parse(body);
  } catch {
    return Response.json({ error: "❌ 잘못된 프로필 데이터에요." }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for") ?? "";

  const data: any = { ...patch };

  // handle 처리
  if (typeof patch.handle === "string") {
    let normalized: string;
    try {
      normalized = normalizeHandleDisplay(patch.handle);
    } catch (e) {
      if (e instanceof Error && e.message === "INVALID_HANDLE_CHARS") {
        return Response.json(
          {
            error:
              "❌ 핸들에는 한글, 영어, 숫자, 언더바(_), 마침표(.)만 사용할 수 있어요.",
          },
          { status: 400 }
        );
      }

      return Response.json(
        { error: "❌ 잘못된 핸들 형식이에요." },
        { status: 400 }
      );
    }
    if (!normalized) {
      return Response.json({ error: "❌ 핸들이 비어있어요!" }, { status: 400 });
    }

    const handleLower = normalized.toLowerCase();
    const exists = await prisma.user.findUnique({ where: { handleLower } });
    if (exists && exists.id !== userId) {
      return Response.json({ error: "❌ 이미 있는 핸들이에요!" }, { status: 409 });
    }

    data.handle = normalized;
    data.handleLower = handleLower;
  }

  // bio 길이 제한
  if (typeof patch.bio === "string") {
    data.bio = patch.bio.slice(0, 500);
  }

  // 🔥 profileTag 처리 (이게 핵심)
  if ("profileTag" in patch) {
    if (
      patch.profileTag !== null &&
      !PROFILE_TAGS.some((t) => t.id === patch.profileTag)
    ) {
      return Response.json({ error: "invalid profile tag" }, { status: 400 });
    }

    data.profileTag = patch.profileTag; // ✅ DB에 실제 저장
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  await writeLog({
    type: "PROFILE_UPDATE",
    message: `profile updated (handle=@${user.handle})`,
    actorUserId: userId,
    targetUserId: userId,
    ip,
  });

  return Response.json({ user });
}
