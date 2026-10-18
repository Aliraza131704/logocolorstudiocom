import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** True only when the signed-in user has the admin role (checked in the database). */
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user.id;
      if (!uid) return setIsAdmin(false);
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      setIsAdmin(!!roles?.some((r) => r.role === "admin"));
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((e) => {
      if (e === "SIGNED_IN" || e === "SIGNED_OUT") check();
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return isAdmin;
}
