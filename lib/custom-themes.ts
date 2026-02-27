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
  // 예시:
  // { id: "sample1", label: "Joa Wall 1", imageUrl: "/custom-themes/joa-1.jpg" },
];

