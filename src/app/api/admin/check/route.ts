import { NextResponse } from "next/server";
import { checkIsAdmin } from "@/lib/admin";

/**
 * GET /api/admin/check
 * Check if the current user has admin privileges.
 */
export async function GET() {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    return NextResponse.json({ isAdmin: false }, { status: 403 });
  }

  return NextResponse.json({ isAdmin: true });
}
