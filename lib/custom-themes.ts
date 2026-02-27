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
    id: "akireSurface1280",
    label: "Akire Surface",
    imageUrl: "/custom-themes/akirevarga-surface-4373559_1280.jpg",
  },
  {
    id: "felixNewYear1280",
    label: "Felix New Year",
    imageUrl: "/custom-themes/felix-mittermeier-new-year-background-3625405_1280.jpg",
  },
  {
    id: "walWater1280",
    label: "Wal Water",
    imageUrl: "/custom-themes/wal_172619-water-5917708_1280.jpg",
  },
];

