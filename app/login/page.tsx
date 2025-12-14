import { Container, GlassCard } from "@/components/ui";
import { SignInButton } from "@/components/signin-button";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-pink-200 to-violet-200 relative overflow-hidden">
      <div className="absolute inset-0 noise opacity-40" />
      <Container className="relative py-16">
        <GlassCard className="bg-white/45 border-white/50 p-8">
          <h1 className="text-3xl font-black tracking-tight">Discord로 로그인</h1>
          <p className="mt-2 text-slate-700">
            퍼리 링크 프로필을 만들려면 Discord로 로그인해줘.
          </p>
          <div className="mt-6">
            <SignInButton />
          </div>
          <p className="mt-6 text-xs text-slate-600">
            로그인하면 닉네임/아바타를 기본값으로 가져오고, @핸들을 자동 생성해.
          </p>
        </GlassCard>
      </Container>
    </div>
  );
}
