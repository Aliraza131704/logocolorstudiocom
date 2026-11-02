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
import { getPublicSetting } from "@/lib/content.functions";
import { TOOL_CONTENT_KEY, toolOverride } from "@/lib/tool-overrides";
import auditScanImg from "@/assets/guide-audit-scan.jpg";
import seoReportImg from "@/assets/guide-seo-report.jpg";

const FAQS: Faq[] = [
  { q: "What does this website auditor check?", a: "It evaluates publicly fetched HTML and related response details across SEO, content, accessibility, security, performance-related static signals, links, images, forms, navigation, schema and other categories. Each finding includes its status, evidence and recommendation." },
  { q: "Can I audit an entire website?", a: "Yes. Site-wide mode discovers pages through same-site links and the sitemap and scans up to 100 URLs in paced batches. Keep the tab open. Pages hidden from discovery, blocked, restricted, or rendered only by JavaScript may not appear." },
  { q: "What is focused mode?", a: "Focused mode checks a selected sample of one to three pages. It is useful for an individual landing page or a quick representative review, but it should not be mistaken for complete site coverage." },
  { q: "Does the audit execute JavaScript or render pages?", a: "No. It inspects static HTML and response data. It does not execute page scripts, take screenshots, assess layout interactions, or measure browser-rendered behavior." },
  { q: "Does it measure Core Web Vitals?", a: "No. It does not measure Core Web Vitals, real-user experience, or lab performance metrics. HTML size and fetch timing may be shown as observations, not as a substitute for browser performance measurement." },
  { q: "How should I interpret the score?", a: "Passed checks receive one point, warnings half a point and failed checks zero; Not Tested checks are excluded from the score. Coverage is shown separately. Scores describe tested checks in this report, not overall site quality or search rankings." },
  { q: "What SEO elements are reviewed?", a: "Static checks include title and description signals, headings, canonical and robots directives, sitemap and robots.txt signals, structured data, Open Graph and language attributes. A present tag does not prove that search engines will index or rank a page." },
  { q: "Are all links and images checked?", a: "No. Link checks sample up to 12 same-site links and image checks sample up to 4 same-site images per request, when enabled. External destinations and every asset are not comprehensively validated." },
  { q: "Can it audit private pages?", a: "No. It is designed for public HTTP or HTTPS websites and cannot sign into accounts, submit forms, or inspect pages that require authentication." },
  { q: "Can I export or revisit reports?", a: "Reports can be exported as PDF, CSV or JSON. The latest ten reports are kept in this browser only for history and comparisons; they are not synced to an account." },
  { q: "Are scheduled scans or email alerts available?", a: "No. Scans start when you run them. Scheduled background audits and email alerts are not connected." },
  { q: "Why is coverage partial?", a: "Some pages may be undiscovered, unavailable, restricted by crawl rules, or skipped when a scan is stopped. Read the report's coverage and notes to understand exactly what was included." },
];

