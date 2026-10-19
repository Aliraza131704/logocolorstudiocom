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
const auditInput = z.object({
  url: z.string().min(3).max(500),
  maxPages: z.number().int().min(1).max(3).default(1),
  checkLinks: z.boolean().default(true),
  checkImages: z.boolean().default(true),
  pageUrls: z.array(z.string().min(3).max(500)).min(1).max(3).optional(),
  discoverSite: z.boolean().default(false),
});
export const auditWebsite = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => auditInput.parse(d))
  .handler(async ({ data }) => {
    const engine = await import("./audit-engine.server");
    await engine.consumeAuditRequest();
    return engine.runWebsiteAudit(data);
  });

/* ---------------- CMS / theme detectors (logic in detect.server.ts) ---------------- */
export const detectCms = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }) => {
    const { m, page } = await load(data.url);
    const d = await import("./detect.server");
    return d.runCms(m, page);
  });

export const detectShopify = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }) => {
    const { m, page } = await load(data.url);
    const d = await import("./detect.server");
    return d.runShopify(m, page);
  });

export const detectWordpress = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }) => {
    const { m, page } = await load(data.url);
    const d = await import("./detect.server");
    return d.runWordpress(m, page);
  });
