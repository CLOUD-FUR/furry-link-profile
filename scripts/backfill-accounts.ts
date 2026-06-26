// Backfill script: create Account records for existing Discord users.
// Run once after schema change. Safe to re-run (idempotent).
// Usage: npx tsx scripts/backfill-accounts.ts  (or: npx ts-node ...)

import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany();
    let created = 0;
    let skipped = 0;
    for (const u of users) {
      const existing = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: "discord",
            providerAccountId: u.id,
          },
        },
      });
      if (existing) {
        skipped++;
        continue;
      }
      await prisma.account.create({
        data: {
          userId: u.id,
          provider: "discord",
          providerAccountId: u.id,
          type: "oauth",
        },
      });
      created++;
    }
    console.log(`Backfill done. Created ${created} Account records, skipped ${skipped} (already existed). Total users: ${users.length}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
