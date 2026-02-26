import { QuestionsClient } from "@/components/questions-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "자주 묻는 질문 & 사용 방법 ",
  description: "플러피링크 자주 묻는 질문과 사용 방법",
  openGraph: {
    title: "Fluffy Link | 자주 묻는 질문",
    description: "플러피링크 FAQ & 사용 방법",
  },
};

export default function QuestionsPage() {
  return <QuestionsClient />;
}
