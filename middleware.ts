import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getSid(req: NextRequest) {
  return req.cookies.get("fl_sid")?.value ?? "";
}

function makeSid() {
  // Node 18+ in edge supports crypto.randomUUID
  // eslint-disable-next-line no-undef
  return crypto.randomUUID();
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const res = NextResponse.next();

  // Ensure session id cookie for basic unique visit counting (per device/session)
  const needsSid = pathname.startsWith("/@") || pathname.startsWith("/p/") || pathname.startsWith("/go/");
  if (needsSid) {
    const sid = getSid(req);
    if (!sid) {
      res.cookies.set("fl_sid", makeSid(), {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }
  }

  // Rewrite "/@cloud" -> "/p/cloud"
  if (pathname.length > 2 && pathname.startsWith("/@")) {
    const handle = pathname.slice(2).split("/")[0];
    if (handle) {
      const url = req.nextUrl.clone();
      url.pathname = `/p/${handle}`;
      return NextResponse.rewrite(url, { headers: res.headers });
    }
  }

  return res;
}

export const config = {
  matcher: ["/:path*"],
};
