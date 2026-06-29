import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import DarkLightToggle from "@/components/dark-light-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://fluffy-link.xyz";
const SITE_NAME = "Fluffy Link";
const SITE_DESC_KO =
  "퍼리·퍼슈터를 위한 링크 모음 서비스. Discord 로그인으로 1분 만에 나만의 프로필을 만들고, 여러 링크를 하나로 관리하세요. 테마, 배지, 방문자 통계, 커스텀 컬러 지원.";
const SITE_DESC_EN =
  "A link-in-bio service for the furry & fursuit community. Sign in with Discord, build your profile in a minute, and share all your links in one place. Themes, badges, visitor stats, custom colors.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Fluffy Link — 퍼리·퍼슈터 링크 모음 | Linktree for Furries",
    template: "%s | Fluffy Link",
  },
  description: SITE_DESC_KO,
  applicationName: SITE_NAME,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
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
  authors: [{ name: "Fluffy Link", url: SITE_URL }],
  creator: "Fluffy Link",
  publisher: "Fluffy Link",
  category: "web service",
  formatDetection: { email: false, address: false, telephone: false },
  alternates: {
    canonical: "/",
    languages: {
      "ko-KR": "/",
      "en-US": "/",
    },
  },
  icons: {
    icon: [
      { url: "/logo.png", sizes: "any" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    alternateLocale: ["en_US"],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Fluffy Link — 퍼리·퍼슈터 링크 모음",
    description: SITE_DESC_KO,
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Fluffy Link 로고",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fluffy Link — 퍼리·퍼슈터 링크 모음",
    description: SITE_DESC_KO,
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "theme-color": "#ffffff",
    "google-site-verification": "",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
};

const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: "플러피링크",
  url: SITE_URL,
  description: SITE_DESC_KO,
  inLanguage: ["ko-KR", "en-US"],
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/user?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('fluffy-site-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&d)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SessionProvider>
          {children}
          <DarkLightToggle />
        </SessionProvider>
      </body>
    </html>
  );
}
