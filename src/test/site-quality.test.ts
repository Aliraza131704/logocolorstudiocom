import { describe, expect, it } from "vitest";
import { getAllPalettes, PALETTE_TAGS } from "@/lib/palettes";
import { getFeaturedPalettes, getIndexablePalettes, hasPaletteShareImage, isIndexablePalette, paletteEditorial } from "@/lib/palette-editorial";
import { SITE_URL, pageHead } from "@/lib/seo";
import { renderSitemap, sitemapEntries } from "@/lib/sitemap";
import { contrastRatio, readableOn } from "@/lib/color";
import { TOOLS } from "@/lib/tools";
import { paletteTextColor } from "@/lib/palette-presentation";

describe("Palette indexing", () => {
  it("makes all 1,000 palettes indexable with unique stable slugs", () => {
    const palettes = getIndexablePalettes();
    expect(palettes).toHaveLength(1000);
    expect(new Set(palettes.map(p => p.slug)).size).toBe(1000);
    expect(isIndexablePalette("coastal-breeze-70")).toBe(true);
    expect(isIndexablePalette("nordic-dawn-126")).toBe(true);
    expect(isIndexablePalette("golden-glacier-687")).toBe(true);
  });
  it("keeps 150 featured palettes with 15 from each tag and share-image coverage", () => {
    const featured = getFeaturedPalettes();
    expect(featured).toHaveLength(150);
    expect(new Set(featured.map(p => p.name)).size).toBe(150);
    for (const tag of PALETTE_TAGS) expect(featured.filter(p => p.tags[0] === tag)).toHaveLength(15);
    for (const p of featured) expect(hasPaletteShareImage(p.slug)).toBe(true);
    expect(hasPaletteShareImage("coastal-breeze-70")).toBe(false);
  });
  it("uses AA-readable text on all 1,000 live preview surfaces", () => {
    for (const p of getIndexablePalettes()) {
      const editorial = paletteEditorial(p);
      expect(editorial.uses).toHaveLength(3);
      for (const color of [editorial.light, editorial.dark, editorial.accent]) expect(contrastRatio(color, paletteTextColor(color))).toBeGreaterThanOrEqual(4.5);
    }
  });
});
describe("Public URLs and sitemap", () => {
  it("self-references the absolute page URL for canonical and og:url", () => {
    const head = pageHead({ title: "Example", description: "Example", path: "/blog/example" });
    expect(head.links[0].href).toBe(`${SITE_URL}/blog/example`);
    expect(head.meta.find(m => m.property === "og:url")?.content).toBe(`${SITE_URL}/blog/example`);
  });
  it("emits noindex follow for excluded palettes", () => {
    expect(pageHead({ title: "Example", description: "Example", path: "/palette/example-70", noindex: true, follow: true }).meta.find(m => m.name === "robots")?.content).toBe("noindex, follow");
  });
  it("includes downloads, generator and all 1,000 palette pages, and excludes admin and login", () => {
    const paths = sitemapEntries([], []).map(u => new URL(u.loc).pathname);
    expect(paths).toContain("/downloads");
    expect(paths).toContain("/tools/palette-generator");
    expect(paths).not.toContain("/admin");
    expect(paths).not.toContain("/login");
    expect(paths.filter(p => p.startsWith("/palette/"))).toHaveLength(1000);
    expect(paths).toContain("/palette/coastal-breeze-70");
  });
  it("uses the article-specific update date and omits unknown dates instead of build fallbacks", () => {
    const entries = sitemapEntries([{ slug: "guide", published_at: "2026-09-02", updated_at: "2026-10-10" }], []);
    expect(entries.find(u => u.loc.endsWith("/blog/guide"))?.lastmod).toBe("2026-10-10");
    expect(entries.find(u => u.loc.endsWith("/downloads"))?.lastmod).toBeUndefined();
    expect(renderSitemap(entries)).not.toContain("<priority>");
  });
  it("retains all existing non-generator tool URLs", () => {
    expect(TOOLS.filter(t => t.slug !== "palette-generator").map(t => t.path)).toEqual(["/tools/logo-extractor", "/tools/website-extractor", "/tools/contrast-checker", "/tools/theme-generator", "/tools/export-center", "/tools/website-auditor", "/tools/cms-detector", "/tools/shopify-theme-detector", "/tools/wordpress-theme-detector"]);
  });
});