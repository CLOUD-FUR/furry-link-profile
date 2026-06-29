import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui";
import { UserListClient } from "@/components/user-list-client";
import { SiteTopBar } from "@/components/SiteTopBar";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://fluffy-link.xyz";

export const metadata: Metadata = {
  title: "유저 리스트 | Fluffy Link",
  description:
    "플러피링크(Fluffy Link)에 등록된 퍼리·퍼슈터 유저 리스트. 다양한 프로필을 둘러보고 팔로우하세요. 퍼리 커뮤니티 프로필 링크 모음.",
  keywords: [
    // 한국어
    "플러피링크 유저",
    "플러피링크 사용자",
    "퍼리 유저",
    "퍼슈터 리스트",
    "퍼슈터 유저",
    "퍼리 커뮤니티",
    "퍼리 한국",
    "한국 퍼리",
    "링크 모음 유저",
    "프로필 리스트",
    "유저 디렉토리",
    // English
    "fluffy link users",
    "furry users",
    "fursuiters list",
    "fursuiter directory",
    "furry community",
    "furry profiles",
    "fursuit bio",
    "fursona profiles",
    "linktree users",
  ],
  alternates: {
    canonical: "/user",
  },
  openGraph: {
    type: "website",
    title: "Fluffy Link | 유저 리스트",
    description:
      "플러피링크에 등록된 퍼리·퍼슈터 유저 리스트. 다양한 프로필을 둘러보세요.",
    siteName: "Fluffy Link",
    url: `${SITE_URL.replace(/\/$/, "")}/user`,
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Fluffy Link 로고",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Fluffy Link | 유저 리스트",
    description:
      "플러피링크에 등록된 퍼리·퍼슈터 유저 리스트.",
    images: ["/logo.png"],
  },
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
