import { NextResponse, type NextRequest } from "next/server";

/** No auth: pass through. User app is public; admin is gated by ADMIN_SECRET. */
export async function updateSession(request: NextRequest) {
  return NextResponse.next({ request });
}
