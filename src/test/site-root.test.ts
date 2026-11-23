import { describe, expect, it } from "vitest";
import { publicWebsiteUrl, siteRoot } from "@/lib/audit-url";

describe("detector target", () => {
  it("visits only the website homepage, dropping caller-chosen paths and queries", () => {
    expect(siteRoot(publicWebsiteUrl("https://Shop.Brand.co/api/delete?id=1#x")).href).toBe("https://shop.brand.co/");
  });
  it("keeps the website's own protocol", () => {
    expect(siteRoot(publicWebsiteUrl("http://brand.co/blog/post")).href).toBe("http://brand.co/");
  });
});
