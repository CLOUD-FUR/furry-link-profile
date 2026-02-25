import clsx from "clsx";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-black tracking-tight text-slate-900">
        Fluffy Link 이용약관 및 개인정보처리방침
      </h1>

      <p className="mt-4 text-sm text-slate-600">
        본 약관 및 개인정보처리방침은 Fluffy Link(이하 “서비스”) 이용과 관련하여
        서비스 운영자와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
      </p>

      <hr className="my-10" />

      {/* ================= 이용약관 ================= */}
      <section id="terms" className="space-y-8">
        <h2 className="text-2xl font-bold">제1장 이용약관</h2>

        <article className="space-y-2">
          <h3 className="text-lg font-semibold">제1조 (목적)</h3>
          <p className="text-sm leading-relaxed text-slate-700">
            본 약관은 Fluffy Link가 제공하는 링크 통합 프로필 서비스의 이용 조건,
            절차 및 이용자와 운영자 간의 권리·의무·책임사항을 규정함을 목적으로 합니다.
          </p>
        </article>

        <article className="space-y-2">
          <h3 className="text-lg font-semibold">제2조 (용어의 정의)</h3>
          <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
            <li>“서비스”란 Fluffy Link가 제공하는 모든 웹 서비스 일체를 의미합니다.</li>
            <li>“이용자”란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
            <li>“회원”이란 Discord 로그인을 통해 계정을 생성한 자를 말합니다.</li>
          </ul>
        </article>

        <article className="space-y-2">
          <h3 className="text-lg font-semibold">제3조 (약관의 효력 및 변경)</h3>
          <p className="text-sm leading-relaxed text-slate-700">
            본 약관은 서비스 화면에 게시하거나 기타의 방법으로 공지함으로써 효력을 발생합니다.
            운영자는 관련 법령을 위배하지 않는 범위 내에서 약관을 변경할 수 있으며,
            변경된 약관은 공지 시점부터 효력을 가집니다.
          </p>
        </article>

        <article className="space-y-2">
          <h3 className="text-lg font-semibold">제4조 (서비스의 제공 및 변경)</h3>
          <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
            <li>프로필 페이지 생성 및 관리 기능</li>
            <li>외부 링크 등록 및 공개 기능</li>
            <li>기타 운영자가 정하는 부가 서비스</li>
          </ul>
          <p className="text-sm text-slate-700">
            서비스는 운영자의 판단에 따라 변경·중단될 수 있습니다.
          </p>
        </article>

        <article className="space-y-2">
          <h3 className="text-lg font-semibold">제5조 (이용자의 의무)</h3>
          <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
            <li>타인의 권리를 침해하거나 법령을 위반하는 행위</li>
            <li>불법, 음란, 혐오, 차별적 콘텐츠 등록</li>
            <li>서비스의 정상적인 운영을 방해하는 행위</li>
          </ul>
          <p className="text-sm text-slate-700">
            위 행위가 확인될 경우 서비스 이용이 제한될 수 있습니다.
          </p>
        </article>

        <article className="space-y-2">
          <h3 className="text-lg font-semibold">제6조 (책임의 제한)</h3>
          <p className="text-sm leading-relaxed text-slate-700">
            서비스는 이용자가 등록한 외부 링크 및 콘텐츠에 대해 관리·감독 책임을 지지 않으며,
            해당 콘텐츠로 인해 발생하는 분쟁에 대해서는 책임을 부담하지 않습니다.
          </p>
        </article>
      </section>

      <hr className="my-12" />

      {/* ================= 개인정보처리방침 ================= */}
      <section id="privacy" className="space-y-8">
        <h2 className="text-2xl font-bold">제2장 개인정보처리방침</h2>

        <article className="space-y-2">
          <h3 className="text-lg font-semibold">제7조 (수집하는 개인정보 항목)</h3>
          <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
            <li>Discord 계정 정보(사용자 ID, 닉네임, 프로필 이미지)</li>
            <li>프로필 설정 정보(소개글, 링크 목록)</li>
            <li>서비스 이용 기록, 접속 IP</li>
          </ul>
        </article>

        <article className="space-y-2">
          <h3 className="text-lg font-semibold">제8조 (개인정보의 이용 목적)</h3>
          <p className="text-sm text-slate-700">
            수집된 개인정보는 다음 목적에 한하여 이용됩니다.
          </p>
          <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
            <li>회원 식별 및 서비스 제공</li>
            <li>프로필 페이지 운영</li>
            <li>문의 대응 및 서비스 개선</li>
          </ul>
        </article>

        <article className="space-y-2">
          <h3 className="text-lg font-semibold">제9조 (개인정보의 보관 및 이용 기간)</h3>
          <p className="text-sm text-slate-700">
            개인정보는 회원 탈퇴 시 즉시 파기되며, 관련 법령에 따라 보관이 필요한 경우에 한해
            일정 기간 보관될 수 있습니다.
          </p>
        </article>

        <article className="space-y-2">
          <h3 className="text-lg font-semibold">제10조 (개인정보의 제3자 제공)</h3>
          <p className="text-sm text-slate-700">
            서비스는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않으며,
            다음의 외부 서비스를 이용할 수 있습니다.
          </p>
          <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
            <li>Discord (로그인 인증)</li>
            <li>Channel.io (고객 문의 및 상담)</li>
          </ul>
        </article>

        <article className="space-y-2">
          <h3 className="text-lg font-semibold">제11조 (이용자의 권리)</h3>
          <p className="text-sm text-slate-700">
            이용자는 언제든지 자신의 개인정보를 조회·수정·삭제할 수 있으며,
            서비스 탈퇴를 통해 개인정보 이용을 중단할 수 있습니다.
          </p>
        </article>
      </section>

      <hr className="my-12" />

      <p className="text-xs text-slate-500">
        본 약관은 2026년 1월 1일부터 적용됩니다.
      </p>
    </main>
  );
}
