"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import type { Link, User } from "@prisma/client";
import { themes, getThemeById } from "@/lib/themes";
import clsx from "clsx";
import { PROFILE_TAGS } from "@/lib/profile-tags";

type UserWithLinks = User & { links: Link[] };
type DraftLink = Link & { handleInput?: string };

type ToastKind = "success" | "error" | "info";

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

  const activeTag = PROFILE_TAGS.find(
  (t) => t.id === draftUser.profileTag
);


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

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.counts) setCounts(d.counts);
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
    const refreshed = await fetch("/api/profile").then((r) => r.json()).catch(() => null);
    if (refreshed?.user) {
      setSavedUser(refreshed.user);
      setDraftUser(refreshed.user);
      setDraftLinks(refreshed.user.links as DraftLink[]);
    }
  }

  async function saveAll() {
    setSaving(true);
    setHandleError("");

    try {
      // 1️⃣ 프로필 저장
      const userPatch: Partial<User> = {
        handle: draftUser.handle,
        bio: draftUser.bio,
        theme: draftUser.theme,
        themeJson: draftUser.themeJson,
        bannerUrl: draftUser.bannerUrl,
        image: draftUser.image,
        isPublic: draftUser.isPublic,
        profileTag: draftUser.profileTag, // ✅ 추가
      };

      const resU = await fetch("/api/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(userPatch),
      });

      const dataU = await safeJson(resU);
      if (!resU.ok) {
        if (resU.status === 409) {
          setHandleError((dataU as any)?.error ?? "❌ 이미 있는 핸들이에요!");
        }
        showToast("error", (dataU as any)?.error ?? "❌ 프로필 저장 실패");
        return;
      }

      // 2️⃣ 링크 bulk 저장 (🔥 핵심)
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
            handle: l.handleInput ?? undefined,
          })),
        }),
      });

      const d = await safeJson(r);
      if (!r.ok) {
        showToast("error", (d as any)?.error ?? "❌ 링크 저장 실패");
        return;
      }

      // 3️⃣ 상태 동기화 (🔥 중요)
      if (d?.links) {
        setSavedUser((u) => ({ ...u, links: d.links }));
        setDraftLinks((d.links as DraftLink[]).map((x: DraftLink) => ({ ...x })));
        setDirty(false);
      }

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
        ...(data.links as Link[])
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

  // ✅ 여기 추가 (return 위)
  const cleanPath = publicPath.trim();
  const fullUrl = `https://fluffy-link.xyz${cleanPath}`;

  return (

    <div className={clsx("min-h-screen relative overflow-hidden", theme.bg)}>
      <div className="absolute inset-0 noise opacity-30" />
      {draftUser.theme === "custom" && parseThemeBg() ? (
        <div
          className="absolute inset-0 opacity-35"
          style={{ backgroundImage: `url(${parseThemeBg()})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
      ) : null}

      <div className="relative mx-auto w-full max-w-6xl px-4 py-10">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className={clsx("text-xl font-black tracking-tight", uiText)}>🐾 Dashboard | 프로필 수정하기</div>
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
              onClick={() => signOut({ callbackUrl: "/" })}
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
                    <p className={clsx("mt-1 text-xs", uiSub)}>최대 20자까지 영어와 언더바만 적을 수 있어요!</p>
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
                    <p className={clsx("mt-1 text-xs", uiSub)}>최대 500자까지 적을 수 있어요!</p>
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
                    className={clsx(
                      "w-full rounded-xl border px-3 py-2",
                      isDark
                        ? "bg-white/10 text-white border-white/15"
                        : "bg-white/60 border-white/50"
                    )}
                  >
                    <option value="">선택 안함</option>

                    {PROFILE_TAGS.map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.label}
                      </option>
                    ))}
                  </select>

                  <p className={clsx("mt-1 text-xs", uiSub)}>
                    프로필에 표시할 태그를 1개 선택할 수 있어요
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

                          {l.platform === "x" || l.platform === "instagram" || l.platform === "bluesky" ? (
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
                            <input
                              value={l.url}
                              onChange={(e) => setLink(l.id, { url: e.target.value })}
                              className={clsx("rounded-xl border px-3 py-2 text-sm", isDark ? "border-white/15 bg-white/10 text-white placeholder:text-white/40" : "border-white/50 bg-white/60")}
                              placeholder="https://..."
                            />
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
                        아직 링크가 없어요! “링크 추가” 버튼을 눌러주세요!
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
                    * 같은 브라우저 또는 세션에서는 링크 클릭이 중복 카운트되지 않아요.
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
                  <label className={clsx("flex items-center justify-between gap-3 rounded-2xl border p-4", isDark ? "border-white/15 bg-white/10" : "border-white/45 bg-white/40")}>
                    <div>
                      <div className={clsx("font-bold", uiText)}>페이지 공개</div>
                      <div className={clsx("text-xs", uiSub)}>OFF로 되있으면 프로필 링크가 비공개로 변경돼요</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={draftUser.isPublic}
                      onChange={(e) => {
                        setDraftUser((u) => ({ ...u, isPublic: e.target.checked }));
                        markDirty();
                      }}
                    />
                  </label>

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
                        showToast("success", "✅ 프로필 링크를 복사했어요!");
                      }}
                      className={clsx("mt-2 w-full rounded-2xl px-4 py-2 font-semibold", isDark ? "bg-white text-slate-900" : "bg-slate-900 text-white")}
                    >
                      복사
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
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
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
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/35">
                            {l.platform === "x"
                              ? "𝕏"
                              : l.platform === "instagram"
                              ? "📸"
                              : l.platform === "youtube"
                              ? "🎬"
                              : l.platform === "discord_server"
                              ? "💬"
                              : l.platform === "bluesky"
                              ? "🦋"
                              : "🔗"}
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
