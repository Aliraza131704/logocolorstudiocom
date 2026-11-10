import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ToolLayout } from "@/components/site/ToolLayout";
import { ToolGuide } from "@/components/site/ToolGuide";
import { TOOL_GUIDES } from "@/lib/tool-guide-content";
import { ColorCard, ErrorNote, ExportBox, ResultSkeleton, UrlForm, savePalette } from "@/components/site/tool-parts";
import { faqLd, breadcrumbLd, type Faq } from "@/components/site/ui-bits";
import { Button } from "@/components/ui/button";
import { extractWebsite } from "@/lib/analyze.functions";
import { pageHead } from "@/lib/seo";
import { getPublicSetting } from "@/lib/content.functions";
import { TOOL_CONTENT_KEY, toolOverride, withMeta } from "@/lib/tool-overrides";
import { PAGE_META } from "@/lib/page-meta";

const FAQS: Faq[] = TOOL_GUIDES["website-extractor"].faqs;

export const Route = createFileRoute("/tools/website-extractor")({
  loader: () => getPublicSetting({ data: { key: TOOL_CONTENT_KEY } }),
  head: ({ loaderData }) => {
    const o = toolOverride(loaderData, "website-extractor");
    return pageHead({
      ...withMeta(o, PAGE_META["/tools/website-extractor"]),
      path: "/tools/website-extractor",
      jsonLd: [faqLd(o?.faqs ?? FAQS), breadcrumbLd([{ label: "Tools", to: "/tools" }, { label: "Website Extractor" }], "/tools/website-extractor"), { "@context": "https://schema.org", "@type": "WebApplication", name: "Website Color Extractor", applicationCategory: "DesignApplication", operatingSystem: "Any" }],
    });
  },
  component: Page,
});

type Res = Awaited<ReturnType<typeof extractWebsite>>;

function Page() {
  const o = toolOverride(Route.useLoaderData(), "website-extractor");
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
    <ToolLayout override={o} slug="website-extractor" title={TOOL_GUIDES["website-extractor"].title} intro="Paste a website address to discover its brand colors, fonts and logo in seconds." faqs={FAQS} about={<About />}>
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
  return <ToolGuide slug="website-extractor" />;
}
