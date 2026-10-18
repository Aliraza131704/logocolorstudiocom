// Server-only helpers for fetching and inspecting public websites.
const UA = "Mozilla/5.0 (compatible; LogoColorStudioBot/1.0; +https://logocolostudio.lovable.app)";

export function validateUrl(raw: string): URL {
  let s = raw.trim();
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  let u: URL;
  try { u = new URL(s); } catch { throw new Error("Please enter a valid website address."); }
  if (!["http:", "https:"].includes(u.protocol)) throw new Error("Only http and https addresses are supported.");
  const h = u.hostname.toLowerCase();
  if (
    h === "localhost" || h.endsWith(".local") || h.endsWith(".internal") || !h.includes(".") ||
    /^(127\.|10\.|192\.168\.|169\.254\.|0\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h) || h.startsWith("[")
  ) throw new Error("That address is not a public website.");
  return u;
}

export async function rateLimit(limit = 20) {
  try {
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const ip = getRequestHeader("cf-connecting-ip") || getRequestHeader("x-forwarded-for")?.split(",")[0] || "unknown";
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - 60_000).toISOString();
    const { count } = await supabaseAdmin.from("rate_limits").select("id", { count: "exact", head: true }).eq("ip", ip).gte("created_at", since);
    if ((count ?? 0) >= limit) throw new Error("RATE");
    await supabaseAdmin.from("rate_limits").insert({ ip });
    if (Math.random() < 0.05) await supabaseAdmin.from("rate_limits").delete().lt("created_at", new Date(Date.now() - 3600_000).toISOString());
  } catch (e) {
    if (e instanceof Error && e.message === "RATE") throw new Error("Too many requests. Please wait a minute and try again.");
  }
}

export type Fetched = { url: string; status: number; html: string; headers: Record<string, string>; ms: number; bytes: number };

export async function fetchPage(u: URL | string, max = 2_000_000): Promise<Fetched> {
  const t = Date.now();
  let res: Response;
  try {
    res = await fetch(u.toString(), { headers: { "user-agent": UA, accept: "text/html,*/*" }, redirect: "follow", signal: AbortSignal.timeout(12000) });
  } catch {
    throw new Error("We couldn't reach that website. Check the address and try again.");
  }
  const buf = await res.arrayBuffer();
  const html = new TextDecoder().decode(buf.slice(0, max));
  const headers: Record<string, string> = {};
  res.headers.forEach((v, k) => (headers[k] = v));
  return { url: res.url || u.toString(), status: res.status, html, headers, ms: Date.now() - t, bytes: buf.byteLength };
}

export async function fetchText(url: string, max = 400_000): Promise<{ ok: boolean; status: number; text: string }> {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(8000) });
    const text = r.ok ? (await r.text()).slice(0, max) : "";
    return { ok: r.ok, status: r.status, text };
  } catch {
    return { ok: false, status: 0, text: "" };
  }
}

export const attr = (tag: string, name: string) => {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return m ? m[2] : null;
};

export const tags = (html: string, name: string) => html.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) ?? [];

export function metaContent(html: string, key: string) {
  for (const t of tags(html, "meta")) {
    const n = (attr(t, "name") || attr(t, "property") || "").toLowerCase();
    if (n === key.toLowerCase()) return attr(t, "content");
  }
  return null;
}

export const abs = (base: string, href: string) => { try { return new URL(href, base).toString(); } catch { return href; } };

export const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
