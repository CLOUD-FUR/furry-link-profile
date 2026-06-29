import { QuestionsClient } from "@/components/questions-client";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://fluffy-link.xyz";

export const metadata: Metadata = {
  title: "자주 묻는 질문 & 사용 방법",
  description:
    "플러피링크(Fluffy Link) 자주 묻는 질문과 사용 방법 가이드. 로그인, 프로필 수정, 링크 추가, 테마 변경, 방문자 통계, 프로필 끌어올리기 등 모든 기능 사용법을 한곳에서 확인하세요.",
  keywords: [
    // 한국어
    "플러피링크 사용법",
    "플러피링크 FAQ",
    "플러피링크 문의",
    "퍼리 링크 사용법",
    "퍼리 링크",
    "퍼슈터 링크",
    "링크 모음 사용법",
    "Linktree 대체",
    "바이오 링크 만들기",
    "디스코드 링크",
    "프로필 링크",
    // English
    "fluffy link faq",
    "fluffy link guide",
    "furry link",
    "fursuit link",
    "linktree alternative",
    "link in bio guide",
    "furry bio",
    "fursuit bio",
  ],
  alternates: {
    canonical: "/questions",
  },
  openGraph: {
    type: "article",
    title: "Fluffy Link | 자주 묻는 질문 & 사용 방법",
    description:
      "플러피링크 자주 묻는 질문과 사용 방법 가이드. 모든 기능 사용법을 한곳에서 확인하세요.",
    url: `${SITE_URL.replace(/\/$/, "")}/questions`,
    siteName: "Fluffy Link",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Fluffy Link 로고",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Fluffy Link | 자주 묻는 질문",
    description:
      "플러피링크 자주 묻는 질문과 사용 방법 가이드.",
    images: ["/logo.png"],
  },
};

// FAQ 페이지 구조화 데이터 (Google FAQPage 스키마)
// 주요 질문들을 정적으로 추출하여 SEO에 제공
const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: ["ko-KR", "en-US"],
  mainEntity: [
    {
      "@type": "Question",
      name: "Fluffy Link 시작하기 – 로그인과 대시보드는 어떻게 사용하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Discord 또는 Google 계정으로 로그인하면 바로 프로필을 만들 수 있어요. 홈에서 Discord 로그인 또는 Google 로그인 버튼을 누르거나, 로그인 페이지로 이동한 뒤 원하는 방식으로 로그인해 주세요. 로그인 후에는 자동으로 대시보드로 이동합니다. 대시보드에서 프로필, 링크, 테마, 방문자, 설정 등 모두 관리할 수 있어요.",
      },
    },
    {
      "@type": "Question",
      name: "프로필 수정 (사진, 배너, 핸들, 소개글, 태그)은 어떻게 하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "대시보드 > 프로필 탭에서 프로필 이미지, 배너, 핸들(@이름), 소개글, 프로필 태그를 수정할 수 있어요. 프로필 이미지는 1:1 비율, 배너는 1400×500 사이즈를 추천합니다. 핸들은 한글·영어·숫자·언더바·마침표만 사용 가능하며 최대 20자, 소개글은 최대 500자까지 입력할 수 있어요. 프로필 태그는 퍼슈터, 아티스트, 메이커, 개발자, 사진사, 뮤지션, 서포터 중 하나를 선택해 뱃지로 표시할 수 있어요. 설정 변경 후 저장 버튼을 눌러 적용해 주세요.",
      },
    },
    {
      "@type": "Question",
      name: "링크 추가 · 수정 · 삭제 · 순서 변경은 어떻게 하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "대시보드 > 링크 탭에서 버튼으로 들어가는 링크를 관리할 수 있어요. 링크 추가 버튼으로 새 링크를 생성하고, 플랫폼(Discord 서버, X, YouTube, Instagram, 기타 링크)을 고른 뒤 제목과 URL을 입력하세요. 기타 링크를 선택하면 URL, 버튼 이름, 이모지를 자유롭게 커스텀할 수 있어요. ↑·↓ 버튼으로 순서를 바꾸고 삭제 버튼으로 지울 수 있으며, 변경 후 저장 버튼을 누르면 적용돼요.",
      },
    },
    {
      "@type": "Question",
      name: "테마 변경 & 프로필 효과는 어떻게 설정하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "대시보드 > 테마 탭에서 프로필 페이지의 테마를 바꿀 수 있어요. 파스텔, 다크 네온, 스카이 등 다양한 프리셋 테마가 제공되며, 커스텀 테마로 원하는 컬러와 배경 이미지를 적용할 수 있어요. 프로필 효과로 눈(snow) 또는 색종이(confetti) 효과를 켜서 프로필을 더 생동감 있게 꾸밀 수 있어요. 테마 선택 후 저장 버튼을 눌러 적용하세요.",
      },
    },
    {
      "@type": "Question",
      name: "프로필 끌어올리기(Bump)는 어떻게 사용하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "대시보드 > 설정 탭에서 끌어올리기 버튼을 누르면 유저 리스트 상단으로 프로필을 올릴 수 있어요. 12시간마다 한 번씩 사용 가능하니 홍보할 때 활용해 보세요.",
      },
    },
    {
      "@type": "Question",
      name: "프로필 공개 / 비공개 & 리스트 노출은 어떻게 설정하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "대시보드 > 설정 탭에서 공개 범위를 설정할 수 있어요. 페이지 공개를 OFF로 두면 프로필 링크로 들어와도 프로필이 보이지 않고 비공개로 처리돼요. 리스트 노출을 OFF로 두면 유저 리스트에 내 프로필이 표시되지 않아요. 변경 후 저장 버튼을 꼭 눌러주세요.",
      },
    },
    {
      "@type": "Question",
      name: "방문자 통계는 어디서 확인하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "대시보드 > 방문자 탭에서 프로필 페이지 방문 수를 확인할 수 있어요. 통계는 자동으로 수집되며 본인만 확인할 수 있어요.",
      },
    },
    {
      "@type": "Question",
      name: "프로필 주소 URL 형식은 어떻게 되나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "프로필 주소는 https://fluffy-link.xyz/@핸들 또는 https://fluffy-link.xyz/p/핸들 두 가지로 접속할 수 있으며, 같은 페이지로 연결됩니다. 이 링크는 대시보드 설정 탭에서 확인 및 복사할 수 있어요.",
      },
    },
  ],
};

export default function QuestionsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <QuestionsClient />
    </>
  );
}
