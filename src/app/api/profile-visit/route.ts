import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function parseDevice(ua: string | null): string | null {
  if (!ua) return null;
  if (/ipad|tablet|playbook|silk/i.test(ua)) return "tablet";
  if (/android(?!.*mobile)/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|windows phone|blackberry|opera mini/i.test(ua)) return "mobile";
  return "desktop";
}

function parseReferrer(req: Request, refParam: string | null): string | null {
  // 클라이언트가 넘긴 document.referrer 우선, 없으면 referer 헤더
  const raw = (refParam || req.headers.get("referer") || "").trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const selfHost = new URL(req.url).hostname;
    // 자기 사이트 내부 이동은 직접 유입으로 취급
    if (url.hostname === selfHost) return null;
    return raw.slice(0, 500);
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get("handle")?.trim();
  if (!handle) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const handleLower = handle.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { handleLower },
    select: { id: true, isPublic: true },
  });
  if (!user || !user.isPublic) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const sid = (await cookies()).get("fl_sid")?.value;
  if (!sid) {
    return NextResponse.json({ ok: true });
  }

  const referrer = parseReferrer(req, searchParams.get("ref"));
  const countryRaw = req.headers.get("x-vercel-ip-country")?.trim().toUpperCase();
  const country = countryRaw && /^[A-Z]{2}$/.test(countryRaw) ? countryRaw : null;
  const device = parseDevice(req.headers.get("user-agent"));

  try {
    await prisma.profileVisit.create({
      data: { userId: user.id, sessionId: sid, referrer, country, device },
    });
  } catch {
    // already counted for this session (unique constraint)
  }

  return NextResponse.json({ ok: true });
}
