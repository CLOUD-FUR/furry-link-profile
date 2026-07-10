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
 * ⚠️ 여기 등록한 파일은 반드시 public/custom-themes 안에 실제로 존재해야 해요.
 *    없는 파일을 등록하면 랜덤 추천에서 깨진 이미지("theme preview")가 떠요.
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
    id: "bg6487685",
    label: "BG 6487685",
    imageUrl: "/custom-themes/6487685.jpg",
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
    id: "rm456004",
    label: "RM456 004",
    imageUrl: "/custom-themes/rm456-004.jpg",
  },
  {
    id: "v960Ning31",
    label: "V960 Ning 31",
    imageUrl: "/custom-themes/v960-ning-31.jpg",
  },
];
