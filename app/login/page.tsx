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
            프로필을 만들기 위해 Discord로 로그인이 필요해요!
          </p>
          <div className="mt-6">
            <SignInButton />
          </div>
          <p className="mt-6 text-xs text-slate-600">
            로그인 후 디스코드 태그와 프로필을 기본값으로 가져오고 따로 수정할 수 있어요!
          </p>
        </GlassCard>
      </Container>
    </div>
  );
}
