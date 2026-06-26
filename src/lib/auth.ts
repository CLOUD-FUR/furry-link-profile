import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
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

// Build providers list. Discord is always present. Google is conditional.
const providers: NextAuthOptions["providers"] = [
  DiscordProvider({
    clientId: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    authorization: { params: { scope: "identify email" } },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { scope: "openid email profile" } },
    })
  );
}

providers.push(
  CredentialsProvider({
    id: "credentials",
    name: "credentials",
    credentials: {
      handle: { label: "아이디", type: "text" },
      password: { label: "비밀번호", type: "password" },
    },
    async authorize(credentials) {
      try {
        const handle = credentials?.handle?.trim().toLowerCase();
        const password = credentials?.password;
        if (!handle || !password) return null;

        const user = await prisma.user.findUnique({ where: { handleLower: handle } });
        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(String(password), user.password);
        if (!valid) return null;

        return {
          id: String(user.id),
          name: user.name ?? user.handle,
          email: user.email ?? null,
          image: user.image ?? null,
        };
      } catch (e) {
        console.error("[auth] credentials authorize error:", e);
        return null;
      }
    },
  })
);

export const authOptions: NextAuthOptions = {
  providers: providers as any,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, user, profile }) {
      // 첫 로그인 시 user 객체가 전달됨 — token에 id 저장
      if (user) {
        token.id = String((user as any).id);
        token.name = (user as any).name ?? token.name;
        token.picture = (user as any).image ?? token.picture;
      }

      // Credentials 로그인은 여기서 끝
      if (account?.provider === "credentials") {
        return token;
      }

      // OAuth sign-in (Discord or Google)
      if (account && profile) {
        const provider = account.provider; // "discord" | "google"
        let providerAccountId: string | undefined;
        let name: string = "user";
        let image: string = "";

        if (provider === "discord") {
          const discordId = String((profile as any).id);
          providerAccountId = discordId;
          name =
            (profile as any).global_name || (profile as any).username || "user";
          image = (profile as any).avatar
            ? `https://cdn.discordapp.com/avatars/${discordId}/${(profile as any).avatar}.png?size=256`
            : "";
        } else if (provider === "google") {
          const sub = String((profile as any).sub);
          providerAccountId = sub;
          name = (profile as any).name || (profile as any).email || "user";
          image = (profile as any).picture ?? "";
        }

        if (!providerAccountId) return token;

        // Look up existing Account for this provider+providerAccountId
        const existingAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider,
              providerAccountId,
            },
          },
          include: { user: true },
        });

        if (existingAccount) {
          // Login as existing user — update name/image
          token.id = existingAccount.userId;

          await prisma.user
            .update({
              where: { id: existingAccount.userId },
              data: {
                name,
                ...(provider === "discord"
                  ? {
                      discordImage: image,
                      ...(existingAccount.user.image?.startsWith("data:")
                        ? {}
                        : { image: image || existingAccount.user.image || "" }),
                    }
                  : {}),
              },
            })
            .catch(() => {});

          await writeLog({
            type: "LOGIN",
            message: `login (provider=${provider}, id=${existingAccount.userId})`,
            actorUserId: existingAccount.userId,
            targetUserId: existingAccount.userId,
          });
        } else {
          // No Account exists — create new User + Account
          const handle = makeHandleDisplay(name);
          const handleLower = await ensureUniqueHandleLower(handle);

          const newUser = await prisma.user.create({
            data: {
              name,
              image,
              ...(provider === "discord" ? { discordImage: image } : {}),
              handle,
              handleLower,
              bio: "",
              theme: "pastel",
              themeJson: "",
              bannerUrl: "",
              isPublic: true,
              ...(provider === "google" && (profile as any).email
                ? { email: String((profile as any).email) }
                : {}),
            },
          });

          await prisma.account.create({
            data: {
              userId: newUser.id,
              provider,
              providerAccountId,
              type: "oauth",
            },
          });

          token.id = newUser.id;

          await writeLog({
            type: "USER_CREATE",
            message: `user created (provider=${provider}, id=${newUser.id}, handle=@${handle})`,
            actorUserId: newUser.id,
            targetUserId: newUser.id,
          });
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
