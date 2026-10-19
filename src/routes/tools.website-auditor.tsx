import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Search, SlidersHorizontal, History, Trash2, RotateCcw, ArrowRight, Globe } from "lucide-react";
import { ToolLayout } from "@/components/site/ToolLayout";
import { ErrorNote } from "@/components/site/tool-parts";
import { AuditResults } from "@/components/site/AuditResults";
import { faqLd, breadcrumbLd, type Faq } from "@/components/site/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auditWebsite } from "@/lib/analyze.functions";
import { AUDIT_HISTORY_KEY, readAuditHistory } from "@/lib/audit-report";
import type { AuditReport } from "@/lib/audit-types";
import { crawlUrl, mergeAuditBatches, SITE_AUDIT_LIMIT } from "@/lib/audit-crawl";
import { pageHead } from "@/lib/seo";

const FAQS: Faq[] = [
  { q: "Can it scan my whole website?", a: "Site-wide mode discovers same-site pages through links and the sitemap, scanning up to 100 URLs in small batches. Keep this tab open. Hidden, blocked, query-string and JavaScript-only pages may not be discovered; the report discloses partial coverage. Focused mode scans one to three pages." },
  { q: "What does the Website Auditor test?", a: "It checks SEO, static accessibility signals, security headers, HTML size, images, forms, navigation, schema, common English typos and CMS fingerprints. Link and image availability checks sample permitted same-origin URLs per batch." },
  { q: "How are the score and coverage calculated?", a: "Passed checks earn one point, warnings half and failed checks zero. Not Tested checks are excluded from scores and included in the coverage denominator. Scores reflect the tested sample, not overall business or website quality." },
  { q: "Does it capture screenshots or execute JavaScript?", a: "Not currently. Browser rendering, layout overlaps, mobile interaction, JavaScript errors, complete grammar analysis and Core Web Vitals are explicitly marked Not Tested. No metrics are invented." },
  { q: "Can I download reports and save scans?", a: "Yes. Download actual PDF, CSV and JSON reports with evidence and recommendations. Up to ten reports are saved only in this browser for history, URL reuse and score comparisons. They are not synced to an account." },
  { q: "Are scheduled scans and email alerts available?", a: "Not currently. Scans run when you start them. Background schedules, email delivery and public auditor accounts are not connected. Existing owner access is unchanged." },
];

export const Route = createFileRoute("/tools/website-auditor")({
  head: () =>
    pageHead({
      title: "Website Auditor — Evidence & Reports | LogoColorStudio",
      description: "Audit public website HTML with real evidence, category scores, coverage, link checks and CMS detection. Compare scans and export PDF, CSV or JSON.",
      path: "/tools/website-auditor",
      jsonLd: [faqLd(FAQS), breadcrumbLd([{ label: "Tools", to: "/tools" }, { label: "Website Auditor" }], "/tools/website-auditor"), { "@context": "https://schema.org", "@type": "WebApplication", name: "Website Auditor", applicationCategory: "BusinessApplication", operatingSystem: "Any" }],
    }),
  component: Page,
});

