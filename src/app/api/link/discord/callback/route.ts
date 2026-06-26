import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/link/discord/callback
// Handles the Discord OAuth callback for LINKING.
// Exchanges code → token → user info, then either links or signals migration needed.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  const currentUserId = (session.user as any).id as string;

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const base = process.env.NEXTAUTH_URL ?? "";
  const settingsUrl = new URL("/dashboard/settings", req.url);

  if (error) {
    settingsUrl.searchParams.set("error", "oauth_cancelled");
    return NextResponse.redirect(settingsUrl);
  }
  if (!code || !state) {
    settingsUrl.searchParams.set("error", "missing_params");
    return NextResponse.redirect(settingsUrl);
  }

  // Verify state
  let parsed: { userId?: string; nonce?: string };
  try {
    parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf-8"));
  } catch {
    settingsUrl.searchParams.set("error", "invalid_state");
    return NextResponse.redirect(settingsUrl);
  }
  const nonceCookie = req.cookies.get("fl_link_nonce")?.value;
  if (!parsed.userId || parsed.userId !== currentUserId) {
    settingsUrl.searchParams.set("error", "invalid_state");
    return NextResponse.redirect(settingsUrl);
  }
  if (!parsed.nonce || parsed.nonce !== nonceCookie) {
    settingsUrl.searchParams.set("error", "invalid_state");
    return NextResponse.redirect(settingsUrl);
  }

  // Exchange code for token
  const clientId = process.env.DISCORD_CLIENT_ID!;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET!;
  const redirectUri = `${base}/api/link/discord/callback`;

  let tokenRes: Response;
  try {
    tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });
  } catch {
    settingsUrl.searchParams.set("error", "token_exchange_failed");
    return NextResponse.redirect(settingsUrl);
  }

  if (!tokenRes.ok) {
    settingsUrl.searchParams.set("error", "token_exchange_failed");
    return NextResponse.redirect(settingsUrl);
  }
  const tokenData: any = await tokenRes.json();
  const accessToken = tokenData?.access_token;
  if (!accessToken) {
    settingsUrl.searchParams.set("error", "no_access_token");
    return NextResponse.redirect(settingsUrl);
  }

  // Get Discord user info
  let discordUser: any;
  try {
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    discordUser = await userRes.json();
  } catch {
    settingsUrl.searchParams.set("error", "discord_user_fetch_failed");
    return NextResponse.redirect(settingsUrl);
  }
  const discordId = String(discordUser?.id);
  if (!discordId) {
    settingsUrl.searchParams.set("error", "no_discord_id");
    return NextResponse.redirect(settingsUrl);
  }

  // Check Account
  const existing = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "discord",
        providerAccountId: discordId,
      },
    },
    include: { user: { select: { id: true } } },
  });

  const res = NextResponse.redirect(settingsUrl);
  res.cookies.delete("fl_link_nonce");

  if (!existing) {
    // Link to current user
    await prisma.account.create({
      data: {
        userId: currentUserId,
        provider: "discord",
        providerAccountId: discordId,
        type: "oauth",
      },
    });
    settingsUrl.searchParams.set("linked", "discord");
    return NextResponse.redirect(settingsUrl);
  }

  if (existing.userId === currentUserId) {
    settingsUrl.searchParams.set("info", "already_linked");
    return NextResponse.redirect(settingsUrl);
  }

  // Different user → migration needed
  settingsUrl.searchParams.set("migration_needed", "discord");
  settingsUrl.searchParams.set("provider_account_id", discordId);
  return NextResponse.redirect(settingsUrl);
}
