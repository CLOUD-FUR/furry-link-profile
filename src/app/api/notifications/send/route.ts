import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendPushToUser, saveNotification } from '@/lib/push-notifications';
import { isAdmin } from '@/lib/admin';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    // 관리자 권한 확인
    if (!isAdmin(session.user.id)) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, title, body: messageBody, icon, url, type } = body;

    if (!userId || !title || !messageBody) {
      return NextResponse.json(
        { error: 'userId, title, body는 필수입니다' },
        { status: 400 }
      );
    }

    const payload = {
      title,
      body: messageBody,
      icon: icon || '/logo.png',
      url: url || '/dashboard',
    };

    const result = await sendPushToUser(userId, payload);
    await saveNotification(userId, type || 'custom', payload);

    return NextResponse.json({
      success: true,
      sent: result.success,
      failed: result.failed,
    });
  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json(
      { error: '알림 전송 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
