import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { writeLog } from "@/lib/log";
import { buildUrl, platformIcon, Platform } from "@/lib/links/url";

const PLATFORM_ENUM: Platform[] = [
  "discord_server",
  "x",
  "youtube",
  "bluesky",
  "instagram",
  "other",
];

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await checkAdminAuth();
    if (!authResult.ok) {
      return NextResponse.json(
        { ok: false, error: authResult.error },
        { status: authResult.error === "unauthorized" ? 401 : 403 }
      );
    }
    const actorId = authResult.actorId;

    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const title = String(body.title ?? "").trim();
    const url = String(body.url ?? "").trim();
    const handleOrUrl = String(body.handle ?? "").trim();
    const platform = String(body.platform ?? "").trim();
    const subtitle = String(body.subtitle ?? "").trim();
    const iconRaw = String(body.icon ?? "").trim();
    const enabled = body.enabled === true || body.enabled === "on" || body.enabled === "true";

    const before = await prisma.link.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!before) {
      return NextResponse.json({ ok: false, error: "link not found" }, { status: 404 });
    }

    const nextTitle = title || before.title;
    const nextPlatform =
      platform && PLATFORM_ENUM.includes(platform as Platform)
        ? (platform as Platform)
        : (before.platform as Platform);

    // URL 계산: handle 또는 url이 오면 buildUrl, 아니면 기존 url 유지
    let nextUrl = before.url;
    if (handleOrUrl || url) {
      try {
        nextUrl = buildUrl(nextPlatform, handleOrUrl || url);
      } catch (e: any) {
        console.error(`[admin/links/update] buildUrl error for link id=${id}:`, e);
        return NextResponse.json({ ok: false, error: e?.message ?? "invalid url" }, { status: 400 });
      }
    } else if (url) {
      nextUrl = url;
    }

    // icon
    let nextIcon = before.icon;
    if (nextPlatform === "other") {
      if (!iconRaw) {
        nextIcon = "link";
      } else if (iconRaw === "link" || iconRaw === "🔗") {
        nextIcon = "link";
      } else {
        const chars = Array.from(iconRaw);
        if (chars.length === 1 && /\p{Extended_Pictographic}/u.test(chars[0])) {
          nextIcon = chars[0];
        } else {
          nextIcon = "link";
        }
      }
    } else {
      nextIcon = platformIcon(nextPlatform);
    }

    const ip = req.headers.get("x-forwarded-for") ?? "";

    await prisma.link.update({
      where: { id },
      data: {
        title: nextTitle,
        url: nextUrl,
        platform: nextPlatform,
        subtitle: subtitle ?? before.subtitle,
        enabled,
        icon: nextIcon,
      },
    });

    await writeLog({
      type: "ADMIN_LINK_UPDATE",
      message: `admin updated link (@${before.user.handle}) "${before.title}" -> "${nextTitle}"`,
      actorUserId: actorId,
      targetUserId: before.userId,
      ip,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/links/update] Unexpected error:", error);
    return NextResponse.json(
      { ok: false, error: "링크 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
