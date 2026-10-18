import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ToolLayout } from "@/components/site/ToolLayout";
import { ErrorNote, ResultSkeleton, UrlForm } from "@/components/site/tool-parts";
import { faqLd, breadcrumbLd, type Faq } from "@/components/site/ui-bits";
import { detectCms } from "@/lib/analyze.functions";
import { pageHead } from "@/lib/seo";

const FAQS: Faq[] = [
  { q: "Which platforms can be detected?", a: "WordPress, Shopify, Wix, Squarespace, Webflow, Joomla, Drupal, Magento, Ghost, BigCommerce, PrestaShop, HubSpot CMS, Framer, Weebly and Next.js." },
  { q: "What does the confidence score mean?", a: "It reflects how many independent fingerprints matched, such as generator tags, asset paths and server headers. 80%+ is a very strong match." },
  { q: "Why is nothing detected?", a: "The site may be custom-built, use a headless setup, or hide its platform signals." },
  { q: "Is it legal to check a site's CMS?", a: "Yes. We only read the same public HTML and headers your browser receives." },
];

export const Route = createFileRoute("/tools/cms-detector")({
  head: () =>
    pageHead({
      title: "CMS Detector — What Platform Is This Site Built On?",
      description: "Detect whether a website uses WordPress, Shopify, Wix, Squarespace, Webflow, Drupal, Magento, Ghost and more, with a confidence score.",
      path: "/tools/cms-detector",
      jsonLd: [faqLd(FAQS), breadcrumbLd([{ label: "Tools", to: "/tools" }, { label: "CMS Detector" }], "/tools/cms-detector"), { "@context": "https://schema.org", "@type": "WebApplication", name: "CMS Detector", applicationCategory: "DeveloperApplication", operatingSystem: "Any" }],
    }),
  component: Page,
});

type Res = Awaited<ReturnType<typeof detectCms>>;

function Page() {
  const fn = useServerFn(detectCms);
  const [res, setRes] = useState<Res | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const run = async (url: string) => {
    setLoading(true); setErr(""); setRes(null);
    try { setRes(await fn({ data: { url } })); } catch (e) { setErr(e instanceof Error ? e.message : "Detection failed."); }
    setLoading(false);
  };
  return (
    <ToolLayout slug="cms-detector" title="CMS Detector" intro="Find out which content management system or site builder powers any website." faqs={FAQS} about={<About />}>
      <UrlForm onSubmit={run} loading={loading} cta="Detect" />
      {loading && <ResultSkeleton />}
      {err && <ErrorNote msg={err} />}
      {res && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border bg-card p-6">
            {res.results.length === 0 ? (
              <p className="text-muted-foreground">No known CMS fingerprints found. The site may be custom-built or headless.</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Most likely</p>
                <p className="font-display text-4xl font-extrabold">{res.results[0].name}</p>
                <div className="mt-6 space-y-4">
                  {res.results.map((r) => (
                    <div key={r.name}>
                      <div className="flex justify-between text-sm"><span>{r.name}</span><span className="font-semibold">{r.confidence}%</span></div>
                      <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-brand-gradient" style={{ width: `${r.confidence}%` }} /></div>
                    </div>
                  ))}
                </div>
                {res.results[0].name === "WordPress" && <p className="mt-6 text-sm">Next: <Link to="/tools/wordpress-theme-detector" className="text-primary underline">detect the WordPress theme</Link></p>}
                {res.results[0].name === "Shopify" && <p className="mt-6 text-sm">Next: <Link to="/tools/shopify-theme-detector" className="text-primary underline">detect the Shopify theme</Link></p>}
              </>
            )}
          </div>
          <dl className="space-y-3 rounded-2xl border bg-card p-6 text-sm">
            <div><dt className="text-muted-foreground">URL</dt><dd className="break-all">{res.url}</dd></div>
            <div><dt className="text-muted-foreground">Generator tag</dt><dd>{res.generator ?? "—"}</dd></div>
            <div><dt className="text-muted-foreground">Server</dt><dd>{res.server ?? "—"}</dd></div>
            <div><dt className="text-muted-foreground">X-Powered-By</dt><dd>{res.poweredBy ?? "—"}</dd></div>
          </dl>
        </div>
      )}
    </ToolLayout>
  );
}

function About() {
  return (
    <>
      <h2>Identify the platform behind any website</h2>
      <p>Every content management system leaves fingerprints: a generator meta tag, distinctive folder names like <code>/wp-content/</code> or <code>/cdn/shop/</code>, special HTML attributes, JavaScript globals and HTTP headers. The CMS Detector loads the page you enter, checks it against fingerprints for more than fifteen popular platforms and shows a confidence score for each match.</p>
      <h2>When this is useful</h2>
      <ul>
        <li>Sales and agencies qualifying leads by the platform they use.</li>
        <li>Designers researching how a competitor built their site.</li>
        <li>Developers estimating a migration or redesign.</li>
        <li>Marketers choosing plugins or integrations that will work.</li>
      </ul>
      <h2>How to use it</h2>
      <ol>
        <li>Paste the website address and click <strong>Detect</strong>.</li>
        <li>Read the most likely platform and the confidence bars for all matches.</li>
        <li>Check the technical details: generator tag, server and X-Powered-By header.</li>
        <li>For WordPress or Shopify sites, continue to the theme detectors for more detail.</li>
      </ol>
      <h2>How confidence is calculated</h2>
      <p>Each fingerprint adds points. A generator tag that names the platform is a strong signal, asset paths are strong, and headers confirm the result. Scores are capped at 100%. A site can show more than one platform, for example a Next.js front end on top of a headless CMS. If nothing matches, the site is probably custom-built.</p>
      <p>Pair this with the <Link to="/tools/website-auditor">Website Auditor</Link> to see how well the site is optimised, or the <Link to="/tools/website-extractor">Website Extractor</Link> to grab its colors and fonts.</p>
    </>
  );
}
