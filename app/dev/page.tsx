import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const ADMIN_PROFILE_ID = "1362203848713703514";

export default async function DevAliasPage() {
  const user = await prisma.user.findUnique({ where: { id: ADMIN_PROFILE_ID } });
  if (!user) {
    redirect("/");
  }
  redirect(`/@${user.handle}`);
}
