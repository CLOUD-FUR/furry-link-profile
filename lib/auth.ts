import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "@/lib/prisma";
import { writeLog } from "@/lib/log";

function makeHandleDisplay(base: string) {
  const cleaned = base
    .trim()
    .toLowerCase()
    // 한글, 영어, 숫자, 언더바(_), 마침표(.)만 남기기
    .replace(/[^a-z0-9가-힣._]/gu, "")
    .slice(0, 20);

  return cleaned || "user";
}

async function ensureUniqueHandleLower(handleLower: string) {
  let candidate = handleLower || "user";
  let i = 1;
  while (true) {
    const exists = await prisma.user.findUnique({ where: { handleLower: candidate } });
    if (!exists) return candidate;
    i += 1;
    candidate = `${handleLower || "user"}_${i}`.slice(0, 20);
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify email" } },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const discordId = String((profile as any).id);
        token.id = discordId;

        const name = (profile as any).global_name || (profile as any).username || "user";
        const discordImage =
          (profile as any).avatar
            ? `https://cdn.discordapp.com/avatars/${discordId}/${(profile as any).avatar}.png?size=256`
            : "";

        const existing = await prisma.user.findUnique({ where: { id: discordId } });

        if (!existing) {
          const handle = makeHandleDisplay(name);
          const handleLowerBase = handle.toLowerCase();
          const handleLower = await ensureUniqueHandleLower(handleLowerBase);

          await prisma.user.create({
            data: {
              id: discordId,
              name,
              image: discordImage,
              discordImage,
              handle,
              handleLower,
              bio: "",
              theme: "pastel",
              themeJson: "",
              bannerUrl: "",
              isPublic: true,
            },
          });

          await writeLog({
            type: "USER_CREATE",
            message: `user created (id=${discordId}, handle=@${handle})`,
            actorUserId: discordId,
            targetUserId: discordId,
          });
        } else {
          await prisma.user.update({
            where: { id: discordId },
            data: {
              name,
              discordImage,
              ...(existing.image?.startsWith("data:") ? {} : { image: discordImage || existing.image || "" }),
            },
          });

          await writeLog({
            type: "LOGIN",
            message: `login (id=${discordId})`,
            actorUserId: discordId,
            targetUserId: discordId,
          });
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
