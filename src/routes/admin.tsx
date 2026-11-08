import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { toast } from "sonner";
import { LayoutDashboard, Megaphone, FileText, FileCog, Settings, Users, Inbox, LogOut, ExternalLink, Trash2, Plus, Wrench, Link2 } from "lucide-react";
import { ReferralManager } from "@/components/admin/ReferralManager";
import { supabase } from "@/integrations/supabase/client";
import { LogoImage } from "@/components/site/Logo";
import { ThemeToggle } from "@/components/site/SiteHeader";
import { RichEditor } from "@/components/admin/RichEditor";
import { DownloadManager } from '@/components/admin/DownloadManager';
import { ToolContentManager } from "@/components/admin/ToolContentManager";
import { download } from "@/components/site/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { pageHead } from "@/lib/seo";
import { MfaChallenge } from "@/components/admin/MfaChallenge";
import { uploadMediaImage } from "@/lib/media-upload";
import { EDITORIAL_AUTHOR } from "@/lib/editorial-config";
import { useServerFn } from "@tanstack/react-start";
import { listAdmins, addAdmin, removeAdmin } from "@/lib/team.functions";
import { isOwnerEmail } from "@/lib/team";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
    if (!roles?.some((r) => r.role === "admin")) {
      await supabase.auth.signOut();
      throw redirect({ to: "/login" });
    }
    const { data: assurance, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) throw new Error("Could not verify sign-in security. Please try again.");
    let factorId: string | undefined;
    if (assurance.nextLevel === "aal2" && assurance.currentLevel !== "aal2") {
      const { data: factors, error: factorError } = await supabase.auth.mfa.listFactors();
      if (factorError) throw new Error("Could not load sign-in verification.");
      factorId = factors.totp.find(f => f.status === "verified")?.id;
      if (!factorId) throw new Error("Please use your enrolled verification method to finish signing in.");
    }
    return { email: data.user.email, factorId };
  },
  head: () => pageHead({ title: "Admin — LogoColorStudio", description: "Owner management for LogoColorStudio content, advertising and downloads.", path: "/admin", noindex: true }),
  component: Admin,
});

const TABS = [
  { id: "dash", label: "Dashboard", icon: LayoutDashboard },
  { id: "ads", label: "Ads Manager", icon: Megaphone },
  { id: "downloads", label: "Downloads", icon: FileCog },
  { id: "blog", label: "Blog", icon: FileText },
  { id: "pages", label: "Pages", icon: FileCog },
  { id: "tools", label: "Tool pages", icon: Wrench },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "subs", label: "Subscribers", icon: Users },
  { id: "msgs", label: "Messages", icon: Inbox },
  { id: "giveaway", label: "Giveaway", icon: Users },
  { id: "referrals", label: "Referral links", icon: Link2 },
  { id: "team", label: "Admin access", icon: Users },
] as const;
type Tab = (typeof TABS)[number]["id"];

const clean = (html: string) => DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });

