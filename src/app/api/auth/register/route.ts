import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { writeLog } from "@/lib/log";

const HANDLE_REGEX = /^[a-z0-9가-힣._]+$/u;
const HANDLE_MIN = 3;
const HANDLE_MAX = 20;
const PASSWORD_MIN = 8;

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  const rawHandle = String(body?.handle ?? "").trim();
  const handleLower = rawHandle.toLowerCase();
  const password = String(body?.password ?? "");
  const confirmPassword = String(body?.confirmPassword ?? "");

  // 1. handle validation
  if (rawHandle.length < HANDLE_MIN || rawHandle.length > HANDLE_MAX) {
    return NextResponse.json(
      { error: `아이디는 ${HANDLE_MIN}~${HANDLE_MAX}자여야 해요.` },
      { status: 400 }
    );
  }
  if (!HANDLE_REGEX.test(handleLower)) {
    return NextResponse.json(
      { error: "아이디는 영어 소문자, 숫자, 한글, _, . 만 사용할 수 있어요." },
      { status: 400 }
    );
  }

  // 2. duplicate check
  const dup = await prisma.user.findUnique({ where: { handleLower } });
  if (dup) {
    return NextResponse.json(
      { error: "이미 존재하는 아이디입니다" },
      { status: 409 }
    );
  }

  // 3. password validation
  if (password.length < PASSWORD_MIN) {
    return NextResponse.json(
      { error: `비밀번호는 ${PASSWORD_MIN}자 이상이어야 해요.` },
      { status: 400 }
    );
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return NextResponse.json(
      { error: "비밀번호는 영문과 숫자를 모두 포함해야 해요." },
      { status: 400 }
    );
  }
  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: "비밀번호 확인이 일치하지 않아요." },
      { status: 400 }
    );
  }

  // 4. hash + create
  const hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      handle: rawHandle,
      handleLower,
      password: hash,
      name: rawHandle,
      isPublic: true,
    },
  });

  await prisma.account.create({
    data: {
      userId: user.id,
      provider: "credentials",
      providerAccountId: handleLower,
      type: "credentials",
    },
  });

  await writeLog({
    type: "USER_CREATE",
    message: `user created (provider=credentials, id=${user.id}, handle=@${rawHandle})`,
    actorUserId: user.id,
    targetUserId: user.id,
  });

  return NextResponse.json({ ok: true });
}
