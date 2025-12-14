import "./globals.css";
import type { Metadata } from "next";
import { SessionProvider } from "@/components/session-provider";

export const metadata: Metadata = {
  title: "Fluffy Link",
  description: "여러개의 링크를 하나의 링크로!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
