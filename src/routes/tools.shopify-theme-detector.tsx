import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ToolLayout } from "@/components/site/ToolLayout";
import { ErrorNote, ResultSkeleton, UrlForm } from "@/components/site/tool-parts";
import { faqLd, breadcrumbLd, type Faq } from "@/components/site/ui-bits";
import { detectShopify } from "@/lib/analyze.functions";
import { pageHead } from "@/lib/seo";

const FAQS: Faq[] = [
  { q: "How do you find the Shopify theme?", a: "Shopify stores expose a Shopify.theme object in the page with the theme name, ID and role, and Online Store 2.0 themes include schema name and version." },
  { q: "Why does it show a custom name?", a: "Store owners can rename themes. The schema name shows the original theme it is based on." },
  { q: "How are apps detected?", a: "By recognising script and asset URLs from popular Shopify apps such as Klaviyo, Judge.me and ReCharge." },
  { q: "Can I buy the same theme?", a: "If it is a Theme Store theme, use the Theme Store link. Custom themes are not available to buy." },
];

export const Route = createFileRoute("/tools/shopify-theme-detector")({
  head: () =>
    pageHead({
      title: "Shopify Theme Detector — Theme Name & Apps",
      description: "Detect any Shopify store's theme name, version, Theme Store link and installed apps. Free Shopify theme checker.",
      path: "/tools/shopify-theme-detector",
      jsonLd: [faqLd(FAQS), breadcrumbLd([{ label: "Tools", to: "/tools" }, { label: "Shopify Theme Detector" }], "/tools/shopify-theme-detector"), { "@context": "https://schema.org", "@type": "WebApplication", name: "Shopify Theme Detector", applicationCategory: "DeveloperApplication", operatingSystem: "Any" }],
    }),
  component: Page,
});

type Res = Awaited<ReturnType<typeof detectShopify>>;

function Page() {
  const fn = useServerFn(detectShopify);
  const [res, setRes] = useState<Res | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const run = async (url: string) => {
    setLoading(true); setErr(""); setRes(null);
    try { setRes(await fn({ data: { url } })); } catch (e) { setErr(e instanceof Error ? e.message : "Detection failed."); }
    setLoading(false);
  };
  return (
    <ToolLayout slug="shopify-theme-detector" title="Shopify Theme Detector" intro="See which theme a Shopify store uses, its version and the apps it runs." faqs={FAQS} about={<About />}>
      <UrlForm onSubmit={run} loading={loading} placeholder="store.com" cta="Detect theme" />
      {loading && <ResultSkeleton />}
      {err && <ErrorNote msg={err} />}
      {res && !res.isShopify && <ErrorNote msg="This site doesn't appear to be a Shopify store. Try the CMS Detector to find its platform." />}
      {res && res.isShopify && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">Theme</p>
            <p className="font-display text-4xl font-extrabold">{res.themeName ?? "Unknown"}</p>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-muted-foreground">Based on</dt><dd>{res.schemaName ?? "—"}</dd></div>
              <div><dt className="text-muted-foreground">Version</dt><dd>{res.version ?? "—"}</dd></div>
              <div><dt className="text-muted-foreground">Theme ID</dt><dd>{res.themeId ?? "—"}</dd></div>
              <div><dt className="text-muted-foreground">Theme Store ID</dt><dd>{res.themeStoreId ?? (res.isCustom ? "Custom theme" : "—")}</dd></div>
              <div><dt className="text-muted-foreground">Role</dt><dd>{res.role ?? "—"}</dd></div>
              <div><dt className="text-muted-foreground">Architecture</dt><dd>{res.headless ? "Headless (Hydrogen)" : res.onlineStore2 ? "Online Store 2.0" : "Classic"}</dd></div>
              <div><dt className="text-muted-foreground">Store name</dt><dd>{res.storeName ?? "—"}</dd></div>
              <div><dt className="text-muted-foreground">Products</dt><dd>{res.productsCount ?? "—"}</dd></div>
              <div><dt className="text-muted-foreground">Currency</dt><dd>{res.currency ?? "—"}</dd></div>
              <div><dt className="text-muted-foreground">Locale / country</dt><dd>{[res.locale, res.country].filter(Boolean).join(" / ") || "—"}</dd></div>
              <div className="col-span-2"><dt className="text-muted-foreground">Store</dt><dd className="break-all">{res.shop ?? res.url}</dd></div>
            </dl>
            {res.themeStoreLink && <a href={res.themeStoreLink} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block text-primary underline">View on Shopify Theme Store</a>}
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <h2 className="font-semibold">Detected apps &amp; integrations ({res.apps.length})</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {res.apps.length ? res.apps.map((a) => <span key={a} className="rounded-full border px-3 py-1.5 text-sm">{a}</span>) : <p className="text-sm text-muted-foreground">No known apps detected.</p>}
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}

function About() {
  return (
    <>
      <h2>Find out which Shopify theme a store uses</h2>
      <p>Seen a Shopify store with a layout you love? The Shopify Theme Detector reads the store's public page and reports the theme name, the Theme Store theme it is based on, its version and theme IDs, plus the apps and integrations the store runs. It is the fastest way to research competitors or find a starting point for your own store.</p>
      <h2>How it works</h2>
      <p>Every Shopify storefront includes a small JavaScript object called <code>Shopify.theme</code> with the theme's name, ID and role. Modern Online Store 2.0 themes also include a <code>schema_name</code> and <code>schema_version</code> that identify the original theme even if the merchant renamed it. We also confirm the store by looking for <code>/cdn/shop/</code> asset paths and Shopify headers.</p>
      <h2>How to use it</h2>
      <ol>
        <li>Paste the store's address, such as <code>allbirds.com</code>.</li>
        <li>Click <strong>Detect theme</strong>.</li>
        <li>Read the theme name, base theme and version.</li>
        <li>Follow the Theme Store link to preview or buy the theme, and review detected apps.</li>
      </ol>
      <h2>Understanding app detection</h2>
      <p>Apps are identified from the scripts they load, like Klaviyo for email, Judge.me or Loox for reviews and ReCharge for subscriptions. Apps that only run in the admin or checkout cannot be seen from the storefront, so the list may be incomplete.</p>
      <p>Not sure the site is on Shopify? Run the <Link to="/tools/cms-detector">CMS Detector</Link> first. To match the store's look, extract its palette with the <Link to="/tools/website-extractor">Website Extractor</Link>.</p>
    </>
  );
}
