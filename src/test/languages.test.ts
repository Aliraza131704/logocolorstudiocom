import { describe, expect, it } from "vitest";
import { LANGUAGES, suggestLanguage } from "@/lib/languages";

describe("region-based language suggestion", () => {
  it("offers Urdu to visitors in Pakistan even with an English browser", () => {
    expect(suggestLanguage(["en-US", "en"], "Asia/Karachi")).toBe("ur");
  });
  it("offers Urdu when the browser prefers Urdu", () => {
    expect(suggestLanguage(["ur-PK"], "Asia/Dubai")).toBe("ur");
  });
  it("keeps English for USA and UK visitors", () => {
    expect(suggestLanguage(["en-US"], "America/New_York")).toBeNull();
    expect(suggestLanguage(["en-GB"], "Europe/London")).toBeNull();
  });
  it("offers European languages by browser language or region", () => {
    expect(suggestLanguage(["de-DE"], "Europe/Berlin")).toBe("de");
    expect(suggestLanguage(["en-GB"], "Europe/Paris")).toBe("fr");
    expect(suggestLanguage(["es-US"], "America/Los_Angeles")).toBe("es");
    expect(suggestLanguage(["en"], "Europe/Rome")).toBe("it");
  });
  it("does not offer unsupported languages", () => {
    expect(suggestLanguage(["ja-JP"], "Asia/Tokyo")).toBeNull();
  });
  it("includes Urdu and English in the language list", () => {
    const codes = LANGUAGES.map((l) => l.code);
    expect(codes).toContain("ur");
    expect(codes[0]).toBe("en");
  });
});
