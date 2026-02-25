import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function decodeHandle(handle: string): string {
  try {
    return decodeURIComponent(handle);
  } catch {
    return handle;
  }
}

/**
 * OG/디스코드 임베드용 이미지. 우리 도메인 URL로 두어서
 * 디스코드 아바타 해시가 바뀌어도 DB만 갱신되면 항상 최신 이미지가 나감.
 */
export async function GET(
  _req: Request,
  { params }: { params: { handle: string } }
) {
  const handleParam = decodeHandle(params.handle ?? "");
  const handleLower = handleParam.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { handleLower },
    select: { image: true, discordImage: true, isPublic: true },
  });

  if (!user || !user.isPublic) {
    return new NextResponse(null, { status: 404 });
  }

  // 1) http(s) URL이면 그 주소에서 이미지 가져와서 그대로 스트리밍 (해시 바뀌어도 다음 요청 때 DB 기준으로 새 URL 사용)
  let httpUrl: string | null =
    user.image?.startsWith("http")
      ? user.image
      : user.discordImage?.startsWith("http")
        ? user.discordImage
        : null;

  // 디스코드 CDN이면 고해상도(size=1024) 요청해서 흐림 방지
  if (httpUrl?.includes("cdn.discordapp.com")) {
    try {
      const u = new URL(httpUrl);
      u.searchParams.set("size", "1024");
      httpUrl = u.toString();
    } catch {
      // keep original
    }
  }

  if (httpUrl) {
    try {
      const res = await fetch(httpUrl, {
        headers: { "User-Agent": "FluffyLink-OG/1.0" },
      });
      if (!res.ok) {
        return new NextResponse(null, { status: 404 });
      }
      const contentType = res.headers.get("content-type") ?? "image/png";
      const body = await res.arrayBuffer();
      return new NextResponse(body, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      });
    } catch {
      return new NextResponse(null, { status: 404 });
    }
  }

  // 2) data URL (커스텀 업로드 이미지)
  if (user.image?.startsWith("data:")) {
    try {
      const [header, base64] = user.image.split(",");
      const m = header.match(/data:([^;]+)/);
      const contentType = m ? m[1].trim() : "image/png";
      const buf = Buffer.from(base64!, "base64");
      return new NextResponse(buf, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      });
    } catch {
      return new NextResponse(null, { status: 404 });
    }
  }

  return new NextResponse(null, { status: 404 });
}
