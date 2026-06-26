import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/auth/link
// Body: { provider, providerAccountId, providerUserData? }
// Called from the custom OAuth callback after Discord/Google OAuth for linking.
// - If Account doesn't exist for provider+providerAccountId → create it linked to current user → { ok, action: "linked" }
// - If Account exists for a DIFFERENT user → { ok, action: "migration_needed", existingUserId, existingUserHandle, existingUserBio, existingUserLinkCount }
// - If Account exists for the SAME user → { ok, action: "already_linked" }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const currentUserId = (session.user as any).id as string;
  if (!currentUserId) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const provider = String(body?.provider ?? "");
  const providerAccountId = String(body?.providerAccountId ?? "");
  if (!provider || !providerAccountId) {
    return NextResponse.json(
      { error: "provider와 providerAccountId가 필요해요." },
      { status: 400 }
    );
  }

  const existing = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId,
      },
    },
    include: {
      user: { select: { id: true, handle: true, bio: true, _count: { select: { links: true } } } },
    },
  });

  if (!existing) {
    // No Account → link to current user
    await prisma.account.create({
      data: {
        userId: currentUserId,
        provider,
        providerAccountId,
        type: "oauth",
      },
    });
    return NextResponse.json({ ok: true, action: "linked" });
  }

  if (existing.userId === currentUserId) {
    return NextResponse.json({ ok: true, action: "already_linked" });
  }

  // Account exists for a different user → migration needed
  return NextResponse.json({
    ok: true,
    action: "migration_needed",
    existingUserId: existing.user.id,
    existingUserHandle: existing.user.handle,
    existingUserBio: existing.user.bio,
    existingUserLinkCount: existing.user._count.links,
  });
}
