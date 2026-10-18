import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { UploadCloud, ArrowRight } from "lucide-react";
import { ToolLayout } from "@/components/site/ToolLayout";
import { ColorCard, ExportBox, savePalette } from "@/components/site/tool-parts";
import { faqLd, breadcrumbLd, type Faq } from "@/components/site/ui-bits";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { extractColors } from "@/lib/color";
import { pageHead } from "@/lib/seo";
import { toast } from "sonner";

const FAQS: Faq[] = [
  { q: "Is my logo uploaded to a server?", a: "No. The image is read by your browser and analysed locally, so it never leaves your device." },
  { q: "Which file types work?", a: "PNG, JPG, WebP, GIF and SVG files up to 10 MB." },
  { q: "Why do I see colors that are not in my logo?", a: "Low-quality JPGs create blended edge pixels. Use a transparent PNG or SVG, or lower the number of colors." },
  { q: "Can I export the colors?", a: "Yes, as CSS variables, Tailwind config, SCSS or JSON, or send them to the Palette Generator." },
];

export const Route = createFileRoute("/tools/logo-extractor")({
  head: () =>
    pageHead({
      title: "Logo Color Extractor — Get HEX, RGB & HSL",
      description: "Upload any logo and instantly extract its exact brand colors in HEX, RGB and HSL. Export to CSS, Tailwind, SCSS or JSON. Free and private.",
      path: "/tools/logo-extractor",
      jsonLd: [
        { "@context": "https://schema.org", "@type": "WebApplication", name: "Logo Color Extractor", applicationCategory: "DesignApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
        faqLd(FAQS),
        breadcrumbLd([{ label: "Tools", to: "/tools" }, { label: "Logo Extractor" }], "/tools/logo-extractor"),
      ],
    }),
  component: Page,
});

function Page() {
  const [img, setImg] = useState<string | null>(null);
  const [k, setK] = useState(6);
  const [colors, setColors] = useState<{ hex: string; share: number }[]>([]);
  const [drag, setDrag] = useState(false);
  const pixels = useRef<Uint8ClampedArray | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const run = (n: number) => { if (pixels.current) setColors(extractColors(pixels.current, n)); };

  const handle = useCallback((file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file.");
    if (file.size > 10 * 1024 * 1024) return toast.error("File is larger than 10 MB.");
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      const c = document.createElement("canvas");
      const scale = Math.min(1, 400 / Math.max(im.width, im.height));
      c.width = Math.max(1, im.width * scale); c.height = Math.max(1, im.height * scale);
      const ctx = c.getContext("2d")!;
      ctx.drawImage(im, 0, 0, c.width, c.height);
      pixels.current = ctx.getImageData(0, 0, c.width, c.height).data;
      setImg(url);
      run(k);
    };
    im.onerror = () => toast.error("Could not read that image.");
    im.src = url;
  }, [k]);

  const hexes = colors.map((c) => c.hex);

  return (
    <ToolLayout
      slug="logo-extractor"
      title="Logo Color Extractor"
      intro="Drop your logo to get its exact brand colors with HEX, RGB and HSL values, then export them as code."
      faqs={FAQS}
      about={<About />}
    >
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
          className={`flex min-h-72 flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-card p-6 text-center transition ${drag ? "border-primary bg-accent" : ""}`}
        >
          {img ? <img src={img} alt="Uploaded logo preview" className="max-h-44 max-w-full object-contain" /> : <UploadCloud className="size-12 text-primary" />}
          <p className="mt-4 font-medium">Drop your logo here</p>
          <p className="text-sm text-muted-foreground">PNG, JPG, SVG or WebP · up to 10 MB</p>
          <Button className="mt-4" onClick={() => input.current?.click()}>Choose file</Button>
          <input ref={input} type="file" accept="image/*" className="hidden" aria-label="Upload logo" onChange={(e) => handle(e.target.files?.[0])} />
          {img && (
            <div className="mt-6 w-full text-left">
              <label className="text-sm font-medium">Number of colors: {k}</label>
              <Slider className="mt-3" min={2} max={10} step={1} value={[k]} onValueChange={([v]) => { setK(v); run(v); }} aria-label="Number of colors" />
            </div>
          )}
        </div>
        <div>
          {colors.length === 0 ? (
            <div className="flex h-full min-h-72 items-center justify-center rounded-2xl border bg-card/50 text-muted-foreground">No artwork loaded yet</div>
          ) : (
            <div className="space-y-6">
              <div className="flex h-16 overflow-hidden rounded-2xl border">
                {colors.map((c) => <div key={c.hex} style={{ backgroundColor: c.hex, flex: c.share }} title={c.hex} />)}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {colors.map((c) => <ColorCard key={c.hex} hex={c.hex} sub={`${Math.round(c.share * 100)}%`} onRemove={() => setColors(colors.filter((x) => x.hex !== c.hex))} />)}
              </div>
              <ExportBox colors={hexes} />
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="hero" onClick={() => savePalette(hexes)}><Link to="/palettes">Generate palettes from these colors <ArrowRight /></Link></Button>
                <Button asChild variant="outline" onClick={() => savePalette(hexes)}><Link to="/tools/theme-generator">Build a theme</Link></Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}

function About() {
  return (
    <>
      <h2>What the Logo Color Extractor does</h2>
      <p>The Logo Color Extractor reads every pixel of your logo and finds the handful of colors that really define your brand. Instead of guessing with an eyedropper, you get precise HEX, RGB and HSL values, the share of the logo each color covers, and ready-to-use code for your website or design system.</p>
      <p>Everything happens inside your browser. Your file is drawn onto an invisible canvas, transparent pixels and soft anti-aliased edges are ignored, and the remaining pixels are grouped with a k-means clustering algorithm. Similar shades are merged so you are not left with ten nearly identical blues.</p>
      <h2>How to extract colors from a logo</h2>
      <ol>
        <li>Click <strong>Choose file</strong> or drag your logo into the drop area.</li>
        <li>Adjust the <strong>number of colors</strong> slider until the results match your artwork.</li>
        <li>Remove any background or stray colors with the × button.</li>
        <li>Copy single values, or export the full set as CSS variables, Tailwind, SCSS or JSON.</li>
        <li>Send the colors to the <Link to="/palettes">Palette Generator</Link> or <Link to="/tools/theme-generator">Theme Generator</Link> to build a complete system.</li>
      </ol>
      <h2>Tips for the most accurate results</h2>
      <p>Use the original vector (SVG) or a high-resolution transparent PNG. Heavily compressed JPGs introduce noise and can produce extra in-between colors. If your logo sits on a solid background, remove that color from the results after extraction. For gradient logos, increase the color count to capture more stops.</p>
      <h2>Why exact brand colors matter</h2>
      <p>Consistent colors build recognition. When a website, an ad and an invoice all use slightly different blues, the brand feels less trustworthy. Extracting precise values once and sharing them as design tokens keeps every channel aligned. Before using brand colors for text, check them with the <Link to="/tools/contrast-checker">Contrast Checker</Link> so they stay readable for everyone.</p>
    </>
  );
}
