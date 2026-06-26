import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeLog } from "@/lib/log";

// POST /api/auth/migrate
// Body: { provider, providerAccountId }
// Migrates data from the existing user (who owns the Account for provider+providerAccountId)
// to the current user, then deletes the existing user and links the Account to the current user.
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

  // Find the existing Account (the "other" user)
  const existingAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId,
      },
    },
    include: { user: true },
  });

  if (!existingAccount) {
    return NextResponse.json(
      { error: "마이그레이션할 계정을 찾을 수 없어요." },
      { status: 404 }
    );
  }

  const otherUser = existingAccount.user;
  if (otherUser.id === currentUserId) {
    return NextResponse.json(
      { error: "같은 계정이에요. 마이그레이션이 필요하지 않아요." },
      { status: 400 }
    );
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
  });
  if (!currentUser) {
    return NextResponse.json({ error: "현재 사용자를 찾을 수 없어요." }, { status: 404 });
  }

  // Perform migration in a transaction
  await prisma.$transaction(async (tx) => {
    // 1. Move Links from otherUser to currentUser
    await tx.link.updateMany({
      where: { userId: otherUser.id },
      data: { userId: currentUserId },
    });

    // 2. Move ProfileVisits (delete existing visits for currentUser that conflict, then reassign)
    // To avoid unique constraint violations on (userId, sessionId), delete conflicting visits.
    const otherVisits = await tx.profileVisit.findMany({
      where: { userId: otherUser.id },
      select: { id: true, sessionId: true },
    });
    const currentUserSessionIds = new Set(
      (
        await tx.profileVisit.findMany({
          where: { userId: currentUserId },
          select: { sessionId: true },
        })
      ).map((v) => v.sessionId)
    );
    // Delete conflicting visits on otherUser that would clash with currentUser
    const conflictIds = otherVisits
      .filter((v) => currentUserSessionIds.has(v.sessionId))
      .map((v) => v.id);
    if (conflictIds.length > 0) {
      await tx.profileVisit.deleteMany({ where: { id: { in: conflictIds } } });
    }
    // Reassign remaining visits
    await tx.profileVisit.updateMany({
      where: { userId: otherUser.id },
      data: { userId: currentUserId },
    });

    // 3. Update Log references: actorUserId and targetUserId
    await tx.log.updateMany({
      where: { actorUserId: otherUser.id },
      data: { actorUserId: currentUserId },
    });
    await tx.log.updateMany({
      where: { targetUserId: otherUser.id },
      data: { targetUserId: currentUserId },
    });

    // 4. Copy profile data from otherUser to currentUser (only if currentUser has defaults)
    // We merge: prefer existing currentUser data if set, otherwise take from otherUser.
    await tx.user.update({
      where: { id: currentUserId },
      data: {
        bio: currentUser.bio || otherUser.bio,
        theme: currentUser.theme === "pastel" && otherUser.theme !== "pastel" ? otherUser.theme : currentUser.theme,
        themeJson: currentUser.themeJson || otherUser.themeJson,
        bannerUrl: currentUser.bannerUrl || otherUser.bannerUrl,
        profileTag: currentUser.profileTag ?? otherUser.profileTag,
        profileEffect: currentUser.profileEffect ?? otherUser.profileEffect,
        // Don't overwrite handle — currentUser keeps their own handle
        // Don't overwrite password — currentUser keeps their own
      },
    });

    // 5. Reassign the Account to currentUser
    await tx.account.update({
      where: { id: existingAccount.id },
      data: { userId: currentUserId },
    });

    // 6. Delete the otherUser (cascade will clean up any remaining references)
    await tx.user.delete({ where: { id: otherUser.id } });

    // 7. Log
    await tx.log.create({
      data: {
        type: "ACCOUNT_MIGRATE",
        message: `migrated user @${otherUser.handle} (id=${otherUser.id}) into @${currentUser.handle} (id=${currentUserId})`,
        actorUserId: currentUserId,
        targetUserId: currentUserId,
      },
    });
  });

  return NextResponse.json({ ok: true });
}
