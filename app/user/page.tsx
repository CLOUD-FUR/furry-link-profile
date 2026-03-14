import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui";
import { UserListClient } from "@/components/user-list-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "유저 리스트 | Fluffy Link",
  description: "플러피 링크 사용자 목록",
};

export default async function UserListPage() {
  const users = await prisma.user.findMany({
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
    },
    orderBy: { handleLower: "asc" },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-sky-200 to-violet-200 relative overflow-hidden">
      <div className="absolute inset-0 noise opacity-40" />
      <Container className="relative py-10 pb-16">
        <UserListClient users={users} />
      </Container>
    </div>
  );
}
