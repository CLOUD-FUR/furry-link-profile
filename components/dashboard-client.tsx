"use client";

import NextLink from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import type { Link as DbLink, User } from "@prisma/client";
import { themes, getThemeById } from "@/lib/themes";
import { CUSTOM_THEMES } from "@/lib/custom-themes";
import clsx from "clsx";
import { PROFILE_TAGS } from "@/lib/profile-tags";
import { PLATFORM_ICONS, getOtherLinkDisplayIcon } from "@/lib/platform-icons";

type UserWithLinks = User & { links: DbLink[] };
type DraftLink = DbLink & { handleInput?: string };

type ToastKind = "success" | "error" | "info";

function deriveHandleInput(platform: string, url: string): string | undefined {
  if (!url) return undefined;

  if (platform === "x") {
    return url.replace(/^https?:\/\/(www\.)?x\.com\//, "");
  }

  if (platform === "instagram") {
    return url.replace(/^https?:\/\/(www\.)?instagram\.com\//, "");
  }

  return undefined;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function resizeImageToDataUrl(file: File, maxW: number, maxH: number, quality = 0.9): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  const img = new Image();
  img.src = dataUrl;
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error("이미지 로드 실패"));
  });

  const scale = Math.min(maxW / img.width, maxH / img.height, 1);
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, w, h);

  return canvas.toDataURL("image/jpeg", quality);
}

function platformOptions() {
  return [
    ["discord_server", "Discord 서버"],
    ["x", "Twitter (X)"],
    ["youtube", "YouTube"],
    ["instagram", "Instagram"],
    ["other", "기타 링크"],
  ] as const;
}

async function safeJson(res: Response) {
  const txt = await res.text();
  if (!txt) return null;
  try {
    return JSON.parse(txt);
  } catch {
    return { _raw: txt };
  }
}

export function DashboardClient({ initialUser }: { initialUser: UserWithLinks }) {
  const [savedUser, setSavedUser] = useState<UserWithLinks>(initialUser);
  const [draftUser, setDraftUser] = useState<UserWithLinks>(initialUser);
  const [draftLinks, setDraftLinks] = useState<DraftLink[]>(initialUser.links as DraftLink[]);
  const [tab, setTab] = useState<"profile" | "links" | "theme" | "stats" | "settings">("profile");

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const [handleError, setHandleError] = useState<string>("");

  const theme = useMemo(() => getThemeById(draftUser.theme), [draftUser.theme]);
  const isDark = useMemo(() => (draftUser.theme === "custom" ? false : getThemeById(draftUser.theme).isDark), [draftUser.theme]);

  // Toast
  const [toast, setToast] = useState<{ kind: ToastKind; message: string } | null>(null);
  const toastTimer = useRef<number | null>(null);

  // 복사 버튼 피드백 (버튼 옆에 "복사가 완료되었어요!" 표시 후 원상복귀)
  const [copyDone, setCopyDone] = useState(false);

  // 랜덤 추천 테마 버튼 피드백
  const [randomThemeDone, setRandomThemeDone] = useState(false);

  // 끌어올리기: 성공 피드백 + 쿨타임 표시용 1초 틱
  const [bumpDone, setBumpDone] = useState(false);
  const [tick, setTick] = useState(0);
  const BUMP_COOLDOWN_MS = 12 * 60 * 60 * 1000;
  const lastBumpedAt = savedUser.lastBumpedAt;
  const lastBumpedTime = !lastBumpedAt
    ? 0
    : lastBumpedAt instanceof Date
      ? lastBumpedAt.getTime()
      : new Date(String(lastBumpedAt)).getTime();
  const nextBumpAt = lastBumpedTime > 0 ? lastBumpedTime + BUMP_COOLDOWN_MS : 0;
  const inBumpCooldown = nextBumpAt > Date.now();
  useEffect(() => {
    if (!inBumpCooldown) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [inBumpCooldown]);
  const bumpRemainingMs = Math.max(0, nextBumpAt - Date.now());
  const bumpCooldownText =
    bumpRemainingMs >= 3600000
      ? `${Math.floor(bumpRemainingMs / 3600000)}시간 ${Math.floor((bumpRemainingMs % 3600000) / 60000)}분 뒤에 다시 시도해주세요!`
      : bumpRemainingMs >= 60000
        ? `${Math.floor(bumpRemainingMs / 60000)}분 뒤에 다시 시도해주세요!`
        : `${Math.ceil(bumpRemainingMs / 1000)}초 뒤에 다시 시도해주세요!`;

  const activeTag = PROFILE_TAGS.find(
    (t) => t.id === draftUser.profileTag
  );

  // ✅ 최초 마운트 시 서버 기준으로 다시 동기화
  useEffect(() => {
    refreshFromServer();
  }, []);

  // ✅ 가입/로그인 시 디스코드 웹훅 로그 (한 번만)
  useEffect(() => {
    fetch("/api/auth/log-event", { method: "POST", credentials: "include" }).catch(() => {});
  }, []);

  function showToast(kind: ToastKind, message: string) {
    setToast({ kind, message });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 5000);
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  // stats
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [profileVisitCount, setProfileVisitCount] = useState<number>(0);
  const [emojiErrors, setEmojiErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.counts) setCounts(d.counts);
        if (typeof d?.profileVisitCount === "number")
          setProfileVisitCount(d.profileVisitCount);
      })
      .catch(() => {});
  }, [saving]);

  function markDirty() {
    setDirty(true);
  }

  function resetDraft() {
    setDraftUser(savedUser);
    setDraftLinks(savedUser.links as DraftLink[]);
    setDirty(false);
    setHandleError("");
    showToast("info", "✅ 변경사항을 되돌렸어요!");
  }

  async function refreshFromServer() {
    const refreshed = await fetch("/api/profile")
      .then((r) => r.json())
      .catch(() => null);

    if (refreshed?.user) {
      setSavedUser(refreshed.user);
      setDraftUser(refreshed.user);

      // 🔥 여기서 handleInput 복원
      setDraftLinks(
        refreshed.user.links.map((l: DraftLink) => ({
          ...l,
          handleInput: deriveHandleInput(l.platform, l.url),
        }))
      );
    }
  }

  async function saveAll() {
    setSaving(true);
    setHandleError("");

    try {
      // 이모지 에러가 남아 있으면 저장 막기
      if (Object.values(emojiErrors).some((v) => v)) {
        showToast("error", "❌ 이모지 입력을 다시 확인해주세요.");
        return;
      }
      // 1️⃣ 프로필 저장
      const userPatch: Partial<User> = {
        handle: draftUser.handle,
        bio: draftUser.bio,
        theme: draftUser.theme,
        themeJson: draftUser.themeJson,
        bannerUrl: draftUser.bannerUrl,
        image: draftUser.image,
        isPublic: draftUser.isPublic,
        listPublic: draftUser.listPublic,
        profileTag: draftUser.profileTag, // ✅ 프로필 태그
        profileEffect: draftUser.profileEffect ?? null, // ✅ 프로필 효과
      };

      const resU = await fetch("/api/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(userPatch),
      });

      const dataU = await safeJson(resU);
      if (!resU.ok) {
        if (resU.status === 409 || resU.status === 400) {
          setHandleError(
            (dataU as any)?.error ?? "❌ 핸들을 다시 확인해주세요."
          );
        }
        showToast("error", (dataU as any)?.error ?? "❌ 프로필 저장 실패");
        return;
      }

      // 2️⃣ 링크 bulk 저장
      const r = await fetch("/api/links/bulk", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          links: draftLinks.map((l, i) => ({
            id: l.id,
            platform: l.platform,
            title: l.title,
            url: l.url,
            subtitle: l.subtitle,
            enabled: l.enabled,
            order: i,
            handle: l.handleInput ?? undefined, // UI 전용 → 서버에서 URL로 변환
            icon:
              l.platform === "other" && l.icon && l.icon !== "link"
                ? l.icon
                : undefined,
          })),
        }),
      });

      const d = await safeJson(r);
      if (!r.ok) {
        showToast("error", (d as any)?.error ?? "❌ 링크 저장 실패");
        return;
      }

      // 3️⃣ 🔥 서버 기준으로 재동기화 (핵심)
      await refreshFromServer();

      setDirty(false);
      showToast("success", "✅ 저장 완료!");
    } finally {
      setSaving(false);
    }
  }


