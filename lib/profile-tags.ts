export type ProfileTag = {
  id: string;
  label: string;
  image: string; // public 기준 경로
};

export const PROFILE_TAGS: ProfileTag[] = [
  {
    id: "furry",
    label: "퍼슈터",
    image: "/tags/furry.png",
  },
  {
    id: "artist",
    label: "아티스트",
    image: "/tags/artist.png",
  },
  {
    id: "developer",
    label: "개발자",
    image: "/tags/developer.png",
  },
];
