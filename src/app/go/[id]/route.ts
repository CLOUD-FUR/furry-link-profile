import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const link = await prisma.link.findUnique({ where: { id } });
  if (!link) redirect("/");

  const sid = (await cookies()).get("fl_sid")?.value;
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
