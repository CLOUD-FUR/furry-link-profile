import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminPage({ searchParams }: { searchParams: { err?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const actorId = (session.user as any).id as string;
  if (!isAdminId(actorId)) redirect("/");

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  const links = await prisma.link.findMany({ orderBy: { createdAt: "desc" }, take: 300, include: { user: true } });
  const logs = await prisma.log.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  const err = searchParams?.err;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-black">Admin</h1>
        <p className="mt-1 text-sm text-white/70">유저/링크 관리 + 로그</p>

        {err ? (
          <div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-600/20 px-4 py-3 text-sm">
            오류: {err}
          </div>
        ) : null}

        <h2 className="mt-8 text-lg font-bold">Users</h2>
        <div className="mt-3 overflow-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="p-3 text-left">handle</th>
                <th className="p-3 text-left">name</th>
                <th className="p-3 text-left">id</th>
                <th className="p-3 text-left">public</th>
                <th className="p-3 text-left">edit</th>
                <th className="p-3 text-left">delete</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-white/10 align-top">
                  <td className="p-3">@{u.handle}</td>
                  <td className="p-3">{u.name ?? ""}</td>
                  <td className="p-3 font-mono text-xs">{u.id}</td>
                  <td className="p-3">{u.isPublic ? "ON" : "OFF"}</td>
                  <td className="p-3">
                    <form action={`/api/admin/users/${u.id}/update`} method="post" className="grid gap-2">
                      <input
                        name="handle"
                        defaultValue={u.handle}
                        className="w-44 rounded-lg bg-white/10 border border-white/15 px-2 py-1 text-white"
                        maxLength={20}
                      />
                      <input
                        name="bio"
                        defaultValue={u.bio}
                        className="w-72 rounded-lg bg-white/10 border border-white/15 px-2 py-1 text-white"
                        maxLength={500}
                      />
                      <label className="flex items-center gap-2 text-xs text-white/70">
                        <input name="isPublic" type="checkbox" defaultChecked={u.isPublic} />
                        public
                      </label>
                      <button className="w-fit rounded-lg bg-sky-500 px-3 py-1 text-xs font-bold">수정</button>
                    </form>
                  </td>
                  <td className="p-3">
                    <form action={`/api/admin/users/${u.id}/delete`} method="post">
                      <button
                        disabled={u.id === "1362203848713703514"}
                        className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold disabled:opacity-40"
                      >
                        삭제
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-lg font-bold">Links</h2>
        <div className="mt-3 overflow-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="p-3 text-left">user</th>
                <th className="p-3 text-left">platform</th>
                <th className="p-3 text-left">title</th>
                <th className="p-3 text-left">url</th>
                <th className="p-3 text-left">actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.id} className="border-t border-white/10">
                  <td className="p-3">@{l.user.handle}</td>
                  <td className="p-3">{l.platform}</td>
                  <td className="p-3">{l.title}</td>
                  <td className="p-3 max-w-[420px] truncate">{l.url}</td>
                  <td className="p-3">
                    <form action={`/api/admin/links/${l.id}/delete`} method="post">
                      <button className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold">삭제</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-lg font-bold">Logs (최근 200)</h2>
        <div className="mt-3 overflow-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="p-3 text-left">time</th>
                <th className="p-3 text-left">type</th>
                <th className="p-3 text-left">actor</th>
                <th className="p-3 text-left">target</th>
                <th className="p-3 text-left">ip</th>
                <th className="p-3 text-left">message</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((x) => (
                <tr key={x.id} className="border-t border-white/10">
                  <td className="p-3 whitespace-nowrap">{new Date(x.createdAt).toLocaleString()}</td>
                  <td className="p-3 font-mono text-xs">{x.type}</td>
                  <td className="p-3 font-mono text-xs">{x.actorUserId ?? "-"}</td>
                  <td className="p-3 font-mono text-xs">{x.targetUserId ?? "-"}</td>
                  <td className="p-3 font-mono text-xs">{x.ip || "-"}</td>
                  <td className="p-3 max-w-[560px]">{x.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-10 text-xs text-white/60">
          * 접속/생성/수정 로그가 자동으로 쌓여.
        </p>
      </div>
    </div>
  );
}
