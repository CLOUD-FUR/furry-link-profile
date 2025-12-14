import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const link = await prisma.link.findUnique({ where: { id } });
  if (!link) redirect("/");

  const sid = cookies().get("fl_sid")?.value;
  if (sid) {
    try {
      // Unique per link+session (schema enforces)
      await prisma.visit.create({ data: { linkId: id, sessionId: sid } });
    } catch {
      // already counted for this session
    }
  }

  redirect(link.url);
}
