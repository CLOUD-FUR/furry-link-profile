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

    await prisma.link.update({
      where: { id: params.id },
      data: {
        title: nextTitle,
        url: nextUrl,
      },
    });

    await prisma.log.create({
      data: {
        type: "ADMIN_LINK_UPDATE",
        actorUserId: actorId,
        targetUserId: before.userId,
        ip, // ✅ string | undefined
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
