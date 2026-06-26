import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/link/discord
// Starts a Discord OAuth flow for LINKING (not login).
// Redirects to Discord with state containing the current user's id + nonce.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  const userId = (session.user as any).id as string;
  if (!userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const clientId = process.env.DISCORD_CLIENT_ID!;
  const redirectUri = `${process.env.NEXTAUTH_URL ?? ""}/api/link/discord/callback`;

  // state = base64(JSON({ userId, nonce }))
  const nonce = crypto.randomUUID();
  const state = Buffer.from(JSON.stringify({ userId, nonce })).toString("base64url");

  // Store nonce in a short-lived cookie for verification
  const url = new URL("https://discord.com/api/oauth2/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "identify");
  url.searchParams.set("state", state);

  const res = NextResponse.redirect(url);
  res.cookies.set("fl_link_nonce", nonce, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 5 * 60, // 5 minutes
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
