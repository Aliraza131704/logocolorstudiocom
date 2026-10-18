import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { getAllPalettes, getPalette } from "@/lib/palettes";
import { PaletteRow } from "@/components/site/PaletteRow";
import { ExportBox, savePalette } from "@/components/site/tool-parts";
import { Breadcrumbs, breadcrumbLd } from "@/components/site/ui-bits";
import { likesQuery, useLike } from "@/components/site/PaletteGallery";
import { Button } from "@/components/ui/button";
import { contrastRatio, hexToHsl } from "@/lib/color";
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
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Palettes", to: "/palettes" }, { label: p.name }]} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-bold">{p.name} palette</h1>
        <button onClick={() => like(p.slug)} className="flex items-center gap-2 rounded-full border px-4 py-2" aria-label="Like palette">
          <Heart className={cn("size-4", mine.has(p.slug) && "fill-brand-red text-brand-red")} /> {likes[p.slug] ?? 0}
        </button>
      </div>
      <div className="mt-6"><PaletteRow colors={p.colors} title={p.tags.join(" · ")} /></div>
      <div className="mt-6"><ExportBox colors={p.colors} name={p.slug.split("-")[0]} /></div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild variant="hero" onClick={() => savePalette(p.colors)}><Link to="/tools/theme-generator">Build a theme with this palette</Link></Button>
        <Button asChild variant="outline" onClick={() => savePalette(p.colors)}><Link to="/palettes">Edit in generator</Link></Button>
      </div>
      <article className="prose-content mt-12">
        <h2>About the {p.name} palette</h2>
        <p>{p.name} is a {p.tags[0].toLowerCase()} color palette built from {hues.join(", ")} tones. It contains five colors: {p.colors.join(", ")}. The strongest contrast pair in the palette reaches {best.toFixed(1)}:1, {best >= 4.5 ? "which is enough for readable body text (WCAG AA)" : "so pair it with a darker neutral for body text"}.</p>
        <h3>How to use it</h3>
        <p>Use the darkest shade for text or backgrounds, the most saturated color for buttons and links, and lighter tones for surfaces and highlights. Copy the CSS variables above, or check any pair in the <Link to="/tools/contrast-checker">Contrast Checker</Link>.</p>
      </article>
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
