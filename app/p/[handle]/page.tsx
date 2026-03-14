import { prisma } from "@/lib/prisma";
import { getThemeById } from "@/lib/themes";
import { PROFILE_TAGS } from "@/lib/profile-tags";
import { notFound } from "next/navigation";
import { PLATFORM_ICONS, getOtherLinkDisplayIcon } from "@/lib/platform-icons";
import Script from "next/script";
import { ProfileVisitTracker } from "@/components/profile-visit-tracker";
import { ProfileHandleShare } from "@/components/profile-handle-share";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://fluffy-link.xyz";

/**
 * @CLOUD 계정만 고정 아바타 이미지를 사용.
 * 나머지 핸들(ex. @Tiger_Rangi)은 항상 현재 프로필 이미지/디스코드 이미지를 사용.
 */
const FIXED_AVATAR_HANDLE = "cloud";
const FIXED_AVATAR_URL =
  "https://cdn.discordapp.com/avatars/1362203848713703514/b89a0b5def16807f3a385939b6617ada.png?size=2048";

function parseThemeJson(themeJson?: string) {
  try {
    return themeJson ? JSON.parse(themeJson) : {};
  } catch {
    return {};
  }
}

function decodeHandle(handle: string): string {
  try {
    return decodeURIComponent(handle);
  } catch {
    return handle;
  }
}

/* ---------- metadata (메타태그 / OG / Discord 임베드) ---------- */

export async function generateMetadata({
  params,
}: {
  params: { handle: string };
}): Promise<Metadata> {
  const handleParam = decodeHandle(params.handle);
  const handleLower = handleParam.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { handleLower },
    select: {
      id: true,
      handle: true,
      bio: true,
      image: true,
      discordImage: true,
      bannerUrl: true,
      isPublic: true,
      updatedAt: true,
    },
  });

  if (!user || !user.isPublic) {
    return { title: "Not Found" };
  }

  const title = `@${user.handle}`;
  const description = user.bio?.trim() ?? "";

  const isFixedAvatarUser = user.handle.toLowerCase() === FIXED_AVATAR_HANDLE;

  // 고정 아바타 유저는 항상 OG 이미지 사용, 그 외는 DB 이미지 여부로 결정
  const hasImage =
    isFixedAvatarUser ||
    (user.image && (user.image.startsWith("http") || user.image.startsWith("data:"))) ||
    user.discordImage?.startsWith("http");
  const base = SITE_URL.replace(/\/$/, "");
  // updatedAt 기준으로 버전을 붙여서 Discord / 카톡 썸네일 캐시를 갱신
  const version = user.updatedAt ? user.updatedAt.getTime() : Date.now();
  const ogImagePath = `${base}/p/${encodeURIComponent(handleParam)}/og-image?v=${version}`;
  const openGraphImages = hasImage
    ? [{ url: ogImagePath, width: 256, height: 256, alt: `@${user.handle}` }]
    : undefined;

  return {
    title,
    description: description,
    keywords: [user.handle, "플러피 링크", "Fluffy Link"],
    metadataBase: new URL(SITE_URL),
    themeColor: "#ffffff",
    openGraph: {
      type: "website",
      title,
      description: description,
      siteName: "Fluffy Link",
      url: `${SITE_URL.replace(/\/$/, "")}/@${encodeURIComponent(user.handle)}`,
      ...(openGraphImages && { images: openGraphImages }),
    },
    twitter: {
      card: "summary",
      title,
      description: description,
      ...(openGraphImages && { images: [openGraphImages[0].url] }),
    },
    other: {
      "theme-color": "#ffffff",
    },
  };
}

/* ---------- page ---------- */

