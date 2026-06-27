import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui";
import { UserListClient } from "@/components/user-list-client";
import { SiteTopBar } from "@/components/SiteTopBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "유저 리스트 | Fluffy Link",
  description: "플러피 링크 사용자 목록",
};

export default async function UserListPage() {
  const rows = await prisma.user.findMany({
    where: {
      isPublic: true,
      listPublic: true,
    },
    select: {
      handle: true,
      handleLower: true,
      bio: true,
      image: true,
      discordImage: true,
      lastBumpedAt: true,
    },
    orderBy: { handleLower: "asc" },
  });

  const users = [...rows].sort((a, b) => {
    const at = a.lastBumpedAt?.getTime() ?? 0;
    const bt = b.lastBumpedAt?.getTime() ?? 0;
    if (bt !== at) return bt - at;
    return (a.handleLower ?? "").localeCompare(b.handleLower ?? "");
  }).map(({ lastBumpedAt, ...u }) => ({
    ...u,
    bumpedRecently: lastBumpedAt ? Date.now() - lastBumpedAt.getTime() < 24 * 60 * 60 * 1000 : false,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-200 via-sky-200 to-violet-300 dark:from-slate-950 dark:via-indigo-950 dark:to-fuchsia-950 relative overflow-hidden transition-colors">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-pink-300/40 dark:bg-fuchsia-500/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-violet-300/40 dark:bg-indigo-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-sky-300/40 dark:bg-sky-500/10 blur-3xl" />
      <div className="absolute inset-0 noise opacity-[0.35] dark:opacity-[0.15]" />

      <SiteTopBar activePage="user" />

      <Container className="relative py-10 pb-16">
        <UserListClient users={users} />
      </Container>
    </div>
  );
}
