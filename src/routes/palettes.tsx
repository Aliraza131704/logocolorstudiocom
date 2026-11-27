import { createFileRoute, Link } from "@tanstack/react-router";
import { PaletteGallery } from "@/components/site/PaletteGallery";
import { Button } from "@/components/ui/button";
import { pageHead, absoluteUrl } from "@/lib/seo";
import { getPublicSetting } from "@/lib/content.functions";
import { TOOL_CONTENT_KEY, toolOverride, withMeta } from "@/lib/tool-overrides";
import { PageExtras } from "@/components/site/PageExtras";
import { getFeaturedPalettes } from "@/lib/palette-editorial";
import { PAGE_META } from "@/lib/page-meta";
import { Breadcrumbs, breadcrumbLd, faqLd, FaqList } from "@/components/site/ui-bits";
import { COMBINATIONS, PALETTE_FAQS } from "@/lib/palettes-landing";

const CRUMBS = [{ label: "Color palettes" }];

export const Route = createFileRoute("/palettes")({
  loader: () => getPublicSetting({ data: { key: TOOL_CONTENT_KEY } }),
  head: ({ loaderData }) => {
    const o = toolOverride(loaderData, "page-palettes");
    const itemList = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Logo color palettes",
      numberOfItems: 1000,
      itemListElement: getFeaturedPalettes().slice(0, 30).map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, url: absoluteUrl(`/palette/${p.slug}`) })),
    };
    return pageHead(withMeta(o, { ...PAGE_META["/palettes"], path: "/palettes", jsonLd: [breadcrumbLd(CRUMBS, "/palettes"), itemList, ...(o?.faqs ? [] : [faqLd(PALETTE_FAQS)])] }));
  },
  component: GalleryPage,
});

const linkCls = "font-medium text-primary underline-offset-4 hover:underline";

function GalleryPage() {
  const o = toolOverride(Route.useLoaderData(), "page-palettes");
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={CRUMBS} />
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-bold">{o?.title ?? "Explore 1,000+ Logo Color Palettes & Brand Color Ideas"}</h1>
        <Button asChild variant="hero"><Link to="/tools/palette-generator">Create a palette</Link></Button>
      </div>
      {o?.intro ? <p className="mb-10 max-w-3xl text-muted-foreground">{o.intro}</p> : (
        <section className="mb-10 max-w-3xl">
          <h2 className="text-2xl font-bold">Find the perfect logo color palette for your brand</h2>
          <p className="mt-3 text-muted-foreground">
            A logo color palette is the small group of colors a brand uses in its logo and repeats everywhere else: website, packaging, social posts and signs. The right color combination makes a business easier to recognise and tells people how it wants to feel, whether that is calm, bold, friendly or premium. Choose colors that suit your industry and audience, keep one main color with one or two supporting colors, and make sure text stays readable. Every palette below lists its HEX codes, so designers can paste the exact values into Figma, Canva, CSS or a print brief. Browse 1,000 free palettes by style, open any one to copy its codes, or{" "}
            <Link to="/tools/logo-extractor" className={linkCls}>extract colors from your logo</Link> to start from what you already have.
          </p>
        </section>
      )}
      <PaletteGallery />
      <div className="mx-auto mt-16 max-w-3xl space-y-12">
        <section>
          <h2 className="text-2xl font-bold">Popular logo color combinations</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {COMBINATIONS.map((c) => (
              <li key={c.name} className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex overflow-hidden rounded-md border" aria-hidden="true">{c.colors.map((h) => <span key={h} className="size-8" style={{ backgroundColor: h }} />)}</div>
                  <h3 className="font-semibold">{c.name}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{c.text}</p>
                <p className="mt-2 font-mono text-xs">{c.colors.join(" · ")}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-muted-foreground">Want to see how real companies combine colors? <Link to="/brand-colors" className={linkCls}>Explore brand color combinations</Link> from nearly 200 well-known brands.</p>
        </section>
        <section>
          <h2 className="text-2xl font-bold">How to choose the best logo color palette</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
            <li><strong className="text-foreground">Industry:</strong> blues and greens feel safe for finance and health; reds and oranges suit food and sport; black and gold signal luxury.</li>
            <li><strong className="text-foreground">Audience:</strong> younger audiences often respond to brighter, playful colors, while business buyers expect calmer tones.</li>
            <li><strong className="text-foreground">Personality:</strong> decide whether your brand is serious, friendly, bold or gentle, then pick a main color that matches.</li>
            <li><strong className="text-foreground">Readability:</strong> your logo must work small, on dark and light backgrounds, and in one color. <Link to="/tools/contrast-checker" className={linkCls}>Check color contrast</Link> before you commit.</li>
          </ul>
          <p className="mt-4 text-muted-foreground">If none of the ready palettes fit, <Link to="/tools/palette-generator" className={linkCls}>generate a custom brand color palette</Link> from one starting color.</p>
        </section>
        <section>
          <h2 className="text-2xl font-bold">Why brand colors matter</h2>
          <p className="mt-4 text-muted-foreground">People notice color before they read a name. When the same colors appear on your logo, website, packaging and posts, customers start to recognise you at a glance. Inconsistent colors make a brand look unplanned. Writing your palette down as HEX codes, and using the same codes every time, is the simplest way to keep your visual identity consistent. The <Link to="/tools/theme-generator" className={linkCls}>Theme Generator</Link> turns a palette into ready website colors.</p>
        </section>
        <section>
          <h2 className="text-2xl font-bold">Free logo color palettes with HEX codes</h2>
          <p className="mt-4 text-muted-foreground">Filter the gallery by style, such as pastel, dark, retro or neon, then open a palette to copy each HEX and RGB code with one click. Paste the codes into your design tool or stylesheet, or export them as CSS. For individual shades with names, see our <Link to="/color-names" className={linkCls}>color names</Link> pages.</p>
        </section>
      </div>
      {!o?.faqs && <div className="mt-16"><FaqList faqs={PALETTE_FAQS} /></div>}
      <PageExtras o={o} />
    </div>
  );
}
