import { describe, expect, it } from "vitest";
import { isPublicMediaPath } from "@/lib/media-path";

describe("public media paths", () => {
  it("serves blog cover, sharing and article images", () => {
    expect(isPublicMediaPath("covers/my-post-1.webp")).toBe(true);
    expect(isPublicMediaPath("og/share.png")).toBe(true);
    expect(isPublicMediaPath("posts/photo.jpg")).toBe(true);
  });
  it("refuses other folders, file types and path tricks", () => {
    expect(isPublicMediaPath("private/file.png")).toBe(false);
    expect(isPublicMediaPath("covers/file.pdf")).toBe(false);
    expect(isPublicMediaPath("covers/../secret.png")).toBe(false);
    expect(isPublicMediaPath("covers/sub/file.png")).toBe(false);
  });
});
