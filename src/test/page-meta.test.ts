import { describe, expect, it } from "vitest";
import { PAGE_META, paletteMeta, brandMeta, colorNameMeta, type PageMeta } from "@/lib/page-meta";
import { getAllPalettes } from "@/lib/palettes";
import { BRANDS } from "@/lib/brands";
import { NAMED_COLORS } from "@/lib/color-names";
import { pageHead } from "@/lib/seo";
import { withMeta } from "@/lib/tool-overrides";

const all: [string, PageMeta][] = [
  ...Object.entries(PAGE_META),
  ...getAllPalettes().map((p) => [`/palette/${p.slug}`, paletteMeta(p)] as [string, PageMeta]),
  ...BRANDS.map((b) => [`/brand-colors/${b.slug}`, brandMeta(b)] as [string, PageMeta]),
  ...NAMED_COLORS.map((c) => [`/colors/${c.slug}`, colorNameMeta(c)] as [string, PageMeta]),
];

describe("Search titles and descriptions", () => {
  it("keeps every title at 60 characters or fewer", () => {
    for (const [path, m] of all) expect(m.title.length, path).toBeLessThanOrEqual(60);
  });
  it("starts the homepage title with the brand and ends every other title with '| LogoColorStudio'", () => {
    expect(PAGE_META["/"].title.startsWith("LogoColorStudio")).toBe(true);
    for (const [path, m] of all) if (path !== "/") expect(m.title.endsWith(" | LogoColorStudio"), path).toBe(true);
  });
  it("keeps every description between 140 and 155 characters", () => {
    for (const [path, m] of all) {
      expect(m.description.length, path).toBeGreaterThanOrEqual(140);
      expect(m.description.length, path).toBeLessThanOrEqual(155);
    }
  });
  it("keeps social titles to 60 and social descriptions to 100 characters", () => {
    for (const [path, m] of all) {
      expect(m.ogTitle.length, path).toBeLessThanOrEqual(60);
      expect(m.ogDescription.length, path).toBeLessThanOrEqual(100);
    }
  });
  it("never repeats a title or description on two pages", () => {
    expect(new Set(all.map(([, m]) => m.title)).size).toBe(all.length);
    expect(new Set(all.map(([, m]) => m.description)).size).toBe(all.length);
  });
  it("never uses the word AI or emoji", () => {
    for (const [path, m] of all) for (const v of Object.values(m)) {
      expect(v, path).not.toMatch(/\bAI\b/);
      expect(v, path).not.toMatch(/\p{Extended_Pictographic}/u);
    }
  });
  it("sends the social copy to Open Graph and the search copy to the title tag", () => {
    const head = pageHead({ ...PAGE_META["/tools/logo-extractor"], path: "/tools/logo-extractor" });
    expect(head.meta.find((m) => "title" in m)?.title).toBe("Logo Color Changer & HEX Code Extractor | LogoColorStudio");
    expect(head.meta.find((m) => m.property === "og:title")?.content).toBe("Logo Color Changer & HEX Code Extractor");
  });
  it("lets an owner-edited title from Admin replace both search and social titles", () => {
    const m = withMeta({ metaTitle: "Owner title", metaDescription: "Owner text" } as never, PAGE_META["/"]);
    expect([m.title, m.ogTitle, m.description, m.ogDescription]).toEqual(["Owner title", "Owner title", "Owner text", "Owner text"]);
  });
});
