import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import HomePageClient from "@/components/home-page-client";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://fluffy-link.xyz";

const HOME_DESCRIPTION_KO =
  "퍼리·퍼슈터를 위한 링크 모음 서비스. Discord 로그인으로 1분 만에 나만의 프로필을 만들고, 여러 링크를 하나로 관리하세요. 테마, 배지, 방문자 통계, 커스텀 컬러 지원.";
const HOME_DESCRIPTION_EN =
  "A link-in-bio service for the furry & fursuit community. Sign in with Discord, build your profile in a minute, and share all your links in one place.";

export const metadata: Metadata = {
  title: {
    absolute:
      "Fluffy Link — 모든 링크를 하나의 링크로",
  },
  description: HOME_DESCRIPTION_KO,
  keywords: [
    // 한국어
    "플러피링크",
    "플러피 링크",
    "퍼리",
    "퍼슈터",
    "퍼슈터",
    "링크 모음",
    "링크 리스트",
    "링크 바이오",
    "Linktree 대체",
    "프로필 링크",
    "바이오 링크",
    "디스코드 링크",
    "퍼리 커뮤니티",
    "퍼리 한국",
    "한국 퍼리",
    // English
    "fluffy link",
    "fluffylink",
    "furry link",
    "furry links",
    "fursuit",
    "fursuiter",
    "furry community",
    "link in bio",
    "linktree",
    "linktree alternative",
    "linktree for furries",
    "furry bio",
    "fursuit bio",
    "fursona",
    "furry profile",
    "discord link bio",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    alternateLocale: ["en_US"],
    url: SITE_URL,
    siteName: "Fluffy Link",
    title: "Fluffy Link — 모든 링크를 하나의 링크로",
    description: "여러개의 링크를 하나의 링크로!",
    images: [
      {
        url: "/logo.png",
        width: 231,
        height: 231,
        alt: "Fluffy Link 로고",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Fluffy Link — 모든 링크를 하나의 링크로",
    description: "여러개의 링크를 하나의 링크로!",
    images: ["/logo.png"],
  },
};

const WEBAPP_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Fluffy Link",
  alternateName: "플러피링크",
  url: SITE_URL,
  description: HOME_DESCRIPTION_KO,
  inLanguage: ["ko-KR", "en-US"],
  applicationCategory: "WebApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KRW",
  },
  featureList: [
    "Discord 로그인",
    "커스텀 프로필 테마",
    "무제한 링크",
    "방문자 통계",
    "프로필 배지",
    "프로필 효과",
    "유저 리스트",
  ],
  publisher: {
    "@type": "Organization",
    name: "Fluffy Link",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`,
    },
  },
};

export default async function HomePage() {
  let initialCount: number | null = null;
  try {
    initialCount = await prisma.user.count();
  } catch {
    initialCount = null;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBAPP_JSON_LD) }}
      />
      <HomePageClient initialCount={initialCount} />
    </>
  );
}
