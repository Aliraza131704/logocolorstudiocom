import { publicWebsiteUrl, isPublicAddress } from "./audit-url";
import type { Fetched } from "./analyze.server";

const MAX_BYTES = 1_000_000;
const USER_AGENT = "LogoColorStudioBot/2.0 (+https://logocolorstudiocom.lovable.app)";

export async function assertPublicHost(url: URL) {
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (isPublicAddress(host)) return;
  const answers = await Promise.all(["A", "AAAA"].map(async type => {
    const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=${type}`, { headers: { accept: "application/dns-json" }, signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error("Public address validation is unavailable. Please try again later.");
    const result = await response.json() as { Status: number; Answer?: { type: number; data: string }[] };
    if (![0, 3].includes(result.Status)) throw new Error("Unable to validate this website's public address.");
    return (result.Answer ?? []).filter(a => a.type === 1 || a.type === 28).map(a => a.data);
  }));
  const addresses = answers.flat();
  if (!addresses.length || addresses.some(a => !isPublicAddress(a))) throw new Error("That website does not resolve exclusively to public addresses.");
}

export async function auditFetch(raw: string, method: "GET" | "HEAD" = "GET", max = MAX_BYTES) {
  let url = publicWebsiteUrl(raw);
  const allowedOrigin = url.origin;
  const started = Date.now();
  for (let redirects = 0; redirects <= 4; redirects++) {
    await assertPublicHost(url);
    const response = await fetch(url.href, { method, redirect: "manual", headers: { "user-agent": USER_AGENT, accept: "text/html,application/xml;q=0.9,*/*;q=0.5" }, signal: AbortSignal.timeout(8000) });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      await response.body?.cancel();
      const location = response.headers.get("location");
      if (!location) throw new Error("The website returned an incomplete redirect.");
      url = publicWebsiteUrl(new URL(location, url).href);
      if (url.origin !== allowedOrigin) throw new Error("This address redirects to another origin. Enter its final HTTPS website address to audit it with the correct crawl policy.");
      continue;
    }
    let bytes = 0;
    const decoder = new TextDecoder();
    let html = "";
    let truncated = false;
    const reader = response.body?.getReader();
    if (reader) {
      try {
        while (true) {
          const next = await reader.read();
          if (next.done) break;
          const available = max - bytes;
          html += decoder.decode(next.value.subarray(0, available), { stream: true });
          bytes += Math.min(next.value.length, available);
          if (bytes >= max) { truncated = true; await reader.cancel(); break; }
        }
        html += decoder.decode();
      } finally { reader.releaseLock(); }
    }
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => { headers[key] = value; });
    return { url: url.href, status: response.status, html, bytes, headers, ms: Date.now() - started, truncated };
  }
  throw new Error("Too many website redirects. No audit was performed.");
}

export function robotsAllowed(text: string, target: URL) {
  const groups: { agents: string[]; rules: { allow: boolean; path: string }[] }[] = [];
  let current: typeof groups[number] | undefined;
  for (const line of text.split(/\r?\n/)) {
    const clean = line.split("#")[0].trim();
    const index = clean.indexOf(":");
    if (index < 0) continue;
    const key = clean.slice(0, index).toLowerCase();
    const value = clean.slice(index + 1).trim();
    if (key === "user-agent") {
      if (!current || current.rules.length) { current = { agents: [], rules: [] }; groups.push(current); }
      current.agents.push(value.toLowerCase());
    } else if ((key === "allow" || key === "disallow") && current && value) current.rules.push({ allow: key === "allow", path: value });
  }
  const specific = groups.filter(g => g.agents.some(a => a !== "*" && "logocolorstudiobot".startsWith(a)));
  const chosen = specific.length ? specific : groups.filter(g => g.agents.includes("*"));
  const path = target.pathname + target.search;
  const rules = chosen.flatMap(g => g.rules).filter(r => {
    const pattern = r.path.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\\\$$/, "$").replace(/\*/g, ".*");
    try { return new RegExp(`^${pattern}`).test(path); } catch { return path.startsWith(r.path); }
  }).sort((a, b) => b.path.replace(/\*/g, "").length - a.path.replace(/\*/g, "").length || Number(b.allow) - Number(a.allow));
  return rules[0]?.allow ?? true;
}

export function blockedAuditPage(page: Fetched) {
  return [401, 403, 429, 503].includes(page.status) || /cf-browser-verification|challenge-platform|Just a moment\.\.\.|captcha-delivery/i.test(page.html.slice(0, 20000));
}