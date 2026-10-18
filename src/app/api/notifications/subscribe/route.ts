import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId || !session) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: '잘못된 구독 정보입니다' }, { status: 400 });
    }

    const userAgent = request.headers.get('user-agent') || '';

    // 기존 구독이 있으면 업데이트, 없으면 생성
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: {
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent,
      },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push subscription error:', error);
    return NextResponse.json(
      { error: '구독 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json({ error: '엔드포인트가 필요합니다' }, { status: 400 });
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        userId,
        endpoint,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json(
      { error: '구독 취소 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
