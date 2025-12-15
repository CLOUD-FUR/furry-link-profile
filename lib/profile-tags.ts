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
    id: "maker",
    label: "메이커",
    image: "/tags/MAKER.png",
  },
  {
    id: "developer",
    label: "개발자",
    image: "/tags/GITHUB.png",
  },
    {
    id: "photo",
    label: "사진사",
    image: "/tags/PHOTO.png",
  },
    {
    id: "musician",
    label: "뮤지션",
    image: "/tags/MUSICIAN.png",
  },
    {
    id: "supporter",
    label: "서포터",
    image: "/tags/SUPPORTER.png",
  },
    {
    id: "youtuber",
    label: "유튜버",
    image: "/tags/YOUTUBE.png",
  },
];