async function addLink() {
  const res = await fetch("/api/links", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      platform: "other",
      title: "New Link",
      url: "https://example.com",
    }),
  });

  const data = await safeJson(res);

  if (res.ok && data?.links) {
    setSavedUser((u) => ({ ...u, links: data.links }));

    setDraftLinks((prev) => {
      const prevIds = new Set(prev.map((l) => l.id));

      const merged = [
        ...prev,
        ...(data.links as DbLink[])
          .filter((l) => !prevIds.has(l.id))
          .map((l) => ({ ...l })),
      ];

      return merged.sort((a, b) => a.order - b.order);
    });

    setDirty(true);
    showToast("success", "✅ 링크를 추가했어요! 저장을 눌러 적용해주세요!");
  } else {
    showToast("error", (data as any)?.error ?? "❌ 링크 추가를 실패했어요");
  }
}


  async function deleteLink(id: string) {
    if (!confirm("정말로 삭제 하시겠습니까?")) return;

    const res = await fetch("/api/links", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await safeJson(res);

    if (res.ok) {
      // ✅ savedUser는 서버 기준으로 갱신
      if (data?.links) {
        setSavedUser((u) => ({ ...u, links: data.links }));
      }

      // ✅ draftLinks는 현재 상태에서 해당 id만 제거
      setDraftLinks((prev) => prev.filter((l) => l.id !== id));

      markDirty();
      showToast("success", "✅ 링크를 삭제했어요! 저장을 눌러 적용해주세요!");
    } else {
      showToast("error", (data as any)?.error ?? "❌ 링크 삭제를 실패했어요");
    }
  }


  function moveLink(id: string, dir: -1 | 1) {
    const idx = draftLinks.findIndex((l) => l.id === id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= draftLinks.length) return;

    const next = [...draftLinks];
    const a = next[idx];
    const b = next[swap];
    next[idx] = b;
    next[swap] = a;

    const reordered = next.map((l, i) => ({ ...l, order: i }));
    setDraftLinks(reordered);
    markDirty();
  }

  function setLink(id: string, patch: Partial<DraftLink>) {
    setDraftLinks((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    markDirty();
  }

  const publicPath = `/@${draftUser.handle}`;
  const uiText = isDark ? "text-white/90" : "text-slate-800";
  const uiSub = isDark ? "text-white/70" : "text-slate-700";

  async function onAvatarFile(file: File) {
    const dataUrl = await resizeImageToDataUrl(file, 256, 256, 0.92);
    setDraftUser((u) => ({ ...u, image: dataUrl }));
    markDirty();
    showToast("info", "✅ 프로필 이미지가 적용되었어요! 저장을 눌러 적용해주세요!");
  }

  async function onBannerFile(file: File) {
    const dataUrl = await resizeImageToDataUrl(file, 1400, 500, 0.9);
    setDraftUser((u) => ({ ...u, bannerUrl: dataUrl }));
    markDirty();
    showToast("info", "✅ 배너가 적용되었어요! 저장을 눌러 적용해주세요!");
  }

  async function onThemeBgFile(file: File) {
    const dataUrl = await resizeImageToDataUrl(file, 1920, 1080, 0.9);
    const obj = { bgImage: dataUrl };
    setDraftUser((u) => ({ ...u, theme: "custom", themeJson: JSON.stringify(obj) }));
    markDirty();
    showToast("info", "✅ 사진 테마가 적용되었어요! 저장을 눌러 적용해주세요!");
  }

  function parseThemeBg(): string {
    try {
      const o = draftUser.themeJson ? JSON.parse(draftUser.themeJson) : {};
      return typeof o?.bgImage === "string" ? o.bgImage : "";
    } catch {
      return "";
    }
  }

  function resetBannerToDefault() {
    setDraftUser((u) => ({ ...u, bannerUrl: "" }));
    markDirty();
    showToast("info", "✅ 배너를 기본으로 변경했어요! 저장을 눌러 적용해주세요!");
  }

  function resetAvatarToDiscord() {
    // savedUser.image is what server stores; but we want Discord default.
    // If user has Discord image at login, it is stored in DB. We'll request refresh and use savedUser.image from server after save.
    setDraftUser((u) => ({ ...u, image: (savedUser.discordImage ?? savedUser.image ?? "") }));
    markDirty();
    showToast("info", "✅ 프로필이 기본으로 변경되었어요! 저장을 눌러 적용해주세요!");
  }

  function resetCustomThemeToPastel() {
    setDraftUser((u) => ({ ...u, theme: "pastel", themeJson: "" }));
    markDirty();
    showToast("info", "✅ 사진 테마를 기본으로 변경했어요! 저장을 눌러 적용해주세요!");
  }

  function applyRandomCustomTheme() {
    if (!CUSTOM_THEMES.length) {
      showToast("info", "등록된 추천 테마가 없어요. CUSTOM_THEMES를 먼저 채워주세요!");
      return;
    }

    const idx = Math.floor(Math.random() * CUSTOM_THEMES.length);
    const picked = CUSTOM_THEMES[idx];
    const obj = { bgImage: picked.imageUrl };

    setDraftUser((u) => ({
      ...u,
      theme: "custom",
      themeJson: JSON.stringify(obj),
    }));
    markDirty();

    setRandomThemeDone(true);
    window.setTimeout(() => setRandomThemeDone(false), 1600);
  }

  // ✅ 여기 추가 (return 위)
  const cleanPath = publicPath.trim();
  const fullUrl = `https://fluffy-link.xyz${cleanPath}`;

  return (
    <div className={clsx("min-h-screen relative overflow-hidden", theme.bg)}>
      <div className="absolute inset-0 noise opacity-30" />
      {draftUser.theme === "custom" && parseThemeBg() ? (
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage: `url(${parseThemeBg()})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ) : null}

      <div className="relative mx-auto w-full max-w-6xl px-4 py-10">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
          <NextLink
            href="/"
            className={clsx(
              "text-xl font-black tracking-tight cursor-pointer",
              uiText ?? ""
            )}
          >
            🐾 Dashboard | 프로필 수정하기
          </NextLink>

            <div className={clsx("text-sm", uiSub)}>
              프로필 페이지 바로가기:
              <a
                href={fullUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-1 underline break-all"
              >
                {fullUrl}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={!dirty || saving}
              onClick={saveAll}
              className={clsx(
                "rounded-2xl px-4 py-2 font-semibold shadow-soft transition",
                dirty
                  ? isDark
                    ? "bg-white text-slate-900 hover:bg-white/90"
                    : "bg-slate-900 text-white hover:opacity-95"
                  : isDark
                  ? "bg-white/20 text-white/50"
                  : "bg-white/40 text-slate-500",
                saving ? "opacity-70" : ""
              )}
              title={dirty ? "저장" : "변경 사항 없음"}
            >
              {saving ? "저장중.." : dirty ? "저장" : "저장됨"}
            </button>

            <button
              disabled={!dirty || saving}
              onClick={resetDraft}
              className={clsx(
                "rounded-2xl border px-4 py-2 font-semibold transition",
                dirty
                  ? isDark
                    ? "border-white/30 bg-white/15 text-white hover:bg-white/20"
                    : "border-white/50 bg-white/55 hover:bg-white/70"
                  : isDark
                  ? "border-white/15 bg-white/10 text-white/40"
                  : "border-white/30 bg-white/35 text-slate-500"
              )}
            >
              되돌리기
            </button>

            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
                signOut({ callbackUrl: "/" });
              }}
              className={clsx(
                "rounded-2xl px-4 py-2 font-semibold shadow-soft transition",
                isDark ? "bg-white/20 text-white hover:bg-white/25" : "bg-slate-900/90 text-white hover:opacity-95"
              )}
            >
              로그아웃
            </button>
          </div>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Left panel */}
          <div className={clsx("rounded-2xl border backdrop-blur-glass shadow-soft overflow-hidden", isDark ? "border-white/15 bg-white/10" : "border-white/45 bg-white/35")}>
            <div className="flex gap-1 p-2">
              {[
                ["profile", "프로필"],
                ["links", "링크"],
                ["theme", "테마"],
                ["stats", "방문자"],
                ["settings", "설정"],
              ].map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setTab(k as any)}
                  className={clsx(
                    "flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition",
                    tab === k
                      ? isDark
                        ? "bg-white text-slate-900"
                        : "bg-slate-900 text-white"
                      : isDark
                      ? "bg-white/10 text-white/80 hover:bg-white/15"
                      : "bg-white/40 hover:bg-white/55"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {tab === "profile" ? (
                <div className="space-y-4">
                  <Field label="프로필 이미지 (파일)">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) onAvatarFile(f);
                        }}
                        className={clsx("w-full", uiText)}
                      />
                      <button
                        type="button"
                        onClick={resetAvatarToDiscord}
                        className={clsx("shrink-0 rounded-xl px-3 py-2 text-xs font-bold", isDark ? "bg-white/15 text-white hover:bg-white/20" : "bg-white/60 hover:bg-white/75")}
                      >
                        Reset
                      </button>
                    </div>
                    <p className={clsx("mt-1 text-xs", uiSub)}>권장 사이즈는 256×256이에요!</p>
                  </Field>

                  <Field label="배너 이미지 (파일)">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) onBannerFile(f);
                        }}
                        className={clsx("w-full", uiText)}
                      />
                      <button
                        type="button"
                        onClick={resetBannerToDefault}
                        className={clsx("shrink-0 rounded-xl px-3 py-2 text-xs font-bold", isDark ? "bg-white/15 text-white hover:bg-white/20" : "bg-white/60 hover:bg-white/75")}
                      >
                        Reset
                      </button>
                    </div>
                    <p className={clsx("mt-1 text-xs", uiSub)}>권장 사이즈는 1400×500이에요!</p>
                  </Field>

                  <Field label="핸들 (@handle_name)">
                    <input
                      value={draftUser.handle}
                      maxLength={20}
                      onChange={(e) => {
                        setDraftUser((u) => ({ ...u, handle: e.target.value }));
                        setHandleError("");
                        markDirty();
                      }}
                      className={clsx(
                        "w-full rounded-xl border px-3 py-2",
                        isDark ? "bg-white/10 text-white border-white/15 placeholder:text-white/40" : "bg-white/60 border-white/50",
                        handleError ? "border-red-500 ring-2 ring-red-500/40" : ""
                      )}
                      placeholder="CLOUD"
                    />
                    <p className={clsx("mt-1 text-xs", uiSub)}>
                      최대 20자까지 한글, 영어, 숫자, 언더바(_), 마침표(.)만 사용할 수
                      있어요!
                    </p>
                    {handleError ? <p className="mt-1 text-xs text-red-300 font-semibold">{handleError}</p> : null}
                  </Field>

                  <Field label="소개글">
                    <textarea
                      value={draftUser.bio}
                      maxLength={500}
                      onChange={(e) => {
                        setDraftUser((u) => ({ ...u, bio: e.target.value }));
                        markDirty();
                      }}
                      className={clsx(
                        "min-h-[90px] w-full rounded-xl border px-3 py-2",
                        isDark ? "bg-white/10 text-white border-white/15 placeholder:text-white/40" : "border-white/50 bg-white/60"
                      )}
                      placeholder="여러 링크를 한 곳에 ✨"
                    />
                    <p className={clsx("mt-1 text-xs", uiSub)}>
                      최대 500자까지 적을 수 있어요!
                    </p>
                  </Field>

                  <Field label="프로필 태그">
                    <select
                      value={draftUser.profileTag ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setDraftUser((u) => ({
                          ...u,
                          profileTag: v === "" ? null : v,
                        }));
                        markDirty();
                      }}
                      style={{ colorScheme: isDark ? "dark" : "light" }} // ✅ 추가
                      className={clsx(
                        "w-full rounded-xl border px-3 py-2",
                        isDark
                          ? "bg-white/10 text-white border-white/15"
                          : "bg-white/60 border-white/50 text-black"
                      )}
                    >
                      <option
                        value=""
                        className={isDark ? "bg-slate-900 text-white" : ""}
                      >
                        선택 안함
                      </option>

                      {PROFILE_TAGS.map((tag) => (
                        <option
                          key={tag.id}
                          value={tag.id}
                          className={isDark ? "bg-slate-900 text-white" : ""}
                        >
                          {tag.label}
                        </option>
                      ))}
                    </select>

                    <p className={clsx("mt-1 text-xs", uiSub)}>
                      프로필에 표시할 태그를 1개 선택할 수 있어요
                    </p>
                  </Field>

                  <Field label="프로필 효과">
                    <select
                      value={draftUser.profileEffect ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setDraftUser((u) => ({
                          ...u,
                          profileEffect: v === "" ? null : (v as any),
                        }));
                        markDirty();
                      }}
                      style={{ colorScheme: isDark ? "dark" : "light" }}
                      className={clsx(
                        "w-full rounded-xl border px-3 py-2",
                        isDark
                          ? "bg-white/10 text-white border-white/15"
                          : "bg-white/60 border-white/50 text-black"
                      )}
                    >
                      <option
                        value=""
                        className={isDark ? "bg-slate-900 text-white" : ""}
                      >
                        선택 안함
                      </option>
                      <option
                        value="snow"
                        className={isDark ? "bg-slate-900 text-white" : ""}
                      >
                        스노우
                      </option>
                      <option
                        value="confetti"
                        className={isDark ? "bg-slate-900 text-white" : ""}
                      >
                        색종이 조각
                      </option>
                    </select>

                    <p className={clsx("mt-1 text-xs", uiSub)}>
                      프로필 페이지에 스노우 / 색종이 조각 효과를 1개 적용할 수
                      있어요. 대시보드 미리보기에는 표시되지 않습니다!
                    </p>
                  </Field>

                </div>
              ) : null}

              {tab === "links" ? (
                <div>
                  <button
                    onClick={addLink}
                    className={clsx("w-full rounded-2xl px-4 py-2 font-semibold", isDark ? "bg-white text-slate-900" : "bg-slate-900 text-white")}
                  >
                    링크 추가
                  </button>

                  <div className="mt-4 space-y-3">
                    {draftLinks.map((l) => (
                      <div key={l.id} className={clsx("rounded-2xl border p-3", isDark ? "border-white/15 bg-white/10" : "border-white/45 bg-white/40")}>
                        <div className="flex items-center justify-between gap-2">
                          <div className={clsx("font-bold", uiText)}>{l.title}</div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => moveLink(l.id, -1)}
                              className={clsx("rounded-xl border px-2 py-1 text-xs", isDark ? "border-white/15 bg-white/10 text-white/90" : "border-white/50 bg-white/60")}
                              title="위로"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveLink(l.id, 1)}
                              className={clsx("rounded-xl border px-2 py-1 text-xs", isDark ? "border-white/15 bg-white/10 text-white/90" : "border-white/50 bg-white/60")}
                              title="아래로"
                            >
                              ↓
                            </button>
                            <button
                              onClick={() => deleteLink(l.id)}
                              className="rounded-xl bg-rose-600 px-2 py-1 text-xs font-semibold text-white"
                              title="삭제"
                            >
                              삭제
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 grid gap-2">
                          <div className="grid grid-cols-3 gap-2">
                            <select
                              style={{ colorScheme: isDark ? "dark" : "light" }}
                              value={l.platform}
                              onChange={(e) => {
                                const platform = e.target.value;
                                setLink(l.id, { platform: platform as any });
                              }}
                              className={clsx(
                              "w-full rounded-xl px-3 py-2 text-sm",
                              isDark
                                ? "bg-white/10 text-white border border-white/20"
                                : "bg-white text-black border border-black/10"
                            )}
                          >
                            {platformOptions().map(([value, label]) => (
                              <option
                                key={value}
                                value={value}
                                className="bg-white text-black"
                              >
                                {label}
                              </option>
                            ))}
                          </select>


                            <input
                              value={l.title}
                              maxLength={60}
                              onChange={(e) => setLink(l.id, { title: e.target.value })}
                              className={clsx("col-span-2 rounded-xl border px-3 py-2 text-sm", isDark ? "border-white/15 bg-white/10 text-white placeholder:text-white/40" : "border-white/50 bg-white/60")}
                              placeholder="버튼 이름"
                            />
                          </div>

                          <input
                            value={l.subtitle ?? ""}
                            maxLength={80}
                            onChange={(e) => setLink(l.id, { subtitle: e.target.value })}
                            className={clsx("rounded-xl border px-3 py-2 text-sm", isDark ? "border-white/15 bg-white/10 text-white placeholder:text-white/40" : "border-white/50 bg-white/60")}
                            placeholder="설명(옵션)"
                          />

                          {l.platform === "x" ||
                          l.platform === "instagram" ||
                          l.platform === "bluesky" ? (
                            <input
                              value={l.handleInput ?? ""}
                              onChange={(e) => {
                                const handleInput = e.target.value;
                                setLink(l.id, { handleInput });
                              }}

                              className={clsx("rounded-xl border px-3 py-2 text-sm", isDark ? "border-white/15 bg-white/10 text-white placeholder:text-white/40" : "border-white/50 bg-white/60")}
                              placeholder={l.platform === "bluesky" ? "예시) cloud.bsky.social" : "예시) CLOUD (@ 없이)"}
                            />
                          ) : (
                            <>
                              <input
                                value={l.url}
                                onChange={(e) =>
                                  setLink(l.id, { url: e.target.value })
                                }
                                className={clsx(
                                  "rounded-xl border px-3 py-2 text-sm",
                                  isDark
                                    ? "border-white/15 bg-white/10 text-white placeholder:text-white/40"
                                    : "border-white/50 bg-white/60"
                                )}
                                placeholder="https://..."
                              />

                              {l.platform === "other" ? (
                                <div className="mt-2">
                                  <div className="flex items-center gap-2">
                                    <input
                                      maxLength={8}
                                      value={
                                        l.icon && l.icon !== "link"
                                          ? l.icon
                                          : ""
                                      }
                                      onChange={(e) => {
                                        const raw = e.target.value;
                                        // 비우기(백스페이스로 전부 지우기) 허용
                                        if (raw === "") {
                                          setLink(l.id, { icon: "link" });
                                          setEmojiErrors((prev) => {
                                            const next = { ...prev };
                                            delete next[l.id];
                                            return next;
                                          });
                                          markDirty();
                                          return;
                                        }
                                        const v = raw.trim();
                                        if (!v) {
                                          setLink(l.id, { icon: "link" });
                                          setEmojiErrors((prev) => {
                                            const next = { ...prev };
                                            delete next[l.id];
                                            return next;
                                          });
                                          markDirty();
                                          return;
                                        }

                                        if (/\s/.test(v)) {
                                          setEmojiErrors((prev) => ({
                                            ...prev,
                                            [l.id]:
                                              "공백 없이 이모지 1개만 입력해주세요.",
                                          }));
                                          return;
                                        }

                                        const units = Array.from(v);
                                        if (units.length !== 1) {
                                          setEmojiErrors((prev) => ({
                                            ...prev,
                                            [l.id]:
                                              "이모지는 1개만 입력할 수 있어요.",
                                          }));
                                          return;
                                        }

                                        const ch = units[0];
                                        if (!/\p{Extended_Pictographic}/u.test(ch)) {
                                          setEmojiErrors((prev) => ({
                                            ...prev,
                                            [l.id]:
                                              "시스템 이모지 1개만 입력할 수 있어요.",
                                          }));
                                          return;
                                        }

                                        setEmojiErrors((prev) => {
                                          const next = { ...prev };
                                          delete next[l.id];
                                          return next;
                                        });
                                        setLink(l.id, { icon: ch });
                                        markDirty();
                                      }}
                                      className={clsx(
                                        "w-20 rounded-xl border px-3 py-2 text-sm text-center",
                                        isDark
                                          ? "border-white/15 bg-white/10 text-white placeholder:text-white/40"
                                          : "border-white/50 bg-white/60"
                                      )}
                                      placeholder="🔗"
                                    />
                                    <span className={clsx("text-xs", uiSub)}>
                                      이모지(1개)만 입력할 수 있어요. 
                                      공백으로 둘 시 링크이모지 (🔗) 로 자동적용 돼요.
                                    </span>
                                  </div>
                                  {emojiErrors[l.id] ? (
                                    <p className="mt-1 text-xs text-red-300 font-semibold">
                                      {emojiErrors[l.id]}
                                    </p>
                                  ) : null}
                                </div>
                              ) : null}
                            </>
                          )}

                          <label className={clsx("flex items-center gap-2 text-sm", uiSub)}>
                            <input
                              type="checkbox"
                              checked={l.enabled}
                              onChange={(e) => setLink(l.id, { enabled: e.target.checked })}
                            />
                            공개(Enabled)
                          </label>

                          <div className={clsx("text-xs", uiSub)}>
                            방문자 수: <b className={uiText}>{counts[l.id] ?? 0}명</b>
                          </div>
                        </div>
                      </div>
                    ))}
                    {draftLinks.length === 0 ? (
                      <div className={clsx("rounded-2xl border p-4 text-sm", isDark ? "border-white/15 bg-white/10 text-white/70" : "border-white/45 bg-white/35 text-slate-700")}>
                        아직 링크가 없어요! “링크 추가” 버튼을 눌러서 설정해주세요!
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {tab === "theme" ? (
                <div className="space-y-3">
                  <div className={clsx("rounded-2xl border p-4", isDark ? "border-white/15 bg-white/10" : "border-white/50 bg-white/40")}>
                    <div className={clsx("font-black", uiText)}>커스텀 테마</div>
                    <div className={clsx("mt-1 text-xs", uiSub)}>권장 사이즈는 1920×1080 이에요!</div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        className="min-w-0 flex-1 text-xs"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) onThemeBgFile(f);
                        }}
                      />

                      <button
                        type="button"
                        onClick={resetCustomThemeToPastel}
                        className={clsx(
                          "shrink-0 rounded-xl px-3 py-2 text-xs font-bold",
                          isDark
                            ? "bg-white/15 text-white hover:bg-white/20"
                            : "bg-white/60 hover:bg-white/75"
                        )}
                      >
                        Reset
                      </button>
                    </div>

                    {draftUser.theme === "custom" && parseThemeBg() ? (
                      <div className={clsx("mt-3 overflow-hidden rounded-2xl border", isDark ? "border-white/15" : "border-white/50")}>
                        <img src={parseThemeBg()} alt="theme preview" className="h-28 w-full object-cover" />
                      </div>
                    ) : null}
                  </div>

                  <div className={clsx("rounded-2xl border p-4", isDark ? "border-white/15 bg-white/10" : "border-white/50 bg-white/40")}>
                    <div className={clsx("font-black", uiText)}>랜덤 추천테마</div>
                    <div className={clsx("mt-1 text-xs", uiSub)}>
                      저작권 문제가 없는 배경 이미지를 랜덤으로 불러와요. 적용을 원할 시 꼭 저장버튼을 눌러주세요.
                    </div>
                    <button
                      type="button"
                      onClick={applyRandomCustomTheme}
                      className={clsx(
                        "mt-3 w-full rounded-2xl px-4 py-2 text-sm font-semibold transition-colors duration-200",
                        randomThemeDone
                          ? "bg-emerald-500 text-white"
                          : isDark
                            ? "bg-white text-slate-900 hover:bg-white/90"
                            : "bg-slate-900 text-white hover:bg-slate-800"
                      )}
                    >
                      {randomThemeDone ? "랜덤 테마가 적용되었어요!" : "랜덤 추천 테마"}
                    </button>
                  </div>

                  {themes.slice(0, 6).map((t) => {
                    const selected = draftUser.theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setDraftUser((u) => ({ ...u, theme: t.id, themeJson: "" }));
                          markDirty();
                        }}
                        className={clsx(
                          "w-full rounded-2xl border p-4 text-left backdrop-blur-glass transition",
                          isDark ? "border-white/15" : "border-white/40",
                          selected
                            ? isDark
                              ? "bg-white text-slate-900 ring-2 ring-white/70"
                              : "bg-white/70 ring-2 ring-slate-900/40"
                            : isDark
                            ? "bg-white/10 text-white hover:bg-white/15"
                            : "bg-white/45 hover:bg-white/55"
                        )}
                      >
                        <div className="font-black">{t.name}</div>
                        <div className="mt-1 text-xs opacity-80">{t.description}</div>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {tab === "stats" ? (
                <div className="space-y-3">
                  <div className={clsx("rounded-2xl border p-4 text-sm", isDark ? "border-white/15 bg-white/10 text-white/70" : "border-white/45 bg-white/40 text-slate-800")}>
                    * 같은 브라우저 또는 세션에서는 링크 클릭·프로필 방문이 중복 카운트되지 않아요.
                  </div>
                  <div className={clsx("rounded-2xl border p-4", isDark ? "border-white/15 bg-white/10" : "border-white/45 bg-white/40")}>
                    <div className={clsx("font-bold", uiText)}>프로필 방문 수</div>
                    <div className={clsx("mt-2 text-sm", uiSub)}>
                      <b className={uiText}>{profileVisitCount}</b>명
                    </div>
                  </div>
                  <div className={clsx("rounded-2xl border p-4", isDark ? "border-white/15 bg-white/10" : "border-white/45 bg-white/40")}>
                    <div className={clsx("font-bold", uiText)}>링크별 방문자 수</div>
                    <div className={clsx("mt-3 space-y-2 text-sm", uiSub)}>
                      {draftLinks.map((l) => (
                        <div key={l.id} className="flex items-center justify-between">
                          <span className="truncate">{l.title}</span>
                          <b className={uiText}>{counts[l.id] ?? 0}</b>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {tab === "settings" ? (
                <div className="space-y-4">
                  <div className={clsx("flex items-center justify-between gap-3 rounded-2xl border p-4", isDark ? "border-white/15 bg-white/10" : "border-white/45 bg-white/40")}>
                    <div>
                      <div className={clsx("font-bold", uiText)}>페이지 공개</div>
                      <div className={clsx("text-xs", uiSub)}>OFF로 되있으면 프로필 링크가 비공개로 변경돼요</div>
                    </div>
                    <input
                      id="page-public-toggle"
                      type="checkbox"
                      className="peer sr-only"
                      checked={draftUser.isPublic}
                      onChange={(e) => {
                        setDraftUser((u) => ({ ...u, isPublic: e.target.checked }));
                        markDirty();
                      }}
                    />
                    <label
                      htmlFor="page-public-toggle"
                      className={clsx(
                        "relative flex h-8 w-14 shrink-0 cursor-pointer rounded-full transition-colors after:absolute after:left-0 after:top-0.5 after:h-7 after:w-7 after:rounded-full after:bg-white after:shadow-sm after:transition-[left] after:duration-200 after:content-['']",
                        draftUser.isPublic
                          ? "bg-emerald-400 after:left-[calc(100%-1.75rem)]"
                          : isDark ? "bg-white/25 after:left-0.5" : "bg-slate-300"
                      )}
                    />
                  </div>

                  <div className={clsx("flex items-center justify-between gap-3 rounded-2xl border p-4", isDark ? "border-white/15 bg-white/10" : "border-white/45 bg-white/40")}>
                    <div>
                      <div className={clsx("font-bold", uiText)}>유저 페이지에 공개</div>
                      <div className={clsx("text-xs", uiSub)}>플러피링크 유저 리스트 사이트에 공개 여부를 설정 할 수 있어요!</div>
                    </div>
                    <input
                      id="list-public-toggle"
                      type="checkbox"
                      className="peer sr-only"
                      checked={draftUser.listPublic ?? true}
                      onChange={(e) => {
                        setDraftUser((u) => ({ ...u, listPublic: e.target.checked }));
                        markDirty();
                      }}
                    />
                    <label
                      htmlFor="list-public-toggle"
                      className={clsx(
                        "relative flex h-8 w-14 shrink-0 cursor-pointer rounded-full transition-colors after:absolute after:left-0 after:top-0.5 after:h-7 after:w-7 after:rounded-full after:bg-white after:shadow-sm after:transition-[left] after:duration-200 after:content-['']",
                        draftUser.listPublic !== false
                          ? "bg-emerald-400 after:left-[calc(100%-1.75rem)]"
                          : isDark ? "bg-white/25 after:left-0.5" : "bg-slate-300"
                      )}
                    />
                  </div>

                  {draftUser.listPublic !== false ? (
                    <div className={clsx("rounded-2xl border p-4", isDark ? "border-white/15 bg-white/10" : "border-white/45 bg-white/40")}>
                      <button
                        type="button"
                        onClick={async () => {
                          if (inBumpCooldown) return;
                          try {
                            const res = await fetch("/api/profile/bump", { method: "POST" });
                            const data = await res.json().catch(() => ({}));
                            if (res.ok && data.ok) {
                              setBumpDone(true);
                              window.setTimeout(() => setBumpDone(false), 1600);
                              const r = await fetch("/api/profile");
                              const j = await r.json().catch(() => null);
                              if (j?.user?.lastBumpedAt != null) {
                                const nextAt = new Date(j.user.lastBumpedAt);
                                setSavedUser((u) => ({ ...u, lastBumpedAt: nextAt }));
                                setDraftUser((u) => ({ ...u, lastBumpedAt: nextAt }));
                              }
                            }
                          } catch {
                            showToast("error", "끌어올리기 요청에 실패했어요.");
                          }
                        }}
                        disabled={inBumpCooldown}
                        className={clsx(
                          "mt-0 w-full rounded-2xl px-4 py-2 font-semibold transition-colors duration-200 text-center",
                          bumpDone
                            ? "bg-emerald-500 text-white"
                            : inBumpCooldown
                              ? "bg-amber-400 text-amber-900 text-xs sm:text-sm"
                              : isDark
                                ? "bg-white text-slate-900 hover:bg-white/90"
                                : "bg-slate-900 text-white hover:bg-slate-800"
                        )}
                      >
                        {bumpDone
                          ? "끌어올리기가 되었어요!"
                          : inBumpCooldown
                            ? bumpCooldownText
                            : "프로필 끌어올리기"}
                      </button>
                    </div>
                  ) : null}

                  <div className={clsx("rounded-2xl border p-4", isDark ? "border-white/15 bg-white/10" : "border-white/45 bg-white/40")}>
                    <div className={clsx("font-bold", uiText)}>프로필 링크</div>
                    <input
                      readOnly
                      value={typeof window !== "undefined" ? `${window.location.origin}${publicPath}` : publicPath}
                      className={clsx("mt-2 w-full rounded-xl border px-3 py-2 text-sm", isDark ? "border-white/15 bg-white/10 text-white" : "border-white/50 bg-white/60")}
                    />
                    <button
                      onClick={() => {
                        const url = typeof window !== "undefined" ? `${window.location.origin}${publicPath}` : publicPath;
                        navigator.clipboard.writeText(url);
                        setCopyDone(true);
                        window.setTimeout(() => setCopyDone(false), 1600);
                      }}
                      className={clsx(
                        "mt-2 w-full rounded-2xl px-4 py-2 font-semibold transition-colors duration-200",
                        copyDone
                          ? "bg-emerald-500 text-white"
                          : isDark
                            ? "bg-white text-slate-900 hover:bg-white/90"
                            : "bg-slate-900 text-white hover:bg-slate-800"
                      )}
                    >
                      {copyDone ? "복사가 완료되었어요!" : "복사"}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Right preview */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <div className={clsx("rounded-[2rem] border backdrop-blur-glass shadow-soft overflow-hidden", isDark ? "border-white/15 bg-white/10" : "border-white/45 bg-white/30")}>
                <div
                  className="h-40 bg-gradient-to-r from-sky-300/50 to-violet-300/50"
                  style={
                    draftUser.bannerUrl
                      ? { backgroundImage: `url(${draftUser.bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                      : undefined
                  }
                />
                <div className="-mt-10 flex justify-center">
                  <img
                    src={draftUser.image || "https://placehold.co/128x128/png"}
                    alt="avatar"
                    className="h-24 w-24 rounded-full border-4 border-white/70 bg-white/60 shadow-glow object-cover"
                  />
                </div>
                <div className="px-6 pb-8 pt-4 text-center">
                  <div className={clsx("text-2xl font-black", uiText)}>
                    @{draftUser.handle}
                  </div>

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

                  {draftUser.bio ? (
                    <p className={clsx("mt-1 text-sm whitespace-pre-wrap", uiSub)}>
                      {draftUser.bio}
                    </p>
                  ) : null}

                  <div className="mt-5 grid gap-3">
                    {draftLinks.filter((l) => l.enabled).map((l) => (
                      <div
                        key={l.id}
                        className={clsx("group flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 font-semibold", theme.button)}
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
                            <span className={clsx("block", uiText)}>{l.title}</span>
                            {l.subtitle ? <span className={clsx("block text-xs font-medium opacity-70", uiSub)}>{l.subtitle}</span> : null}
                          </span>
                        </span>
                        <span className="opacity-60 group-hover:opacity-100">↗</span>
                      </div>
                    ))}
                    {draftLinks.filter((l) => l.enabled).length === 0 ? (
                      <div className={clsx("rounded-2xl border px-4 py-6 text-sm", isDark ? "border-white/15 bg-white/10 text-white/70" : "border-white/40 bg-white/30 text-slate-700")}>
                        아직 설정된 링크가 없어요!
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className={clsx("mt-4 rounded-2xl border backdrop-blur-glass p-4 text-xs", isDark ? "border-white/15 bg-white/10 text-white/70" : "border-white/45 bg-white/35 text-slate-700")}>
                변경사항은 우측 상단 <b>저장</b> 버튼을 눌러야 실제로 적용돼요!
              </div>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast ? (
          <div className="fixed bottom-5 right-5 z-50">
            <div
              className={clsx(
                "rounded-2xl px-4 py-3 shadow-soft border backdrop-blur-glass text-sm font-semibold",
                toast.kind === "success"
                  ? "bg-emerald-600/90 border-emerald-300/30 text-white"
                  : toast.kind === "error"
                  ? "bg-rose-600/90 border-rose-300/30 text-white"
                  : "bg-slate-900/80 border-white/15 text-white"
              )}
            >
              {toast.message}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm font-bold">{label}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}
