import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/auth/accounts
// Returns the current user's linked accounts.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;
  if (!userId) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      handle: true,
      handleLower: true,
      password: true,
      accounts: {
        select: {
          id: true,
          provider: true,
          providerAccountId: true,
          type: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "사용자를 찾을 수 없어요." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    accounts: user.accounts,
    hasPassword: !!user.password,
    handle: user.handle,
    handleLower: user.handleLower,
  });
}
