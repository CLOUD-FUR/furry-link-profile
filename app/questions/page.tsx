import { QuestionsClient } from "@/components/questions-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "자주 묻는 질문 & 사용 방법 | Fluffy Link",
  description: "Fluffy Link 자주 묻는 질문과 사용 방법을 안내합니다.",
  openGraph: {
    title: "자주 묻는 질문 | Fluffy Link",
    description: "Fluffy Link FAQ & 사용 방법",
  },
};

export default function QuestionsPage() {
  return <QuestionsClient />;
}
