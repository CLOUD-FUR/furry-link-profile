import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { writeLog } from "@/lib/log";
import { redirect } from "next/navigation";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const actorId = (session.user as any).id as string;
  if (!isAdminId(actorId)) redirect("/");

  if (params.id === "1362203848713703514") redirect("/admin?err=cannot_delete_owner");

  await prisma.user.delete({ where: { id: params.id } }).catch(() => {});

  await writeLog({
    type: "ADMIN_USER_DELETE",
    message: `admin deleted user id=${params.id}`,
    actorUserId: actorId,
    targetUserId: params.id,
    ip: req.headers.get("x-forwarded-for") ?? "",
  });

  redirect("/admin");
}
