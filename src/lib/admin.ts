import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export function getAdminIds(): string[] {
  const raw = process.env.ADMIN_DISCORD_IDS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isAdminId(id?: string | null): boolean {
  if (!id) return false;
  return getAdminIds().includes(id);
}

/**
 * Server-side admin check using session + database lookup.
 * Returns true if the current user is an admin based on:
 * 1. Legacy users: user.id is directly in ADMIN_DISCORD_IDS
 * 2. New users: their Discord account's providerAccountId is in ADMIN_DISCORD_IDS
 */
export async function checkIsAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return false;

  const userId = (session.user as any).id as string;
  if (!userId) return false;

  const adminIds = getAdminIds();
  if (adminIds.length === 0) return false;

  // Check if user ID itself is an admin ID (legacy users)
  if (adminIds.includes(userId)) return true;

  // Check if user has a Discord account with admin providerAccountId
  const discordAccount = await prisma.account.findFirst({
    where: {
      userId,
      provider: "discord",
    },
    select: {
      providerAccountId: true,
    },
  });

  if (discordAccount && adminIds.includes(discordAccount.providerAccountId)) {
    return true;
  }

  return false;
}

/**
 * Get the Discord ID for a given user ID.
 * Returns the providerAccountId from their Discord account, or null if not linked.
 */
export async function getUserDiscordId(userId: string): Promise<string | null> {
  const discordAccount = await prisma.account.findFirst({
    where: {
      userId,
      provider: "discord",
    },
    select: {
      providerAccountId: true,
    },
  });

  return discordAccount?.providerAccountId ?? null;
}

/**
 * Server-side admin authentication check for API routes.
 * Returns { ok: false, error: string } if unauthorized,
 * or { ok: true, actorId: string } if authorized.
 */
export async function checkAdminAuth(): Promise<
  | { ok: false; error: "unauthorized" | "forbidden" }
  | { ok: true; actorId: string }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { ok: false, error: "unauthorized" };
  }

  const userId = (session.user as any).id as string;
  if (!userId) {
    return { ok: false, error: "unauthorized" };
  }

  const adminIds = getAdminIds();
  if (adminIds.length === 0) {
    return { ok: false, error: "forbidden" };
  }

  // Check if user ID itself is an admin ID (legacy users)
  if (adminIds.includes(userId)) {
    return { ok: true, actorId: userId };
  }

  // Check if user has a Discord account with admin providerAccountId
  const discordAccount = await prisma.account.findFirst({
    where: {
      userId,
      provider: "discord",
    },
    select: {
      providerAccountId: true,
    },
  });

  if (discordAccount && adminIds.includes(discordAccount.providerAccountId)) {
    return { ok: true, actorId: userId };
  }

  return { ok: false, error: "forbidden" };
}
