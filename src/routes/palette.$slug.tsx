import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { getAllPalettes, getPalette } from "@/lib/palettes";
import { PaletteRow } from "@/components/site/PaletteRow";
import { ExportBox, savePalette } from "@/components/site/tool-parts";
import { Breadcrumbs, breadcrumbLd } from "@/components/site/ui-bits";
import { likesQuery, useLike } from "@/components/site/PaletteGallery";
import { Button } from "@/components/ui/button";
import { contrastRatio, hexToHsl, readableOn } from "@/lib/color";
import { isIndexablePalette, paletteEditorial } from "@/lib/palette-editorial";
import { paletteTextColor } from "@/lib/palette-presentation";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/palette/$slug")({
  loader: ({ params }) => {
    const p = getPalette(params.slug);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData: p, params }) =>
    p
      ? pageHead({
          title: `${p.name} Color Palette — ${p.colors.slice(0, 3).join(" ")}`.slice(0, 60),
          description: `${p.name} is a ${p.tags.join(", ").toLowerCase()} palette: ${p.colors.join(", ")}. Copy HEX and RGB or export CSS, Tailwind and JSON.`,
          path: `/palette/${params.slug}`,
          noindex: !isIndexablePalette(p.slug),
          follow: true,
          image: isIndexablePalette(p.slug) ? `/images/share/palette-${p.slug}.jpg` : undefined,
          type: "article",
          jsonLd: [breadcrumbLd([{ label: "Palettes", to: "/palettes" }, { label: p.name }], `/palette/${params.slug}`)],
        })
      : { meta: [{ title: "Palette not found" }, { name: "robots", content: "noindex" }] },
  component: Page,
});

const hueName = (h: number) => ["red", "orange", "yellow", "green", "teal", "blue", "indigo", "purple", "pink"][Math.floor(((h + 15) % 360) / 40)];

function Page() {
  const p = Route.useLoaderData();
  const { data: likes = {} } = useQuery(likesQuery);
  const { mine, like } = useLike();
  const similar = getAllPalettes().filter((x) => x.slug !== p.slug && x.tags[0] === p.tags[0]).slice(0, 6);
  const hues = [...new Set(p.colors.map((c) => hueName(hexToHsl(c).h)))];
  const best = Math.max(...p.colors.flatMap((a) => p.colors.map((b) => contrastRatio(a, b))));
  const editorial = paletteEditorial(p);
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Palettes", to: "/palettes" }, { label: p.name }]} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-bold">{p.name} palette</h1>
        <Button variant="outline" onClick={() => like(p.slug)} aria-label="Like palette">
          <Heart className={cn("size-4", mine.has(p.slug) && "fill-brand-red text-brand-red")} /> {likes[p.slug] ?? 0}
        </Button>
      </div>
      <div className="mt-6"><PaletteRow colors={p.colors} title={p.tags.join(" · ")} /></div>
      <div className="mt-6"><ExportBox colors={p.colors} name={p.slug.split("-")[0]} /></div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild variant="hero" onClick={() => savePalette(p.colors)}><Link to="/tools/theme-generator">Build a theme with this palette</Link></Button>
        <Button asChild variant="outline" onClick={() => savePalette(p.colors)}><Link to="/tools/palette-generator">Edit in generator</Link></Button>
      </div>
      <article className="prose-content mt-12">
        <h2>About the {p.name} palette</h2>
        <p>{editorial.description}</p>
        <p>{p.name} is a {p.tags[0].toLowerCase()} color palette built from {hues.join(", ")} tones. It contains five colors: {p.colors.join(", ")}. The strongest contrast pair in the palette reaches {best.toFixed(1)}:1, {best >= 4.5 ? "which is enough for readable body text (WCAG AA)" : "so pair it with a darker neutral for body text"}.</p>
        <h3>How to use it</h3>
        <p>Use the darkest shade for text or backgrounds, the most saturated color for buttons and links, and lighter tones for surfaces and highlights. Copy the CSS variables above, or check any pair in the <Link to="/tools/contrast-checker">Contrast Checker</Link>.</p>
      </article>
      <section className="mt-10" aria-labelledby="palette-uses">
        <h2 id="palette-uses" className="text-2xl font-bold">Suggested use cases</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">{editorial.uses.map(use => <li key={use}>{use}</li>)}</ul>
      </section>
      <section className="mt-10" aria-labelledby="palette-preview">
        <h2 id="palette-preview" className="text-2xl font-bold">Live palette preview</h2>
        <div className="mt-4 grid gap-6 border p-6 sm:grid-cols-2" style={{ backgroundColor: editorial.light, color: paletteTextColor(editorial.light) }}>
          <div><p className="text-sm">{p.name}</p><h3 className="mt-3 text-2xl font-bold">A new point of view</h3><p className="mt-3">Color, clarity and a little personality.</p><Button asChild className="mt-5" style={{ backgroundColor: editorial.accent, color: paletteTextColor(editorial.accent) }}><Link to="/tools/theme-generator" onClick={() => savePalette(p.colors)}>Explore the theme</Link></Button></div>
          <div className="rounded-lg p-5" style={{ backgroundColor: editorial.dark, color: paletteTextColor(editorial.dark) }}><h3 className="text-xl font-semibold">Made for your next project</h3><p className="mt-3">Thoughtful details. A clear direction.</p><div className="mt-5 flex h-12 overflow-hidden rounded">{p.colors.map(c => <span key={c} className="flex-1" style={{ backgroundColor: c }} />)}</div></div>
        </div>
      </section>
      <section className="mt-10" aria-labelledby="palette-contrast">
        <h2 id="palette-contrast" className="text-2xl font-bold">Contrast against white and black</h2>
        <p className="mt-2 text-muted-foreground">Normal text needs 4.5:1 for AA or 7:1 for AAA. Large text needs 3:1 for AA.</p>
        <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-3">Color</th><th className="p-3">White text</th><th className="p-3">Black text</th></tr></thead><tbody>{p.colors.map(c => <tr key={c} className="border-b"><th className="p-3 font-mono"><span className="mr-2 inline-block size-4 border align-middle" style={{ backgroundColor: c }} />{c}</th>{["#FFFFFF", "#000000"].map(text => { const ratio = contrastRatio(c, text); return <td key={text} className="p-3">{ratio.toFixed(2)}:1 · {ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "Large text only" : "Fails AA"}</td>; })}</tr>)}</tbody></table></div>
      </section>
      <section className="mt-12">
        <h2 className="text-2xl font-bold">Similar palettes</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {similar.map((s) => (
            <Link key={s.slug} to="/palette/$slug" params={{ slug: s.slug }} className="card-hover overflow-hidden rounded-2xl border bg-card">
              <div className="flex h-20">{s.colors.map((c) => <div key={c} className="flex-1" style={{ backgroundColor: c }} />)}</div>
              <p className="p-3 text-sm font-medium">{s.name}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
