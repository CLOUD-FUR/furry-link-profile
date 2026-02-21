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

  const link = await prisma.link.findUnique({ where: { id: params.id } });
  if (link) {
    await prisma.link.delete({ where: { id: params.id } }).catch(() => {});
    await writeLog({
      type: "ADMIN_LINK_DELETE",
      message: `admin deleted link id=${params.id}`,
      actorUserId: actorId,
      targetUserId: link.userId,
      ip: req.headers.get("x-forwarded-for") ?? "",
    });
  }

  redirect("/admin");
}
