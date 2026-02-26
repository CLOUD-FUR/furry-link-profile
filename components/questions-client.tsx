"use client";

import { useState } from "react";
import NextLink from "next/link";
import clsx from "clsx";

type Lang = "ko" | "en";

type FaqItem = {
  id: string;
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
        dark ? "border-slate-600 bg-slate-700" : "border-slate-700 bg-slate-800"
      )}
    >
      {children}
    </span>
  );
}

function LinkBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <NextLink href={href} className="font-semibold text-violet-600 underline decoration-violet-400 underline-offset-2 hover:text-violet-700">
      {children}
    </NextLink>
  );
}

const FAQ_DATA: FaqItem[] = [
  {
    id: "start",
    titleKo: "시작하기 – 로그인과 대시보드",
    titleEn: "Getting started – Login & Dashboard",
    contentKo: (
      <p className="text-slate-700 leading-relaxed">
        Discord 계정으로 로그인하면 바로 프로필을 만들 수 있어요.{" "}
        <LinkBtn href="/">홈</LinkBtn>에서 <Btn>Discord 로그인</Btn> 버튼을 누르거나,{" "}
        <LinkBtn href="/login">로그인 페이지</LinkBtn>로 이동한 뒤 Discord로 로그인해 주세요. 로그인 후에는 자동으로{" "}
        <LinkBtn href="/dashboard">대시보드</LinkBtn>로 이동합니다. 대시보드에서 프로필, 링크, 테마, 방문자, 설정 등 모두 관리할 수 있어요!
      </p>
    ),
    contentEn: (
      <p className="text-slate-700 leading-relaxed">
        You can create your profile right after signing in with Discord. On the{" "}
        <LinkBtn href="/">home page</LinkBtn>, click the <Btn>Discord 로그인</Btn> button, or go to the{" "}
        <LinkBtn href="/login">login page</LinkBtn> and sign in with Discord. After login, you’ll be taken to the{" "}
        <LinkBtn href="/dashboard">dashboard</LinkBtn>, where you can manage your profile, links, theme, visitor stats, and settings.
      </p>
    ),
  },
  {
    id: "copy-link",
    titleKo: "프로필 링크 복사하기",
    titleEn: "How to copy your profile link",
    contentKo: (
      <p className="text-slate-700 leading-relaxed">
        프로필 링크를 복사하고 싶으시면 <LinkBtn href="/dashboard">대시보드</LinkBtn> &gt; <Btn>설정</Btn> 탭에서, 프로필 링크 입력창 아래에 있는 <Btn dark>복사</Btn> 버튼을 눌러 주세요!
      </p>
    ),
    contentEn: (
      <p className="text-slate-700 leading-relaxed">
        To copy your profile link, go to <LinkBtn href="/dashboard">Dashboard</LinkBtn> &gt; <Btn>설정</Btn> (Settings) tab, then click the <Btn dark>복사</Btn> (Copy) button below the profile link field!
      </p>
    ),
  },
  {
    id: "profile-edit",
    titleKo: "프로필 수정 (사진, 핸들, 소개글)",
    titleEn: "Editing your profile (photo, handle, bio)",
    contentKo: (
      <div className="space-y-3 text-slate-700 leading-relaxed">
        <p>
          <LinkBtn href="/dashboard">대시보드</LinkBtn> &gt; <Btn>프로필</Btn> 탭에서 프로필 이미지, 배너, 핸들(@이름), 소개글, 프로필 태그를 수정할 수 있어요!
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>프로필 이미지</strong>: 권장 사이즈는 1:1 비율을 추천해요</li>
          <li><strong>배너 이미지</strong>: 권장 사이즈 1400×500</li>
          <li><strong>핸들</strong>: 한글 · 영어 · 숫자 · 언더바(_) · 마침표(.)만 사용 가능하며 최대 20자까지 적을 수 있어요. 프로필 주소는 <code className="rounded bg-slate-200 px-1">/@핸들</code> 형태예요.</li>
          <li><strong>소개글</strong>: 최대 500자까지 적을 수 있어요</li>
        </ul>
        <p>설정 변경 후 오른쪽 상단 <Btn dark>저장</Btn> 버튼을 눌러 적용해 주세요!</p>
      </div>
    ),
    contentEn: (
      <div className="space-y-3 text-slate-700 leading-relaxed">
        <p>
          In <LinkBtn href="/dashboard">Dashboard</LinkBtn> &gt; <Btn>프로필</Btn> (Profile) tab you can edit profile image, banner, handle (@name), bio, and profile tag.
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Profile image</strong>: Recommended 1:1 aspect ratio.</li>
          <li><strong>Banner</strong>: Recommended size 1400×500.</li>
          <li><strong>Handle</strong>: Only letters, numbers, underscore (_), and period (.). Max 20 characters. Your profile URL is <code className="rounded bg-slate-200 px-1">/@handle</code>.</li>
          <li><strong>Bio</strong>: Up to 500 characters.</li>
        </ul>
        <p>After changing settings, click the <Btn dark>저장</Btn> (Save) button at the top right to apply!</p>
      </div>
    ),
  },
  {
    id: "links",
    titleKo: "프로필 수정 (링크 추가 · 수정 · 삭제 · 순서 변경)",
    titleEn: "Profile links (add · edit · delete · reorder)",
    contentKo: (
      <div className="space-y-3 text-slate-700 leading-relaxed">
        <p>
          <LinkBtn href="/dashboard">대시보드</LinkBtn> &gt; <Btn>링크</Btn> 탭에서 버튼으로 들어가는 링크를 관리할 수 있어요
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>링크 추가</strong>: <Btn dark>링크 추가</Btn> 버튼을 누르면 새로운 링크가 생겨요! 플랫폼( Discord 서버, X, YouTube, Instagram, Bluesky, 기타 링크 )을 고른 뒤 제목과 URL(또는 아이디)을 입력하고, 우측 상단 <Btn dark>저장</Btn>을 눌러서 적용해주세요!</li>
          <li><strong>기타 링크</strong>: 플랫폼을 &quot;기타 링크&quot;로 두면 원하는 URL과 버튼이름, 이모지를 자유롭게 커스텀하여 적용할 수 있어요!</li>
          <li><strong>링크 순서</strong>: 링크 탭에서 ↑·↓ 버튼으로 순서를 바꾼 뒤 <Btn dark>저장</Btn> 버튼을 누르면 변경사항이 저장돼요!</li>
          <li><strong>링크 삭제</strong>: 링크 옆 삭제 버튼으로 지운 뒤 <Btn dark>저장</Btn> 버튼을 누르면 변경사항이 적용돼요!</li>
        </ul>
      </div>
    ),
    contentEn: (
      <div className="space-y-3 text-slate-700 leading-relaxed">
        <p>
          In <LinkBtn href="/dashboard">Dashboard</LinkBtn> &gt; <Btn>링크</Btn> (Links) tab you can manage the links that appear as buttons on your profile.
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Add link</strong>: Click the <Btn dark>링크 추가</Btn> (Add link) button to create a new link! Choose a platform (Discord server, X, YouTube, Instagram, Bluesky, or Other), enter the title and URL (or handle), then click <Btn dark>저장</Btn> (Save) at the top right to apply!</li>
          <li><strong>Other link</strong>: If you choose &quot;기타 링크&quot; (Other), you can freely customize the URL, button name, and emoji!</li>
          <li><strong>Link order</strong>: In the Links tab, change the order with the ↑·↓ buttons, then click <Btn dark>저장</Btn> (Save) to apply!</li>
          <li><strong>Delete link</strong>: Use the delete button next to a link, then click <Btn dark>저장</Btn> (Save) to apply!</li>
        </ul>
      </div>
    ),
  },
  {
    id: "theme",
    titleKo: "프로필 테마 변경하기",
    titleEn: "Changing the theme",
    contentKo: (
      <p className="text-slate-700 leading-relaxed">
        <LinkBtn href="/dashboard">대시보드</LinkBtn> &gt; <Btn>테마</Btn> 탭에서 프로필 페이지의 테마를 바꿀 수 있어요. 자신이 원하는 테마 선택 후 <Btn dark>저장</Btn>을 눌러 적용해 주세요!
      </p>
    ),
    contentEn: (
      <p className="text-slate-700 leading-relaxed">
        In <LinkBtn href="/dashboard">Dashboard</LinkBtn> &gt; <Btn>테마</Btn> (Theme) tab you can change your profile page theme. Choose the theme you want and click <Btn dark>저장</Btn> (Save) to apply!
      </p>
    ),
  },
  {
    id: "public",
    titleKo: "프로필 페이지 공개 / 비공개",
    titleEn: "Making your page public or private",
    contentKo: (
      <p className="text-slate-700 leading-relaxed">
        <LinkBtn href="/dashboard">대시보드</LinkBtn> &gt; <Btn>설정</Btn> 탭에 있는 &quot;페이지 공개&quot; 버튼으로 프로필을 공개하거나 비공개로 둘 수 있어요! OFF로 두면 프로필 링크로 들어와도 프로필이 보이지 않고 비공개로 처리돼요. 공개 또는 비공개 선택 후 <Btn dark>저장</Btn> 버튼을 꼭 눌러 변경사항을 저장해주세요!
      </p>
    ),
    contentEn: (
      <p className="text-slate-700 leading-relaxed">
        In <LinkBtn href="/dashboard">Dashboard</LinkBtn> &gt; <Btn>설정</Btn> (Settings) tab, you can make your profile public or private with the &quot;페이지 공개&quot; (Page public) control! When it’s OFF, your profile won&apos;t be visible to others. Be sure to click <Btn dark>저장</Btn> (Save) after choosing public or private!
      </p>
    ),
  },
  {
    id: "stats",
    titleKo: "방문자 통계 보기",
    titleEn: "Viewing visitor stats",
    contentKo: (
      <p className="text-slate-700 leading-relaxed">
        <LinkBtn href="/dashboard">대시보드</LinkBtn> &gt; <Btn>방문자</Btn> 탭에서 프로필 페이지 방문 수와 각 링크별 클릭 수를 확인할 수 있어요! 이 통계는 자동으로 수집되어 본인만 확인할 수 있어요!
      </p>
    ),
    contentEn: (
      <p className="text-slate-700 leading-relaxed">
        In <LinkBtn href="/dashboard">Dashboard</LinkBtn> &gt; <Btn>방문자</Btn> (Visitors) tab you can see how many people visited your profile and how many clicks each link got! Stats are collected automatically and only you can see them!
      </p>
    ),
  },
  {
    id: "url-format",
    titleKo: "프로필 주소 형식",
    titleEn: "Profile URL format",
    contentKo: (
      <div className="space-y-2 text-slate-700 leading-relaxed">
        <p>프로필 주소는 다음 두 가지로 접속할 수 있어요 !(같은 페이지로 연결됩니다)</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><code className="rounded bg-slate-200 px-1">https://fluffy-link.xyz/@핸들</code></li>
          <li><code className="rounded bg-slate-200 px-1">https://fluffy-link.xyz/p/핸들</code></li>
        </ul>
        <p>이 링크는 대시보드 설정 탭에서 링크를 확인 및 복사할 수 있어요!</p>
      </div>
    ),
    contentEn: (
      <div className="space-y-2 text-slate-700 leading-relaxed">
        <p>You can open your profile with either of these URLs (they lead to the same page).</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><code className="rounded bg-slate-200 px-1">https://fluffy-link.xyz/@handle</code></li>
          <li><code className="rounded bg-slate-200 px-1">https://fluffy-link.xyz/p/handle</code></li>
        </ul>
        <p>You can view and copy this link in the Dashboard Settings tab!</p>
      </div>
    ),
  },
];

