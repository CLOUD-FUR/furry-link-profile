import { prisma } from "@/lib/prisma";
import { getThemeById } from "@/lib/themes";
import { PROFILE_TAGS } from "@/lib/profile-tags";
import { notFound } from "next/navigation";

/* ---------- utils ---------- */

function platformEmoji(platform: string) {
  const map: Record<string, string> = {
    x: "𝕏",
    instagram: "📸",
    youtube: "🎬",
    discord_server: "💬",
    other: "🔗",
  };
  return map[platform] ?? "🔗";
}

function parseThemeJson(themeJson?: string) {
  try {
    return themeJson ? JSON.parse(themeJson) : {};
  } catch {
    return {};
  }
}

/* ---------- page ---------- */

export default async function PublicProfile({
  params,
}: {
  params: { handle: string };
}) {
  const handleLower = params.handle.toLowerCase();

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

  return (
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
                user.image ||
                user.discordImage ||
                "https://placehold.co/128x128/png"
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
              @{user.handle}
            </div>

            {/* Profile Tag */}
            {activeTag ? (
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
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
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/35">
                      {platformEmoji(l.platform)}
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
  );
}
