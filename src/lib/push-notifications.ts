import webpush from 'web-push';
import { prisma } from './prisma';

// VAPID 키 설정
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

/**
 * 특정 사용자의 모든 구독에 푸시 알림 전송
 */
export async function sendPushToUser(
  userId: string,
  payload: PushNotificationPayload
): Promise<{ success: number; failed: number }> {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) {
    return { success: 0, failed: 0 };
  }

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: payload.icon || '/logo.png',
            url: payload.url || '/',
          })
        );
        return { success: true };
      } catch (error: any) {
        // 410 Gone = 구독 만료, 404 = 엔드포인트 없음 -> 삭제
        if (error.statusCode === 410 || error.statusCode === 404) {
          await prisma.pushSubscription.delete({
            where: { id: sub.id },
          });
        }
        return { success: false };
      }
    })
  );

  const success = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - success;

  return { success, failed };
}

/**
 * 알림 DB에 저장
 */
export async function saveNotification(
  userId: string,
  type: string,
  payload: PushNotificationPayload
): Promise<void> {
  await prisma.notification.create({
    data: {
      userId,
      type,
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/logo.png',
      url: payload.url || '',
    },
  });
}

/**
 * 방문자 마일스톤 알림을 보내야 하는지 확인
 * 50, 100, 300, 500, 1000명, 그 이후는 1000명 단위 (2000, 3000, 4000...)
 */
export function shouldNotifyVisitorMilestone(visitorCount: number): boolean {
  const milestones = [50, 100, 300, 500, 1000];

  // 기본 마일스톤 체크
  if (milestones.includes(visitorCount)) {
    return true;
  }

  // 1000명 이후는 1000명 단위로 체크
  if (visitorCount >= 1000 && visitorCount % 1000 === 0) {
    return true;
  }

  return false;
}

/**
 * 방문자 마일스톤 알림
 */
export async function notifyVisitorMilestone(
  userId: string,
  visitorCount: number
): Promise<void> {
  // 마일스톤에 해당하지 않으면 알림 보내지 않음
  if (!shouldNotifyVisitorMilestone(visitorCount)) {
    return;
  }

  const payload: PushNotificationPayload = {
    title: `축하합니다! 🎉`,
    body: `프로필 방문자가 ${visitorCount.toLocaleString()}명을 돌파했습니다!`,
    icon: '/logo.png',
    url: `/dashboard`,
  };

  await Promise.all([
    sendPushToUser(userId, payload),
    saveNotification(userId, 'milestone', payload),
  ]);
}

/**
 * 국가 알림을 보내야 하는지 확인
 * 3개 또는 5개 국가에 도달했을 때만 알림
 */
export function shouldNotifyCountryMilestone(countryCount: number): boolean {
  return countryCount === 3 || countryCount === 5;
}

/**
 * 국가 마일스톤 알림
 */
export async function notifyCountryMilestone(
  userId: string,
  countryCount: number
): Promise<void> {
  // 3개 또는 5개가 아니면 알림 보내지 않음
  if (!shouldNotifyCountryMilestone(countryCount)) {
    return;
  }

  const payload: PushNotificationPayload = {
    title: `새로운 국가 마일스톤! 🌍`,
    body: `${countryCount}개 국가에서 프로필을 방문했습니다!`,
    icon: '/logo.png',
    url: `/dashboard`,
  };

  await Promise.all([
    sendPushToUser(userId, payload),
    saveNotification(userId, 'country_milestone', payload),
  ]);
}