export default async function PublicProfile({
  params,
}: {
  params: { handle: string };
}) {
  let handleParam = params.handle;
  try {
    handleParam = decodeURIComponent(params.handle);
  } catch {
    // keep as-is
  }

  const handleLower = handleParam.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { handleLower },
    include: {
      links: {
        where: { enabled: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!user || !user.isPublic) notFound();

  const theme = getThemeById(user.theme);
  const isDark =
    user.theme === "custom"
      ? false
      : getThemeById(user.theme).isDark;

  const themeJson = parseThemeJson(user.themeJson);
  const links = user.links ?? [];

  const activeTag = user.profileTag
    ? PROFILE_TAGS.find((t) => t.id === user.profileTag)
    : null;

  const isFixedAvatarUser = handleLower === FIXED_AVATAR_HANDLE;

  return (
    <>
      <ProfileVisitTracker handle={handleParam} />
      {user.profileEffect === "snow" ? (
        <Script
          src="https://app.embed.im/snow.js"
          strategy="afterInteractive"
        />
      ) : null}
      {user.profileEffect === "confetti" ? (
        <Script
          src="https://app.embed.im/confetti.js"
          strategy="afterInteractive"
        />
      ) : null}
      {user.profileEffect === "balloons" ? (
        <Script
          src="https://app.embed.im/balloons.js"
          strategy="afterInteractive"
        />
      ) : null}

      <div
      className={`min-h-screen flex justify-center ${theme.bg}`}
      style={
        user.theme === "custom" && themeJson.bgImage
          ? {
              backgroundImage: `url(${themeJson.bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <div className="relative mx-auto w-full max-w-md px-4 py-10">
        <div
          className={`rounded-[2rem] border ${theme.card} backdrop-blur-glass shadow-soft overflow-hidden`}
        >
          {/* Banner */}
          <div
            className="h-40 bg-gradient-to-r from-sky-300/50 to-violet-300/50"
            style={
              user.bannerUrl
                ? {
                    backgroundImage: `url(${user.bannerUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          />

          {/* Avatar */}
          <div className="-mt-10 flex justify-center">
            <img
              src={
                isFixedAvatarUser
                  ? FIXED_AVATAR_URL
                  : user.image || user.discordImage || "https://placehold.co/128x128/png"
              }
              alt="avatar"
              className="h-24 w-24 rounded-full border-4 border-white/70 bg-white/60 shadow-glow object-cover"
            />
          </div>

          {/* Content */}
          <div className="px-6 pb-8 pt-4 text-center">
            <div
              className={`text-2xl font-black ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              <ProfileHandleShare
                handle={user.handle}
                bio={user.bio}
                profileUrl={`${SITE_URL.replace(/\/$/, "")}/@${user.handle}`}
                isDark={isDark}
                className={isDark ? "text-white" : "text-slate-900"}
              />
            </div>

            {/* Profile Tag */}
            {activeTag ? (
              <div
                className={`mt-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                <img
                  src={activeTag.image}
                  alt={activeTag.label}
                  className="h-4 w-4"
                />
                {activeTag.label}
              </div>

            ) : null}

            {/* Bio */}
            {user.bio ? (
              <p
                className={`mt-2 text-sm whitespace-pre-wrap ${
                  isDark ? "text-white/80" : "text-slate-700"
                }`}
              >
                {user.bio}
              </p>
            ) : null}

            {/* Links */}
            <div className="mt-5 grid gap-3">
              {links.map((l) => (
                <a
                  key={l.id}
                  href={`/go/${l.id}`}
                  className={`group flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 font-semibold ${theme.button} ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/35">
                      {l.platform === "other" ? (
                        <span className="inline-flex items-center justify-center text-xl leading-none">{getOtherLinkDisplayIcon(l.icon)}</span>
                      ) : PLATFORM_ICONS[l.platform] ? (
                        <img
                          src={PLATFORM_ICONS[l.platform]!}
                          alt={l.platform}
                          className="h-5 w-5 object-contain"
                        />
                      ) : (
                        <span className="inline-flex items-center justify-center text-lg leading-none">🔗</span>
                      )}
                    </span>

                    <span className="text-left">
                      <span className="block">{l.title}</span>
                      {l.subtitle ? (
                        <span
                          className={`block text-xs font-medium opacity-80 ${
                            isDark
                              ? "text-white/70"
                              : "text-slate-700"
                          }`}
                        >
                          {l.subtitle}
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <span className="opacity-60 group-hover:opacity-100">
                    ↗
                  </span>
                </a>
              ))}

              {links.length === 0 ? (
                <div
                  className={`rounded-2xl border border-white/40 bg-white/20 px-4 py-6 text-sm ${
                    isDark ? "text-white/70" : "text-slate-700"
                  }`}
                >
                  아직 설정된 링크가 없어요!
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
