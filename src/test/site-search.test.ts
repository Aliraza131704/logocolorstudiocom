import { describe, expect, it } from "vitest";
import { normalizeHex, searchItems, staticIndex } from "@/lib/site-search";

describe("site search", () => {
  it("finds a tool by name first", () => {
    expect(searchItems(staticIndex(), "cms")[0].title).toBe("CMS Detector");
  });
  it("finds palettes by tag", () => {
    expect(searchItems(staticIndex(), "pastel").some((r) => r.kind === "Palettes")).toBe(true);
  });
  it("normalizes hex input", () => {
    expect(normalizeHex("0a8cff")).toBe("#0A8CFF");
    expect(normalizeHex("#abc")).toBe("#AABBCC");
    expect(normalizeHex("blue")).toBeNull();
  });
});
