import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userid: string }> }
) {
  const { userid: rawUserid } = await params;
  const userId = rawUserid?.trim();
  if (!userId) {
    return NextResponse.json(
      { error: "userid is required" },
      { status: 400 }
    );
  }

  // Try to find by ID first, then by handleLower
  let user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      links: {
        where: { enabled: true },
        orderBy: { order: "asc" }
      },
    },
  });

  if (!user) {
    // Try finding by handle (case-insensitive)
    user = await prisma.user.findUnique({
      where: { handleLower: userId.toLowerCase() },
      include: {
        links: {
          where: { enabled: true },
          orderBy: { order: "asc" }
        },
      },
    });
  }

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Only return public profiles
  if (!user.isPublic) {
    return NextResponse.json({ error: "Profile is private" }, { status: 403 });
  }

  const body = {
    user: {
      id: user.id,
      name: user.name,
      handle: user.handle,
      handleLower: user.handleLower,
      bio: user.bio,
      theme: user.theme,
      themeJson: user.themeJson,
      bannerUrl: user.bannerUrl,
      image: user.image,
      discordImage: user.discordImage,
      isPublic: user.isPublic,
      profileTag: user.profileTag,
      profileEffect: user.profileEffect,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      links: user.links.map((l) => ({
        id: l.id,
        platform: l.platform,
        title: l.title,
        url: l.url,
        icon: l.icon,
        subtitle: l.subtitle,
        order: l.order,
        enabled: l.enabled,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
      })),
    }
  };

  return new NextResponse(JSON.stringify(body, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
