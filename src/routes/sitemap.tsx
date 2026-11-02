import { createFileRoute, Link } from "@tanstack/react-router";
import { listPosts } from "@/lib/content.functions";
import { Breadcrumbs, breadcrumbLd } from "@/components/site/ui-bits";
import { pageHead } from "@/lib/seo";
import { getPublicSetting } from "@/lib/content.functions";
import { TOOL_CONTENT_KEY, toolOverride, withMeta } from "@/lib/tool-overrides";
import { PageExtras } from "@/components/site/PageExtras";
import { TOOLS } from "@/lib/tools";
import { getIndexablePalettes } from "@/lib/palette-editorial";
import { BRAND_CATEGORIES, BRANDS } from "@/lib/brands";

export const Route = createFileRoute("/sitemap")({
  loader: async () => { const [posts, ov] = await Promise.all([listPosts(), getPublicSetting({ data: { key: TOOL_CONTENT_KEY } })]); return { posts, ov }; },
  head: ({ loaderData }) => pageHead(withMeta(toolOverride(loaderData?.ov, "page-sitemap"), {
      title: "Sitemap — Every Page on LogoColorStudio",
      description:
        "Complete sitemap of LogoColorStudio: all free color tools, the 1,000-palette gallery, every guide and article, downloads, giveaway and legal pages in one place.",
      path: "/sitemap",
      jsonLd: [breadcrumbLd([{ label: "Sitemap" }], "/sitemap")],
    })),
  component: Page,
});

const MAIN = [
  ["Home", "/"],
  ["All tools", "/tools"],
  ["Palette gallery", "/palettes"],
  ["Blog", "/blog"],
  ["Brand Colors", "/brand-colors"],
  ["Downloads", "/downloads"],
  ["Giveaway", "/giveaway"],
  ["About", "/about"],
  ["Contact", "/contact"],
  ["Changelog", "/changelog"],
] as const;

const LEGAL = [
  ["Privacy Policy", "/privacy-policy"],
  ["Terms of Service", "/terms-of-service"],
  ["Cookie Policy", "/cookie-policy"],
  ["Disclaimer", "/disclaimer"],
] as const;

function LinkList({ items }: { items: readonly (readonly [string, string])[] }) {
  return (
    <ul className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
      {items.map(([label, path]) => (
        <li key={path}>
          <Link to={path} className="text-foreground/80 hover:text-primary">{label}</Link>
        </li>
      ))}
    </ul>
  );
}

function Page() {
  const { posts, ov } = Route.useLoaderData();
  const o = toolOverride(ov, "page-sitemap");
  const palettes = getIndexablePalettes();
  const letters = [...new Set(palettes.map((p) => p.name[0].toUpperCase()))].sort();
  const byLetter = (l: string) => palettes.filter((p) => p.name[0].toUpperCase() === l);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Sitemap" }]} />
      <h1 className="text-4xl font-bold sm:text-5xl">{o?.title ?? "Site map"}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        Every page on LogoColorStudio in one place — {MAIN.length} main pages, {TOOLS.length} free tools,{" "}
        {posts.length} {posts.length === 1 ? "guide" : "guides"}, {palettes.length} palette pages and {LEGAL.length} policy pages.
      </p>

      <section aria-labelledby="sitemap-main" className="mt-12">
        <h2 id="sitemap-main" className="text-2xl font-bold">Main pages</h2>
        <LinkList items={MAIN} />
      </section>

      <section aria-labelledby="sitemap-tools" className="mt-12">
        <h2 id="sitemap-tools" className="text-2xl font-bold">Free tools</h2>
        <ul className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          {TOOLS.map((t) => (
            <li key={t.path}>
              <Link to={t.path} className="block font-semibold hover:text-primary">{t.name}</Link>
              <span className="text-muted-foreground">{t.short}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sitemap-articles" className="mt-12">
        <h2 id="sitemap-articles" className="text-2xl font-bold">Guides and articles</h2>
        {posts.length === 0 ? (
          <p className="mt-4 text-muted-foreground">Articles are coming soon.</p>
        ) : (
          <ul className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <li key={p.id}>
                <Link to="/blog/$slug" params={{ slug: p.slug }} className="text-foreground/80 hover:text-primary">{p.title}</Link>
                <span className="ml-1 text-xs uppercase tracking-wide text-muted-foreground">{p.category}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="sitemap-brands" className="mt-12">
        <h2 id="sitemap-brands" className="text-2xl font-bold">Brand colors</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {BRANDS.length} brand palette pages, grouped by category. Browse them with search and filters on the{" "}
          <Link to="/brand-colors" className="text-primary hover:underline">Brand Colors page</Link>.
        </p>
        <div className="mt-6 space-y-8">
          {BRAND_CATEGORIES.map((c) => {
            const items = BRANDS.filter((b) => b.category === c.id);
            if (!items.length) return null;
            return (
              <section key={c.id} aria-labelledby={`brands-${c.id}`}>
                <h3 id={`brands-${c.id}`} className="text-lg font-bold">
                  {c.label} <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
                </h3>
                <ul className="mt-2 columns-2 gap-8 text-sm md:columns-3 lg:columns-4">
                  {items.map((b) => (
                    <li key={b.slug} className="break-inside-avoid py-0.5">
                      <Link to="/brand-colors/$slug" params={{ slug: b.slug }} className="text-foreground/80 hover:text-primary">{b.name}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="sitemap-palettes" className="mt-12">
        <h2 id="sitemap-palettes" className="text-2xl font-bold">Color palettes</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {palettes.length} palette pages, listed alphabetically by first letter. Browse them all in the{" "}
          <Link to="/palettes" className="text-primary hover:underline">palette gallery</Link>.
        </p>
        <nav aria-label="Palette letters" className="mt-5 flex flex-wrap gap-1.5">
          {letters.map((l) => (
            <a key={l} href={`#palette-${l.toLowerCase()}`} className="rounded-md border px-2.5 py-1 text-xs font-semibold hover:text-primary">
              {l}
            </a>
          ))}
        </nav>
        <div className="mt-8 space-y-8">
          {letters.map((l) => {
            const items = byLetter(l);
            const id = `palette-${l.toLowerCase()}`;
            return (
              <section key={l} aria-labelledby={id} className="scroll-mt-24">
                <h3 id={id} className="text-lg font-bold">
                  {l} <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
                </h3>
                <ul className="mt-2 columns-2 gap-8 text-sm md:columns-3 lg:columns-4">
                  {items.map((p) => (
                    <li key={p.slug} className="break-inside-avoid py-0.5">
                      <Link to="/palette/$slug" params={{ slug: p.slug }} className="text-foreground/80 hover:text-primary">{p.name}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="sitemap-legal" className="mt-12">
        <h2 id="sitemap-legal" className="text-2xl font-bold">Policies</h2>
        <LinkList items={LEGAL} />
      </section>

      <section aria-labelledby="sitemap-xml" className="mt-12">
        <h2 id="sitemap-xml" className="text-2xl font-bold">XML sitemap</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Search engines can crawl the machine-readable version at{" "}
          <a href="/sitemap.xml" className="text-primary hover:underline">/sitemap.xml</a>, or read it through the{" "}
          <a href="/robots.txt" className="text-primary hover:underline">robots.txt</a> file.
        </p>
      </section>
      <PageExtras o={o} />
    </div>
  );
}
