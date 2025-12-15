export type ProfileTag = {
  id: string;
  label: string;
  image: string; // public 기준 경로
};

export const PROFILE_TAGS: ProfileTag[] = [
  {
    id: "furry",
    label: "퍼슈터",
    image: "/tags/FURSUITER.png",
  },
  {
    id: "artist",
    label: "아티스트",
    image: "/tags/ARTIST.png",
  },
  {
    id: "developer",
    label: "개발자",
    image: "/tags/GITHUB.png",
  },
];
