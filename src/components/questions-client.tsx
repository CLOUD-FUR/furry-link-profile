"use client";

import { useState } from "react";
import NextLink from "next/link";
import clsx from "clsx";
import { SiteTopBar } from "@/components/SiteTopBar";

type Lang = "ko" | "en";

type FaqItem = {
  id: string;
  icon: string;
  titleKo: string;
  titleEn: string;
  contentKo: React.ReactNode;
  contentEn: React.ReactNode;
};

function Btn({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-2xl border px-3 py-1.5 text-sm font-semibold text-white",
        dark ? "border-slate-600 bg-slate-700 dark:border-white/20 dark:bg-white/20" : "border-slate-700 bg-slate-800 dark:border-white/25 dark:bg-white/15"
      )}
    >
      {children}
    </span>
  );
}

function LinkBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <NextLink href={href} className="font-semibold text-violet-600 dark:text-violet-300 underline decoration-violet-400 dark:decoration-violet-400/70 underline-offset-2 hover:text-violet-700 dark:hover:text-violet-200">
      {children}
    </NextLink>
  );
}

const FAQ_DATA: FaqItem[] = [
  {
    id: "start",
    icon: "🚀",
    titleKo: "시작하기 – 로그인과 대시보드",
    titleEn: "Getting started – Login & Dashboard",
    contentKo: (
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
        Discord 또는 Google 계정으로 로그인하면 바로 프로필을 만들 수 있어요.{" "}
        <LinkBtn href="/">홈</LinkBtn>에서 <Btn>Discord 로그인</Btn> 또는 <Btn>Google 로그인</Btn> 버튼을 누르거나,{" "}
        <LinkBtn href="/login">로그인 페이지</LinkBtn>로 이동한 뒤 원하는 방식으로 로그인해 주세요. 로그인 후에는 자동으로{" "}
        <LinkBtn href="/dashboard">대시보드</LinkBtn>로 이동합니다. 대시보드에서 프로필, 링크, 테마, 방문자, 설정 등 모두 관리할 수 있어요!
      </p>
    ),
    contentEn: (
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
        You can create your profile right after signing in with Discord or Google. On the{" "}
        <LinkBtn href="/">home page</LinkBtn>, click the <Btn>Discord 로그인</Btn> or <Btn>Google 로그인</Btn> button, or go to the{" "}
        <LinkBtn href="/login">login page</LinkBtn> and sign in. After login, you&apos;ll be taken to the{" "}
        <LinkBtn href="/dashboard">dashboard</LinkBtn>, where you can manage your profile, links, theme, visitor stats, and settings.
      </p>
    ),
  },
  {
    id: "profile-edit",
    icon: "👤",
    titleKo: "프로필 수정 (사진, 배너, 핸들, 소개글, 태그)",
    titleEn: "Editing your profile (photo, banner, handle, bio, tag)",
    contentKo: (
      <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
        <p>
          <LinkBtn href="/dashboard">대시보드</LinkBtn> &gt; <Btn>프로필</Btn> 탭에서 프로필 이미지, 배너, 핸들(@이름), 소개글, 프로필 태그를 수정할 수 있어요!
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>프로필 이미지</strong>: 권장 사이즈는 1:1 비율을 추천해요</li>
          <li><strong>배너 이미지</strong>: 권장 사이즈 1400×500</li>
          <li><strong>핸들</strong>: 한글 · 영어 · 숫자 · 언더바(_) · 마침표(.)만 사용 가능하며 최대 20자까지 적을 수 있어요. 프로필 주소는 <code className="rounded bg-slate-200 dark:bg-white/20 px-1">/@핸들</code> 형태예요.</li>
          <li><strong>소개글</strong>: 최대 500자까지 적을 수 있어요</li>
          <li><strong>프로필 태그</strong>: 퍼슈터, 아티스트, 메이커, 개발자, 사진사, 뮤지션, 서포터 중 하나를 선택해 프로필에 뱃지로 표시할 수 있어요</li>
        </ul>
        <p>설정 변경 후 오른쪽 상단 <Btn dark>저장</Btn> 버튼을 눌러 적용해 주세요!</p>
      </div>
    ),
    contentEn: (
      <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
        <p>
          In <LinkBtn href="/dashboard">Dashboard</LinkBtn> &gt; <Btn>프로필</Btn> (Profile) tab you can edit profile image, banner, handle (@name), bio, and profile tag.
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Profile image</strong>: Recommended 1:1 aspect ratio.</li>
          <li><strong>Banner</strong>: Recommended size 1400×500.</li>
          <li><strong>Handle</strong>: Only letters, numbers, underscore (_), and period (.). Max 20 characters. Your profile URL is <code className="rounded bg-slate-200 dark:bg-white/20 px-1">/@handle</code>.</li>
          <li><strong>Bio</strong>: Up to 500 characters.</li>
          <li><strong>Profile tag</strong>: Choose one from Fursuiter, Artist, Maker, Developer, Photographer, Musician, Supporter to display as a badge on your profile.</li>
        </ul>
        <p>After changing settings, click the <Btn dark>저장</Btn> (Save) button at the top right to apply!</p>
      </div>
    ),
  },
  {
    id: "links",
    icon: "🔗",
    titleKo: "링크 추가 · 수정 · 삭제 · 순서 변경",
    titleEn: "Profile links (add · edit · delete · reorder)",
    contentKo: (
      <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
        <p>
          <LinkBtn href="/dashboard">대시보드</LinkBtn> &gt; <Btn>링크</Btn> 탭에서 버튼으로 들어가는 링크를 관리할 수 있어요
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>링크 추가</strong>: <Btn dark>링크 추가</Btn> 버튼을 누르면 새로운 링크가 생겨요! 플랫폼( Discord 서버, X, YouTube, Instagram, 기타 링크 )을 고른 뒤 제목과 URL(또는 아이디)을 입력하고, 우측 상단 <Btn dark>저장</Btn>을 눌러서 적용해주세요!</li>
          <li><strong>기타 링크</strong>: 플랫폼을 &quot;기타 링크&quot;로 두면 원하는 URL과 버튼이름, 이모지를 자유롭게 커스텀하여 적용할 수 있어요!</li>
          <li><strong>링크 순서</strong>: 링크 탭에서 ↑·↓ 버튼으로 순서를 바꾼 뒤 <Btn dark>저장</Btn> 버튼을 누르면 변경사항이 저장돼요!</li>
          <li><strong>링크 삭제</strong>: 링크 옆 삭제 버튼으로 지운 뒤 <Btn dark>저장</Btn> 버튼을 누르면 변경사항이 적용돼요!</li>
        </ul>
      </div>
    ),
    contentEn: (
      <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
        <p>
          In <LinkBtn href="/dashboard">Dashboard</LinkBtn> &gt; <Btn>링크</Btn> (Links) tab you can manage the links that appear as buttons on your profile.
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Add link</strong>: Click the <Btn dark>링크 추가</Btn> (Add link) button to create a new link! Choose a platform (Discord server, X, YouTube, Instagram, or Other), enter the title and URL (or handle), then click <Btn dark>저장</Btn> (Save) at the top right to apply!</li>
          <li><strong>Other link</strong>: If you choose &quot;기타 링크&quot; (Other), you can freely customize the URL, button name, and emoji!</li>
          <li><strong>Link order</strong>: In the Links tab, change the order with the ↑·↓ buttons, then click <Btn dark>저장</Btn> (Save) to apply!</li>
          <li><strong>Delete link</strong>: Use the delete button next to a link, then click <Btn dark>저장</Btn> (Save) to apply!</li>
        </ul>
      </div>
    ),
  },
  {
    id: "theme",
    icon: "🎨",
    titleKo: "테마 변경 & 프로필 효과",
    titleEn: "Theme & profile effects",
    contentKo: (
      <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
        <p>
          <LinkBtn href="/dashboard">대시보드</LinkBtn> &gt; <Btn>테마</Btn> 탭에서 프로필 페이지의 테마를 바꿀 수 있어요. 자신이 원하는 테마 선택 후 <Btn dark>저장</Btn>을 눌러 적용해 주세요!
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>기본 테마</strong>: 파스텔, 다크 네온, 스카이 등 다양한 프리셋 테마 제공</li>
          <li><strong>커스텀 테마</strong>: 원하는 컬러와 배경 이미지로 나만의 테마를 만들 수 있어요</li>
          <li><strong>프로필 효과</strong>: 눈(snow) 또는 색종이(confetti) 효과를 켜서 프로필을 더 생동감 있게 꾸밀 수 있어요</li>
        </ul>
      </div>
    ),
    contentEn: (
      <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
        <p>
          In <LinkBtn href="/dashboard">Dashboard</LinkBtn> &gt; <Btn>테마</Btn> (Theme) tab you can change your profile page theme. Choose the theme you want and click <Btn dark>저장</Btn> (Save) to apply!
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Preset themes</strong>: Pastel, Dark Neon, Sky, and more</li>
          <li><strong>Custom theme</strong>: Create your own theme with custom colors and background image</li>
          <li><strong>Profile effects</strong>: Enable snow or confetti effects to make your profile more lively</li>
        </ul>
      </div>
    ),
  },
  {
    id: "bump",
    icon: "⬆️",
    titleKo: "프로필 끌어올리기",
    titleEn: "Bumping your profile",
    contentKo: (
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
        <LinkBtn href="/dashboard">대시보드</LinkBtn> &gt; <Btn>설정</Btn> 탭에서 <Btn dark>끌어올리기</Btn> 버튼을 누르면 <LinkBtn href="/user">유저 리스트</LinkBtn> 상단으로 프로필을 올릴 수 있어요! 12시간마다 한 번씩 사용 가능하니 홍보할 때 활용해 보세요!
      </p>
    ),
    contentEn: (
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
        In <LinkBtn href="/dashboard">Dashboard</LinkBtn> &gt; <Btn>설정</Btn> (Settings) tab, click the <Btn dark>끌어올리기</Btn> (Bump) button to move your profile to the top of the <LinkBtn href="/user">user list</LinkBtn>! You can use it once every 12 hours, so use it when you want to promote your profile!
      </p>
    ),
  },
  {
    id: "public",
    icon: "🔒",
    titleKo: "프로필 공개 / 비공개 & 리스트 노출",
    titleEn: "Public/private & list visibility",
    contentKo: (
      <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
        <p>
          <LinkBtn href="/dashboard">대시보드</LinkBtn> &gt; <Btn>설정</Btn> 탭에서 공개 범위를 설정할 수 있어요!
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>페이지 공개</strong>: OFF로 두면 프로필 링크로 들어와도 프로필이 보이지 않고 비공개로 처리돼요</li>
          <li><strong>리스트 노출</strong>: OFF로 두면 <LinkBtn href="/user">유저 리스트</LinkBtn>에 내 프로필이 표시되지 않아요</li>
        </ul>
        <p>변경 후 <Btn dark>저장</Btn> 버튼을 꼭 눌러주세요!</p>
      </div>
    ),
    contentEn: (
      <div className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
        <p>
          In <LinkBtn href="/dashboard">Dashboard</LinkBtn> &gt; <Btn>설정</Btn> (Settings) tab you can control your visibility!
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Page public</strong>: When OFF, your profile won&apos;t be visible to anyone via the profile link</li>
          <li><strong>List visibility</strong>: When OFF, your profile won&apos;t appear in the <LinkBtn href="/user">user list</LinkBtn></li>
        </ul>
        <p>Be sure to click <Btn dark>저장</Btn> (Save) after changing!</p>
      </div>
    ),
  },
  {
    id: "stats",
    icon: "📊",
    titleKo: "방문자 통계 보기",
    titleEn: "Viewing visitor stats",
    contentKo: (
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
        <LinkBtn href="/dashboard">대시보드</LinkBtn> &gt; <Btn>방문자</Btn> 탭에서 프로필 페이지 방문 수를 확인할 수 있어요! 이 통계는 자동으로 수집되어 본인만 확인할 수 있어요!
      </p>
    ),
    contentEn: (
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
        In <LinkBtn href="/dashboard">Dashboard</LinkBtn> &gt; <Btn>방문자</Btn> (Visitors) tab you can see how many people visited your profile! Stats are collected automatically and only you can see them!
      </p>
    ),
  },
  {
    id: "url-format",
    icon: "🌐",
    titleKo: "프로필 주소 형식",
    titleEn: "Profile URL format",
    contentKo: (
      <div className="space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed">
        <p>프로필 주소는 다음 두 가지로 접속할 수 있어요! (같은 페이지로 연결됩니다)</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><code className="rounded bg-slate-200 dark:bg-white/20 px-1">https://fluffy-link.xyz/@핸들</code></li>
          <li><code className="rounded bg-slate-200 dark:bg-white/20 px-1">https://fluffy-link.xyz/p/핸들</code></li>
        </ul>
        <p>이 링크는 대시보드 설정 탭에서 링크를 확인 및 복사할 수 있어요!</p>
      </div>
    ),
    contentEn: (
      <div className="space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed">
        <p>You can open your profile with either of these URLs (they lead to the same page).</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><code className="rounded bg-slate-200 dark:bg-white/20 px-1">https://fluffy-link.xyz/@handle</code></li>
          <li><code className="rounded bg-slate-200 dark:bg-white/20 px-1">https://fluffy-link.xyz/p/handle</code></li>
        </ul>
        <p>You can view and copy this link in the Dashboard Settings tab!</p>
      </div>
    ),
  },
];