export const Route = createFileRoute("/tools/website-auditor")({
  loader: () => getPublicSetting({ data: { key: TOOL_CONTENT_KEY } }),
  head: ({ loaderData }) => {
    const o = toolOverride(loaderData, "website-auditor");
    return
    pageHead({
      title: o?.metaTitle ?? "Website Auditor — Evidence & Reports | LogoColorStudio",
      description: o?.metaDescription ?? "Audit public website HTML with real evidence, category scores, coverage, link checks and CMS detection. Compare scans and export PDF, CSV or JSON.",
      path: "/tools/website-auditor",
      jsonLd: [faqLd(o?.faqs ?? FAQS), breadcrumbLd([{ label: "Tools", to: "/tools" }, { label: "Website Auditor" }], "/tools/website-auditor"), { "@context": "https://schema.org", "@type": "WebApplication", name: "Website Auditor", applicationCategory: "BusinessApplication", operatingSystem: "Any" }],
    });
  },
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
    <ToolLayout slug="website-auditor" title="Free Website Auditor – SEO & Site Health Check" intro="Inspect your website. Find the evidence. Prioritize what matters." faqs={FAQS} about={<About />}>
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
      <h2>A practical, evidence-led website health check</h2>
      <p>A useful website review begins with observable facts. The Website Auditor examines public HTML and response details, then organizes findings into categories with a status, evidence, explanation and suggested next step. Instead of presenting a mysterious grade alone, it shows which checks were performed and how much of the possible check set was actually tested. That distinction matters: a report with limited coverage should not be read as a full-site certification.</p>
      <p>Use the auditor to spot common on-page SEO omissions, review selected accessibility and security signals, notice basic content or navigation issues, and make a prioritized list for a human to verify. For an individual URL, focused mode can inspect a sample of one to three pages. Site-wide mode discovers same-site URLs from links and a sitemap and scans up to 100 pages in paced batches. The scan may take time; leave the browser tab open and consult the coverage and crawl notes when it finishes.</p>
      <p>This is a static analysis tool, not a browser laboratory. It does not render the site, run its JavaScript, submit forms, take screenshots, or measure Core Web Vitals. It cannot see logged-in content or guarantee that a search engine crawls, indexes, or ranks a page. Treat findings as a transparent starting point for investigation, not a replacement for Search Console, analytics, accessibility testing with assistive technology, or real-user performance data.</p>
      <figure><img src={auditScanImg} alt="Website audit scan reviewing public page signals and organizing findings" width={1200} height={688} loading="lazy" className="rounded-2xl border" /><figcaption>A scan collects publicly available page evidence and groups checks for review.</figcaption></figure>
      <h2>How to run a website audit</h2>
      <ol>
        <li><strong>Choose a public address.</strong> Enter a website URL that loads without signing in. Use a page you own or are authorized to review.</li>
        <li><strong>Select the scope.</strong> Choose site-wide discovery for a broader crawl of up to 100 URLs, or focused mode for a deliberate one-to-three-page sample.</li>
        <li><strong>Set optional checks.</strong> In audit settings, choose whether to sample same-site links and images. These checks have limits and do not inspect every destination or asset.</li>
        <li><strong>Start the scan and keep the tab open.</strong> Site-wide pages are processed in paced batches. You may stop the scan and retain a partial result.</li>
        <li><strong>Read evidence and coverage together.</strong> Review findings by category, distinguish failed checks from warnings and Not Tested items, and note pages skipped or still pending.</li>
        <li><strong>Prioritize, fix, and verify.</strong> Make changes in your site platform, then rerun the same scope. Export a PDF, CSV or JSON copy when you need to share or retain the report.</li>
      </ol>
      <h2>Key features</h2>
      <ul>
        <li>Site-wide discovery through same-site links and sitemap references, with a limit of 100 scanned URLs.</li>
        <li>Focused checks covering a one-to-three-page sample.</li>
        <li>Evidence, explanation and a practical recommendation for findings.</li>
        <li>Category-level status and scores alongside a separate coverage percentage.</li>
        <li>Static SEO checks for titles, descriptions, headings, canonicals, robots directives and structured data.</li>
        <li>Additional signals spanning content, accessibility, security, images, forms, navigation and technology.</li>
        <li>Optional sampled same-site link and image checks, with explicit count limits.</li>
        <li>Optional comparison scan against a competitor using matching scan settings.</li>
        <li>PDF, CSV and JSON report exports.</li>
        <li>Browser-local history retaining up to ten reports without account synchronization.</li>
        <li>Not Tested states and scope notes that expose missing or unsupported measurements.</li>
      </ul>
      <h2>Why an evidence-first audit is useful</h2>
      <p><strong>It makes recommendations actionable.</strong> A generic score does not tell a site owner what to change. An evidence-led report connects a check to the affected URL and explains why a signal may matter. That gives a developer or editor something concrete to verify in the source or content management system, rather than encouraging changes based on guesswork. Evidence is still a clue, not an absolute verdict: templates, application behavior, and business context can affect what an observation means.</p>
      <p><strong>It helps prioritize work.</strong> Websites accumulate issues as content and templates change. A page may lose a useful title, gain duplicate headings, or reference an unavailable image during a release. Grouping observations by category makes it easier to identify repeated template problems versus isolated content mistakes. Teams can choose high-impact corrections first and leave cosmetic or low-priority work for later. The audit score is deliberately narrower than an overall quality rating: it summarizes tested checks under a stated scoring method.</p>
      <p><strong>It helps teams discuss scope honestly.</strong> A crawl cannot establish that every site page is healthy unless it actually reaches every relevant page, and this tool caps its site-wide scan at 100 URLs. Pages behind login, pages with no discoverable links, or routes created only after client-side execution may be absent. Coverage and notes help reviewers understand this boundary before sharing conclusions with a client or stakeholder. Repeating an audit after changes can support a practical before-and-after conversation, while browser-local history enables quick return to recent reports on the same device.</p>
      <p><strong>It complements specialist tools.</strong> Static page checks answer a different question from analytics, field performance monitoring, accessibility testing, and search engine indexing reports. A title tag can be present while a page remains blocked elsewhere. A fast server response does not establish a good visual experience. A structured-data block can parse but still be ineligible for a particular search feature. The best use is to combine the report with the tools and human review that address the specific question at hand.</p>
      <p><strong>It encourages repeatable quality routines.</strong> Teams can audit key pages during a redesign, before a release, or when reviewing a content migration. Export formats make it possible to discuss concrete findings outside the browser. Keep a copy when you need a durable record, since the local history is limited and stays in the current browser. When a finding is fixed, inspect the rendered page and source yourself, then rerun the scan to see whether the static signal changed.</p>
      <h2>Who uses a website auditor?</h2>
      <figure><img src={seoReportImg} alt="SEO report highlighting page-level checks and recommendations for a website team" width={1200} height={688} loading="lazy" className="rounded-2xl border" /><figcaption>A report can help teams turn page-level observations into a focused follow-up plan.</figcaption></figure>
      <p><strong>Small-business owners</strong> use a scan to spot obvious page-level omissions before asking a developer for help. A report can make the conversation more specific: which page has a missing description, what the HTML exposes, and whether the issue appears on several URLs. Owners should still confirm that recommendations fit their brand and conversion goals rather than making every change mechanically.</p>
      <p><strong>SEO specialists and content editors</strong> can use the findings as a first-pass checklist while reviewing titles, descriptions, heading structure, canonical tags, robots directives, sitemap signals and structured data. They can identify candidate pages for deeper inspection and explain why a static presence check is not equivalent to search visibility. The report does not replace rank tracking, crawl diagnostics, search console data, or editorial judgment about intent and usefulness.</p>
      <p><strong>Developers and agencies</strong> may run a focused scan during implementation review or a larger scan after a migration. Findings can reveal patterns in shared templates and help direct manual investigation. A small sample of links or images can expose some availability issues, but developers should use dedicated crawlers and deployment monitoring when exhaustive validation is necessary. Exported reports can support handoff, while the local history is convenient for quick comparisons on a single browser.</p>
      <p><strong>Designers and accessibility practitioners</strong> can use static signals as prompts to inspect pages more carefully. An image's alternative text, a page's heading structure, or a mobile viewport declaration may be worth reviewing, but an HTML-only check cannot judge every visual or assistive-technology experience. Keyboard operation, contrast in context, dynamic announcements, focus behavior and screen-reader usability require direct testing.</p>
      <p><strong>Product and marketing teams</strong> can use the report to coordinate a list of technical and content follow-ups. Comparing a public competitor scan may offer a limited point of reference, not a complete competitive analysis. Results are most valuable when the team records the scope, checks the evidence, assigns an owner, and validates the page after changes.</p>
      <h2>On-page SEO basics the audit can help review</h2>
      <p><strong>Titles and meta descriptions</strong> summarize a page for browsers and search results. A title should distinguish the page and accurately describe its purpose; a description can provide a concise, relevant summary. The auditor can inspect static values and flag common issues, but it cannot determine which snippet a search engine will choose or whether a particular wording will improve performance.</p>
      <p><strong>Headings</strong> provide structure for readers and assistive technologies. A clear main heading and logically organized sections make a page easier to scan. Automated checks can identify structural patterns such as missing or repeated headings, but they cannot reliably decide whether every heading communicates the right idea or whether the content satisfies the visitor.</p>
      <p><strong>Canonical links and robots directives</strong> communicate crawl and URL preferences. A canonical reference may help identify a preferred version of similar pages; robots directives can request that a page not be indexed. These signals must be interpreted with redirects, HTTP headers, internal links and site configuration. A tag's presence alone does not prove that search engines will honor it.</p>
      <p><strong>Structured data</strong> describes page entities in a machine-readable format, often using JSON-LD. The auditor can review static schema-related signals, but it is not a guarantee of validity, eligibility, or enhanced search appearance. Validate important markup with dedicated search documentation and testing tools.</p>
      <h2>What static analysis can and cannot measure</h2>
      <p>Static analysis examines the HTML and response information available to the scanner without loading the page as a full interactive browser session. It is useful for inspectable properties such as tags, links, image references, headings, schema blocks and certain headers. It can flag a missing element or show exactly what text was retrieved. Site-wide results remain bounded by discovery and the 100-page cap, and the optional availability checks sample only limited numbers of same-site links and images.</p>
      <p>Static inspection cannot see content that appears only after client-side JavaScript runs, assess layout shifts or overlapping controls, test interaction flows, submit a form, or evaluate a logged-in experience. It does not measure Core Web Vitals or browser-rendered performance. Fetch duration and HTML size are observations, not substitutes for lab or real-user metrics. Likewise, an HTML accessibility signal is not a complete accessibility audit. Use browser testing, assistive technology, field measurement and specialist validation for those needs.</p>
      <p>Findings should therefore be treated as testable observations rather than search-ranking predictions. A result may be affected by a temporary network failure, access policy, unusual template, or incomplete discovery. Read the affected URL, evidence, status, coverage and notes together; verify important findings directly before making site-wide changes.</p>
      <h2>Technical deep dive: scan scope, scoring and retention</h2>
      <p>The audit flow requests permitted public pages and evaluates the returned static material. In site-wide mode, it begins with discovery, follows eligible same-origin URLs and processes discovered pages in paced batches. The crawl limit is 100 URLs, and batches are intentionally spaced. The browser displays progress and can produce a partial report when stopped. Focused mode instead requests the configured one-to-three-page sample. Crawl restrictions, inaccessible pages and undiscovered routes affect coverage, so the report's page list and notes are part of the result.</p>
      <p>Checks are represented as findings with categories and statuses. For score calculation, a passed check contributes one point, a warning contributes half a point, and a failed check contributes zero. Not Tested findings are excluded from the score; coverage separately compares tested checks with the full set of findings. Category scores use the same general scoring approach. Consequently, a score is meaningful only alongside coverage and scope: it is not a ranking, a measurement of commercial success, or a universal grade for the site.</p>
      <p>Reports can be exported in PDF, CSV and JSON formats. Up to ten reports may be stored in browser local storage for history and comparisons. That data is local to the browser and is not synchronized to an account; browser storage can be cleared or unavailable, so export a report if you need a separate record. Scheduled scans, email delivery and persistent cloud history are not part of this workflow.</p>
      <p>For a broader design workflow, explore the <Link to="/tools/contrast-checker">Contrast Checker</Link> for color contrast or the <Link to="/tools/cms-detector">CMS Detector</Link> to inspect public platform signals. Those tools answer different questions; combine their results with appropriate verification rather than treating any one scan as complete assurance.</p>
    </>
  );
}
