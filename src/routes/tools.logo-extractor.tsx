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
import logoExtractImg from "@/assets/guide-logo-extract.jpg";
import colorWheelImg from "@/assets/guide-color-wheel.jpg";
import { toast } from "sonner";

const FAQS: Faq[] = [
  { q: "Is the Logo Color Extractor free?", a: "Yes. It is free with no account, watermark or usage limit." },
  { q: "Is my logo uploaded to a server?", a: "No. The image is read by your browser and analysed locally, so it never leaves your device." },
  { q: "Which file types work?", a: "PNG, JPG, WebP, GIF and SVG files up to 10 MB." },
  { q: "How do I get the HEX code from a picture?", a: "Drop the image into the tool and every extracted color shows its HEX code. Click a value to copy it." },
  { q: "Why do I see colors that are not in my logo?", a: "Low-quality JPGs create blended edge pixels. Use a transparent PNG or SVG, or lower the number of colors." },
  { q: "How accurate are the extracted colors?", a: "With original PNG or SVG files the values match the artwork closely. Compressed JPGs and screenshots can shift colors slightly." },
  { q: "Can I extract colors from a protected image?", a: "The tool only reads files you choose from your device. Make sure you have the right to use the brand colors you extract, and respect trademarks." },
  { q: "Does it give CMYK or Pantone values?", a: "It provides HEX, RGB and HSL for screens. For print, ask your printer to match the HEX values to CMYK or Pantone and check a proof." },
  { q: "How many colors should I extract?", a: "Two to four for flat logos, more for gradients or illustrations. Adjust the slider until the swatches match the artwork." },
  { q: "Can I export the colors?", a: "Yes, as CSS variables, Tailwind config, SCSS or JSON, or send them to the Palette Generator." },
  { q: "Can I extract colors from a website instead?", a: "Yes. Use the Website Extractor to read colors, fonts and the logo from any public URL." },
  { q: "Will it work on my phone?", a: "Yes. It runs in any modern mobile or desktop browser." },
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
      title="Free Logo Color Extractor – Get HEX Codes From Any Image"
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
      <h2>Extract colors from an image online, free and private</h2>
      <p>The Logo Color Extractor turns any logo or brand graphic into a precise, ready-to-use color palette. Drop in a PNG, JPG, WebP, GIF or SVG and, in about a second, you get the handful of colors that really define the artwork, each with its HEX code, RGB value, HSL value and the share of the image it covers. Instead of guessing with an eyedropper or zooming into pixels, you get the exact values you need to rebuild a brand consistently on a website, in a slide deck or in print briefs.</p>
      <p>It is made for anyone who works with brand identity: designers rebuilding an old logo, developers who received a logo but no style guide, marketers preparing social graphics, small business owners setting up a website builder, and students learning color theory. If you have ever asked "what is the HEX code of this logo?" or needed to get a HEX code from a picture quickly, this is the tool for that job.</p>
      <p>Accurate brand colors matter more than most people expect. A logo that appears in three slightly different blues across a website, an invoice and an ad looks careless, and visitors notice inconsistency even when they cannot name it. Extracting the true values once and sharing them as design tokens keeps every channel aligned.</p>
      <p>Privacy is built in. Your file is never uploaded to our servers: it is read and analysed entirely inside your browser, so confidential client logos and unreleased artwork stay on your device. There is no sign-up, watermark or usage limit.</p>

      <figure><img src={logoExtractImg} alt="A multicolor logo mark splitting into five round color swatches with an eyedropper" width={1200} height={688} loading="lazy" className="rounded-2xl border" /><figcaption>Each distinct color in the logo becomes its own swatch with HEX, RGB and HSL values.</figcaption></figure>
      <h2>How to extract a color palette from a logo</h2>
      <ol>
        <li><strong>Add your image.</strong> Click <strong>Choose file</strong> or drag your logo into the drop area. Files up to 10 MB are supported.</li>
        <li><strong>Let it analyse.</strong> The tool reads the pixels, ignores transparent areas and soft edges, and groups similar shades.</li>
        <li><strong>Tune the color count.</strong> Move the <strong>number of colors</strong> slider until the swatches match your artwork. Simple flat logos need two to four; gradients need more.</li>
        <li><strong>Remove what you don't need.</strong> Delete a background color or stray shade with the × button on its card.</li>
        <li><strong>Copy or export.</strong> Copy single HEX or RGB values, or export the full set as CSS variables, a Tailwind config, SCSS or JSON.</li>
        <li><strong>Build a system.</strong> Send the colors to the <Link to="/tools/palette-generator">Palette Generator</Link> or <Link to="/tools/theme-generator">Theme Generator</Link> to create harmonies and a full UI theme.</li>
      </ol>

      <h2>Key features</h2>
      <ul>
        <li>Exact HEX, RGB and HSL values for every extracted color.</li>
        <li>Coverage percentage showing how much of the logo each color fills.</li>
        <li>Adjustable color count for flat, multi-color and gradient artwork.</li>
        <li>Transparent pixels and anti-aliased edges ignored automatically.</li>
        <li>Near-duplicate shades merged so results stay clean.</li>
        <li>100% in-browser processing; images never leave your device.</li>
        <li>Supports PNG, JPG, WebP, GIF and SVG.</li>
        <li>One-click copy for any value.</li>
        <li>Export as CSS custom properties, Tailwind, SCSS or JSON.</li>
        <li>Proportional palette strip for a quick visual summary.</li>
        <li>Direct hand-off to the palette, theme and contrast tools.</li>
        <li>Free, with no account and no watermark.</li>
      </ul>

      <h2>Color formats explained: HEX, RGB, HSL and CMYK</h2>
      <p><strong>HEX</strong> is the six-character code web designers use most, such as <code>#0A8CFF</code>. Each pair of characters is the red, green and blue amount in base 16, from 00 to FF.</p>
      <p><strong>RGB</strong> expresses the same color as three numbers from 0 to 255, for example <code>rgb(10, 140, 255)</code>. Screens mix red, green and blue light, so RGB is the native language of displays, apps and video.</p>
      <p><strong>HSL</strong> stands for hue, saturation and lightness. Hue is the position on the color wheel from 0 to 360 degrees, saturation is intensity and lightness is how close the color is to black or white. HSL is the easiest format for creating tints, shades and hover states because you can change one value at a time.</p>
      <p><strong>CMYK</strong> (cyan, magenta, yellow, black) is used for printing with ink. This tool reports screen formats; screen colors can look different in print, so for business cards or packaging ask your printer to match the HEX value to a CMYK or Pantone reference and check a physical proof.</p>

      <h2>Why brand colors and color psychology matter</h2>
      <p>Color is usually the first thing people remember about a brand, often before the name or the shape of the logo. Research on branding consistently finds that a signature color improves recognition, which is why companies protect their exact shades so carefully. When you extract the true values from a logo, you protect that recognition across every touchpoint.</p>
      <p>Colors also carry associations, though these depend on culture and context rather than fixed rules. Blue is widely linked with trust and calm, which is why it is common in finance and technology. Green suggests growth, health and nature. Orange and yellow feel energetic and friendly. Red signals urgency, passion or importance. Dark navy and black feel premium and serious. Understanding the mood of a logo's palette helps you extend it sensibly: an energetic orange brand rarely suits a muted gray website.</p>
      <p>Consistency is where extraction pays off. A precise palette lets developers build a design system with named tokens, lets marketers create graphics that match the website, and lets printers and agencies work from the same numbers. It also speeds up handovers: instead of sending a logo and hoping for the best, you send a short list of values that anyone can use.</p>
      <p>Finally, exact colors make accessibility work possible. You cannot check whether brand blue text is readable on white unless you know exactly which blue it is. Use the extracted values in the <Link to="/tools/contrast-checker">Contrast Checker</Link> to confirm text and buttons meet WCAG contrast ratios of at least 4.5:1 for normal text and 3:1 for large text.</p>

      <h2>Color harmonies: building on your logo colors</h2>
      <p>Most logos only contain two or three colors, but a website or campaign needs more. Color harmonies are proven ways to add colors that work together. <strong>Complementary</strong> colors sit opposite on the wheel and create strong contrast. <strong>Analogous</strong> colors sit next to each other and feel calm. <strong>Triadic</strong> palettes use three evenly spaced hues for a lively balance, while <strong>monochromatic</strong> palettes use tints and shades of one hue. The <Link to="/tools/palette-generator">Palette Generator</Link> creates each of these from a base color, and the <Link to="/palettes">palette gallery</Link> offers ready-made ideas.</p>

      <figure><img src={colorWheelImg} alt="Color wheel with triadic harmony lines beside palette cards, a monitor and a printer" width={1200} height={688} loading="lazy" className="rounded-2xl border" /><figcaption>Harmonies on the color wheel help extend a logo palette, while screen and print use different color models.</figcaption></figure>
      <h2>Who uses the Logo Color Extractor</h2>
      <p><strong>Designers</strong> use it to recover exact values when a client supplies only a logo file, or to compare a redrawn logo against the original. <strong>Developers</strong> paste the exported CSS variables or Tailwind config directly into a project, which avoids typos and mismatched shades. <strong>Marketers</strong> extract colors to keep social posts, ads, email templates and landing pages on-brand without waiting for a designer. <strong>SEO and content teams</strong> use the palette to make on-brand featured images and infographics. <strong>Business owners</strong> setting up Shopify, WordPress or a website builder use the HEX codes in theme settings so their site matches their signage and packaging. To grab colors from a live website instead of an image, try the <Link to="/tools/website-extractor">Website Extractor</Link>.</p>

      <h2>Tips for the most accurate results</h2>
      <p>Use the original vector (SVG) or a high-resolution transparent PNG. Heavily compressed JPGs create blended edge pixels and extra in-between colors. If your logo sits on a solid background, remove that color after extraction. For gradient logos, increase the color count to capture more stops. Screenshots can shift colors slightly because of display color profiles, so use original files when precision matters.</p>

      <h2>Technical deep dive: how extraction works</h2>
      <p>When you choose a file, your browser draws it onto an invisible canvas element at a size that keeps processing fast. The tool then reads the raw pixel data: every pixel's red, green, blue and alpha values. Pixels that are fully or mostly transparent are skipped, and very soft edge pixels created by anti-aliasing are down-weighted so they don't create false colors.</p>
      <p>The remaining pixels are grouped with <strong>k-means clustering</strong>. The algorithm places a set number of starting points in color space, assigns each pixel to its nearest point, moves each point to the average of its pixels, and repeats until the groups stabilise. Each final group becomes a swatch, and its size becomes the coverage percentage. Groups that end up almost identical are merged so you don't get several near-duplicate blues. Finally each color is converted to HEX, RGB and HSL. Because all of this runs locally in JavaScript, nothing is sent over the network.</p>
    </>
  );
}
