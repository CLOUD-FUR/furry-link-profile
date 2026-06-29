import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

/**
 * 관리자 TopBar 알림 — 실시간 DB 기반
 * 최근 24시간 내 이벤트를 집계해서 의미 있는 알림만 반환
 */

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  return `${day}일 전`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const actorId = (session.user as any).id as string;
  if (!isAdminId(actorId)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  // 병렬로 최근 24시간 이벤트 집계
  const [
    newUsers24h,
    newLinks24h,
    disabledLinks,
    recentLogs,
    recentVisits,
  ] = await Promise.all([
    // 최근 24시간 새 가입자
    prisma.user.findMany({
      where: { createdAt: { gte: oneDayAgo } },
      select: { id: true, handle: true, name: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    // 최근 24시간 새 링크
    prisma.link.findMany({
      where: { createdAt: { gte: oneDayAgo } },
      select: { id: true, title: true, createdAt: true, userId: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    // 비활성화된 링크 수
    prisma.link.count({ where: { enabled: false } }),
    // 최근 관리자 로그 (에러/경고 위주)
    prisma.log.findMany({
      where: { createdAt: { gte: oneDayAgo } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        type: true,
        message: true,
        createdAt: true,
      },
    }),
    // 최근 1시간 프로필 방문 수 (트래픽 급증 감지용)
    prisma.profileVisit.count({
      where: { createdAt: { gte: oneHourAgo } },
    }),
  ]);

  type Notification = {
    title: string;
    time: string;
    color: string;
    href?: string;
  };

  const notifications: Notification[] = [];

  // 1. 새 사용자 가입
  if (newUsers24h.length > 0) {
    const latest = newUsers24h[0];
    const handleText =
      newUsers24h.length === 1
        ? `새 사용자 @${latest.handle}님이 가입했습니다`
        : `새 사용자 ${newUsers24h.length}명이 가입했습니다`;
    notifications.push({
      title: handleText,
      time: timeAgo(latest.createdAt),
      color: "bg-indigo-500",
      href: "/admin/users",
    });
  }

  // 2. 새 링크 생성
  if (newLinks24h.length > 0) {
    const latest = newLinks24h[0];
    const linkText =
      newLinks24h.length === 1
        ? `새 링크 "${latest.title}"이(가) 생성되었습니다`
        : `새 링크 ${newLinks24h.length}개가 생성되었습니다`;
    notifications.push({
      title: linkText,
      time: timeAgo(latest.createdAt),
      color: "bg-emerald-500",
      href: "/admin/links",
    });
  }

  // 3. 비활성화된 링크
  if (disabledLinks > 0) {
    notifications.push({
      title: `비활성화된 링크 ${disabledLinks}개가 발견되었습니다`,
      time: "확인 필요",
      color: "bg-red-500",
      href: "/admin/links",
    });
  }

  // 4. 최근 1시간 방문자 수 (트래픽 표시)
  if (recentVisits > 0) {
    notifications.push({
      title: `최근 1시간 프로필 방문 ${recentVisits}회`,
      time: "1시간 전",
      color: "bg-amber-500",
      href: "/admin",
    });
  }

  // 5. 최근 로그 중 중요 이벤트 (관리자 작업 등)
  const importantLogs = recentLogs.filter((log) =>
    log.type.startsWith("ADMIN_")
  );
  if (importantLogs.length > 0) {
    const latest = importantLogs[0];
    notifications.push({
      title: latest.message,
      time: timeAgo(latest.createdAt),
      color: "bg-purple-500",
      href: "/admin/logs",
    });
  }

  return NextResponse.json({
    notifications,
    count: notifications.length,
    // 배지용 읽지 않은 알림 수 (간단히 전체 알림 수 사용)
    unreadCount: notifications.length,
  });
}