function Page() {
  const fn = useServerFn(auditWebsite);
  const [url, setUrl] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [maxPages, setMaxPages] = useState(1);
  const [siteWide, setSiteWide] = useState(true);
  const stop = useRef(false);
  const [stopping, setStopping] = useState(false);
  useEffect(() => () => { stop.current = true; }, []);
  const [checkLinks, setCheckLinks] = useState(true);
  const [checkImages, setCheckImages] = useState(true);
  const [settings, setSettings] = useState(false);
  const [res, setRes] = useState<AuditReport | null>(null);
  const [competitor, setCompetitor] = useState<AuditReport | null>(null);
  const [history, setHistory] = useState<AuditReport[]>([]);
  const [err, setErr] = useState("");
  const [storageNote, setStorageNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("");
  useEffect(() => { try { setHistory(readAuditHistory(localStorage.getItem(AUDIT_HISTORY_KEY))); } catch { setStorageNote("Browser history storage is unavailable."); } }, []);
  const remember = (report: AuditReport) => {
    setHistory(old => {
      const next = [report, ...old.filter(r => r.checkedAt !== report.checkedAt)].slice(0, 10);
      try { localStorage.setItem(AUDIT_HISTORY_KEY, JSON.stringify(next)); } catch { setStorageNote("This report could not be saved in your browser. Download it to keep a copy."); }
      return next;
    });
  };
  const run = async (address = url) => {
    if (loading || !address.trim()) return;
    stop.current = false; setStopping(false);
    setLoading(true); setErr(""); setRes(null); setCompetitor(null);
    setStage("Fetching permitted pages and evaluating evidence…");
    try {
      const scan = async (input: string, primary = true): Promise<AuditReport> => {
        if (!siteWide) return fn({ data: { url: input, maxPages, checkLinks, checkImages } });
        const started = Date.now();
        const first = await fn({ data: { url: input, maxPages: 1, checkLinks, checkImages, discoverSite: true } });
        const target = first.url;
        const origin = new URL(target).origin;
        const reports = [first];
        const attempted = new Set(first.pages.map(p => p.url));
        const queue: string[] = [];
        const enqueue = (urls: string[]) => urls.forEach(href => { const u = crawlUrl(href, origin); if (u && !attempted.has(u) && !queue.includes(u) && queue.length < 1000) queue.push(u); });
        enqueue(first.discovered ?? []);
        let lastRequest = started;
        while (queue.length && attempted.size < SITE_AUDIT_LIMIT && !stop.current) {
          if (primary) setRes(mergeAuditBatches(reports, target, [...attempted], queue.length, false));
          setStage(`${reports.reduce((sum, r) => sum + r.pages.length, 0)} pages scanned · ${queue.length} discovered pages waiting · keep this tab open`);
          // Pace batches below the existing five-requests-per-minute safety limit.
          while (Date.now() - lastRequest < 16_000 && !stop.current) await new Promise(resolve => setTimeout(resolve, 250));
          if (stop.current) break;
          const batch = queue.splice(0, Math.min(3, SITE_AUDIT_LIMIT - attempted.size));
          batch.forEach(u => attempted.add(u));
          lastRequest = Date.now();
          try {
            const next = await fn({ data: { url: target, maxPages: batch.length, pageUrls: batch, checkLinks, checkImages } });
            reports.push(next); enqueue(next.discovered ?? []);
          } catch (error) {
            const message = error instanceof Error ? error.message : "Batch unavailable";
            reports[0].notes.push(`${batch.join(", ")}: ${message}`);
            if (/Too many audits|request checks|crawl policy/i.test(message)) { queue.unshift(...batch); batch.forEach(u => attempted.delete(u)); stop.current = true; setErr(`Partial report saved. ${message}`); }
          }
        }
        return mergeAuditBatches(reports, target, [...attempted], queue.length, stop.current);
      };
      const report = await scan(address.trim());
      setRes(report); remember(report);
      if (competitorUrl.trim() && !stop.current) {
        setStage("Auditing the competitor with the same settings…");
        if (siteWide) for (let i = 0; i < 64 && !stop.current; i++) await new Promise(resolve => setTimeout(resolve, 250));
        try { if (!stop.current) setCompetitor(await scan(competitorUrl.trim(), false)); }
        catch (error) { setErr(`Your report is ready. Competitor scan: ${error instanceof Error ? error.message : "Unavailable"}`); }
      }
    } catch (error) { setErr(error instanceof Error ? error.message : "Audit unavailable. Please try again."); }
    finally { setLoading(false); setStage(""); }
  };
  const previous = res ? history.find(r => r.url === res.url && r.checkedAt !== res.checkedAt) : undefined;
  return (
    <ToolLayout slug="website-auditor" title="Website Auditor" intro="Inspect your website. Find the evidence. Prioritize what matters." faqs={FAQS} about={<About />}>
      <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground"><span className="flex items-center gap-2"><Globe className="size-4 text-primary" /> Public websites</span><span>17 audit categories</span><span>Evidence-based recommendations</span></div>
      <form onSubmit={e => { e.preventDefault(); void run(); }} className="space-y-4">
        <div className="flex flex-wrap gap-2" aria-label="Scan scope"><Button type="button" variant={siteWide ? "default" : "outline"} aria-pressed={siteWide} disabled={loading} onClick={() => setSiteWide(true)}>Site-wide scan</Button><Button type="button" variant={!siteWide ? "default" : "outline"} aria-pressed={!siteWide} disabled={loading} onClick={() => setSiteWide(false)}>Focused scan</Button></div>
        {siteWide && <p className="text-xs text-muted-foreground">Up to 100 public URLs · sitemap and link discovery · keep this tab open · restricted and undiscovered pages are not scanned.</p>}
        <label htmlFor="audit-url" className="block text-sm font-semibold">Website address</label>
        <div className="flex flex-col gap-2 sm:flex-row"><div className="relative min-w-0 flex-1"><Search className="absolute left-4 top-4 size-4 text-muted-foreground" /><Input id="audit-url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" maxLength={500} className="h-12 bg-card pl-11 text-base" disabled={loading} required /></div><Button type="submit" variant="hero" size="lg" disabled={loading || !url.trim()}>{loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}{loading ? "Auditing…" : "Run audit"}</Button></div>
        <Button type="button" variant="ghost" size="sm" onClick={() => setSettings(!settings)} aria-expanded={settings} aria-controls="audit-settings"><SlidersHorizontal />Audit settings</Button>
        {settings && <div id="audit-settings" className="grid gap-5 border-y py-5 sm:grid-cols-2"><div><label htmlFor="audit-pages" className="mb-2 block text-sm font-medium">Page limit</label><select id="audit-pages" className="h-10 w-full rounded-md border bg-card px-3 text-sm" value={maxPages} onChange={e => setMaxPages(Number(e.target.value))} disabled={loading || siteWide}><option value={1}>1 page · focused scan</option><option value={2}>2 pages · small sample</option><option value={3}>3 pages · extended sample</option></select></div><div><label htmlFor="audit-competitor" className="mb-2 block text-sm font-medium">Competitor website <span className="text-muted-foreground">(optional)</span></label><Input id="audit-competitor" value={competitorUrl} onChange={e => setCompetitorUrl(e.target.value)} placeholder="https://competitor.com" maxLength={500} disabled={loading} /></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={checkLinks} onChange={e => setCheckLinks(e.target.checked)} disabled={loading} />Check up to 12 same-site links</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={checkImages} onChange={e => setCheckImages(e.target.checked)} disabled={loading} />Check up to 4 same-site images</label><p className="text-xs text-muted-foreground sm:col-span-2">Static HTML · no form submissions · respects crawl restrictions. Browser screenshots, scheduled scans and email alerts are not connected.</p></div>}
      </form>
      {loading && <div className="mt-6 flex flex-wrap items-center gap-3 border-y py-6" role="status" aria-live="polite"><Loader2 className="size-5 animate-spin text-primary" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{stage}</p><p className="mt-1 text-xs text-muted-foreground">{siteWide ? "Batches are paced to respect scan limits. Stopping finishes the current batch and keeps a partial report." : "Progress is indeterminate; no fabricated completion percentage."}</p></div><Button type="button" variant="outline" disabled={stopping} onClick={() => { stop.current = true; setStopping(true); }}>{stopping ? "Stopping…" : "Stop scan"}</Button></div>}
      {err && <ErrorNote msg={err} />}
      {res && <AuditResults key={res.checkedAt} report={res} competitor={competitor} previous={previous} />}
      <section className="mt-8 border-t pt-5"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-base font-semibold"><History className="size-4" /> Saved audits</h2>{history.length > 0 && <Button variant="ghost" size="sm" onClick={() => { setHistory([]); try { localStorage.removeItem(AUDIT_HISTORY_KEY); } catch { setStorageNote("Browser storage could not be cleared."); } }}><Trash2 />Clear history</Button>}</div><p className="mt-2 text-xs text-muted-foreground">Last 10 reports · saved only in this browser · no account sync</p>{storageNote && <p role="status" className="mt-2 text-sm">{storageNote}</p>}{history.length ? <div className="mt-3 divide-y">{history.map(report => <div key={report.checkedAt} className="flex flex-wrap items-center gap-3 py-3"><div className="min-w-0 flex-1"><p className="break-all text-sm font-medium">{report.url}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(report.checkedAt).toLocaleString()} · score {report.score ?? "—"} · {report.coverage.percent}% coverage</p></div><Button variant="outline" size="sm" disabled={loading} onClick={() => { setRes(report); setCompetitor(null); setErr(""); }}>Open report</Button><Button variant="ghost" size="icon" title="Rescan website" aria-label={`Rescan ${report.url}`} disabled={loading} onClick={() => { setUrl(report.url); void run(report.url); }}><RotateCcw className="size-4" /></Button></div>)}</div> : <p className="py-6 text-sm text-muted-foreground">No saved audits yet.</p>}</section>
    </ToolLayout>
  );
}

function About() {
  return (
    <>
      <h2>A quick health check for any website</h2>
      <p>The Website Auditor scans a public page and checks static HTML signals related to search, sharing, accessibility, security and usability. You get category scores for tested checks, an explicit coverage summary and a plain-English recommendation with actual evidence. Unsupported browser checks are marked Not Tested.</p>
      <h2>What we check</h2>
      <ul>
        <li><strong>SEO:</strong> title length, meta description, a single H1, canonical tag, noindex, robots.txt, sitemap, JSON-LD schema, Open Graph tags and the language attribute.</li>
        <li><strong>Mobile:</strong> a correct responsive viewport tag.</li>
        <li><strong>Security:</strong> HTTPS and the HSTS header.</li>
        <li><strong>Accessibility:</strong> alt text on images.</li>
        <li><strong>Performance:</strong> downloaded HTML size and external script count. Fetch duration is an observation, not a graded speed metric. Browser performance and compression are not tested.</li>
        <li><strong>Links:</strong> a sample of up to 12 links checked for 4xx and 5xx errors.</li>
      </ul>
      <h2>How to run an audit</h2>
      <ol>
        <li>Enter the full address of the page you want to audit.</li>
        <li>Click <strong>Run audit</strong>.</li>
        <li>Start with red items, then orange warnings. Each one has a suggested fix.</li>
        <li>Export a PDF, CSV or JSON report, with your chosen report name.</li>
      </ol>
      <h2>Next steps</h2>
      <p>After fixing issues, re-run the audit to confirm your score improved. Then submit your sitemap in Google Search Console. Curious what platform a site is built on? Try the <Link to="/tools/cms-detector">CMS Detector</Link>. Want your colors to pass accessibility too? Use the <Link to="/tools/contrast-checker">Contrast Checker</Link>.</p>
    </>
  );
}