export function QuestionsClient() {
  const [lang, setLang] = useState<Lang>("ko");
  const [openId, setOpenId] = useState<string | null>(FAQ_DATA[0]?.id ?? null);

  const langToggle = (
    <div className="flex items-center gap-1 rounded-full border border-white/70 bg-white/60 dark:border-white/15 dark:bg-white/10 p-0.5">
      <button
        onClick={() => setLang("ko")}
        className={clsx(
          "rounded-full px-2.5 py-1 text-xs font-bold transition-all",
          lang === "ko"
            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
            : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
        )}
      >
        한국어
      </button>
      <button
        onClick={() => setLang("en")}
        className={clsx(
          "rounded-full px-2.5 py-1 text-xs font-bold transition-all",
          lang === "en"
            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
            : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
        )}
      >
        EN
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-200 via-sky-200 to-violet-300 dark:from-slate-950 dark:via-indigo-950 dark:to-fuchsia-950 relative overflow-hidden transition-colors">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-pink-300/40 dark:bg-fuchsia-500/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-violet-300/40 dark:bg-indigo-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-sky-300/40 dark:bg-sky-500/10 blur-3xl" />
      <div className="absolute inset-0 noise opacity-[0.35] dark:opacity-[0.15]" />

      <SiteTopBar activePage="home" showNav={false} actions={langToggle} />

      <div className="relative mx-auto max-w-2xl px-4 py-10">
        {/* Title */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/55 dark:border-white/15 dark:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 backdrop-blur mb-4">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {lang === "ko" ? "도움말 센터" : "Help Center"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white" style={{ wordBreak: "keep-all" }}>
            {lang === "ko" ? "자주 묻는 질문" : "FAQ"}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">
            {lang === "ko" ? "궁금한 항목을 눌러 펼쳐 보세요 ✨" : "Click an item to expand ✨"}
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {FAQ_DATA.map((item, index) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={clsx(
                  "group rounded-2xl border backdrop-blur-md transition-all duration-300 overflow-hidden",
                  isOpen
                    ? "border-violet-300/70 bg-white/70 dark:border-violet-400/40 dark:bg-white/15 shadow-[0_20px_50px_-20px_rgba(124,58,237,0.35)]"
                    : "border-white/60 bg-white/45 dark:border-white/15 dark:bg-white/8 shadow-soft hover:border-violet-200/80 dark:hover:border-violet-400/30 hover:bg-white/55 dark:hover:bg-white/12 hover:-translate-y-0.5"
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left"
                >
                  {/* Icon badge */}
                  <span
                    className={clsx(
                      "shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-2xl text-xl transition-all duration-300",
                      isOpen
                        ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-[0_8px_20px_-8px_rgba(124,58,237,0.55)] scale-110"
                        : "bg-white/70 dark:bg-white/15 group-hover:scale-105"
                    )}
                  >
                    {item.icon}
                  </span>

                  {/* Title + number */}
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs font-bold text-violet-600 dark:text-violet-300 mb-0.5">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="block font-bold text-slate-800 dark:text-white text-[15px] leading-snug" style={{ wordBreak: "keep-all" }}>
                      {lang === "ko" ? item.titleKo : item.titleEn}
                    </span>
                  </span>

                  {/* Chevron */}
                  <span
                    className={clsx(
                      "shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                      isOpen
                        ? "bg-violet-500 text-white rotate-180"
                        : "bg-white/60 dark:bg-white/15 text-slate-500 dark:text-slate-300 group-hover:bg-white/80 dark:group-hover:bg-white/25"
                    )}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>

                {/* Content */}
                <div
                  className={clsx(
                    "grid transition-all duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 pt-0">
                      <div className="ml-0 rounded-2xl border border-white/50 bg-white/55 dark:border-white/15 dark:bg-white/8 p-4 text-sm">
                        {lang === "ko" ? item.contentKo : item.contentEn}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-10 rounded-2xl border border-white/50 bg-white/45 dark:border-white/15 dark:bg-white/8 backdrop-blur-md px-5 py-4 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {lang === "ko" ? "더 궁금한 점이 있으면 문의하기를 이용해 주세요! 🐾" : "For more help, please use the contact page! 🐾"}
          </p>
          <NextLink
            href="/"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-900 dark:bg-white/15 px-4 py-2 text-sm font-semibold text-white dark:text-white hover:opacity-90 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {lang === "ko" ? "홈으로 돌아가기" : "Back to home"}
          </NextLink>
        </div>
      </div>
    </div>
  );
}
