"use client";

import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function SignInButton() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleClick = () => {
    if (session?.user) {
      window.location.href = "/dashboard";
      return;
    }
    signIn("discord", { callbackUrl: "/dashboard" });
  };

  return (
    <button
      onClick={handleClick}
      className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white shadow-soft hover:opacity-95 active:scale-[0.99]"
    >
      {status === "loading"
        ? "확인 중..."
        : session?.user
          ? "대시보드로 이동"
          : "플러피링크 이용하기"}
    </button>
  );
}
