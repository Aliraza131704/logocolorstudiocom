import { summarizeAudit, type AuditReport } from "./audit-types";

export const SITE_AUDIT_LIMIT = 100;
export function crawlUrl(href: string, origin: string): string | null {
  try {
    const u = new URL(href, origin);
    u.hash = "";
    if (u.origin !== origin || u.username || u.password || u.search || !/^https?:$/.test(u.protocol) || /\.(pdf|zip|png|jpe?g|gif|webp|svg|mp4|mp3|css|js|xml)$/i.test(u.pathname) || /\/(logout|signout|delete|remove|cart|checkout)(\/|$)/i.test(u.pathname)) return null;
    return u.href;
  } catch { return null; }
}

export function mergeAuditBatches(reports: AuditReport[], target: string, attempted: string[], pending: number, stopped: boolean): AuditReport {
  const first = reports[0];
  if (!first) throw new Error("No public pages could be audited.");
  const pages = [...new Map(reports.flatMap(r => r.pages).map(p => [p.url, p])).values()];
  const findings = [...new Map(reports.flatMap(r => r.findings).filter(f => !f.id.endsWith("#duplicate-titles")).map(f => [`${f.url}|${f.label}`, f])).values()];
  const duplicates = pages.filter((p, i) => p.title && pages.findIndex(other => other.title === p.title) !== i);
  if (pages.length > 1) findings.push({ id: "site#duplicate-titles", category: "SEO", label: "Duplicate titles across scanned pages", status: duplicates.length ? "Warning" : "Passed", severity: "medium", url: target, evidence: duplicates.length ? duplicates.map(p => `${p.url}: ${p.title}`).join("; ") : `${pages.length} scanned pages have distinct non-empty titles`, explanation: "Only successfully scanned pages are compared.", fix: "Give distinct pages unique titles." });
  return { ...first, url: target, ...summarizeAudit(findings), pages, findings, durationMs: reports.reduce((sum, r) => sum + r.durationMs, 0), limits: { maxPages: SITE_AUDIT_LIMIT, maxLinks: first.limits.maxLinks }, crawl: { attempted: attempted.length, pending, stopped, skipped: attempted.filter(url => !pages.some(p => p.url === url)), complete: !stopped && pending === 0 }, notes: [...new Set(reports.flatMap(r => r.notes).filter(n => !n.includes("page limit used"))) , `${pages.length} pages scanned; ${attempted.length} URLs attempted; ${pending} discovered URLs remain. ${stopped ? "Stopped by you; partial report." : pending ? "100-page attempt limit reached; partial report." : "Discovery queue exhausted; hidden, unlinked, query-string, restricted and JavaScript-only pages may remain."}`, "Site-wide checks run in small batches. Duration excludes pauses between batches. Scores cover downloaded HTML, not every page on the internet."] };
}