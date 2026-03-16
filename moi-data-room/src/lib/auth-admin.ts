import { cookies } from "next/headers";

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "";
const COOKIE_NAME = "admin_key";

export async function isAdminRequest(request: Request): Promise<boolean> {
  if (!ADMIN_SECRET) return true;
  const headerKey = request.headers.get("x-admin-key");
  if (headerKey === ADMIN_SECRET) return true;
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === ADMIN_SECRET;
}

export async function hasAdminCookie(): Promise<boolean> {
  if (!ADMIN_SECRET) return true;
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === ADMIN_SECRET;
}

export { COOKIE_NAME, ADMIN_SECRET };
