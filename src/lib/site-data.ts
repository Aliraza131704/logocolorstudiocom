import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AdSlotRow = { position: string; label: string; code: string; enabled: boolean; show_desktop: boolean; show_mobile: boolean };

export const settingsQuery = queryOptions({
  queryKey: ["site_settings"],
  queryFn: async () => {
    const { data } = await supabase.from("site_settings").select("key,value");
    return Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Record<string, string>;
  },
  staleTime: 5 * 60_000,
});

export const adsQuery = queryOptions({
  queryKey: ["ad_slots_public"],
  queryFn: async () => {
    const { data } = await supabase.from("ad_slots").select("*").eq("enabled", true);
    return (data ?? []) as AdSlotRow[];
  },
  staleTime: 5 * 60_000,
});

export const useSettings = () => useQuery(settingsQuery);
export const useAds = () => useQuery(adsQuery);

export function getVisitorId() {
  let id = localStorage.getItem("lcs-visitor");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("lcs-visitor", id);
  }
  return id;
}

export async function logEvent(kind: "visit" | "tool", name: string) {
  try {
    const key = `lcs-ev-${kind}-${name}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    await supabase.from("events").insert({ kind, name: name.slice(0, 120) });
  } catch {
    /* ignore */
  }
}
