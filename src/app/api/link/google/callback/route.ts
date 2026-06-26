import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/link/google/callback
// Handles the Google OAuth callback for LINKING.
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

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = `${base}/api/link/google/callback`;

  let tokenRes: Response;
  try {
    tokenRes = await fetch("https://oauth2.googleapis.com/token", {
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

  // Get Google user info
  let googleUser: any;
  try {
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    googleUser = await userRes.json();
  } catch {
    settingsUrl.searchParams.set("error", "google_user_fetch_failed");
    return NextResponse.redirect(settingsUrl);
  }
  const sub = String(googleUser?.sub);
  if (!sub) {
    settingsUrl.searchParams.set("error", "no_google_sub");
    return NextResponse.redirect(settingsUrl);
  }

  // Check Account
  const existing = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "google",
        providerAccountId: sub,
      },
    },
    include: { user: { select: { id: true } } },
  });

  const res = NextResponse.redirect(settingsUrl);
  res.cookies.delete("fl_link_nonce");

  if (!existing) {
    await prisma.account.create({
      data: {
        userId: currentUserId,
        provider: "google",
        providerAccountId: sub,
        type: "oauth",
      },
    });
    settingsUrl.searchParams.set("linked", "google");
    return NextResponse.redirect(settingsUrl);
  }

  if (existing.userId === currentUserId) {
    settingsUrl.searchParams.set("info", "already_linked");
    return NextResponse.redirect(settingsUrl);
  }

  settingsUrl.searchParams.set("migration_needed", "google");
  settingsUrl.searchParams.set("provider_account_id", sub);
  return NextResponse.redirect(settingsUrl);
}
