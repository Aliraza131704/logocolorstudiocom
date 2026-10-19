import { describe, expect, it } from "vitest";
import { getAllPalettes, PALETTE_TAGS } from "@/lib/palettes";
import { getIndexablePalettes, isIndexablePalette, paletteEditorial } from "@/lib/palette-editorial";
import { SITE_URL, pageHead } from "@/lib/seo";
import { renderSitemap, sitemapEntries } from "@/lib/sitemap";
import { contrastRatio, readableOn } from "@/lib/color";
import { TOOLS } from "@/lib/tools";
import { paletteTextColor } from "@/lib/palette-presentation";

describe("Palette indexing", () => {
  it("keeps exactly 150 unique base names indexable", () => {
    const selected = getIndexablePalettes();
    expect(selected).toHaveLength(150);
    expect(new Set(selected.map(p => p.slug)).size).toBe(150);
    expect(new Set(selected.map(p => p.name)).size).toBe(150);
  });
  it("includes 15 from each of the 10 palette tags", () => {
    for (const tag of PALETTE_TAGS) expect(getIndexablePalettes().filter(p => p.tags[0] === tag)).toHaveLength(15);
  });
  it("excludes every numeric suffix without changing the 1000 stable palette slugs", () => {
    expect(getAllPalettes()).toHaveLength(1000);
    expect(isIndexablePalette("coastal-breeze-70")).toBe(false);
    expect(isIndexablePalette("nordic-dawn-126")).toBe(false);
    expect(isIndexablePalette("golden-glacier-687")).toBe(false);
    for (const p of getAllPalettes().filter(p => /-\d+$/.test(p.slug))) expect(isIndexablePalette(p.slug)).toBe(false);
  });
  it("uses AA-readable text on all 150 live preview surfaces", () => {
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
  it("includes downloads and generator and excludes admin, login and numeric palettes", () => {
    const paths = sitemapEntries([], []).map(u => new URL(u.loc).pathname);
    expect(paths).toContain("/downloads");
    expect(paths).toContain("/tools/palette-generator");
    expect(paths).not.toContain("/admin");
    expect(paths).not.toContain("/login");
    expect(paths.filter(p => p.startsWith("/palette/"))).toHaveLength(150);
    expect(paths.some(p => /\/palette\/.*-\d+$/.test(p))).toBe(false);
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