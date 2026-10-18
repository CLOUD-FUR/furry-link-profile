import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { writeLog } from "@/lib/log";
import { buildUrl, platformIcon, Platform } from "@/lib/links/url";

/* =========================
   GET — list links (search by handle)
========================= */
export async function GET(req: Request) {
  try {
    const authResult = await checkAdminAuth();
    if (!authResult.ok) {
      return NextResponse.json(
        { ok: false, error: authResult.error },
        { status: authResult.error === "unauthorized" ? 401 : 403 }
      );
    }
    const actorId = authResult.actorId;

    const { searchParams } = new URL(req.url);
    const handle = (searchParams.get("handle") ?? "").trim();
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "300", 10), 500);

    const links = await prisma.link.findMany({
      where: handle
        ? {
            user: {
              handle: { contains: handle, mode: "insensitive" },
            },
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: { id: true, handle: true, name: true },
        },
      },
    });

    return NextResponse.json({ ok: true, links });
  } catch (error) {
    console.error("[admin/links] Error fetching links:", error);
    return NextResponse.json(
      { ok: false, error: "링크 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/* =========================
   POST — admin manually create a link for a user
========================= */
export async function POST(req: Request) {
  try {
    const authResult = await checkAdminAuth();
    if (!authResult.ok) {
      return NextResponse.json(
        { ok: false, error: authResult.error },
        { status: authResult.error === "unauthorized" ? 401 : 403 }
      );
    }
    const actorId = authResult.actorId;

    const body = await req.json().catch(() => ({}));
    const userId = String(body.userId ?? "").trim();
    const platform = String(body.platform ?? "other") as Platform;
    const title = String(body.title ?? "").trim();
    const handleOrUrl = String(body.handle ?? body.url ?? "").trim();
    const subtitle = String(body.subtitle ?? "").trim();
    const iconRaw = String(body.icon ?? "").trim();
    const enabled = body.enabled !== false; // default true

    if (!userId) {
      return NextResponse.json({ ok: false, error: "userId is required" }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ ok: false, error: "title is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ ok: false, error: "user not found" }, { status: 404 });
    }

    let url: string;
    try {
      url = buildUrl(platform, handleOrUrl);
    } catch (e: any) {
      console.error(`[admin/links] buildUrl error for platform=${platform}:`, e);
      return NextResponse.json({ ok: false, error: e?.message ?? "invalid url" }, { status: 400 });
    }

    // icon 처리
    let icon = platformIcon(platform);
    if (platform === "other") {
      if (!iconRaw || iconRaw === "link" || iconRaw === "🔗") {
        icon = "link";
      } else {
        const chars = Array.from(iconRaw);
        if (chars.length === 1 && /\p{Extended_Pictographic}/u.test(chars[0])) {
          icon = chars[0];
        } else {
          icon = "link";
        }
      }
    }

    const count = await prisma.link.count({ where: { userId } });

    const created = await prisma.link.create({
      data: {
        userId,
        platform,
        title,
        url,
        icon,
        subtitle,
        enabled,
        order: count,
      },
    });

    const ip = req.headers.get("x-forwarded-for") ?? "";

    await writeLog({
      type: "ADMIN_LINK_CREATE",
      message: `admin created link for @${user.handle} (${created.platform}) title="${created.title}"`,
      actorUserId: actorId,
      targetUserId: userId,
      ip,
    });

    return NextResponse.json({ ok: true, link: created });
  } catch (error) {
    console.error("[admin/links] Unexpected error:", error);
    return NextResponse.json(
      { ok: false, error: "링크 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
