import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST /api/auth/password
// Body: { currentPassword?, newPassword, confirmPassword }
// - If user has no password (OAuth-only): set a new password (currentPassword not required)
// - If user has a password: require currentPassword to match, then change
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

  const newPassword = String(body?.newPassword ?? "");
  const confirmPassword = String(body?.confirmPassword ?? "");
  const currentPassword = body?.currentPassword ? String(body.currentPassword) : null;

  const user = await prisma.user.findUnique({ where: { id: currentUserId } });
  if (!user) {
    return NextResponse.json({ error: "사용자를 찾을 수 없어요." }, { status: 404 });
  }

  // If user already has a password, verify currentPassword
  if (user.password) {
    if (!currentPassword) {
      return NextResponse.json(
        { error: "현재 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "현재 비밀번호가 올바르지 않아요." },
        { status: 400 }
      );
    }
  }

  // Validate new password
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "비밀번호는 8자 이상이어야 해요." },
      { status: 400 }
    );
  }
  if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return NextResponse.json(
      { error: "비밀번호는 영문과 숫자를 모두 포함해야 해요." },
      { status: 400 }
    );
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json(
      { error: "비밀번호 확인이 일치하지 않아요." },
      { status: 400 }
    );
  }

  const hash = await bcrypt.hash(newPassword, 12);

  // Ensure a credentials Account exists
  const credAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "credentials",
        providerAccountId: user.handleLower,
      },
    },
  });
  if (!credAccount) {
    await prisma.account.create({
      data: {
        userId: user.id,
        provider: "credentials",
        providerAccountId: user.handleLower,
        type: "credentials",
      },
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hash },
  });

  return NextResponse.json({ ok: true });
}
