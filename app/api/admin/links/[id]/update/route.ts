import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const actorId = (session.user as any).id as string;
  if (!isAdminId(actorId)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const formData = await req.formData();
  const title = String(formData.get("title") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const platform = String(formData.get("platform") ?? "").trim() || undefined;
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const enabled = formData.get("enabled") === "on";
  const iconRaw = String(formData.get("icon") ?? "").trim();

  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    undefined;

  try {
    const before = await prisma.link.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!before) {
      return NextResponse.redirect(
        new URL("/admin?err=Link not found", req.url)
      );
    }

    const nextTitle = title || before.title;
    const nextUrl = url || before.url;

    if (!nextTitle || !nextUrl) {
      return NextResponse.redirect(
        new URL("/admin?err=Invalid input", req.url)
      );
    }

    const platformEnum = [
      "discord_server",
      "x",
      "youtube",
      "bluesky",
      "instagram",
      "other",
    ] as const;
    const nextPlatform = platform && platformEnum.includes(platform as any)
      ? (platform as (typeof platformEnum)[number])
      : before.platform;

    // 기타 링크 이모지: 1글자 이모지만 허용, 아니면 "link"
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
    }

    await prisma.link.update({
      where: { id: params.id },
      data: {
        title: nextTitle,
        url: nextUrl,
        platform: nextPlatform,
        subtitle: subtitle ?? before.subtitle,
        enabled,
        icon: nextIcon,
      },
    });

    // ✅ 여기서는 key: value만
    await prisma.log.create({
      data: {
        type: "ADMIN_LINK_UPDATE",
        actorUserId: actorId,
        targetUserId: before.userId,
        ip,
        message: `Link updated (@${before.user.handle}) "${before.title}" -> "${nextTitle}"`,
      },
    });

    return NextResponse.redirect(new URL("/admin", req.url));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(
      new URL("/admin?err=Update failed", req.url)
    );
  }
}
