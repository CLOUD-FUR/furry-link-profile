import "./globals.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import { SessionProvider } from "@/components/session-provider";
import LegalButtons from "@/components/LegalButtons";

export async function generateMetadata(): Promise<Metadata> {
  const h = headers();
  const country = h.get("x-vercel-ip-country") ?? "";
  const isKorea = country.toUpperCase() === "KR";

  return {
    title: isKorea ? "플러피 링크" : "Fluffy Link",
    description: "여러개의 링크를 하나의 링크로!",
    themeColor: "#ffffff",
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
