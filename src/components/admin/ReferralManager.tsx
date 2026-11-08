import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Plus, Trash2, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SITE_URL } from "@/lib/seo";
import { REFERRAL_PREFIX, isValidReferralCode, normalizeReferralCode, safeReferralTarget } from "@/lib/referrals";

type Stats = { total: number; unique_visitors: number; today: number; last_7d: number; last_30d: number; last_click: string | null; top_source: string | null };

export function ReferralManager() {
  const qc = useQueryClient();
  const { data: links, isLoading } = useQuery({
    queryKey: ["admin-referrals"],
    queryFn: async () => (await supabase.from("referral_links").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: stats } = useQuery({
    queryKey: ["admin-referral-stats"],
    queryFn: async () => {
      const { data } = await supabase.rpc("referral_stats");
      return Object.fromEntries((data ?? []).map((r) => [r.link_id, r as unknown as Stats])) as Record<string, Stats>;
    },
    refetchInterval: 30_000,
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-referrals"] }); qc.invalidateQueries({ queryKey: ["admin-referral-stats"] }); };

  const [label, setLabel] = useState("");
  const [code, setCode] = useState("");
  const [target, setTarget] = useState("/");
  const [busy, setBusy] = useState(false);
  const finalCode = normalizeReferralCode(code || label);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidReferralCode(finalCode)) return toast.error("Use letters, numbers or dashes for the link code.");
    setBusy(true);
    const { error } = await supabase.from("referral_links").insert({ label: label.trim(), code: finalCode, target_path: safeReferralTarget(target) });
    setBusy(false);
    if (error) return toast.error(error.code === "23505" ? "That link code is already used. Pick another." : "Could not create the link.");
    toast.success("Referral link created");
    setLabel(""); setCode(""); setTarget("/");
    refresh();
  };

  const urlFor = (c: string) => `${SITE_URL}${REFERRAL_PREFIX}${c}`;
  const copy = async (c: string) => { await navigator.clipboard.writeText(urlFor(c)); toast.success("Link copied"); };

  const totals = Object.values(stats ?? {}).reduce((a, s) => ({ total: a.total + Number(s.total), today: a.today + Number(s.today) }), { total: 0, today: 0 });

  return (
    <div className="max-w-4xl space-y-6">
      <form onSubmit={create} className="space-y-3 rounded-2xl border bg-card p-6">
        <h2 className="font-semibold">Create a referral link</h2>
        <p className="text-sm text-muted-foreground">Share the link anywhere (Facebook, YouTube, WhatsApp, a partner's site). Each visit is counted here, then the visitor lands on the page you choose.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">Name<Input required maxLength={80} className="mt-1" placeholder="e.g. Facebook group" value={label} onChange={(e) => setLabel(e.target.value)} /></label>
          <label className="text-sm">Link code<Input className="mt-1" placeholder={normalizeReferralCode(label) || "facebook-group"} value={code} onChange={(e) => setCode(e.target.value)} /></label>
          <label className="text-sm">Opens page<Input className="mt-1" placeholder="/ or /tools/logo-extractor" value={target} onChange={(e) => setTarget(e.target.value)} /></label>
        </div>
        <p className="break-all text-xs text-muted-foreground">Your link: <span className="font-mono text-foreground">{urlFor(finalCode || "…")}</span></p>
        <Button type="submit" disabled={busy || !label.trim()}><Plus className="size-4" /> {busy ? "Creating…" : "Create link"}</Button>
      </form>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5"><p className="text-sm text-muted-foreground">Links</p><p className="mt-1 font-display text-3xl font-bold">{links?.length ?? 0}</p></div>
        <div className="rounded-2xl border bg-card p-5"><p className="text-sm text-muted-foreground">All clicks</p><p className="mt-1 font-display text-3xl font-bold">{totals.total}</p></div>
        <div className="rounded-2xl border bg-card p-5"><p className="text-sm text-muted-foreground">Clicks today</p><p className="mt-1 font-display text-3xl font-bold">{totals.today}</p></div>
      </div>

      {isLoading && <div className="h-24 animate-pulse rounded-2xl bg-muted" />}
      {links?.length === 0 && <p className="text-sm text-muted-foreground">No referral links yet. Create your first one above.</p>}
      <div className="space-y-3">
        {(links ?? []).map((l) => {
          const s = stats?.[l.id];
          return (
            <div key={l.id} className="space-y-3 rounded-2xl border bg-card p-5" data-testid="referral-link">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{l.label}</p>
                {!l.active && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Paused</span>}
                <span className="ml-auto flex items-center gap-2 text-sm">Active
                  <Switch checked={l.active} aria-label={`Active: ${l.label}`} onCheckedChange={async (v) => { const { error } = await supabase.from("referral_links").update({ active: v }).eq("id", l.id); if (error) toast.error("Could not update."); refresh(); }} />
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <code className="break-all rounded-lg bg-muted px-3 py-1.5 text-xs">{urlFor(l.code)}</code>
                <Button size="sm" variant="outline" onClick={() => copy(l.code)}><Copy className="size-4" /> Copy</Button>
                <span className="text-xs text-muted-foreground">opens {l.target_path}</span>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
                <div><dt className="text-muted-foreground">Total clicks</dt><dd className="text-xl font-bold" data-testid="referral-total">{s?.total ?? 0}</dd></div>
                <div><dt className="text-muted-foreground">Unique visitors</dt><dd className="text-xl font-bold">{s?.unique_visitors ?? 0}</dd></div>
                <div><dt className="text-muted-foreground">Today</dt><dd className="text-xl font-bold">{s?.today ?? 0}</dd></div>
                <div><dt className="text-muted-foreground">Last 7 days</dt><dd className="text-xl font-bold">{s?.last_7d ?? 0}</dd></div>
                <div><dt className="text-muted-foreground">Last 30 days</dt><dd className="text-xl font-bold">{s?.last_30d ?? 0}</dd></div>
              </dl>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>Last click: {s?.last_click ? new Date(s.last_click).toLocaleString() : "none yet"}</span>
                {s?.top_source && <span>Top source: {s.top_source}</span>}
                <span className="ml-auto flex gap-2">
                  <Button size="sm" variant="ghost" onClick={async () => { if (!confirm(`Reset click count for "${l.label}"?`)) return; await supabase.from("referral_clicks").delete().eq("link_id", l.id); refresh(); }}><RotateCcw className="size-4" /> Reset</Button>
                  <Button size="sm" variant="ghost" onClick={async () => { if (!confirm(`Delete "${l.label}" and its clicks?`)) return; await supabase.from("referral_links").delete().eq("id", l.id); refresh(); }}><Trash2 className="size-4" /> Delete</Button>
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">Repeat clicks by the same visitor within one minute count once. Link previews from WhatsApp, Facebook and search crawlers are not counted. No personal details of visitors are stored.</p>
    </div>
  );
}
