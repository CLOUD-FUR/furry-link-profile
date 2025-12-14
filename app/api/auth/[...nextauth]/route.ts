import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "@/lib/prisma";

const handler = NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    // ✅ JWT에 Discord ID 저장
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    // ✅ session.user.id 주입 (이게 핵심)
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },

    // ✅ 로그인 시 유저 자동 생성
    async signIn({ user }) {
      const discordId = user.id;

      const exists = await prisma.user.findUnique({
        where: { id: discordId },
      });

      if (!exists) {
        const handle = user.name ?? `user_${discordId.slice(0, 6)}`;

        await prisma.user.create({
          data: {
            id: discordId,
            handle,
            handleLower: handle.toLowerCase(),
            image: user.image ?? "",
            discordImage: user.image ?? "",
            bio: "",
            theme: "pastel",
            themeJson: "",
            isPublic: true,
          },
        });
      }

      return true;
    },

    // ✅ 로그인 후 dashboard로
    async redirect({ baseUrl }) {
      return `${baseUrl}/dashboard`;
    },
  },
});

export { handler as GET, handler as POST };
