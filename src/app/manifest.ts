import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fluffy Link",
    short_name: "FluffyLink",
    description:
      "퍼리·퍼슈터를 위한 링크 모음 서비스. Discord 로그인으로 1분 만에 나만의 프로필을 만들고, 여러 링크를 하나로 관리하세요.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    lang: "ko-KR",
    orientation: "portrait",
    categories: ["social", "productivity", "utilities"],
    icons: [
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
