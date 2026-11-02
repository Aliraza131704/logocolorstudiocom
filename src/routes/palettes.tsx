import { createFileRoute, Link } from "@tanstack/react-router";
import { PaletteGallery } from "@/components/site/PaletteGallery";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { getPublicSetting } from "@/lib/content.functions";
import { TOOL_CONTENT_KEY, toolOverride, withMeta } from "@/lib/tool-overrides";
import { PageExtras } from "@/components/site/PageExtras";
import { getFeaturedPalettes } from "@/lib/palette-editorial";
export const Route = createFileRoute("/palettes")({
  loader: () => getPublicSetting({ data: { key: TOOL_CONTENT_KEY } }),
  head: ({ loaderData }) => pageHead(withMeta(toolOverride(loaderData, "page-palettes"), { title: "Color Palette Gallery — LogoColorStudio", description: `Browse ${getFeaturedPalettes().length} featured color palettes and the full 1,000-palette library. Filter by style, copy colors and compare contrast.`, path: "/palettes" })),
  component: GalleryPage,
});
function GalleryPage() {
 const o = toolOverride(Route.useLoaderData(), "page-palettes");
 return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><div className="mb-10 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-4xl font-bold">{o?.title ?? "Color palettes"}</h1>{o?.intro && <p className="mt-3 max-w-2xl text-muted-foreground">{o.intro}</p>}</div><Button asChild variant="hero"><Link to="/tools/palette-generator">Create a palette</Link></Button></div><PaletteGallery /><PageExtras o={o} /></div>;
}
