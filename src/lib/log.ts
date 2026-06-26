import { prisma } from "@/lib/prisma";

export async function writeLog(args: {
  type: string;
  message: string;
  actorUserId?: string | null;
  targetUserId?: string | null;
  ip?: string | null;
}) {
  try {
    await prisma.log.create({
      data: {
        type: args.type,
        message: args.message,
        actorUserId: args.actorUserId ?? null,
        targetUserId: args.targetUserId ?? null,
        ip: args.ip ?? "",
      },
    });
  } catch {
    // ignore
  }
}
