import { describe, expect, it } from "vitest";
import { isBotUserAgent, isValidReferralCode, normalizeReferralCode, referrerHost, safeReferralTarget } from "@/lib/referrals";

describe("referral links", () => {
  it("turns a name into a URL-safe code", () => {
    expect(normalizeReferralCode("Facebook Group #1")).toBe("facebook-group-1");
    expect(isValidReferralCode("facebook-group-1")).toBe(true);
    expect(isValidReferralCode("-bad")).toBe(false);
  });

  it("only redirects to pages on this site", () => {
    expect(safeReferralTarget("tools/logo-extractor")).toBe("/tools/logo-extractor");
    expect(safeReferralTarget("https://www.logocolorstudio.com/downloads?x=1")).toBe("/downloads?x=1");
    expect(safeReferralTarget("https://evil.example/phish")).toBe("/");
    expect(safeReferralTarget("//evil.example")).toBe("/");
  });

  it("does not count link previews or crawlers", () => {
    expect(isBotUserAgent("WhatsApp/2.23")).toBe(true);
    expect(isBotUserAgent("facebookexternalhit/1.1")).toBe(true);
    expect(isBotUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0 Safari/537.36")).toBe(false);
  });

  it("keeps only the referring site's host", () => {
    expect(referrerHost("https://www.facebook.com/groups/123")).toBe("facebook.com");
  });
});
