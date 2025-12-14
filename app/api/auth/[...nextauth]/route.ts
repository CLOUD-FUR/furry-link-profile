import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

const handler = NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async redirect({ url, baseUrl }) {
      // 로그인 후 항상 깔끔한 dashboard로
      return `${baseUrl}/dashboard`;
    },
  },
});

export { handler as GET, handler as POST };
