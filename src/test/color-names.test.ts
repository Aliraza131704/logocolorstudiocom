import { describe, expect, it } from "vitest";
import { NAMED_COLORS, colorFamily, getNamedColor, toCmyk } from "@/lib/color-names";
import { sitemapEntries } from "@/lib/sitemap";

describe("Color name pages", () => {
  it("covers the requested keyword colors with their standard HEX codes", () => {
    expect(getNamedColor("burgundy")?.hex).toBe("#800020");
    expect(getNamedColor("teal")?.hex).toBe("#008080");
    expect(getNamedColor("beige")?.hex).toBe("#F5F5DC");
    expect(getNamedColor("indigo")?.hex).toBe("#4B0082");
    expect(getNamedColor("periwinkle")?.hex).toBe("#CCCCFF");
  });

  it("has unique slugs", () => {
    expect(new Set(NAMED_COLORS.map((c) => c.slug)).size).toBe(NAMED_COLORS.length);
  });

  it("computes CMYK from HEX", () => {
    expect(toCmyk("#800020")).toEqual({ c: 0, m: 100, y: 75, k: 50 });
    expect(toCmyk("#000000")).toEqual({ c: 0, m: 0, y: 0, k: 100 });
  });

  it("groups logo colors into families for the brand filter", () => {
    expect(colorFamily("#9146FF")).toBe("purple");
    expect(colorFamily("#FF0000")).toBe("red");
    expect(colorFamily("#000000")).toBe("neutral");
  });

  it("lists every color page in the sitemap", () => {
    const paths = sitemapEntries([], []).map((u) => new URL(u.loc).pathname);
    expect(paths).toContain("/colors");
    for (const c of NAMED_COLORS) expect(paths).toContain(`/colors/${c.slug}`);
  });
});
