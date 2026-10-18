#!/usr/bin/env node

/**
 * Discord 웹훅으로 배포 알림 전송
 * Usage: node scripts/deploy-notify.js "업데이트 내용1" "업데이트 내용2" ...
 */

const https = require('https');
const { execSync } = require('child_process');

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1561343098569887794/OjRYpKgimjuMwi92dIA8sqs2URLFya_MY-aSJKZSTXIZuDXsFWCCluTpXU4GYgWGg9RH';

// 커밋 메시지에서 업데이트 내용 추출
function getUpdateContent() {
  const args = process.argv.slice(2);

  if (args.length > 0) {
    // 인자로 전달된 업데이트 내용 사용
    return args;
  }

  // 최근 커밋 메시지에서 자동 추출
  try {
    const commitMsg = execSync('git log -1 --pretty=%B', { encoding: 'utf-8' }).trim();
    const lines = commitMsg.split('\n').filter(line => line.trim());

    // Co-Authored-By 라인 제거
    const updates = lines.filter(line => !line.startsWith('Co-Authored-By:'));

    return updates.length > 0 ? updates : ['코드 개선 및 버그 수정'];
  } catch (error) {
    return ['코드 개선 및 버그 수정'];
  }
}

// Discord 메시지 포맷 생성
function createDiscordMessage(updates) {
  const updateList = updates.map(update => `- ${update}`).join('\n');

  const message = `# <a:Verified:1435898840766218260> 플러피링크 업데이트\n\n${updateList}`;

  return {
    content: message,
    username: 'FLUFFY LINK',
  };
}

// 웹훅 전송
function sendWebhook(message) {
  return new Promise((resolve, reject) => {
    const url = new URL(WEBHOOK_URL);
    const data = JSON.stringify(message);

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, status: res.statusCode });
        } else {
          reject(new Error(`Webhook failed: ${res.statusCode} ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// 메인 실행
async function main() {
  try {
    const updates = getUpdateContent();
    const message = createDiscordMessage(updates);

    console.log('📢 Discord 웹훅 전송 중...');
    console.log('업데이트 내용:');
    updates.forEach(update => console.log(`  - ${update}`));

    await sendWebhook(message);

    console.log('✅ Discord 알림 전송 완료!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Discord 알림 전송 실패:', error.message);
    // 실패해도 배포는 계속 진행되도록 exit 0
    process.exit(0);
  }
}

main();