export function QuestionsClient() {
  const [lang, setLang] = useState<Lang>("ko");
  const [openId, setOpenId] = useState<string | null>(FAQ_DATA[0]?.id ?? null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-sky-200 to-violet-200 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]" />
      <div className="relative mx-auto max-w-2xl px-4 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <NextLink href="/" className="font-black tracking-tight text-xl text-slate-800 hover:text-slate-900">
            🐾 Fluffy Link
          </NextLink>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Language</span>
            <button
              onClick={() => setLang("ko")}
              className={clsx(
                "rounded-xl px-3 py-2 text-sm font-semibold transition",
                lang === "ko" ? "bg-slate-900 text-white" : "bg-white/50 text-slate-600 hover:bg-white/70"
              )}
            >
              한국어
            </button>
            <button
              onClick={() => setLang("en")}
              className={clsx(
                "rounded-xl px-3 py-2 text-sm font-semibold transition",
                lang === "en" ? "bg-slate-900 text-white" : "bg-white/50 text-slate-600 hover:bg-white/70"
              )}
            >
              English
            </button>
          </div>
        </header>

        <div className="rounded-3xl border border-white/50 bg-white/40 backdrop-blur-md shadow-xl overflow-hidden">
          <div className="border-b border-white/50 bg-white/30 px-6 py-5">
            <h1 className="text-2xl font-black text-slate-800">
              {lang === "ko" ? "자주 묻는 질문 & 사용 방법" : "FAQ & How to use"}
            </h1>
            <p className="mt-1 text-slate-600 text-sm">
              {lang === "ko"
                ? "궁금한 항목을 눌러 펼쳐 보세요."
                : "Click an item to expand."}
            </p>
          </div>

          <ul className="divide-y divide-white/60">
            {FAQ_DATA.map((item) => {
              const isOpen = openId === item.id;
              return (
                <li key={item.id} className="bg-white/20">
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="w-full flex items-center justify-between gap-3 px-6 py-4 text-left hover:bg-white/25 transition"
                  >
                    <span className="font-bold text-slate-800">
                      {lang === "ko" ? item.titleKo : item.titleEn}
                    </span>
                    <span
                      className={clsx(
                        "shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-slate-600 transition-transform",
                        isOpen ? "bg-white/60 rotate-180" : "bg-white/40"
                      )}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>
                  <div
                    className={clsx(
                      "overflow-hidden transition-all duration-200 ease-out",
                      isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="px-6 pb-5 pt-0">
                      <div className="rounded-2xl border border-white/50 bg-white/50 p-4">
                        {lang === "ko" ? item.contentKo : item.contentEn}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          {lang === "ko" ? "더 궁금한 점이 있으면 옆에 보이는 버튼을 눌러 문의하기를 이용해 주세요!" : "For more help, please use the channel or contact."}
        </p>
      </div>
    </div>
  );
}
