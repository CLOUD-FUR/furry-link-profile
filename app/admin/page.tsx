import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

type SearchParams = {
  err?: string;
  user_q?: string;
  user_by?: string; // URL에서 들어오는 값은 string이라 안전하게
  link_handle?: string;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const actorId = (session.user as any).id as string;
  if (!isAdminId(actorId)) redirect("/");

  const members = await prisma.user.count();

  const userBy = searchParams.user_by === "id" ? "id" : "handle";
  const userQ = (searchParams.user_q ?? "").trim();
  const linkHandleQ = (searchParams.link_handle ?? "").trim();

  const users = await prisma.user.findMany({
    where: userQ
      ? userBy === "id"
        ? { id: userQ }
        : { handle: { contains: userQ, mode: "insensitive" } }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const links = await prisma.link.findMany({
    where: linkHandleQ
      ? {
          user: {
            handle: {
              contains: linkHandleQ,
              mode: "insensitive",
            },
          },
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 300,
    include: { user: true },
  });

  const logs = await prisma.log.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const err = searchParams?.err;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-black">🖥️ Admin Panel ({members}명 사용중)</h1>
        <p className="mt-1 text-sm text-white/70">
          유저/링크 수정 및 로그 확인
        </p>

        {err ? (
          <div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-600/20 px-4 py-3 text-sm">
            Error: {err}
          </div>
        ) : null}

        {/* ================= USERS ================= */}
        <h2 className="mt-8 text-lg font-bold">Users</h2>

        <form method="get" className="mt-3 flex flex-wrap items-center gap-2">
          <select
            name="user_by"
            defaultValue={userBy}
            className="rounded-lg bg-white/10 border border-white/15 px-2 py-1 text-sm"
          >
            <option value="handle">handle</option>
            <option value="id">id</option>
          </select>
          <input
            name="user_q"
            defaultValue={userQ}
            placeholder="유저 검색"
            className="w-52 rounded-lg bg-white/10 border border-white/15 px-3 py-1 text-sm"
          />
          <button className="rounded-lg bg-sky-600 px-3 py-1 text-sm font-bold">
            검색
          </button>

          {(userQ || searchParams.user_by) && (
            <a
              href="/admin"
              className="rounded-lg bg-white/10 border border-white/15 px-3 py-1 text-sm"
            >
              초기화
            </a>
          )}
        </form>

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
                  <td className="p-3">
                    <Link href={`/@${u.handle}`} className="text-sky-300 hover:underline">
                      @{u.handle}
                    </Link>
                  </td>
                  <td className="p-3">{u.name ?? ""}</td>
                  <td className="p-3 font-mono text-xs">{u.id}</td>
                  <td className="p-3">{u.isPublic ? "ON" : "OFF"}</td>
                  <td className="p-3">
                    <form
                      action={`/api/admin/users/${u.id}/update`}
                      method="post"
                      className="grid gap-2"
                    >
                      <input
                        name="handle"
                        defaultValue={u.handle}
                        className="w-44 rounded-lg bg-white/10 border border-white/15 px-2 py-1 text-white"
                        maxLength={20}
                      />
                      <input
                        name="bio"
                        defaultValue={u.bio ?? ""}
                        className="w-72 rounded-lg bg-white/10 border border-white/15 px-2 py-1 text-white"
                        maxLength={500}
                      />
                      <label className="flex items-center gap-2 text-xs text-white/70">
                        <input
                          name="isPublic"
                          type="checkbox"
                          defaultChecked={u.isPublic}
                        />
                        public
                      </label>
                      <button className="w-fit rounded-lg bg-sky-500 px-3 py-1 text-xs font-bold">
                        수정
                      </button>
                    </form>
                  </td>
                  <td className="p-3">
                    <form
                      action={`/api/admin/users/${u.id}/delete`}
                      method="post"
                    >
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

              {users.length === 0 ? (
                <tr className="border-t border-white/10">
                  <td className="p-4 text-white/60" colSpan={6}>
                    결과가 없어요
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* ================= LINKS ================= */}
        <h2 className="mt-10 text-lg font-bold">Links</h2>

        <form method="get" className="mt-3 flex flex-wrap items-center gap-2">
          <input
            name="link_handle"
            defaultValue={linkHandleQ}
            placeholder="유저 핸들로 링크 검색"
            className="w-72 rounded-lg bg-white/10 border border-white/15 px-3 py-1 text-sm"
          />
          <button className="rounded-lg bg-sky-600 px-3 py-1 text-sm font-bold">
            검색
          </button>

          {linkHandleQ && (
            <a
              href="/admin"
              className="rounded-lg bg-white/10 border border-white/15 px-3 py-1 text-sm"
            >
              초기화
            </a>
          )}
        </form>

        <div className="mt-3 overflow-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="p-3 text-left">user</th>
                <th className="p-3 text-left">platform</th>
                <th className="p-3 text-left">title</th>
                <th className="p-3 text-left">url</th>
                <th className="p-3 text-left">subtitle</th>
                <th className="p-3 text-left">icon</th>
                <th className="p-3 text-left">on</th>
                <th className="p-3 text-left">actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.id} className="border-t border-white/10 align-top">
                  <td className="p-3">
                    <Link href={`/@${l.user.handle}`} className="text-sky-300 hover:underline">
                      @{l.user.handle}
                    </Link>
                  </td>
                  <td className="p-3">
                    <form
                      action={`/api/admin/links/${l.id}/update`}
                      method="post"
                      className="flex flex-col gap-2"
                    >
                      <input type="hidden" name="title" defaultValue={l.title} />
                      <input type="hidden" name="url" defaultValue={l.url} />
                      <input type="hidden" name="subtitle" defaultValue={l.subtitle ?? ""} />
                      <input type="hidden" name="icon" defaultValue={l.icon ?? "link"} />
                      <input
                        type="hidden"
                        name="enabled"
                        value={l.enabled ? "on" : "off"}
                      />
                      <select
                        name="platform"
                        defaultValue={l.platform}
                        className="w-28 rounded-lg bg-white/10 border border-white/15 px-2 py-1 text-xs"
                      >
                        <option value="discord_server">discord_server</option>
                        <option value="x">x</option>
                        <option value="youtube">youtube</option>
                        <option value="bluesky">bluesky</option>
                        <option value="instagram">instagram</option>
                        <option value="other">other</option>
                      </select>
                      <button className="w-fit rounded-lg bg-sky-600 px-3 py-1 text-xs font-bold">
                        저장
                      </button>
                    </form>
                  </td>
                  <td className="p-3">
                    <form
                      action={`/api/admin/links/${l.id}/update`}
                      method="post"
                      className="flex flex-col gap-2"
                    >
                      <input type="hidden" name="url" defaultValue={l.url} />
                      <input type="hidden" name="platform" defaultValue={l.platform} />
                      <input type="hidden" name="subtitle" defaultValue={l.subtitle ?? ""} />
                      <input type="hidden" name="icon" defaultValue={l.icon ?? "link"} />
                      <input
                        type="hidden"
                        name="enabled"
                        value={l.enabled ? "on" : "off"}
                      />
                      <input
                        name="title"
                        defaultValue={l.title}
                        className="w-56 rounded-lg bg-white/10 border border-white/15 px-2 py-1 text-xs"
                        maxLength={100}
                      />
                      <button className="w-fit rounded-lg bg-sky-600 px-3 py-1 text-xs font-bold">
                        저장
                      </button>
                    </form>
                  </td>
                  <td className="p-3">
                    <form
                      action={`/api/admin/links/${l.id}/update`}
                      method="post"
                      className="flex flex-col gap-2"
                    >
                      <input type="hidden" name="title" defaultValue={l.title} />
                      <input type="hidden" name="platform" defaultValue={l.platform} />
                      <input type="hidden" name="subtitle" defaultValue={l.subtitle ?? ""} />
                      <input type="hidden" name="icon" defaultValue={l.icon ?? "link"} />
                      <input
                        type="hidden"
                        name="enabled"
                        value={l.enabled ? "on" : "off"}
                      />
                      <input
                        name="url"
                        defaultValue={l.url}
                        className="w-[380px] max-w-[380px] rounded-lg bg-white/10 border border-white/15 px-2 py-1 text-xs"
                      />
                      <button className="w-fit rounded-lg bg-sky-600 px-3 py-1 text-xs font-bold">
                        저장
                      </button>
                    </form>
                  </td>
                  <td className="p-3">
                    <form
                      action={`/api/admin/links/${l.id}/update`}
                      method="post"
                      className="flex flex-col gap-2"
                    >
                      <input type="hidden" name="title" defaultValue={l.title} />
                      <input type="hidden" name="url" defaultValue={l.url} />
                      <input type="hidden" name="platform" defaultValue={l.platform} />
                      <input type="hidden" name="icon" defaultValue={l.icon ?? "link"} />
                      <input
                        type="hidden"
                        name="enabled"
                        value={l.enabled ? "on" : "off"}
                      />
                      <input
                        name="subtitle"
                        defaultValue={l.subtitle ?? ""}
                        className="w-40 rounded-lg bg-white/10 border border-white/15 px-2 py-1 text-xs"
                        maxLength={120}
                      />
                      <button className="w-fit rounded-lg bg-sky-600 px-3 py-1 text-xs font-bold">
                        저장
                      </button>
                    </form>
                  </td>
                  <td className="p-3">
                    <form
                      action={`/api/admin/links/${l.id}/update`}
                      method="post"
                      className="flex flex-col gap-2"
                    >
                      <input type="hidden" name="title" defaultValue={l.title} />
                      <input type="hidden" name="url" defaultValue={l.url} />
                      <input type="hidden" name="platform" defaultValue={l.platform} />
                      <input type="hidden" name="subtitle" defaultValue={l.subtitle ?? ""} />
                      <input
                        type="hidden"
                        name="enabled"
                        value={l.enabled ? "on" : "off"}
                      />
                      <input
                        name="icon"
                        key={l.id}
                        defaultValue={l.icon ?? "link"}
                        placeholder="기타 이모지"
                        className="w-14 rounded-lg bg-white/10 border border-white/15 px-2 py-1 text-xs text-center"
                        maxLength={4}
                      />
                      <button className="w-fit rounded-lg bg-sky-600 px-3 py-1 text-xs font-bold">
                        저장
                      </button>
                    </form>
                  </td>
                  <td className="p-3">
                    <form
                      action={`/api/admin/links/${l.id}/update`}
                      method="post"
                      className="flex flex-col gap-2"
                    >
                      <input type="hidden" name="title" defaultValue={l.title} />
                      <input type="hidden" name="url" defaultValue={l.url} />
                      <input type="hidden" name="platform" defaultValue={l.platform} />
                      <input type="hidden" name="subtitle" defaultValue={l.subtitle ?? ""} />
                      <input type="hidden" name="icon" defaultValue={l.icon ?? "link"} />
                      <label className="flex items-center gap-2 text-xs text-white/70">
                        <input
                          name="enabled"
                          type="checkbox"
                          defaultChecked={l.enabled}
                        />
                        on
                      </label>
                      <button className="w-fit rounded-lg bg-sky-600 px-3 py-1 text-xs font-bold">
                        저장
                      </button>
                    </form>
                  </td>
                  <td className="p-3">
                    <form
                      action={`/api/admin/links/${l.id}/delete`}
                      method="post"
                    >
                      <button className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold">
                        삭제
                      </button>
                    </form>
                  </td>
                </tr>
              ))}

              {links.length === 0 ? (
                <tr className="border-t border-white/10">
                  <td className="p-4 text-white/60" colSpan={8}>
                    결과가 없어요
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* ================= LOGS ================= */}
        <h2 className="mt-10 text-lg font-bold">Logs</h2>
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
                  <td className="p-3 whitespace-nowrap">
                    {new Date(x.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 font-mono text-xs">{x.type}</td>
                  <td className="p-3 font-mono text-xs">
                    {x.actorUserId ?? "-"}
                  </td>
                  <td className="p-3 font-mono text-xs">
                    {x.targetUserId ?? "-"}
                  </td>
                  <td className="p-3 font-mono text-xs">{x.ip || "-"}</td>
                  <td className="p-3 max-w-[560px]">{x.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-10 text-xs text-white/60">
          접속로그, 수정로그 등 각종 로그가 여기에 표시돼요
        </p>
      </div>
    </div>
  );
}
