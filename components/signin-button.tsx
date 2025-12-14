"use client";

import { signIn } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("discord", { callbackUrl: "/login" })}
      className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white shadow-soft hover:opacity-95 active:scale-[0.99]"
    >
      Discord로 시작하기
    </button>
  );
}
