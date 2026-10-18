import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ToolLayout } from "@/components/site/ToolLayout";
import { ColorCard, ErrorNote, ExportBox, ResultSkeleton, UrlForm, savePalette } from "@/components/site/tool-parts";
import { faqLd, breadcrumbLd, type Faq } from "@/components/site/ui-bits";
import { Button } from "@/components/ui/button";
import { extractWebsite } from "@/lib/analyze.functions";
import { pageHead } from "@/lib/seo";

const FAQS: Faq[] = [
  { q: "How does the Website Extractor find colors?", a: "It reads the page HTML and up to five stylesheets, counts every HEX and RGB value and ranks them by how often they are used." },
  { q: "Why are some colors missing?", a: "Colors set by JavaScript at runtime, images or CSS variables defined in other files may not be detected." },
  { q: "Can I scan any website?", a: "Any public website that allows normal visits. Pages behind a login or blocking bots cannot be read." },
  { q: "Is there a limit?", a: "To keep the service fast for everyone there is a limit of about 20 scans per minute per visitor." },
];

export const Route = createFileRoute("/tools/website-extractor")({
  head: () =>
    pageHead({
      title: "Website Color Extractor — Colors, Fonts & Logo",
      description: "Enter any URL to extract the website's brand colors, fonts and logo. Copy HEX and RGB values or export CSS, Tailwind and JSON.",
      path: "/tools/website-extractor",
      jsonLd: [faqLd(FAQS), breadcrumbLd([{ label: "Tools", to: "/tools" }, { label: "Website Extractor" }], "/tools/website-extractor"), { "@context": "https://schema.org", "@type": "WebApplication", name: "Website Color Extractor", applicationCategory: "DesignApplication", operatingSystem: "Any" }],
    }),
  component: Page,
});

type Res = Awaited<ReturnType<typeof extractWebsite>>;

function Page() {
  const fn = useServerFn(extractWebsite);
  const [res, setRes] = useState<Res | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const run = async (url: string) => {
    setLoading(true); setErr(""); setRes(null);
    try { setRes(await fn({ data: { url } })); } catch (e) { setErr(e instanceof Error ? e.message : "Something went wrong."); }
    setLoading(false);
  };
  const hexes = res?.colors.slice(0, 10).map((c) => c.hex) ?? [];
  return (
    <ToolLayout slug="website-extractor" title="Website Color Extractor" intro="Paste a website address to discover its brand colors, fonts and logo in seconds." faqs={FAQS} about={<About />}>
      <UrlForm onSubmit={run} loading={loading} cta="Extract" />
      {loading && <ResultSkeleton />}
      {err && <ErrorNote msg={err} />}
      {res && (
        <div className="mt-8 space-y-8">
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-5">
            {(res.logo || res.favicon) && <img src={res.logo ?? res.favicon} alt={`${res.title} logo`} className="h-12 max-w-40 rounded object-contain" loading="lazy" />}
            <div className="min-w-0">
              <p className="truncate font-semibold">{res.title || res.url}</p>
              <p className="truncate text-sm text-muted-foreground">{res.url}</p>
            </div>
            {res.themeColor && <span className="ml-auto flex items-center gap-2 text-sm">Theme color <span className="inline-block size-5 rounded-full border" style={{ backgroundColor: res.themeColor }} /> {res.themeColor}</span>}
          </div>
          <section>
            <h2 className="text-xl font-bold">Colors ({res.colors.length})</h2>
            {res.colors.length === 0 ? <p className="mt-2 text-muted-foreground">No colors found in the page styles.</p> : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {res.colors.map((c) => <ColorCard key={c.hex} hex={c.hex} sub={`${c.count}×`} />)}
              </div>
            )}
          </section>
          <section>
            <h2 className="text-xl font-bold">Fonts</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {res.fonts.length ? res.fonts.map((f) => <span key={f} className="rounded-full border bg-card px-4 py-2 text-sm">{f}</span>) : <p className="text-muted-foreground">No custom fonts detected.</p>}
            </div>
          </section>
          {hexes.length > 0 && (
            <>
              <ExportBox colors={hexes} name="site" />
              <Button asChild variant="hero" onClick={() => savePalette(hexes.slice(0, 5))}><Link to="/palettes">Make palettes from these colors</Link></Button>
            </>
          )}
        </div>
      )}
    </ToolLayout>
  );
}

function About() {
  return (
    <>
      <h2>Extract brand colors from any website</h2>
      <p>The Website Color Extractor reveals the color system behind any public website. Enter a URL and we load the page, read its inline styles and main stylesheets, then count every HEX and RGB value. Colors are ranked by frequency, so the brand's primary, secondary and neutral shades rise to the top. We also list the font families used and show the site's logo, favicon and theme color.</p>
      <p>This is perfect when you are redesigning a client site, building a competitor analysis, matching a partner's branding in a co-marketing campaign, or simply want to learn from websites you admire.</p>
      <h2>How to use it</h2>
      <ol>
        <li>Type or paste a web address such as <code>stripe.com</code>.</li>
        <li>Press <strong>Extract</strong> and wait a few seconds while we analyse the page.</li>
        <li>Review colors with their usage count, copy HEX or RGB values, and check the detected fonts.</li>
        <li>Export the top colors as CSS, Tailwind, SCSS or JSON, or send them to the <Link to="/palettes">Palette Generator</Link>.</li>
      </ol>
      <h2>Understanding the results</h2>
      <p>The usage count shows how many times a color appears in the CSS, not how much screen area it covers. Neutral grays and white often appear most because they style text, borders and backgrounds. The brand accent is usually the most frequent saturated color. Use the <Link to="/tools/contrast-checker">Contrast Checker</Link> to see whether those colors work together for text.</p>
      <h2>Limitations</h2>
      <p>Websites that build styles with JavaScript, use CSS-in-JS at runtime, or protect pages from automated visits may return fewer results. We only read publicly available files and never store the pages you scan. Please use the tool responsibly and respect each site's terms and trademarks.</p>
    </>
  );
}
