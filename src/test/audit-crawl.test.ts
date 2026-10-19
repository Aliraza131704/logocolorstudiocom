import { describe, expect, it } from "vitest";
import { crawlUrl, mergeAuditBatches, SITE_AUDIT_LIMIT } from "@/lib/audit-crawl";
import { summarizeAudit, type AuditReport } from "@/lib/audit-types";
const report: AuditReport = { version: 2, url: "https://example.com/", checkedAt: "2026-10-19", durationMs: 100, ...summarizeAudit([]), findings: [], pages: [{ url: "https://example.com/", title: "Home", status: 200, bytes: 200, responseMs: 50 }], limits: { maxPages: 1, maxLinks: 12 }, notes: [] };
describe("site-wide audit integrity", () => {
  it("extends the small sample with a bounded 100 URL limit", () => { expect(SITE_AUDIT_LIMIT).toBe(100); });
  it("excludes external, destructive, query and asset URLs", () => { for (const path of ["https://other.com/", "/checkout", "/a?q=1", "/download.zip"]) expect(crawlUrl(path, "https://example.com")).toBeNull(); });
  it("deduplicates page fragment URLs", () => { expect(crawlUrl("/about#team", "https://example.com")).toBe("https://example.com/about"); });
  it("retains a partial report when stopped", () => { const r = mergeAuditBatches([report], report.url, [report.url], 7, true); expect(r.crawl).toMatchObject({ stopped: true, pending: 7, complete: false }); });
  it("records unavailable pages rather than claiming them scanned", () => { const r = mergeAuditBatches([report], report.url, [report.url, "https://example.com/missing"], 0, false); expect(r.pages).toHaveLength(1); expect(r.crawl?.skipped).toEqual(["https://example.com/missing"]); });
  it("compares duplicate titles across separate batches", () => { const second = { ...report, pages: [{ ...report.pages[0], url: "https://example.com/about" }] }; expect(mergeAuditBatches([report, second], report.url, [], 0, false).findings.find(f => f.id === "site#duplicate-titles")?.status).toBe("Warning"); });
});