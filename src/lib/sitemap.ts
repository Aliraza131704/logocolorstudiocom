import { absoluteUrl } from "./seo";
import { getIndexablePalettes } from "./palette-editorial";
import { BRANDS } from "./brands";
import { NAMED_COLORS } from "./color-names";
import { TOOLS } from "./tools";

// Authoritative editorial revision dates, not sitemap/build timestamps.
// Update these only when the corresponding public content meaningfully changes.
export const CONTENT_REVISIONS: Record<string, string> = {
  "/": "2026-10-19", "/tools": "2026-10-19", "/palettes": "2026-10-19",
  "/about": "2026-10-19", "/contact": "2026-10-19", "/privacy-policy": "2026-10-19",
  "/tools/logo-extractor": "2026-10-19", "/tools/website-extractor": "2026-10-19",
  "/tools/palette-generator": "2026-10-19", "/tools/contrast-checker": "2026-10-19",
  "/tools/theme-generator": "2026-10-19", "/tools/export-center": "2026-10-19",
  "/tools/website-auditor": "2026-10-19", "/tools/cms-detector": "2026-10-19",
  "/tools/shopify-theme-detector": "2026-10-19", "/tools/wordpress-theme-detector": "2026-10-19",
  "/sitemap": "2026-11-02", "/brand-colors": "2026-11-02",
};
export const PALETTE_CONTENT_REVISION = "2026-10-19";
export const BRAND_CONTENT_REVISION = "2026-11-02";
export const COLOR_CONTENT_REVISION = "2026-11-08";
const PAGE_PATHS: Record<string, string> = { about: "/about", contact: "/contact", privacy: "/privacy-policy", terms: "/terms-of-service", cookies: "/cookie-policy", disclaimer: "/disclaimer", changelog: "/changelog" };
type Dated = { updated_at?: string | null; published_at?: string | null };
export function sitemapEntries(posts: ({ slug: string } & Dated)[], pages: ({ slug: string } & Dated)[], downloadUpdated?: string) {
  const entries = new Map<string, string | undefined>();
  for (const path of ["/", "/tools", "/palettes", "/blog", "/downloads", "/giveaway", "/sitemap", "/brand-colors", ...Object.values(PAGE_PATHS), ...TOOLS.map(t => t.path)]) entries.set(path, CONTENT_REVISIONS[path]);
  for (const b of BRANDS) entries.set(`/brand-colors/${b.slug}`, BRAND_CONTENT_REVISION);
  entries.set("/colors", COLOR_CONTENT_REVISION);
  for (const c of NAMED_COLORS) entries.set(`/colors/${c.slug}`, COLOR_CONTENT_REVISION);
  for (const page of pages) {
    const path = PAGE_PATHS[page.slug];
    if (path) entries.set(path, [CONTENT_REVISIONS[path], page.updated_at].filter((d): d is string => Boolean(d)).sort().at(-1));
  }
  if (downloadUpdated) entries.set("/downloads", downloadUpdated);
  for (const post of posts) entries.set(`/blog/${post.slug}`, post.updated_at || post.published_at || undefined);
  const blogDate = posts.map(p => p.updated_at || p.published_at).filter((d): d is string => Boolean(d)).sort().at(-1);
  entries.set("/blog", blogDate);
  for (const p of getIndexablePalettes()) entries.set(`/palette/${p.slug}`, PALETTE_CONTENT_REVISION);
  return [...entries].map(([path, lastmod]) => ({ loc: absoluteUrl(path), lastmod: lastmod?.slice(0, 10) }));
}
export const escapeXml = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c] ?? c);
export function renderSitemap(entries: { loc: string; lastmod?: string }[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map(u => `<url><loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `<lastmod>${escapeXml(u.lastmod)}</lastmod>` : ""}</url>`).join("\n")}\n</urlset>`;
}