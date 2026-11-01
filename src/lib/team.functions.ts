import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { OWNER_EMAIL, isOwnerEmail } from "@/lib/team";

async function ownerOnly(context: { supabase: any; userId: string; claims: any }) {
  if (!isOwnerEmail(context.claims?.email)) throw new Error("Only the site owner can manage admins.");
  const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (error || !data) throw new Error("Only the site owner can manage admins.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const listAdmins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await ownerOnly(context);
    const { data: roles, error } = await admin.from("user_roles").select("user_id").eq("role", "admin");
    if (error) throw new Error(error.message);
    const out: { id: string; email: string; owner: boolean }[] = [];
    for (const r of roles ?? []) {
      const { data } = await admin.auth.admin.getUserById(r.user_id);
      const email = data.user?.email ?? "(unknown)";
      out.push({ id: r.user_id, email, owner: isOwnerEmail(email) });
    }
    return out.sort((a, b) => Number(b.owner) - Number(a.owner));
  });

export const addAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ email: z.string().trim().toLowerCase().email().max(255), password: z.string().min(8).max(72) }).parse(d))
  .handler(async ({ context, data }) => {
    const admin = await ownerOnly(context);
    if (data.email === OWNER_EMAIL) throw new Error("That is already the owner account.");
    let userId: string | undefined;
    const created = await admin.auth.admin.createUser({ email: data.email, password: data.password, email_confirm: true });
    if (created.data.user) userId = created.data.user.id;
    else {
      // Account may already exist: find it and reset its password.
      for (let page = 1; page <= 20 && !userId; page++) {
        const { data: list } = await admin.auth.admin.listUsers({ page, perPage: 200 });
        userId = list?.users.find((u) => u.email?.toLowerCase() === data.email)?.id;
        if (!list || list.users.length < 200) break;
      }
      if (!userId) throw new Error(created.error?.message ?? "Could not create the account.");
      await admin.auth.admin.updateUserById(userId, { password: data.password, email_confirm: true });
    }
    const { error } = await admin.from("user_roles").upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const admin = await ownerOnly(context);
    if (data.userId === context.userId) throw new Error("You cannot remove the owner.");
    const { error } = await admin.from("user_roles").delete().eq("user_id", data.userId).eq("role", "admin");
    if (error) throw new Error(error.message);
    // End their sessions immediately.
    await admin.auth.admin.signOut?.(data.userId).catch(() => {});
    return { ok: true };
  });
