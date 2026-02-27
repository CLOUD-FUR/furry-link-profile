import "./globals.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import { SessionProvider } from "@/components/session-provider";
import LegalButtons from "@/components/LegalButtons";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://fluffy-link.xyz";

export async function generateMetadata(): Promise<Metadata> {
  const h = headers();
  const country = h.get("x-vercel-ip-country") ?? "";
  const isKorea = country.toUpperCase() === "KR";

  const title = isKorea ? "플러피 링크" : "Fluffy Link";
  const description =
    "여러개의 링크를 하나의 링크로!";

  return {
    title,
    description,
    keywords: [
      "플러피링크",
      "퍼리",
      "퍼슈트",
      "플러피 링크",
      "Fluffy Link",
      "링크트리",
      "링크 모음",
      "디스코드 링크",
      "프로필 링크",
      "퍼리 프로필",
      "퍼리카페",
      "퍼슈터",
      "퍼리조아",
    ],
    metadataBase: new URL(SITE_URL),
    themeColor: "#ffffff",
    openGraph: {
      type: "website",
      title,
      description,
      siteName: "깔끔하고 편리한 플러피링크",
      url: SITE_URL,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    other: {
      "theme-color": "#ffffff",
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <SessionProvider>
          {children}
          <LegalButtons />
        </SessionProvider>

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CWR730ZHC5"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CWR730ZHC5');
          `}
        </Script>

        {/* Channel.io */}
        <Script id="channel-io" strategy="afterInteractive">
          {`
            (function(){
              var w=window;
              if(w.ChannelIO){return;}
              var ch=function(){ch.c(arguments);};
              ch.q=[];
              ch.c=function(args){ch.q.push(args);};
              w.ChannelIO=ch;
              function l(){
                if(w.ChannelIOInitialized){return;}
                w.ChannelIOInitialized=true;
                var s=document.createElement("script");
                s.type="text/javascript";
                s.async=true;
                s.src="https://cdn.channel.io/plugin/ch-plugin-web.js";
                var x=document.getElementsByTagName("script")[0];
                if(x.parentNode){x.parentNode.insertBefore(s,x);}
              }
              if(document.readyState==="complete"){
                l();
              }else{
                w.addEventListener("DOMContentLoaded",l);
                w.addEventListener("load",l);
              }
            })();

            ChannelIO('boot', {
              pluginKey: "82b944a2-fb16-4408-b44c-51e73ff49d62"
            });
          `}
        </Script>
      </body>
    </html>
  );
}
