import type { AuditReport } from "./audit-types";

function csvCell(value: unknown) {
  let text = String(value ?? "");
  // Treat spreadsheet formulas as text, including formulas after whitespace.
  if (/^\s*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function auditCsv(report: AuditReport, brand: string) {
  const headings = ["Report brand", "Audit URL", "Timestamp", "Overall score", "Coverage %", "Pages scanned", "Category", "Severity", "Status", "Finding", "Affected URL", "Evidence", "Explanation", "Suggested fix", "Implementation example", "Scope notes"];
  return "\uFEFF" + [headings, ...report.findings.map(f => [brand, report.url, report.checkedAt, report.score ?? "Not Tested", report.coverage.percent, report.pages.length, f.category, f.severity, f.status, f.label, f.url, f.evidence, f.explanation, f.fix, f.example ?? "", report.notes.join(" | ")])].map(row => row.map(csvCell).join(",")).join("\r\n");
}

export async function exportAuditPdf(report: AuditReport, brand: string) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(brand || "LogoColorStudio", 14, 18);
  doc.setFontSize(11);
  doc.text("Website audit report", 14, 27);
  autoTable(doc, {
    startY: 34, theme: "plain", body: [
      ["Website", report.url], ["Checked at", report.checkedAt],
      ["Score / tested coverage", `${report.score ?? "Not Tested"}/100 · ${report.coverage.percent}% (${report.coverage.tested}/${report.coverage.total})`],
      ["Pages / duration", `${report.pages.length} · ${report.durationMs} ms`],
      ...report.groups.map(g => [g.category, `${g.score ?? "Not Tested"}${g.score === null ? "" : "/100"} · ${g.tested}/${g.total} checks tested`]),
      ["Scope and limitations", report.notes.join("\n")],
    ], styles: { fontSize: 9, overflow: "linebreak", cellPadding: 3 }, columnStyles: { 0: { cellWidth: 47 }, 1: { cellWidth: 135 } },
  });
  doc.addPage();
  autoTable(doc, {
    head: [["Category / status", "Finding and evidence", "Recommendation"]],
    body: report.findings.map(f => [
      `${f.category}\n${f.status}\n${f.severity.toUpperCase()}`,
      `${f.label}\n${f.url}\n\n${f.evidence}\n\n${f.explanation}`,
      `${f.fix}${f.example ? `\n\nExample:\n${f.example}` : ""}`,
    ]), theme: "grid", styles: { fontSize: 8, overflow: "linebreak", cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 28 }, 1: { cellWidth: 80 }, 2: { cellWidth: 74 } },
    didDrawPage: () => { doc.setFontSize(8); doc.text(`${brand || "Website audit"} · ${report.checkedAt} · Page ${doc.getNumberOfPages()}`, 14, 290); },
  });
  doc.save("website-audit.pdf");
}

export const AUDIT_HISTORY_KEY = "lcs-audit-history-v2";
export function readAuditHistory(raw: string | null): AuditReport[] {
  try {
    const parsed: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is AuditReport => {
      if (!item || typeof item !== "object") return false;
      const r = item as Partial<AuditReport>;
      return r.version === 2 && typeof r.url === "string" && typeof r.checkedAt === "string" && Array.isArray(r.findings) && Array.isArray(r.pages) && Array.isArray(r.groups) && !!r.coverage && typeof r.coverage.percent === "number" && Array.isArray(r.notes);
    }).slice(0, 10);
  } catch { return []; }
}