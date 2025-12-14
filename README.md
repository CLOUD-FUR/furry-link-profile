# 🐾 Furry Links (guns.lol 퍼리판) - Fullstack

Discord 로그인으로 누구나 자기 링크 프로필 페이지를 만들 수 있는 서비스형(SaaS) 템플릿입니다.

## ✅ 포함 기능
- Discord OAuth 로그인 (NextAuth)
- 유저 자동 생성 + 핸들(@handle) 자동 발급
- `/dashboard`에서 프로필/링크/테마/공개설정 관리
- 공개 페이지: `/@handle` (미들웨어 rewrite로 지원)
- DB: Prisma + SQLite (초기 개발/배포용으로 편함)

---

## 1) 준비물
- Node.js 18+ (추천 20+)
- Discord Developer Portal에서 OAuth2 앱 생성

Discord 설정:
- OAuth2 Redirect URL:
  - 개발: `http://localhost:3000/api/auth/callback/discord`
  - 배포: `https://YOUR_DOMAIN/api/auth/callback/discord`

---

## 2) 실행 방법

```bash
npm install
cp .env.example .env
# .env 값 채우기 (DISCORD_CLIENT_ID / SECRET, NEXTAUTH_SECRET 등)

npm run prisma:migrate
npm run dev
```

브라우저: http://localhost:3000

---

## 3) 배포 팁
- Vercel 추천 (Next.js 친화적)
- SQLite는 서버리스 환경에서 주의가 필요합니다.
  - 진짜 서비스 운영이면 PostgreSQL로 바꾸는 걸 추천 (schema 그대로 provider만 변경 가능)

---

## 4) URL 규칙
- 랜딩: `/`
- 로그인: `/login`
- 대시보드: `/dashboard`
- 공개 프로필: `/@handle`  (실제 라우트는 `/p/[handle]`이고, 미들웨어로 `/@handle`을 rewrite)

---

## 5) 커스터마이징 포인트
- `lib/themes.ts`에서 테마 프리셋 추가/수정
- `components/dashboard-client.tsx`에서 편집 UI 확장 (드래그앤드롭으로 업그레이드 가능)
- 링크 아이콘/이모지 매핑은 `app/p/[handle]/page.tsx`에 있음

---

## 6) 보안/운영 메모
- NEXTAUTH_SECRET은 반드시 랜덤 긴 값으로 설정
- 공개/비공개: `User.isPublic`
- 링크 URL은 zod로 URL 검증

즐개발 🐾


## v2 변경점
- 테마 6개 + 사진 테마(커스텀 배경)
- 저장 버튼(일괄 저장) + 되돌리기
- 플랫폼 링크 입력(핸들 입력 자동 URL 생성)
- 링크 클릭수(세션 중복 방지) + /go 리다이렉트
- 관리자 페이지 /admin (ADMIN_DISCORD_IDS 환경변수)


## Netlify 배포
- DATABASE_URL: Postgres(Neon/Supabase 등) 연결 필요
- Netlify 환경변수에 NEXTAUTH_URL, NEXTAUTH_SECRET, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DATABASE_URL 설정
- 빌드: npm run build (plugin-nextjs)
