import { afterEach, describe, expect, it, vi } from "vitest";
import { inspectAuditPage } from "@/lib/audit-checks";
import { auditScore, summarizeAudit, type AuditFinding } from "@/lib/audit-types";
import { publicWebsiteUrl, isPublicAddress } from "@/lib/audit-url";
import { auditFetch, robotsAllowed } from "@/lib/audit-fetch.server";
import { auditCsv, readAuditHistory } from "@/lib/audit-report";

const page = { url: "https://example.com/", status: 200, bytes: 800, ms: 200, headers: { "content-type": "text/html" }, html: '<html lang="en"><head><title>A useful page title</title><script type="application/ld+json">{broken json}</script></head><body><h1>Hello</h1><h3>Jump</h3><img src="photo.webp"><form><input id="email"></form><p>teh buisness</p></body></html>' };
describe("evidence-based page inspection", () => {
  it("detects missing alt from actual HTML", () => { expect(inspectAuditPage(page).findings.find(f => f.id.endsWith("#alt"))?.status).toBe("Failed"); });
  it("detects invalid JSON-LD rather than counting a script tag", () => { expect(inspectAuditPage(page).findings.find(f => f.id.endsWith("#schema"))?.evidence).toContain("1 invalid JSON"); });
  it("detects heading skips", () => { expect(inspectAuditPage(page).findings.find(f => f.id.endsWith("#headings"))?.status).toBe("Failed"); });
  it("reports real limited spelling matches", () => { expect(inspectAuditPage(page).findings.find(f => f.id.endsWith("#spelling"))?.evidence).toContain("teh → the"); });
  it("does not grade a network duration as Core Web Vitals", () => { expect(inspectAuditPage(page).findings.find(f => f.id.endsWith("#duration"))?.status).toBe("Not Tested"); });
  it("does not submit forms", () => { expect(inspectAuditPage(page).findings.find(f => f.id.endsWith("#form-submission"))?.status).toBe("Not Tested"); });
});
describe("scores and coverage", () => {
  const findings = ["Passed", "Warning", "Failed", "Not Tested"].map(status => ({ status, category: "SEO" })) as AuditFinding[];
  it("excludes not-tested checks from score", () => { expect(auditScore(findings)).toBe(50); });
  it("includes not-tested checks in coverage", () => { expect(summarizeAudit(findings).coverage.percent).toBe(75); });
  it("does not produce a score without evidence", () => { expect(auditScore([{ status: "Not Tested" } as AuditFinding])).toBeNull(); });
});
describe("public website safety", () => {
  it.each(["http://127.0.0.1", "http://2130706433", "http://0x7f000001", "http://[::1]", "http://[::ffff:127.0.0.1]", "http://10.0.0.1", "http://169.254.169.254", "https://localhost", "https://x.internal", "https://user:pass@example.com", "https://example.com:8080", "file:///tmp/example"])("rejects unsafe URL %s", url => { expect(() => publicWebsiteUrl(url)).toThrow(); });
  it("accepts ordinary public addresses", () => { expect(publicWebsiteUrl("example.com").href).toBe("https://example.com/"); expect(isPublicAddress("8.8.8.8")).toBe(true); });
  it.each(["224.0.0.1", "100.64.0.1", "192.168.1.1", "fc00::1", "fe80::1"])("rejects non-public IP %s", address => { expect(isPublicAddress(address)).toBe(false); });
});
describe("robots exclusions", () => {
  it("honors a wildcard disallow", () => { expect(robotsAllowed("User-agent: *\nDisallow: /private", new URL("https://example.com/private/a"))).toBe(false); });
  it("honors more specific allow", () => { expect(robotsAllowed("User-agent: *\nDisallow: /private\nAllow: /private/public", new URL("https://example.com/private/public"))).toBe(true); });
  it("supports wildcard and end marker", () => { expect(robotsAllowed("User-agent: *\nDisallow: /*.pdf$", new URL("https://example.com/file.pdf"))).toBe(false); });
  it("uses bot-specific groups", () => { expect(robotsAllowed("User-agent: *\nDisallow: /\nUser-agent: LogoColorStudioBot\nAllow: /", new URL("https://example.com/"))).toBe(true); });
});
describe("safe report exports", () => {
  it("neutralizes spreadsheet formulas in evidence and branding", () => {
    const findings = inspectAuditPage(page).findings;
    findings[0].evidence = '=HYPERLINK("bad")';
    const report = { version: 2 as const, url: page.url, checkedAt: "2026-10-19T15:41:00Z", durationMs: 200, ...summarizeAudit(findings), findings, pages: [], limits: { maxPages: 1, maxLinks: 12 }, notes: [] };
    expect(auditCsv(report, "=danger")).toContain("'=danger");
    expect(auditCsv(report, "Test")).toContain("'=HYPERLINK");
  });
  it("ignores corrupt browser history", () => { expect(readAuditHistory('{broken')).toEqual([]); });
});
describe("bounded fetch safety", () => {
  afterEach(() => vi.unstubAllGlobals());
  const dns = () => new Response(JSON.stringify({ Status: 0, Answer: [{ type: 1, data: "8.8.8.8" }] }), { headers: { "content-type": "application/json" } });
  it("stops unsafe redirects before requesting the destination", async () => {
    const mock = vi.fn(async (url: string | URL) => String(url).startsWith("https://cloudflare-dns.com/") ? dns() : new Response(null, { status: 302, headers: { location: "http://127.0.0.1/" } }));
    vi.stubGlobal("fetch", mock);
    await expect(auditFetch("https://example.com/")).rejects.toThrow("not a public website");
    expect(mock.mock.calls.some(([url]) => String(url).includes("127.0.0.1"))).toBe(false);
  });
  it("refuses a host with any private DNS answer", async () => {
    const mock = vi.fn(async () => new Response(JSON.stringify({ Status: 0, Answer: [{ type: 1, data: "10.0.0.1" }] })));
    vi.stubGlobal("fetch", mock);
    await expect(auditFetch("https://example.com/")).rejects.toThrow("exclusively to public addresses");
    expect(mock).toHaveBeenCalledTimes(2);
  });
  it("caps downloaded body bytes", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string | URL) => String(url).startsWith("https://cloudflare-dns.com/") ? dns() : new Response("1234567890")));
    const response = await auditFetch("https://example.com/", "GET", 5);
    expect(response.html).toBe("12345"); expect(response.bytes).toBe(5); expect(response.truncated).toBe(true);
  });
});