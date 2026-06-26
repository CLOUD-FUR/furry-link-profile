import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import DarkLightToggle from "@/components/dark-light-toggle";
import LegalButtons from "@/components/LegalButtons";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Fluffy Link — 여러 링크를 한 곳에",
    template: "%s | Fluffy Link",
  },
  description: "여러 개의 링크를 한 곳에! Discord 로그인으로 바로 시작하세요.",
  icons: {
    icon: "/logo.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Fluffy Link — 여러 링크를 한 곳에",
    description: "여러 개의 링크를 한 곳에! Discord 로그인으로 바로 시작하세요.",
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
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SessionProvider>
          {children}
          <DarkLightToggle />
          <LegalButtons />
        </SessionProvider>
      </body>
    </html>
  );
}
