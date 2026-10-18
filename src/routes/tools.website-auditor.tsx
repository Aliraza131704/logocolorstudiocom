import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, X, AlertTriangle } from "lucide-react";
import { ToolLayout } from "@/components/site/ToolLayout";
import { ErrorNote, ResultSkeleton, UrlForm } from "@/components/site/tool-parts";
import { download, faqLd, breadcrumbLd, type Faq } from "@/components/site/ui-bits";
import { Button } from "@/components/ui/button";
import { auditWebsite } from "@/lib/analyze.functions";
import { pageHead } from "@/lib/seo";

const FAQS: Faq[] = [
  { q: "What does the Website Auditor check?", a: "Title, meta description, H1, canonical, robots, sitemap, schema, Open Graph, viewport, HTTPS, HSTS, image alt text, lazy loading, response time, page size, compression, scripts and a sample of broken links." },
  { q: "How is the score calculated?", a: "Each check is worth one point; warnings count half. The overall and group scores are the percentage of points earned." },
  { q: "Is this the same as Google Lighthouse?", a: "No. It is a fast HTML-based audit. Use it alongside Lighthouse and Google Search Console for a full picture." },
  { q: "Can I download the report?", a: "Yes, as a PDF (via print) or as JSON." },
];

export const Route = createFileRoute("/tools/website-auditor")({
  head: () =>
    pageHead({
      title: "Free Website Auditor — SEO & Performance Check",
      description: "Audit any website for SEO, mobile, HTTPS, image alt text, performance hints and broken links. Get a score, fix tips and PDF/JSON export.",
      path: "/tools/website-auditor",
      jsonLd: [faqLd(FAQS), breadcrumbLd([{ label: "Tools", to: "/tools" }, { label: "Website Auditor" }], "/tools/website-auditor"), { "@context": "https://schema.org", "@type": "WebApplication", name: "Website Auditor", applicationCategory: "BusinessApplication", operatingSystem: "Any" }],
    }),
  component: Page,
});

type Res = Awaited<ReturnType<typeof auditWebsite>>;
const tone = (s: number) => (s >= 85 ? "text-brand-green" : s >= 60 ? "text-brand-orange" : "text-brand-red");

function Page() {
  const fn = useServerFn(auditWebsite);
  const [res, setRes] = useState<Res | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const run = async (url: string) => {
    setLoading(true); setErr(""); setRes(null);
    try { setRes(await fn({ data: { url } })); } catch (e) { setErr(e instanceof Error ? e.message : "Audit failed."); }
    setLoading(false);
  };
  return (
    <ToolLayout slug="website-auditor" title="Website Auditor" intro="Get an instant SEO, mobile, security and performance report with clear fix suggestions." faqs={FAQS} about={<About />}>
      <UrlForm onSubmit={run} loading={loading} cta="Run audit" />
      {loading && <ResultSkeleton />}
      {err && <ErrorNote msg={err} />}
      {res && (
        <div className="mt-8 space-y-6" id="audit-report">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border bg-card p-5 sm:col-span-2 lg:col-span-1">
              <p className="text-sm text-muted-foreground">Overall score</p>
              <p className={`font-display text-6xl font-extrabold ${tone(res.score)}`}>{res.score}</p>
              <p className="truncate text-xs text-muted-foreground">{res.url}</p>
            </div>
            {res.groups.map((g) => (
              <div key={g.group} className="rounded-2xl border bg-card p-5">
                <p className="text-sm text-muted-foreground">{g.group}</p>
                <p className={`font-display text-3xl font-bold ${tone(g.score)}`}>{g.score}</p>
                <div className="mt-2 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${g.score}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" onClick={() => window.print()}>Export PDF</Button>
            <Button variant="outline" onClick={() => download("audit.json", JSON.stringify(res, null, 2), "application/json")}>Export JSON</Button>
          </div>
          <div className="divide-y rounded-2xl border bg-card">
            {res.checks.map((c) => (
              <div key={c.id} className="flex gap-4 p-4">
                <span className={`mt-0.5 ${c.pass ? "text-brand-green" : c.warn ? "text-brand-orange" : "text-brand-red"}`}>
                  {c.pass ? <Check className="size-5" /> : c.warn ? <AlertTriangle className="size-5" /> : <X className="size-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{c.label} <span className="ml-2 text-xs text-muted-foreground">{c.group}</span></p>
                  <p className="break-words text-sm text-muted-foreground">{c.detail}</p>
                  {!c.pass && c.fix && <p className="mt-1 text-sm"><strong>Fix:</strong> {c.fix}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}

function About() {
  return (
    <>
      <h2>A quick health check for any website</h2>
      <p>The Website Auditor scans a public page and grades the technical basics that affect how it ranks, how it looks when shared and how it feels on a phone. In a few seconds you get an overall score, scores for SEO, mobile, security, accessibility, performance and links, and a plain-English fix for every problem.</p>
      <h2>What we check</h2>
      <ul>
        <li><strong>SEO:</strong> title length, meta description, a single H1, canonical tag, noindex, robots.txt, sitemap, JSON-LD schema, Open Graph tags and the language attribute.</li>
        <li><strong>Mobile:</strong> a correct responsive viewport tag.</li>
        <li><strong>Security:</strong> HTTPS and the HSTS header.</li>
        <li><strong>Accessibility:</strong> alt text on images.</li>
        <li><strong>Performance:</strong> server response time, HTML size, compression, lazy-loaded images and the number of external scripts.</li>
        <li><strong>Links:</strong> a sample of up to 12 links checked for 4xx and 5xx errors.</li>
      </ul>
      <h2>How to run an audit</h2>
      <ol>
        <li>Enter the full address of the page you want to audit.</li>
        <li>Click <strong>Run audit</strong>.</li>
        <li>Start with red items, then orange warnings. Each one has a suggested fix.</li>
        <li>Export the report as PDF for clients or JSON for your own tracking.</li>
      </ol>
      <h2>Next steps</h2>
      <p>After fixing issues, re-run the audit to confirm your score improved. Then submit your sitemap in Google Search Console. Curious what platform a site is built on? Try the <Link to="/tools/cms-detector">CMS Detector</Link>. Want your colors to pass accessibility too? Use the <Link to="/tools/contrast-checker">Contrast Checker</Link>.</p>
    </>
  );
}