function Admin() {
  const [tab, setTab] = useState<Tab>("dash");
  const nav = useNavigate();
  const { email, factorId } = Route.useRouteContext();
  const owner = isOwnerEmail(email);
  if (factorId) return <MfaChallenge factorId={factorId} />;
  return (
    <div className="min-h-screen bg-background md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b bg-card md:min-h-screen md:border-b-0 md:border-r">
        <div className="flex items-center justify-between p-4"><LogoImage className="h-8" /><ThemeToggle /></div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:pb-0">
          {TABS.filter((t) => t.id !== "team" || owner).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm", tab === t.id ? "bg-primary text-primary-foreground" : "hover:bg-accent")}>
              <t.icon className="size-4" /> {t.label}
            </button>
          ))}
        </nav>
        <div className="hidden space-y-1 p-4 text-sm md:block">
          <p className="truncate text-muted-foreground">{email}</p>
          <Link to="/" className="flex items-center gap-2 hover:text-primary"><ExternalLink className="size-4" /> View site</Link>
          <button className="flex items-center gap-2 hover:text-primary" onClick={async () => { await supabase.auth.signOut(); nav({ to: "/login" }); }}><LogOut className="size-4" /> Sign out</button>
        </div>
      </aside>
      <main className="p-4 sm:p-8">
        <h1 className="mb-6 text-2xl font-bold">{TABS.find((t) => t.id === tab)?.label}</h1>
        {tab === "dash" && <Dashboard />}
        {tab === "ads" && <AdsManager />}
        {tab === "downloads" && <DownloadSettings />}
        {tab === "blog" && <BlogManager />}
        {tab === "pages" && <PageManager />}
        {tab === "tools" && <ToolContentManager />}
        {tab === "settings" && <SettingsPanel />}
        {tab === "subs" && <Subscribers />}
        {tab === "msgs" && <Messages />}
        {tab === "giveaway" && <Giveaway />}
        {tab === "referrals" && <ReferralManager />}
        {tab === "team" && owner && <TeamPanel />}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return <div className="rounded-2xl border bg-card p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 font-display text-3xl font-bold">{value}</p></div>;
}

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 86400_000).toISOString();
      const c = async (t: "palette_likes" | "blog_posts" | "subscribers" | "contact_messages") => (await supabase.from(t).select("*", { count: "exact", head: true })).count ?? 0;
      const visits = (await supabase.from("events").select("*", { count: "exact", head: true }).eq("kind", "visit").gte("created_at", since)).count ?? 0;
      const { data: tools } = await supabase.from("events").select("name").eq("kind", "tool").gte("created_at", since).limit(5000);
      const usage: Record<string, number> = {};
      (tools ?? []).forEach((t) => (usage[t.name] = (usage[t.name] ?? 0) + 1));
      return { visits, likes: await c("palette_likes"), posts: await c("blog_posts"), subs: await c("subscribers"), msgs: await c("contact_messages"), usage };
    },
  });
  if (!data) return <div className="h-32 animate-pulse rounded-2xl bg-muted" />;
  const max = Math.max(1, ...Object.values(data.usage));
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Page views (30d)" value={data.visits} /><Stat label="Palette likes" value={data.likes} /><Stat label="Blog posts" value={data.posts} /><Stat label="Subscribers" value={data.subs} /><Stat label="Messages" value={data.msgs} />
      </div>
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-semibold">Tool usage (30 days)</h2>
        <div className="mt-4 space-y-3">
          {Object.entries(data.usage).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
            <div key={k}><div className="flex justify-between text-sm"><span>{k}</span><span>{v}</span></div><div className="mt-1 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(v / max) * 100}%` }} /></div></div>
          ))}
          {Object.keys(data.usage).length === 0 && <p className="text-sm text-muted-foreground">No tool usage yet.</p>}
        </div>
      </div>
    </div>
  );
}

type Slot = { position: string; label: string; code: string; image_url: string; link_url: string; enabled: boolean; show_desktop: boolean; show_mobile: boolean };

