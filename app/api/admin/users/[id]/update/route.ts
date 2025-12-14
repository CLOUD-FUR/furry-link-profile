import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminId } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { writeLog } from "@/lib/log";
import { redirect } from "next/navigation";

function normalizeHandleDisplay(handle: string) {
  const cleaned = handle.trim().replace(/[^A-Za-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "");
  return cleaned.slice(0, 20);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const actorId = (session.user as any).id as string;
  if (!isAdminId(actorId)) redirect("/");

  const form = await req.formData();
  const handle = String(form.get("handle") ?? "");
  const bio = String(form.get("bio") ?? "");
  const isPublic = String(form.get("isPublic") ?? "off") === "on";

  const nextHandle = normalizeHandleDisplay(handle);
  const handleLower = nextHandle.toLowerCase();

  // handleLower must be unique
  const exists = await prisma.user.findUnique({ where: { handleLower } });
  if (exists && exists.id !== params.id) {
    redirect("/admin?err=handle_exists");
  }

  await prisma.user.update({
    where: { id: params.id },
    data: {
      handle: nextHandle,
      handleLower,
      bio: bio.slice(0, 500),
      isPublic,
    },
  });

  await writeLog({
    type: "ADMIN_USER_UPDATE",
    message: `admin updated user id=${params.id} handle=@${nextHandle}`,
    actorUserId: actorId,
    targetUserId: params.id,
    ip: req.headers.get("x-forwarded-for") ?? "",
  });

  redirect("/admin");
}
