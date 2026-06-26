import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/link/google
// Starts a Google OAuth flow for LINKING (not login).
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  const userId = (session.user as any).id as string;
  if (!userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/dashboard/settings?error=google_not_configured", req.url));
  }

  const redirectUri = `${process.env.NEXTAUTH_URL ?? ""}/api/link/google/callback`;
  const nonce = crypto.randomUUID();
  const state = Buffer.from(JSON.stringify({ userId, nonce })).toString("base64url");

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "consent");

  const res = NextResponse.redirect(url);
  res.cookies.set("fl_link_nonce", nonce, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 5 * 60,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