function AdsManager() {
  const qc = useQueryClient();
  const { data: slots } = useQuery({ queryKey: ["admin-ads"], queryFn: async () => ((await supabase.from("ad_slots").select("*").order("position")).data ?? []) as Slot[] });
  const [edit, setEdit] = useState<Record<string, Slot>>({});
  useEffect(() => { if (slots) setEdit(Object.fromEntries(slots.map((s) => [s.position, s]))); }, [slots]);
  const save = async (s: Slot) => {
    const { error } = await supabase.from("ad_slots").update({ code: s.code, image_url: s.image_url, link_url: s.link_url, enabled: s.enabled, show_desktop: s.show_desktop, show_mobile: s.show_mobile, updated_at: new Date().toISOString() }).eq("position", s.position);
    if (error) return toast.error(error.message);
    toast.success(`${s.label} saved`);
    qc.invalidateQueries({ queryKey: ["ad_slots_public"] });
  };
  return (
    <div className="space-y-6">
      <SettingsFields keys={[["ads_enabled", "Show ads site-wide? (type: on / off)"]]} />
      <p className="-mt-4 text-sm text-muted-foreground">Ads are OFF by default. Type <span className="font-mono">on</span> and save to turn every ad slot, the global AdSense script and in-article ads back on — useful after your site is approved. For an approval review, keep this set to <span className="font-mono">off</span>.</p>
      <SettingsFields keys={[["adsense_head", "Global AdSense head script (with your publisher ID)", true], ["ads_txt", "ads.txt content (served at /ads.txt)", true]]} />
      <div className="grid gap-4 xl:grid-cols-2">
        {Object.values(edit).map((s) => (
          <div key={s.position} className="space-y-3 rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between"><h2 className="font-semibold">{s.label}</h2><label className="flex items-center gap-2 text-sm">Enabled <Switch checked={s.enabled} onCheckedChange={(v) => setEdit({ ...edit, [s.position]: { ...s, enabled: v } })} /></label></div>
            <Textarea rows={5} className="font-mono text-xs" placeholder="Paste ad unit code here (AdSense, Adsterra, etc.)" value={s.code} onChange={(e) => setEdit({ ...edit, [s.position]: { ...s, code: e.target.value } })} />
            <div className="space-y-2 rounded-xl border border-dashed p-3">
              <p className="text-xs font-medium text-muted-foreground">Custom image ad (optional — shown instead of the code above when set)</p>
              <Input placeholder="Image URL (https://…)" value={s.image_url} onChange={(e) => setEdit({ ...edit, [s.position]: { ...s, image_url: e.target.value } })} />
              <Input placeholder="Link URL — where the click goes (https://…)" value={s.link_url} onChange={(e) => setEdit({ ...edit, [s.position]: { ...s, link_url: e.target.value } })} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <label className="flex items-center gap-2"><Switch checked={s.show_desktop} onCheckedChange={(v) => setEdit({ ...edit, [s.position]: { ...s, show_desktop: v } })} /> Desktop</label>
              <label className="flex items-center gap-2"><Switch checked={s.show_mobile} onCheckedChange={(v) => setEdit({ ...edit, [s.position]: { ...s, show_mobile: v } })} /> Mobile</label>
              <Button size="sm" className="ml-auto" onClick={() => save(s)}>Save</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DownloadSettings() {
  return <div className="space-y-5">
    <DownloadManager />
    <h2 className="border-t pt-6 font-semibold">Shared sponsor video</h2>
    <SettingsFields keys={[["download_video_enabled", "Enable sponsored downloads (on / off)"], ["download_video_url", "Sponsor video URL (HTTPS MP4 or hosted video URL)"]]} />
    <p className="text-sm text-muted-foreground">Use your own or an authorized sponsor's video. Do not paste AdSense or Google rewarded-ad code here: a downloadable ZIP is transferable and is not an eligible Google reward. Downloads stay locked until a video is configured. This page does not generate ad-network revenue or verify ad impressions.</p>
  </div>;
}

function SettingsFields({ keys }: { keys: [string, string, boolean?][] }) {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-settings"], queryFn: async () => Object.fromEntries(((await supabase.from("site_settings").select("key,value")).data ?? []).map((r) => [r.key, r.value])) as Record<string, string> });
  const [v, setV] = useState<Record<string, string>>({});
  useEffect(() => { if (data) setV(data); }, [data]);
  const save = async () => {
    const rows = keys.map(([k]) => ({ key: k, value: v[k] ?? "", updated_at: new Date().toISOString() }));
    const { error } = await supabase.from("site_settings").upsert(rows);
    if (error) return toast.error(error.message);
    toast.success("Settings saved");
    qc.invalidateQueries({ queryKey: ["site_settings"] });
    qc.invalidateQueries({ queryKey: ["admin-settings"] });
  };
  return (
    <div className="space-y-4 rounded-2xl border bg-card p-5">
      {keys.map(([k, label, multi]) => (
        <div key={k}>
          <label htmlFor={`s-${k}`} className="text-sm font-medium">{label}</label>
          {multi ? <Textarea id={`s-${k}`} rows={4} className="mt-1 font-mono text-xs" value={v[k] ?? ""} onChange={(e) => setV({ ...v, [k]: e.target.value })} /> : <Input id={`s-${k}`} className="mt-1" value={v[k] ?? ""} onChange={(e) => setV({ ...v, [k]: e.target.value })} />}
        </div>
      ))}
      <Button onClick={save}>Save</Button>
    </div>
  );
}

function SettingsPanel() {
  return (
    <div className="space-y-6">
      <SettingsFields keys={[["site_title", "Site title"], ["site_description", "Site description", true], ["contact_email", "Contact email"]]} />
      <SettingsFields keys={[["social_twitter", "X / Twitter URL"], ["social_instagram", "Instagram URL"], ["social_github", "GitHub URL"], ["social_dribbble", "Dribbble URL"]]} />
      <SettingsFields keys={[["header_scripts", "Custom header scripts (Google Analytics, Search Console verification meta)", true], ["footer_scripts", "Custom footer scripts", true], ["robots_extra", "Extra robots.txt rules", true]]} />
      <h3 className="pt-2 font-semibold">Promotion popup</h3>
      <SettingsFields keys={[["promo_enabled", "Show popup? (type: on / off)"], ["promo_title", "Popup title"], ["promo_text", "Popup text", true], ["promo_button", "Button text"], ["promo_link", "Button link (e.g. /contact or https://...)"], ["promo_delay", "Delay before showing (seconds)"]]} />
      <p className="text-sm text-muted-foreground">Logos: the light and dark logos are built into the site. Sitemap is generated automatically at /sitemap.xml.</p>
    </div>
  );
}

type Post = { id?: string; slug: string; title: string; excerpt: string; content: string; cover_image: string; category: string; tags: string[]; author: string; status: string; published_at: string; seo_title: string; meta_description: string; canonical: string; og_image: string };
const EMPTY: Post = { slug: "", title: "", excerpt: "", content: "<p></p>", cover_image: "", category: "Guides", tags: [], author: EDITORIAL_AUTHOR.name, status: "draft", published_at: new Date().toISOString(), seo_title: "", meta_description: "", canonical: "", og_image: "" };

function ImageUpload({ label, folder, onUploaded }: { label: string; folder: string; onUploaded: (url: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const go = async (file: File) => {
    setBusy(true);
    try {
      onUploaded(await uploadMediaImage(file, folder));
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => ref.current?.click()}>{busy ? "Uploading…" : label}</Button>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) go(f); e.target.value = ""; }} />
    </>
  );
}

function BlogManager() {
  const qc = useQueryClient();
  const { data: posts } = useQuery({ queryKey: ["admin-posts"], queryFn: async () => ((await supabase.from("blog_posts").select("*").order("published_at", { ascending: false })).data ?? []) as Post[] });
  const [p, setP] = useState<Post | null>(null);

  const save = async () => {
    if (!p) return;
    const slug = (p.slug || p.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
    if (!p.title.trim() || !slug) return toast.error("Title is required");
    const row = { ...p, slug, content: clean(p.content), title: p.title.slice(0, 200), excerpt: p.excerpt.slice(0, 400) };
    const { error } = p.id ? await supabase.from("blog_posts").update(row).eq("id", p.id) : await supabase.from("blog_posts").insert(row);
    if (error) return toast.error(error.message);
    toast.success("Post saved");
    setP(null);
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
  };
  const del = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
  };
  if (p) {
    const set = (k: keyof Post, val: string | string[]) => setP({ ...p, [k]: val });
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Input placeholder="Post title" className="h-12 text-lg" value={p.title} onChange={(e) => set("title", e.target.value)} />
          <Textarea placeholder="Excerpt" rows={2} value={p.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
          <RichEditor value={p.content} onChange={(h) => set("content", h)} />
        </div>
        <div className="space-y-3 rounded-2xl border bg-card p-5 text-sm">
          <label className="block">Status<Select value={p.status} onValueChange={(v) => set("status", v)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent></Select></label>
          <label className="block">Publish date (future = scheduled)<Input type="datetime-local" className="mt-1" value={p.published_at.slice(0, 16)} onChange={(e) => set("published_at", new Date(e.target.value).toISOString())} /></label>
          <label className="block">Slug<Input className="mt-1" value={p.slug} onChange={(e) => set("slug", e.target.value)} /></label>
          <label className="block">Category<Input className="mt-1" value={p.category} onChange={(e) => set("category", e.target.value)} /></label>
          <label className="block">Tags (comma separated)<Input className="mt-1" value={p.tags.join(", ")} onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} /></label>
          <label className="block">Author<Input className="mt-1" value={p.author} onChange={(e) => set("author", e.target.value)} /></label>
          <label className="block">Cover image (upload or paste URL)
            <div className="mt-1 flex gap-2">
              <Input className="min-w-0 flex-1" value={p.cover_image} onChange={(e) => set("cover_image", e.target.value)} />
              <ImageUpload label="Upload" folder="covers" onUploaded={(url) => set("cover_image", url)} />
            </div>
          </label>
          {p.cover_image && <img src={p.cover_image} alt="" className="rounded-lg" />}
          <label className="block">SEO title<Input className="mt-1" maxLength={60} value={p.seo_title} onChange={(e) => set("seo_title", e.target.value)} /></label>
          <label className="block">Meta description<Textarea className="mt-1" maxLength={160} value={p.meta_description} onChange={(e) => set("meta_description", e.target.value)} /></label>
          <label className="block">Canonical URL<Input className="mt-1" value={p.canonical} onChange={(e) => set("canonical", e.target.value)} /></label>
          <label className="block">OG image (upload or paste URL)
            <div className="mt-1 flex gap-2">
              <Input className="min-w-0 flex-1" value={p.og_image} onChange={(e) => set("og_image", e.target.value)} />
              <ImageUpload label="Upload" folder="og" onUploaded={(url) => set("og_image", url)} />
            </div>
          </label>
          <div className="flex gap-2 pt-2"><Button onClick={save}>Save post</Button><Button variant="outline" onClick={() => setP(null)}>Cancel</Button></div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <Button onClick={() => setP({ ...EMPTY, published_at: new Date().toISOString() })}><Plus /> New post</Button>
      <div className="divide-y rounded-2xl border bg-card">
        {(posts ?? []).map((x) => (
          <div key={x.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1"><p className="font-medium">{x.title}</p><p className="text-xs text-muted-foreground">/{x.slug} · {new Date(x.published_at).toLocaleDateString()} · {x.category}</p></div>
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs", x.status === "published" ? "bg-brand-green/15 text-brand-green" : "bg-muted")}>{x.status === "published" && new Date(x.published_at) > new Date() ? "scheduled" : x.status}</span>
            <Button size="sm" variant="outline" onClick={() => setP(x)}>Edit</Button>
            <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => del(x.id!)}><Trash2 /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageManager() {
  const { data: pages, refetch } = useQuery({ queryKey: ["admin-pages"], queryFn: async () => (await supabase.from("pages").select("*").order("slug")).data ?? [] });
  const [sel, setSel] = useState<{ slug: string; title: string; content: string } | null>(null);
  const save = async () => {
    if (!sel) return;
    const { error } = await supabase.from("pages").update({ title: sel.title, content: clean(sel.content), updated_at: new Date().toISOString() }).eq("slug", sel.slug);
    if (error) return toast.error(error.message);
    toast.success("Page saved"); refetch();
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <div className="space-y-1">{(pages ?? []).map((p) => <button key={p.slug} onClick={() => setSel(p)} className={cn("block w-full rounded-lg px-3 py-2 text-left text-sm", sel?.slug === p.slug ? "bg-primary text-primary-foreground" : "hover:bg-accent")}>{p.title}</button>)}</div>
      {sel ? (
        <div className="space-y-4">
          <Input value={sel.title} onChange={(e) => setSel({ ...sel, title: e.target.value })} />
          <RichEditor value={sel.content} onChange={(h) => setSel({ ...sel, content: h })} />
          <Button onClick={save}>Save page</Button>
        </div>
      ) : <p className="text-muted-foreground">Choose a page to edit.</p>}
    </div>
  );
}

function Subscribers() {
  const { data, refetch } = useQuery({ queryKey: ["admin-subs"], queryFn: async () => (await supabase.from("subscribers").select("*").order("created_at", { ascending: false })).data ?? [] });
  const csv = () => download("subscribers.csv", "email,subscribed_at\n" + (data ?? []).map((s) => `${s.email},${s.created_at}`).join("\n"), "text/csv");
  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={csv}>Export CSV ({data?.length ?? 0})</Button>
      <div className="divide-y rounded-2xl border bg-card">
        {(data ?? []).map((s) => (
          <div key={s.id} className="flex items-center gap-3 p-3 text-sm"><span className="flex-1">{s.email}</span><span className="text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</span>
            <Button size="icon" variant="ghost" aria-label="Delete" onClick={async () => { await supabase.from("subscribers").delete().eq("id", s.id); refetch(); }}><Trash2 /></Button></div>
        ))}
        {data?.length === 0 && <p className="p-4 text-sm text-muted-foreground">No subscribers yet.</p>}
      </div>
    </div>
  );
}

function Messages() {
  const { data, refetch } = useQuery({ queryKey: ["admin-msgs"], queryFn: async () => (await supabase.from("contact_messages").select("*").order("created_at", { ascending: false })).data ?? [] });
  return (
    <div className="space-y-3">
      {(data ?? []).map((m) => (
        <div key={m.id} className="rounded-2xl border bg-card p-5">
          <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{m.name}</p><a href={`mailto:${m.email}`} className="text-sm text-primary">{m.email}</a><span className="ml-auto text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</span>
            <Button size="icon" variant="ghost" aria-label="Delete" onClick={async () => { await supabase.from("contact_messages").delete().eq("id", m.id); refetch(); }}><Trash2 /></Button></div>
          {m.subject && <p className="mt-1 text-sm font-medium">{m.subject}</p>}
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{m.message}</p>
        </div>
      ))}
      {data?.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
    </div>
  );
}

const maskEmail = (e: string) => { const [u, d] = e.split("@"); return `${u.slice(0, 2)}***@${d}`; };
const maskWallet = (w: string) => `${w.slice(0, 6)}…${w.slice(-4)}`;

function TeamPanel() {
  const qc = useQueryClient();
  const list = useServerFn(listAdmins);
  const add = useServerFn(addAdmin);
  const remove = useServerFn(removeAdmin);
  const { data, isLoading, error } = useQuery({ queryKey: ["admins"], queryFn: () => list() });
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="max-w-2xl space-y-6">
      <form className="space-y-3 rounded-2xl border bg-card p-6" onSubmit={async (e) => {
        e.preventDefault(); setBusy(true);
        try { await add({ data: { email, password: pw } }); toast.success("Admin access given"); setEmail(""); setPw(""); qc.invalidateQueries({ queryKey: ["admins"] }); }
        catch (err) { toast.error((err as Error).message); }
        setBusy(false);
      }}>
        <h2 className="font-semibold">Give admin access</h2>
        <p className="text-sm text-muted-foreground">Enter their email and a password. Share both with them; they sign in at /login.</p>
        <Input type="email" required placeholder="their@email.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
        <Input type="text" required minLength={8} placeholder="Password (min 8 characters)" value={pw} onChange={(e) => setPw(e.target.value)} aria-label="Password" />
        <Button type="submit" disabled={busy}><Plus className="size-4" /> {busy ? "Adding…" : "Add admin"}</Button>
      </form>
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-semibold">People with admin access</h2>
        {isLoading && <p className="mt-3 text-sm text-muted-foreground">Loading…</p>}
        {error && <p className="mt-3 text-sm text-destructive">{(error as Error).message}</p>}
        <ul className="mt-3 divide-y">
          {(data ?? []).map((a) => (
            <li key={a.id} className="flex items-center justify-between py-3 text-sm">
              <span>{a.email} {a.owner && <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Owner</span>}</span>
              {!a.owner && <Button size="sm" variant="outline" onClick={async () => {
                if (!confirm(`Remove admin access for ${a.email}?`)) return;
                try { await remove({ data: { userId: a.id } }); toast.success("Access removed"); qc.invalidateQueries({ queryKey: ["admins"] }); }
                catch (err) { toast.error((err as Error).message); }
              }}><Trash2 className="size-4" /> Remove</Button>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Giveaway() {
  const { data, refetch } = useQuery({ queryKey: ["admin-giveaway"], queryFn: async () => (await supabase.from("giveaway_entries").select("*").order("created_at", { ascending: false })).data ?? [] });
  const { data: winners, refetch: refetchWinners } = useQuery({ queryKey: ["admin-giveaway-winners"], queryFn: async () => (await supabase.from("giveaway_winners").select("*").order("month", { ascending: false })).data ?? [] });
  const months = [...new Set((data ?? []).map((e) => e.month))];
  const [month, setMonth] = useState("");
  const m = month || months[0] || "";
  const list = (data ?? []).filter((e) => e.month === m);
  const [winner, setWinner] = useState<(typeof list)[number] | null>(null);
  const [saving, setSaving] = useState(false);
  const saved = (winners ?? []).find((w) => w.month === m);
  const saveWinner = async () => {
    if (!winner) return;
    setSaving(true);
    const { error } = await supabase.from("giveaway_winners").insert({ month: winner.month, name: winner.name, email: maskEmail(winner.email), wallet: maskWallet(winner.wallet) });
    setSaving(false);
    if (error) return toast.error(error.code === "23505" ? "A winner is already saved for this month." : "Could not save winner.");
    toast.success("Winner published on the giveaway page.");
    setWinner(null);
    refetchWinners();
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select aria-label="Month" className="rounded-lg border bg-background px-3 py-2 text-sm" value={m} onChange={(e) => { setMonth(e.target.value); setWinner(null); }}>
          {months.map((x) => <option key={x}>{x}</option>)}
        </select>
        <span className="text-sm text-muted-foreground">{list.length} entries</span>
        <Button disabled={!list.length || !!saved} onClick={() => { const a = new Uint32Array(1); crypto.getRandomValues(a); setWinner(list[a[0] % list.length]); }}>Pick random winner</Button>
      </div>
      {saved && <div className="rounded-2xl border bg-card p-5"><p className="text-sm font-semibold">Published winner for {saved.month}: {saved.name}</p><p className="text-sm text-muted-foreground">{saved.email} · <span className="font-mono">{saved.wallet}</span></p></div>}
      {winner && <div className="rounded-2xl border-2 border-primary bg-card p-5"><p className="font-semibold">Winner: {winner.name}</p><a href={`mailto:${winner.email}`} className="text-sm text-primary">{winner.email}</a><p className="mt-1 break-all font-mono text-sm">{winner.wallet}</p><Button className="mt-3" disabled={saving} onClick={saveWinner}>{saving ? "Publishing…" : "Publish winner on giveaway page"}</Button></div>}
      {list.map((e) => (
        <div key={e.id} className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-4 text-sm">
          <span className="font-medium">{e.name}</span><span className="text-muted-foreground">{e.email}</span><span className="break-all font-mono text-xs">{e.wallet}</span>
          <Button size="icon" variant="ghost" className="ml-auto" aria-label="Delete" onClick={async () => { await supabase.from("giveaway_entries").delete().eq("id", e.id); refetch(); }}><Trash2 /></Button>
        </div>
      ))}
      {!list.length && <p className="text-sm text-muted-foreground">No entries yet.</p>}
    </div>
  );
}
