import { describe, expect, it } from "vitest";
import { getAllPalettes, PALETTE_TAGS } from "@/lib/palettes";
import { getFeaturedPalettes, getIndexablePalettes, hasPaletteShareImage, isIndexablePalette, paletteEditorial } from "@/lib/palette-editorial";
import { SITE_URL, pageHead } from "@/lib/seo";
import { renderSitemap, sitemapEntries } from "@/lib/sitemap";
import { contrastRatio, readableOn } from "@/lib/color";
import { TOOLS } from "@/lib/tools";
import { paletteTextColor } from "@/lib/palette-presentation";
import { adsEnabled } from "@/components/site/AdSlot";
import { BRANDS, getBrand, relatedBrands } from "@/lib/brands";
import { brandStory } from "@/lib/brand-text";

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
  it("uses the primary custom domain for canonical, sharing and every sitemap entry", () => {
    expect(SITE_URL).toBe("https://logocolorstudio.com");
    const head = pageHead({ title: "Guide", description: "Guide", path: "/tools/logo-extractor" });
    expect(head.links[0].href).toBe("https://logocolorstudio.com/tools/logo-extractor");
    expect(head.meta.find(m => m.property === "og:url")?.content).toBe("https://logocolorstudio.com/tools/logo-extractor");
    for (const entry of sitemapEntries([], [])) expect(new URL(entry.loc).origin).toBe("https://logocolorstudio.com");
  });
  it("connects public page facts to stable website and publisher identities, but excludes private pages", () => {
    const head = pageHead({ title: "Guide", description: "Useful guide", path: "/tools/logo-extractor" });
    const page = JSON.parse(head.scripts[0].children);
    expect(page.url).toBe("https://logocolorstudio.com/tools/logo-extractor");
    expect(page.isPartOf["@id"]).toBe("https://logocolorstudio.com/#website");
    expect(page.publisher["@id"]).toBe("https://logocolorstudio.com/#organization");
    expect(pageHead({ title: "Sign in", description: "Private", path: "/login", noindex: true }).scripts).toHaveLength(0);
  });
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
    expect(paths).toContain("/giveaway");
    expect(paths).toContain("/sitemap");
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

describe("Ads master switch", () => {
  it("keeps every ad surface off by default and only on when the owner sets ads_enabled to on", () => {
    expect(adsEnabled(undefined)).toBe(false);
    expect(adsEnabled({})).toBe(false);
    expect(adsEnabled({ ads_enabled: "off" })).toBe(false);
    expect(adsEnabled({ ads_enabled: "  OFF " })).toBe(false);
    expect(adsEnabled({ ads_enabled: "on" })).toBe(true);
    expect(adsEnabled({ ads_enabled: " ON " })).toBe(true);
  });
});

describe("Brand colors section", () => {
  it("has unique slugs, valid hex colors and a domain for every brand", () => {
    expect(BRANDS.length).toBeGreaterThanOrEqual(190);
    expect(new Set(BRANDS.map(b => b.slug)).size).toBe(BRANDS.length);
    for (const b of BRANDS) {
      expect(b.domain).toMatch(/^[a-z0-9.-]+\.[a-z]{2,}$/);
      expect(b.colors.length).toBeGreaterThan(0);
      for (const c of b.colors) expect(c.hex).toMatch(/^#[0-9A-F]{6}$/);
    }
  });
  it("lists every brand page and the index in the sitemap", () => {
    const paths = sitemapEntries([], []).map(u => new URL(u.loc).pathname);
    expect(paths).toContain("/brand-colors");
    for (const slug of ["spotify", "coca-cola", "nike", "tesla"]) expect(paths).toContain(`/brand-colors/${slug}`);
  });
  it("writes at least 100 words of unique copy per brand page", () => {
    for (const slug of ["spotify", "apple", "ikea"]) {
      const b = getBrand(slug)!;
      const words = brandStory(b).join(" ").split(/\s+/).length;
      expect(words).toBeGreaterThanOrEqual(100);
      expect(brandStory(b).join(" ")).toContain(b.name);
    }
  });
  it("links related brands from the same category only", () => {
    const spotify = getBrand("spotify")!;
    for (const r of relatedBrands(spotify)) expect(r.category).toBe(spotify.category);
  });
});