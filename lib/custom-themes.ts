export type CustomThemePreset = {
  id: string;
  /** 버튼에 간단히 보여줄 이름 (옵션) */
  label?: string;
  /** public 디렉터리 기준 이미지 경로 (예: /custom-themes/joa-1.jpg) */
  imageUrl: string;
};

/**
 * 랜덤 추천 테마에 사용할 이미지 목록입니다.
 *
 * 이미지는 `public/custom-themes` 폴더 안에 넣고,
 * 아래 `imageUrl`에 `/custom-themes/파일이름.jpg` 형태로 적어주세요.
 *
 * 예시)
 *  - public/custom-themes/joa-1.jpg  -> imageUrl: "/custom-themes/joa-1.jpg"
 *
 * 기본값은 비어 있고, 이미지를 추가하면 자동으로 랜덤 추천에 사용됩니다.
 */
export const CUSTOM_THEMES: CustomThemePreset[] = [
  {
    id: "bg47",
    label: "BG 47",
    imageUrl: "/custom-themes/47.jpg",
  },
  {
    id: "bg5159130",
    label: "BG 5159130",
    imageUrl: "/custom-themes/5159130.jpg",
  },
  {
    id: "bg5160549",
    label: "BG 5160549",
    imageUrl: "/custom-themes/5160549.jpg",
  },
  {
    id: "bg5170396",
    label: "BG 5170396",
    imageUrl: "/custom-themes/5170396.jpg",
  },
  {
    id: "bg6487685",
    label: "BG 6487685",
    imageUrl: "/custom-themes/6487685.jpg",
  },
  {
    id: "bgSunsetWatercolor",
    label: "Sunset Watercolor",
    imageUrl: "/custom-themes/6_sunset_cloudy_sky_watercolor_b.jpg",
  },
  {
    id: "bg7175949",
    label: "BG 7175949",
    imageUrl: "/custom-themes/7175949.jpg",
  },
  {
    id: "bg8187310",
    label: "BG 8187310",
    imageUrl: "/custom-themes/8187310.jpg",
  },
  {
    id: "bg9051050",
    label: "BG 9051050",
    imageUrl: "/custom-themes/9051050.jpg",
  },
  {
    id: "akireSurface1280",
    label: "Akire Surface",
    imageUrl: "/custom-themes/akirevarga-surface-4373559_1280.jpg",
  },
  {
    id: "cozyCatCandle",
    label: "Cozy Cat Candle",
    imageUrl: "/custom-themes/cozy-cat-by-candlelight.jpg",
  },
  {
    id: "felixNewYear1280",
    label: "Felix New Year",
    imageUrl: "/custom-themes/felix-mittermeier-new-year-background-3625405_1280.jpg",
  },
  {
    id: "ksushlaBackground",
    label: "Ksushla Background",
    imageUrl: "/custom-themes/ksushlapush-background-6556413.jpg",
  },
  {
    id: "rm456004",
    label: "RM456 004",
    imageUrl: "/custom-themes/rm456-004.jpg",
  },
  {
    id: "v960Ning31",
    label: "V960 Ning 31",
    imageUrl: "/custom-themes/v960-ning-31.jpg",
  },
  {
    id: "walWater1280",
    label: "Wal Water",
    imageUrl: "/custom-themes/wal_172619-water-5917708_1280.jpg",
  },
];

