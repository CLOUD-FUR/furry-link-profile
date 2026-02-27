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
 * @CLOUD 계정만 OG/메타에 고정 이미지 사용.
 * 나머지 핸들(ex. @Tiger_Rangi)은 항상 현재 프로필 이미지를 사용.
 */
const FIXED_AVATAR_HANDLE = "cloud";
const FIXED_AVATAR_URL =
  "https://cdn.discordapp.com/avatars/1362203848713703514/b89a0b5def16807f3a385939b6617ada.png?size=2048";

/**
 * OG/디스코드 임베드용 이미지. 고정 아바타 유저는 항상 고정 URL 사용.
 */
export async function GET(
  _req: Request,
  { params }: { params: { handle: string } }
) {
  const handleParam = decodeHandle(params.handle ?? "");
  const handleLower = handleParam.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { handleLower },
    select: { id: true, image: true, discordImage: true, isPublic: true },
  });

  if (!user || !user.isPublic) {
    return new NextResponse(null, { status: 404 });
  }

  /**
   * ✅ @CLOUD 핸들만 고정 아바타 사용.
   *    그 외 핸들은 항상 DB에 저장된 현재 프로필 이미지를 사용.
   */
  if (handleLower === FIXED_AVATAR_HANDLE) {
    return NextResponse.redirect(FIXED_AVATAR_URL, 302);
  }

  // 일반 유저는 DB 이미지 / 디스코드 이미지를 사용
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
        headers: { "User-Agent": "Mozilla/5.0 (compatible; FluffyLink-OG/1.0)" },
      });
      if (!res.ok) {
        // fetch 실패 시 원본 이미지 URL로 리다이렉트 (Discord/CDN이 우리 서버 fetch를 막는 경우 대비)
        return NextResponse.redirect(httpUrl, 302);
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
      // 네트워크 오류 시에도 리다이렉트로 이미지 노출 시도
      return NextResponse.redirect(httpUrl, 302);
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
