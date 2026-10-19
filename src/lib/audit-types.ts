export const AUDIT_CATEGORIES = ["SEO", "Content", "CRO", "Accessibility", "Security", "Performance", "Images", "Links", "Forms", "Navigation", "Mobile", "Schema", "Local SEO", "E-commerce", "Technology", "Visual", "JavaScript"] as const;
export type AuditCategory = typeof AUDIT_CATEGORIES[number];
export type AuditStatus = "Passed" | "Failed" | "Warning" | "Not Tested";
export type AuditSeverity = "critical" | "high" | "medium" | "low";
export type AuditFinding = { id: string; category: AuditCategory; label: string; status: AuditStatus; severity: AuditSeverity; url: string; evidence: string; explanation: string; fix: string; example?: string };
export type AuditPage = { url: string; status: number; bytes: number; responseMs: number; title: string };
export type AuditReport = {
  version: 2; url: string; checkedAt: string; durationMs: number; score: number | null;
  groups: { category: AuditCategory; score: number | null; tested: number; total: number }[];
  findings: AuditFinding[]; pages: AuditPage[]; coverage: { tested: number; total: number; percent: number };
  limits: { maxPages: number; maxLinks: number }; notes: string[];
  discovered?: string[];
  crawl?: { attempted: number; pending: number; stopped: boolean; skipped: string[]; complete: boolean };
};
export type AuditOptions = { url: string; maxPages: number; checkLinks: boolean; checkImages: boolean; pageUrls?: string[]; discoverSite?: boolean };
export const MAX_AUDIT_PAGES = 3;
export const MAX_AUDIT_LINKS = 12;

export function auditScore(findings: AuditFinding[]) {
  const tested = findings.filter(f => f.status !== "Not Tested");
  if (!tested.length) return null;
  return Math.round(100 * tested.reduce((sum, f) => sum + (f.status === "Passed" ? 1 : f.status === "Warning" ? 0.5 : 0), 0) / tested.length);
}
export function summarizeAudit(findings: AuditFinding[]) {
  const tested = findings.filter(f => f.status !== "Not Tested").length;
  return { score: auditScore(findings), groups: AUDIT_CATEGORIES.map(category => {
    const list = findings.filter(f => f.category === category);
    return { category, score: auditScore(list), tested: list.filter(f => f.status !== "Not Tested").length, total: list.length };
  }), coverage: { tested, total: findings.length, percent: findings.length ? Math.round(tested / findings.length * 100) : 0 } };
}