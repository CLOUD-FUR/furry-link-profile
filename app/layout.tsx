import "./globals.css";
import type { Metadata } from "next";
import { SessionProvider } from "@/components/session-provider";

export const metadata: Metadata = {
  title: "Furry Links",
  description: "Your furry links, in one paw.",
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
