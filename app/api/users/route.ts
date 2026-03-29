import { prisma } from "@/lib/prisma";

const SITE_URL = (process.env.NEXTAUTH_URL ?? "https://fluffy-link.xyz").replace(
  /\/$/,
  ""
);

/**
 * GET /api/users
 * 가입 유저 id(Discord) + 핸들(@태그) + 플러피링크 프로필 URL + 프로필 뱃지(profileTag) 공개 JSON.
 * `ids`는 이전 클라이언트 호환용.
 */
export async function GET() {
  const rows = await prisma.user.findMany({
    select: { id: true, handle: true, profileTag: true },
    orderBy: { createdAt: "asc" },
  });

  const users = rows.map((r) => {
    const handle = r.handle;
    const profileUrl = `${SITE_URL}/@${encodeURIComponent(handle)}`;
    return {
      id: r.id,
      handle,
      tag: `@${handle}`,
      profileUrl,
      profileTag: r.profileTag ?? null,
    };
  });

  return Response.json({
    ids: users.map((u) => u.id),
    users,
  });
}
