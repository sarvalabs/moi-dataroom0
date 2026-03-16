import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "";
const COOKIE_NAME = "admin_key";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const key = body.key ?? "";

  if (!ADMIN_SECRET) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  if (key !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Invalid key" }, { status: 403 });
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, key, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return NextResponse.json({ ok: true });
}
