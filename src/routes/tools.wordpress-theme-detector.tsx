import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ToolLayout } from "@/components/site/ToolLayout";
import { ToolGuide } from "@/components/site/ToolGuide";
import { TOOL_GUIDES } from "@/lib/tool-guide-content";
import { ErrorNote, ResultSkeleton, UrlForm } from "@/components/site/tool-parts";
import { faqLd, breadcrumbLd, type Faq } from "@/components/site/ui-bits";
import { detectWordpress } from "@/lib/analyze.functions";
import { pageHead } from "@/lib/seo";

const FAQS: Faq[] = TOOL_GUIDES["wordpress-theme-detector"].faqs;

export const Route = createFileRoute("/tools/wordpress-theme-detector")({
  head: () =>
    pageHead({
      title: "Free WordPress Theme Detector — Find Theme & Plugins",
      description: "Find the WordPress theme any site uses: name, version, author, theme URI, parent theme and detected plugins. Free WP theme checker.",
      path: "/tools/wordpress-theme-detector",
      jsonLd: [faqLd(FAQS), breadcrumbLd([{ label: "Tools", to: "/tools" }, { label: "WordPress Theme Detector" }], "/tools/wordpress-theme-detector"), { "@context": "https://schema.org", "@type": "WebApplication", name: "WordPress Theme Detector", applicationCategory: "DeveloperApplication", operatingSystem: "Any" }],
    }),
  component: Page,
});

type Res = Awaited<ReturnType<typeof detectWordpress>>;

function Page() {
  const fn = useServerFn(detectWordpress);
  const [res, setRes] = useState<Res | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const run = async (url: string) => {
    setLoading(true); setErr(""); setRes(null);
    try { setRes(await fn({ data: { url } })); } catch (e) { setErr(e instanceof Error ? e.message : "Detection failed."); }
    setLoading(false);
  };
  return (
    <ToolLayout slug="wordpress-theme-detector" title={TOOL_GUIDES["wordpress-theme-detector"].title} intro="Reveal the theme, version, author and plugins behind any WordPress website." faqs={FAQS} about={<About />}>
      <UrlForm onSubmit={run} loading={loading} cta="Detect theme" />
      {loading && <ResultSkeleton />}
      {err && <ErrorNote msg={err} />}
      {res && !res.isWordPress && <ErrorNote msg="This site doesn't appear to run WordPress. Try the CMS Detector to find its platform." />}
      {res && res.isWordPress && (
        <div className="mt-8 space-y-6">
          {(res.siteName || res.builders.length > 0) && (
            <div className="rounded-2xl border bg-card p-6 text-sm">
              {res.siteName && <p className="font-display text-xl font-bold">{res.siteName}</p>}
              {res.tagline && <p className="text-muted-foreground">{res.tagline}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {res.ecommerce && <span className="rounded-full border px-3 py-1">WooCommerce store</span>}
                {res.restApi && <span className="rounded-full border px-3 py-1">REST API open</span>}
                {res.builders.map((b) => <span key={b} className="rounded-full border px-3 py-1">{b}</span>)}
              </div>
            </div>
          )}
          {res.themes.length === 0 && <p className="text-muted-foreground">WordPress detected, but the theme folder is hidden.</p>}
          {res.themes.map((t) => (
            <div key={t.slug} className="rounded-2xl border bg-card p-6">
              <p className="text-sm text-muted-foreground">{"template" in t && t.template ? "Active child theme" : "Theme"}{!t.found && " (details hidden)"}</p>
              <p className="font-display text-3xl font-extrabold">{("name" in t && t.name) || t.slug}</p>
              {"description" in t && t.description && <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>}
              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
                <div><dt className="text-muted-foreground">Folder</dt><dd>{t.slug}</dd></div>
                <div><dt className="text-muted-foreground">Version</dt><dd>{("version" in t && t.version) || "—"}</dd></div>
                <div><dt className="text-muted-foreground">Author</dt><dd>{"authorUri" in t && t.authorUri ? <a className="text-primary underline" href={t.authorUri} target="_blank" rel="noopener noreferrer">{t.author}</a> : ("author" in t && t.author) || "—"}</dd></div>
                <div><dt className="text-muted-foreground">Theme URI</dt><dd className="break-all">{"themeUri" in t && t.themeUri ? <a className="text-primary underline" href={t.themeUri} target="_blank" rel="noopener noreferrer">{t.themeUri}</a> : "—"}</dd></div>
                <div><dt className="text-muted-foreground">Parent theme</dt><dd>{("template" in t && t.template) || "None (parent theme)"}</dd></div>
                <div><dt className="text-muted-foreground">License</dt><dd>{("license" in t && t.license) || "—"}</dd></div>
                <div><dt className="text-muted-foreground">Requires WP</dt><dd>{("requires" in t && t.requires) || "—"}</dd></div>
                <div><dt className="text-muted-foreground">Theme directory</dt><dd><a className="text-primary underline" href={t.directory} target="_blank" rel="noopener noreferrer">Look up</a></dd></div>
              </dl>
            </div>
          ))}
          <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            <div className="rounded-2xl border bg-card p-6 text-sm"><p className="text-muted-foreground">WordPress version</p><p className="text-2xl font-bold">{res.wpVersion ?? "Hidden"}</p></div>
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="font-semibold">Detected plugins ({res.plugins.length})</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {res.plugins.length ? res.plugins.map((p) => <a key={p.slug} href={p.url} target="_blank" rel="noopener noreferrer" className="rounded-full border px-3 py-1.5 text-sm hover:border-primary">{p.slug}{p.version && <span className="text-muted-foreground"> v{p.version}</span>}</a>) : <p className="text-sm text-muted-foreground">No plugins visible.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}

function About() {
  return <ToolGuide slug="wordpress-theme-detector" />;
}
