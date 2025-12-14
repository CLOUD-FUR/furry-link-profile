import { prisma } from "@/lib/prisma";
import { getThemeById } from "@/lib/themes";
import { notFound } from "next/navigation";

function platformEmoji(platform: string) {
  const map: Record<string, string> = {
    x: "𝕏",
    instagram: "📸",
    youtube: "▶️",
    discord_server: "💬",
    bluesky: "🦋",
    other: "🔗",
  };
  return map[platform] ?? "🔗";
}

function parseThemeJson(themeJson: string) {
  try {
    return themeJson ? JSON.parse(themeJson) : {};
  } catch {
    return {};
  }
}

export default async function PublicProfile({ params }: { params: { handle: string } }) {
  const handleLower = params.handle.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { handleLower },
    include: { links: { orderBy: { order: "asc" } } },
  });

  if (!user || !user.isPublic) return notFound();

  const theme = getThemeById(user.theme);
  const isDark = user.theme !== "custom" ? theme.isDark : false;

  const tjson = parseThemeJson(user.themeJson);
  const bgImage: string | undefined = typeof (tjson as any)?.bgImage === "string" ? (tjson as any).bgImage : undefined;

  const links = user.links.filter((l) => l.enabled);

  return (
    <div className={`min-h-screen ${theme.bg} relative overflow-hidden`}>
      <div className="absolute inset-0 noise opacity-30" />
      {bgImage ? (
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ) : null}

      <div className="relative mx-auto w-full max-w-md px-4 py-10">
        <div className={`rounded-[2rem] border ${theme.card} backdrop-blur-glass shadow-soft overflow-hidden`}>
          <div
            className="h-40 bg-gradient-to-r from-sky-300/50 to-violet-300/50"
            style={
              user.bannerUrl
                ? { backgroundImage: `url(${user.bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                : undefined
            }
          />
          <div className="-mt-10 flex justify-center">
            <img
              src={(user.image || user.discordImage) || "https://placehold.co/128x128/png"}
              alt="avatar"
              className="h-24 w-24 rounded-full border-4 border-white/70 bg-white/60 shadow-glow object-cover"
            />
          </div>

          <div className="px-6 pb-8 pt-4 text-center">
            <div className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>@{user.handle}</div>
            {user.bio ? (
              <p className={`mt-1 text-sm whitespace-pre-wrap ${isDark ? "text-white/80" : "text-slate-700"}`}>
                {user.bio}
              </p>
            ) : null}

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
                        <span className={`block text-xs font-medium opacity-80 ${isDark ? "text-white/70" : "text-slate-700"}`}>
                          {l.subtitle}
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <span className="opacity-60 group-hover:opacity-100">↗</span>
                </a>
              ))}
              {links.length === 0 ? (
                <div className={`rounded-2xl border border-white/40 bg-white/20 px-4 py-6 text-sm ${isDark ? "text-white/70" : "text-slate-700"}`}>
                  아직 공개된 링크가 없어.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
