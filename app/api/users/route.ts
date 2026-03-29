import { prisma } from "@/lib/prisma";

/**
 * GET /api/users
 * 가입 유저의 id(Discord user id)만 공개 JSON으로 반환.
 */
export async function GET() {
  const rows = await prisma.user.findMany({
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  const ids = rows.map((r) => r.id);

  return Response.json({ ids });
}
