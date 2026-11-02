import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { BRAND_CATEGORIES, BRANDS, brandPath, getBrand, type Brand } from "@/lib/brands";
import { BrandLogo } from "@/components/site/BrandLogo";
import { BrandDetail } from "@/components/site/BrandDetail";
import { breadcrumbLd } from "@/components/site/ui-bits";
import { pageHead } from "@/lib/seo";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/brand-colors/")({
  head: () =>
    pageHead({
      title: `Brand Colors: Official Logo Palettes of ${BRANDS.length}+ Famous Brands`,
      description: `Explore the official logo colors of ${BRANDS.length}+ world-famous brands. Copy HEX, RGB and HSL, pick colors straight from each logo, and download palettes as PNG, CSS or Tailwind.`,
      path: "/brand-colors",
      jsonLd: [breadcrumbLd([{ label: "Brand Colors" }], "/brand-colors")],
    }),
  component: Page,
});

function Page() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [open, setOpen] = useState<Brand | null>(null);

  // Close the popup when the user presses the browser Back button.
  useEffect(() => {
    const onPop = () => { (window as any).__bcPop = ((window as any).__bcPop || 0) + 1; setOpen(null); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const openBrand = (b: Brand) => {
    window.history.pushState({ brand: b.slug }, "", brandPath(b));
    setOpen(b);
  };
  const closeBrand = () => {
    if (window.history.state?.brand) window.history.back();
    else setOpen(null);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BRANDS.filter(
      (b) => (cat === "all" || b.category === cat) && (!q || b.name.toLowerCase().includes(q)),
    );
  }, [query, cat]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-bold">Brand colors</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        The official logo palettes of {BRANDS.length} world-famous brands. Click any brand to copy its HEX, RGB and HSL
        values, pick colors directly from the logo, and download the palette as PNG, CSS variables or a Tailwind config.
      </p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brands…"
            aria-label="Search brands"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <Button size="sm" variant={cat === "all" ? "hero" : "outline"} onClick={() => setCat("all")}>All</Button>
          {BRAND_CATEGORIES.map((c) => (
            <Button key={c.id} size="sm" variant={cat === c.id ? "hero" : "outline"} onClick={() => setCat(c.id)}>
              {c.label}
            </Button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
        {filtered.length} brand{filtered.length === 1 ? "" : "s"}
      </p>

      <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.map((b) => (
          <li key={b.slug}>
            <a
              href={brandPath(b)}
              className="group flex flex-col items-center gap-3 rounded-xl border bg-card p-5 transition hover:border-primary hover:shadow-md"
              onClick={(e) => {
                e.preventDefault();
                openBrand(b);
              }}
            >
              <BrandLogo brand={b} size={128} className="h-16 w-16" />
              <span className="text-center text-sm font-semibold group-hover:text-primary">{b.name}</span>
              <span className="flex gap-1" aria-hidden>
                {b.colors.slice(0, 4).map((c) => (
                  <span key={c.hex} className="size-3 rounded-full border" style={{ backgroundColor: c.hex }} />
                ))}
              </span>
            </a>
          </li>
        ))}
      </ul>

      <Dialog open={open !== null} onOpenChange={(v) => { if (!v) closeBrand(); }}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto" aria-label={open ? `${open.name} brand colors` : undefined}>
          <DialogTitle className="sr-only">{open ? `${open.name} brand colors` : "Brand colors"}</DialogTitle>
          {open && <BrandDetail brand={open} headingLevel={2} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
