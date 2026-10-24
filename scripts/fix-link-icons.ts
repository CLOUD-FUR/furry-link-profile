import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixLinkIcons() {
  console.log('🔍 잘못된 아이콘 경로를 찾는 중...');

  // /icons/로 시작하는 icon 필드를 가진 링크들 찾기
  const linksWithBadIcons = await prisma.link.findMany({
    where: {
      icon: {
        startsWith: '/icons/'
      }
    },
    select: {
      id: true,
      icon: true,
      platform: true,
      title: true
    }
  });

  console.log(`📊 ${linksWithBadIcons.length}개의 잘못된 아이콘 발견`);

  if (linksWithBadIcons.length === 0) {
    console.log('✅ 수정할 아이콘이 없습니다.');
    return;
  }

  // 각 링크의 아이콘을 수정
  let fixed = 0;
  for (const link of linksWithBadIcons) {
    let newIcon = '🔗'; // 기본값

    // platform에 따라 적절한 아이콘 설정
    if (link.platform === 'discord_server') newIcon = '💬';
    else if (link.platform === 'x') newIcon = '✖️';
    else if (link.platform === 'instagram') newIcon = '📷';
    else if (link.platform === 'youtube') newIcon = '▶️';
    else if (link.platform === 'other') newIcon = '🔗';

    await prisma.link.update({
      where: { id: link.id },
      data: { icon: newIcon }
    });

    console.log(`✓ ${link.title}: ${link.icon} → ${newIcon}`);
    fixed++;
  }

  console.log(`\n✅ ${fixed}개 링크의 아이콘을 수정했습니다.`);
}

fixLinkIcons()
  .then(() => {
    console.log('완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  });
