import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const input = z.object({ url: z.string().min(3).max(500) });

async function load(url: string) {
  const m = await import("./analyze.server");
  await m.rateLimit();
  const u = m.validateUrl(url);
  const page = await m.fetchPage(u);
  return { m, u, page };
}

/* ---------------- Website color extractor ---------------- */
export const extractWebsite = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }) => {
    const { m, page } = await load(data.url);
    const html = page.html;
    let css = (html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) ?? []).join("\n");
    css += "\n" + (html.match(/style\s*=\s*"([^"]*)"/gi) ?? []).join("\n");
    const sheets = m.tags(html, "link").filter((t) => /rel=["']?stylesheet/i.test(t)).map((t) => m.attr(t, "href")).filter(Boolean).slice(0, 5) as string[];
    const fetched = await Promise.all(sheets.map((h) => m.fetchText(m.abs(page.url, m.decode(h)))));
    css += fetched.map((f) => f.text).join("\n");

    const counts = new Map<string, number>();
    const add = (hex: string) => counts.set(hex, (counts.get(hex) ?? 0) + 1);
    for (const x of css.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)) {
      let h = x[1].toUpperCase();
      if (h.length === 3) h = h.split("").map((c) => c + c).join("");
      add("#" + h);
    }
    for (const x of css.matchAll(/rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/g)) {
      add("#" + [x[1], x[2], x[3]].map((v) => Math.min(255, +v).toString(16).padStart(2, "0")).join("").toUpperCase());
    }
    const themeColor = m.metaContent(html, "theme-color");
    const colors = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 16).map(([hex, n]) => ({ hex, count: n }));

    const fonts = new Map<string, number>();
    for (const f of css.matchAll(/font-family\s*:\s*([^;}{]+)/gi)) {
      const first = f[1].split(",")[0].trim().replace(/["']/g, "");
      if (first && !/^(inherit|initial|var\(|-apple-system|system-ui|sans-serif|serif|monospace)/i.test(first)) fonts.set(first, (fonts.get(first) ?? 0) + 1);
    }
    for (const g of html.matchAll(/fonts\.googleapis\.com\/css2?\?family=([^"'&]+)/g)) {
      decodeURIComponent(g[1]).split("|").forEach((f) => fonts.set(f.split(":")[0].replace(/\+/g, " "), 99));
    }

    let logo: string | null = null;
    for (const t of m.tags(html, "img")) {
      const s = `${m.attr(t, "class")} ${m.attr(t, "id")} ${m.attr(t, "alt")} ${m.attr(t, "src")}`;
      if (/logo/i.test(s) && m.attr(t, "src")) { logo = m.abs(page.url, m.decode(m.attr(t, "src")!)); break; }
    }
    const og = m.metaContent(html, "og:image");
    const icon = m.tags(html, "link").find((t) => /rel=["'][^"']*icon/i.test(t));
    const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim();

    return {
      url: page.url,
      title: m.decode(title).slice(0, 120),
      themeColor,
      colors,
      fonts: [...fonts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([f]) => f),
      logo,
      ogImage: og ? m.abs(page.url, m.decode(og)) : null,
      favicon: icon && m.attr(icon, "href") ? m.abs(page.url, m.decode(m.attr(icon, "href")!)) : m.abs(page.url, "/favicon.ico"),
    };
  });

/* ---------------- Website auditor ---------------- */
type Check = { id: string; group: string; label: string; pass: boolean; warn?: boolean; detail: string; fix?: string };

export const auditWebsite = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }) => {
    const { m, page } = await load(data.url);
    const html = page.html;
    const origin = new URL(page.url).origin;
    const checks: Check[] = [];
    const push = (c: Check) => checks.push(c);

    const title = m.decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim());
    push({ id: "title", group: "SEO", label: "Title tag", pass: title.length >= 10 && title.length <= 60, warn: !!title && (title.length < 10 || title.length > 60), detail: title ? `"${title.slice(0, 90)}" (${title.length} chars)` : "Missing", fix: "Write a unique title between 30 and 60 characters that includes your main keyword." });
    const desc = m.metaContent(html, "description") ?? "";
    push({ id: "desc", group: "SEO", label: "Meta description", pass: desc.length >= 50 && desc.length <= 160, warn: !!desc, detail: desc ? `${desc.length} chars` : "Missing", fix: "Add a 120–160 character description that summarises the page." });
    const h1s = html.match(/<h1\b[^>]*>/gi) ?? [];
    push({ id: "h1", group: "SEO", label: "Single H1 heading", pass: h1s.length === 1, warn: h1s.length > 1, detail: `${h1s.length} H1 found`, fix: "Use exactly one H1 that describes the page topic." });
    const canonical = m.tags(html, "link").find((t) => /rel=["']canonical/i.test(t));
    push({ id: "canonical", group: "SEO", label: "Canonical tag", pass: !!canonical, detail: canonical ? m.attr(canonical, "href") ?? "present" : "Missing", fix: "Add <link rel=\"canonical\" href=\"...\"> pointing to the preferred URL." });
    const robotsMeta = m.metaContent(html, "robots") ?? "";
    push({ id: "noindex", group: "SEO", label: "Indexable", pass: !/noindex/i.test(robotsMeta), detail: robotsMeta || "No robots meta (indexable)", fix: "Remove noindex if you want this page in search results." });
    const [robots, sitemap] = await Promise.all([m.fetchText(origin + "/robots.txt", 50_000), m.fetchText(origin + "/sitemap.xml", 50_000)]);
    push({ id: "robots", group: "SEO", label: "robots.txt", pass: robots.ok, detail: robots.ok ? "Found" : `Not found (${robots.status})`, fix: "Publish a robots.txt at the site root and reference your sitemap." });
    const smOk = sitemap.ok || /sitemap:/i.test(robots.text);
    push({ id: "sitemap", group: "SEO", label: "XML sitemap", pass: smOk, detail: smOk ? "Found" : "Not found", fix: "Generate sitemap.xml and submit it in Google Search Console." });
    const ld = (html.match(/application\/ld\+json/gi) ?? []).length;
    push({ id: "schema", group: "SEO", label: "Structured data (JSON-LD)", pass: ld > 0, detail: `${ld} block(s)`, fix: "Add Organization, WebSite or Article schema to earn rich results." });
    const ogT = m.metaContent(html, "og:title"), ogI = m.metaContent(html, "og:image");
    push({ id: "og", group: "SEO", label: "Open Graph tags", pass: !!ogT && !!ogI, warn: !!ogT || !!ogI, detail: `og:title ${ogT ? "✓" : "✗"} · og:image ${ogI ? "✓" : "✗"}`, fix: "Add og:title, og:description and a 1200×630 og:image for social sharing." });
    const lang = /<html[^>]*\blang=/i.test(html);
    push({ id: "lang", group: "SEO", label: "HTML lang attribute", pass: lang, detail: lang ? "Present" : "Missing", fix: "Add lang=\"en\" (or your language) to the <html> tag." });

    const vp = m.metaContent(html, "viewport") ?? "";
    push({ id: "viewport", group: "Mobile", label: "Viewport meta", pass: /width=device-width/i.test(vp), detail: vp || "Missing", fix: "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">." });
    push({ id: "https", group: "Security", label: "HTTPS", pass: page.url.startsWith("https://"), detail: new URL(page.url).protocol, fix: "Install an SSL certificate and redirect all HTTP traffic to HTTPS." });
    const hsts = !!page.headers["strict-transport-security"];
    push({ id: "hsts", group: "Security", label: "HSTS header", pass: hsts, warn: !hsts, detail: hsts ? "Enabled" : "Not set", fix: "Send Strict-Transport-Security to force secure connections." });

    const imgs = m.tags(html, "img");
    const noAlt = imgs.filter((t) => m.attr(t, "alt") === null).length;
    push({ id: "alt", group: "Accessibility", label: "Image alt text", pass: noAlt === 0, warn: noAlt > 0 && noAlt < 3, detail: `${imgs.length - noAlt}/${imgs.length} images have alt`, fix: "Add descriptive alt text to every meaningful image." });
    const lazy = imgs.filter((t) => /loading=["']lazy/i.test(t)).length;
    push({ id: "lazy", group: "Performance", label: "Lazy-loaded images", pass: imgs.length < 4 || lazy > 0, warn: true, detail: `${lazy}/${imgs.length} lazy`, fix: "Add loading=\"lazy\" to below-the-fold images." });
    push({ id: "ttfb", group: "Performance", label: "Server response time", pass: page.ms < 1200, warn: page.ms < 2500, detail: `${page.ms} ms`, fix: "Use caching, a CDN and faster hosting to reduce response time." });
    const kb = Math.round(page.bytes / 1024);
    push({ id: "size", group: "Performance", label: "HTML size", pass: kb < 300, warn: kb < 800, detail: `${kb} KB`, fix: "Reduce inline scripts and markup; split large pages." });
    const comp = page.headers["content-encoding"];
    push({ id: "gzip", group: "Performance", label: "Compression", pass: !!comp, warn: true, detail: comp || "Not detected", fix: "Enable gzip or Brotli compression on the server." });
    const scripts = (html.match(/<script\b[^>]*src=/gi) ?? []).length;
    push({ id: "scripts", group: "Performance", label: "External scripts", pass: scripts <= 20, warn: scripts <= 40, detail: `${scripts} scripts`, fix: "Remove unused third-party scripts and defer non-critical ones." });

    // broken links sample
    const hrefs = [...new Set(m.tags(html, "a").map((t) => m.attr(t, "href")).filter((h): h is string => !!h && !/^(#|mailto:|tel:|javascript:)/i.test(h)).map((h) => m.abs(page.url, m.decode(h))))].slice(0, 12);
    const linkRes = await Promise.all(hrefs.map(async (h) => {
      try { const r = await fetch(h, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(5000) }); return { h, s: r.status }; } catch { return { h, s: 0 }; }
    }));
    const broken = linkRes.filter((l) => l.s >= 400 && l.s !== 405 && l.s !== 403);
    push({ id: "links", group: "Links", label: "Broken links (sample)", pass: broken.length === 0, detail: broken.length ? broken.map((b) => `${b.h} (${b.s})`).join(", ").slice(0, 300) : `${hrefs.length} links checked, none broken`, fix: "Fix or remove links that return 4xx/5xx errors." });

    const score = (g?: string) => {
      const list = g ? checks.filter((c) => c.group === g) : checks;
      const pts = list.reduce((s, c) => s + (c.pass ? 1 : c.warn ? 0.5 : 0), 0);
      return Math.round((pts / Math.max(1, list.length)) * 100);
    };
    const groups = [...new Set(checks.map((c) => c.group))].map((g) => ({ group: g, score: score(g) }));
    return { url: page.url, status: page.status, score: score(), groups, checks, checkedAt: new Date().toISOString() };
  });

/* ---------------- CMS detector ---------------- */
const CMS: { name: string; tests: (h: string, hd: Record<string, string>) => number }[] = [
  { name: "WordPress", tests: (h, hd) => (/wp-content\//.test(h) ? 50 : 0) + (/wp-includes\//.test(h) ? 30 : 0) + (/generator["'][^>]*WordPress/i.test(h) ? 40 : 0) + (/wp-json/.test(h) || /wp-json/.test(hd.link ?? "") ? 20 : 0) },
  { name: "Shopify", tests: (h, hd) => (/cdn\.shopify\.com|\/cdn\/shop\//.test(h) ? 50 : 0) + (/Shopify\.theme/.test(h) ? 40 : 0) + (hd["x-shopid"] || hd["x-shopify-stage"] ? 40 : 0) },
  { name: "Wix", tests: (h, hd) => (/static\.wixstatic\.com|parastorage\.com/.test(h) ? 60 : 0) + (/generator["'][^>]*Wix/i.test(h) ? 40 : 0) + (hd["x-wix-request-id"] ? 40 : 0) },
  { name: "Squarespace", tests: (h) => (/static1\.squarespace\.com|squarespace-cdn\.com/.test(h) ? 60 : 0) + (/Squarespace/i.test(h) ? 20 : 0) },
  { name: "Webflow", tests: (h) => (/data-wf-page|data-wf-site/.test(h) ? 60 : 0) + (/generator["'][^>]*Webflow/i.test(h) ? 40 : 0) + (/website-files\.com|webflow\.com/.test(h) ? 20 : 0) },
  { name: "Joomla", tests: (h) => (/generator["'][^>]*Joomla/i.test(h) ? 60 : 0) + (/\/media\/jui\/|\/components\/com_/.test(h) ? 40 : 0) },
  { name: "Drupal", tests: (h, hd) => (/generator["'][^>]*Drupal/i.test(h) ? 60 : 0) + (/\/sites\/default\/files|drupal-settings-json|Drupal\.settings/.test(h) ? 40 : 0) + (hd["x-drupal-cache"] || hd["x-generator"]?.includes("Drupal") ? 30 : 0) },
  { name: "Magento", tests: (h, hd) => (/Mage\.Cookies|mage\/cookies|\/static\/version\d+\/frontend\//.test(h) ? 60 : 0) + (/text\/x-magento-init/.test(h) ? 40 : 0) + (hd["x-magento-cache-debug"] ? 30 : 0) },
  { name: "Ghost", tests: (h) => (/generator["'][^>]*Ghost/i.test(h) ? 70 : 0) + (/ghost-portal|\/ghost\/api\//.test(h) ? 30 : 0) },
  { name: "BigCommerce", tests: (h) => (/cdn\d*\.bigcommerce\.com|stencil-utils/.test(h) ? 70 : 0) },
  { name: "PrestaShop", tests: (h) => (/prestashop/i.test(h) ? 60 : 0) },
  { name: "HubSpot CMS", tests: (h) => (/hs-scripts\.com|hubspot\.net\/hub/.test(h) ? 50 : 0) + (/generator["'][^>]*HubSpot/i.test(h) ? 40 : 0) },
  { name: "Framer", tests: (h) => (/framerusercontent\.com|data-framer/.test(h) ? 70 : 0) },
  { name: "Next.js", tests: (h) => (/__NEXT_DATA__|\/_next\/static/.test(h) ? 50 : 0) },
  { name: "Weebly", tests: (h) => (/weebly\.com|editmysite\.com/.test(h) ? 70 : 0) },
];

export const detectCms = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }) => {
    const { m, page } = await load(data.url);
    const results = CMS.map((c) => ({ name: c.name, confidence: Math.min(100, c.tests(page.html, page.headers)) })).filter((r) => r.confidence > 0).sort((a, b) => b.confidence - a.confidence);
    const generator = m.metaContent(page.html, "generator");
    return { url: page.url, generator, server: page.headers["server"] ?? null, poweredBy: page.headers["x-powered-by"] ?? null, results };
  });

/* ---------------- Shopify theme detector ---------------- */
export const detectShopify = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }) => {
    const { page } = await load(data.url);
    const h = page.html;
    const isShopify = /cdn\.shopify\.com|\/cdn\/shop\/|Shopify\.theme|myshopify\.com/.test(h) || !!page.headers["x-shopid"];
    if (!isShopify) return { url: page.url, isShopify: false as const };
    const themeObj = h.match(/Shopify\.theme\s*=\s*(\{[^;]*?\});/);
    let theme: Record<string, unknown> = {};
    if (themeObj) { try { theme = JSON.parse(themeObj[1]); } catch { /* ignore */ } }
    const schemaName = h.match(/"schema_name"\s*:\s*"([^"]+)"/)?.[1] ?? (theme.schema_name as string | undefined);
    const schemaVer = h.match(/"schema_version"\s*:\s*"([^"]+)"/)?.[1] ?? (theme.schema_version as string | undefined);
    const storeId = h.match(/"theme_store_id"\s*:\s*(\d+)/)?.[1] ?? (theme.theme_store_id ? String(theme.theme_store_id) : undefined);
    const shop = h.match(/Shopify\.shop\s*=\s*"([^"]+)"/)?.[1] ?? null;
    const APPS: [string, RegExp][] = [["Klaviyo", /klaviyo/i], ["Judge.me Reviews", /judge\.me|judgeme/i], ["Yotpo", /yotpo/i], ["Loox Reviews", /loox\.io/i], ["Privy", /privy\.com/i], ["ReCharge Subscriptions", /rechargecdn|rechargepayments/i], ["Gorgias", /gorgias/i], ["Omnisend", /omnisend/i], ["Hotjar", /hotjar/i], ["Google Analytics", /googletagmanager|google-analytics/i], ["Meta Pixel", /connect\.facebook\.net/i], ["TikTok Pixel", /analytics\.tiktok\.com/i], ["Shop Pay", /shop_pay|shopify-pay/i], ["PageFly", /pagefly/i], ["GemPages", /gempages/i], ["Stamped.io", /stamped\.io/i], ["Smile.io Rewards", /smile\.io/i], ["Tidio Chat", /tidio/i], ["Afterpay", /afterpay/i], ["Klarna", /klarna/i]];
    const apps = APPS.filter(([, r]) => r.test(h)).map(([n]) => n);
    return {
      url: page.url,
      isShopify: true as const,
      shop,
      themeName: (theme.name as string | undefined) ?? schemaName ?? null,
      themeId: theme.id ? String(theme.id) : null,
      role: (theme.role as string | undefined) ?? null,
      schemaName: schemaName ?? null,
      version: schemaVer ?? null,
      themeStoreId: storeId ?? null,
      themeStoreLink: storeId ? `https://themes.shopify.com/themes?q=${encodeURIComponent(schemaName ?? "")}` : schemaName ? `https://themes.shopify.com/themes?q=${encodeURIComponent(schemaName)}` : null,
      apps,
    };
  });

/* ---------------- WordPress theme detector ---------------- */
export const detectWordpress = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }) => {
    const { m, page } = await load(data.url);
    const h = page.html;
    const isWp = /wp-content\/|wp-includes\//.test(h);
    if (!isWp) return { url: page.url, isWordPress: false as const };
    const themeSlugs = [...new Set([...h.matchAll(/wp-content\/themes\/([a-zA-Z0-9_.-]+)\//g)].map((x) => x[1]))];
    const plugins = [...new Set([...h.matchAll(/wp-content\/plugins\/([a-zA-Z0-9_.-]+)\//g)].map((x) => x[1]))].slice(0, 40);
    const base = new URL(page.url).origin;
    const parseHeader = (css: string) => {
      const block = css.match(/\/\*([\s\S]*?)\*\//)?.[1] ?? "";
      const get = (k: string) => block.match(new RegExp(`^\\s*\\*?\\s*${k}\\s*:\\s*(.+)$`, "im"))?.[1]?.trim() ?? null;
      return { name: get("Theme Name"), version: get("Version"), author: get("Author"), authorUri: get("Author URI"), themeUri: get("Theme URI"), description: get("Description"), template: get("Template"), license: get("License") };
    };
    const themes = await Promise.all(themeSlugs.slice(0, 3).map(async (slug) => {
      const r = await m.fetchText(`${base}/wp-content/themes/${slug}/style.css`, 20_000);
      return { slug, ...(r.ok ? parseHeader(r.text) : {}), screenshot: `${base}/wp-content/themes/${slug}/screenshot.png` };
    }));
    const child = themes.find((t) => "template" in t && t.template);
    const wpVer = m.metaContent(h, "generator")?.match(/WordPress\s*([\d.]+)/i)?.[1] ?? h.match(/ver=(\d+\.\d+(?:\.\d+)?)['"&][^>]*wp-includes/)?.[1] ?? null;
    return {
      url: page.url,
      isWordPress: true as const,
      wpVersion: wpVer,
      themes,
      parentTheme: child && "template" in child ? child.template : null,
      plugins: plugins.map((p) => ({ slug: p, url: `https://wordpress.org/plugins/${p}/` })),
    };
  });
