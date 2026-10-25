import { createFileRoute, Link } from "@tanstack/react-router";
import { PaletteGallery } from "@/components/site/PaletteGallery";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { getFeaturedPalettes } from "@/lib/palette-editorial";
export const Route = createFileRoute("/palettes")({
  head: () => pageHead({ title: "Color Palette Gallery — LogoColorStudio", description: `Browse ${getFeaturedPalettes().length} featured color palettes and the full 1,000-palette library. Filter by style, copy colors and compare contrast.`, path: "/palettes" }),
  component: GalleryPage,
});
function GalleryPage() {
 return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><div className="mb-10 flex flex-wrap items-center justify-between gap-4"><h1 className="text-4xl font-bold">Color palettes</h1><Button asChild variant="hero"><Link to="/tools/palette-generator">Create a palette</Link></Button></div><PaletteGallery /></div>;
}
