import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/auth/unlink
// Body: { provider, providerAccountId }
// Removes the Account linking. Refuses if it would leave the user with no login method.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const currentUserId = (session.user as any).id as string;
  if (!currentUserId) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const provider = String(body?.provider ?? "");
  const providerAccountId = String(body?.providerAccountId ?? "");
  if (!provider || !providerAccountId) {
    return NextResponse.json(
      { error: "provider와 providerAccountId가 필요해요." },
      { status: 400 }
    );
  }

  // Count the user's accounts (login methods)
  const accounts = await prisma.account.findMany({
    where: { userId: currentUserId },
  });
  if (accounts.length <= 1) {
    return NextResponse.json(
      { error: "연동 해제가 불가능해요. 최소 하나의 로그인 수단이 필요해요." },
      { status: 400 }
    );
  }

  const target = accounts.find(
    (a) => a.provider === provider && a.providerAccountId === providerAccountId
  );
  if (!target) {
    return NextResponse.json(
      { error: "해당 계정 연동을 찾을 수 없어요." },
      { status: 404 }
    );
  }

  await prisma.account.delete({ where: { id: target.id } });

  return NextResponse.json({ ok: true });
}
