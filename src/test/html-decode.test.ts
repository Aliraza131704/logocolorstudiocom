import { describe, expect, it } from "vitest";
import { decode } from "@/lib/analyze.server";

describe("page title decoding", () => {
  it("turns numeric character codes into the real symbols", () => {
    expect(decode("WordPress News &#124; The latest")).toBe("WordPress News | The latest");
    expect(decode("Caf&#xE9; &amp; Bar")).toBe("Café & Bar");
  });
});
