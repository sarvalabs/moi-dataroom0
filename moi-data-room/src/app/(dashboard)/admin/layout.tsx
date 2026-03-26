import { hasAdminCookie } from "@/lib/auth-admin";
import { AdminPasswordGate } from "@/components/admin-password-gate";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await hasAdminCookie();
  if (!isAdmin) return <AdminPasswordGate />;
  return <>{children}</>;
}
