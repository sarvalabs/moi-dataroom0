import { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

/** Ensure only one document holds `slot`; optionally keep `exceptId`. */
export async function clearOtherDocumentsHeroSlot(
  admin: AdminClient,
  slot: string,
  exceptId?: string
) {
  let q = admin
    .from("documents")
    .update({ home_hero_slot: null, show_on_overview: false })
    .eq("home_hero_slot", slot);
  if (exceptId) q = q.neq("id", exceptId);
  const { error } = await q;
  if (error) throw new Error(error.message);
}
