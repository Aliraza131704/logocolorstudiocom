import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { ToolLayout } from "@/components/site/ToolLayout";
import { ExportBox, loadPalette, savePalette } from "@/components/site/tool-parts";
import { download, faqLd, breadcrumbLd, type Faq } from "@/components/site/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeHex, randomHex, readableOn } from "@/lib/color";
import { pageHead } from "@/lib/seo";

const FAQS: Faq[] = [
  { q: "Which formats can I export?", a: "CSS custom properties, SCSS variables, a Tailwind config snippet, JSON with HEX/RGB/HSL, and a PNG image of the palette." },
  { q: "Can I rename the tokens?", a: "Yes. Change the token name prefix and every format updates instantly." },
  { q: "Where do colors come from?", a: "Your latest palette is loaded automatically. You can add, edit or remove colors here." },
  { q: "Is the PNG suitable for presentations?", a: "Yes. It is a high-resolution image with HEX labels, ideal for slides and brand guides." },
];

export const Route = createFileRoute("/tools/export-center")({
  head: () =>
    pageHead({
      title: "Export Center — CSS, Tailwind, SCSS & JSON",
      description: "Export any color palette as CSS variables, Tailwind config, SCSS, JSON or a PNG swatch image. Rename tokens and copy in one click.",
      path: "/tools/export-center",
      jsonLd: [faqLd(FAQS), breadcrumbLd([{ label: "Tools", to: "/tools" }, { label: "Export Center" }], "/tools/export-center")],
    }),
  component: Page,
});

export function paletteToPng(colors: string[], name = "palette") {
  const c = document.createElement("canvas");
  c.width = 1600; c.height = 900;
  const ctx = c.getContext("2d")!;
  const w = c.width / colors.length;
  colors.forEach((col, i) => {
    ctx.fillStyle = col; ctx.fillRect(i * w, 0, w + 1, c.height);
    ctx.fillStyle = readableOn(col); ctx.font = "bold 40px monospace";
    ctx.fillText(col, i * w + 30, c.height - 50);
  });
  c.toBlob((b) => b && download(`${name}.png`, b));
}

function Page() {
  const [colors, setColors] = useState<string[]>(["#0A8CFF", "#4CC53F", "#FFB11A", "#FF3B4E", "#0F1B3D"]);
  const [name, setName] = useState("brand");
  useEffect(() => { const p = loadPalette(); if (p?.length) setColors(p); }, []);
  useEffect(() => { savePalette(colors); }, [colors]);
  return (
    <ToolLayout slug="export-center" title="Export Center" intro="Turn any palette into production-ready code or a shareable image." faqs={FAQS} about={<About />}>
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4 rounded-2xl border bg-card p-6">
          <div>
            <label htmlFor="tok" className="text-sm font-medium">Token prefix</label>
            <Input id="tok" className="mt-2" value={name} maxLength={24} onChange={(e) => setName(e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "brand")} />
          </div>
          <div className="space-y-2">
            {colors.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="color" aria-label={`Color ${i + 1}`} value={c} onChange={(e) => setColors(colors.map((x, j) => (j === i ? normalizeHex(e.target.value)! : x)))} className="h-10 w-12 cursor-pointer rounded-lg border bg-transparent" />
                <Input defaultValue={c} key={c} className="font-mono" onBlur={(e) => { const n = normalizeHex(e.target.value); if (n) setColors(colors.map((x, j) => (j === i ? n : x))); }} />
                <Button variant="ghost" size="icon" aria-label="Remove color" onClick={() => setColors(colors.filter((_, j) => j !== i))} disabled={colors.length <= 1}><X /></Button>
              </div>
            ))}
          </div>
          <Button variant="outline" disabled={colors.length >= 10} onClick={() => setColors([...colors, randomHex()])}><Plus /> Add color</Button>
        </div>
        <div className="space-y-4">
          <div className="flex h-24 overflow-hidden rounded-2xl border">{colors.map((c, i) => <div key={i} className="flex-1" style={{ backgroundColor: c }} />)}</div>
          <ExportBox colors={colors} name={name} />
          <Button variant="hero" onClick={() => paletteToPng(colors, name)}>Download PNG</Button>
        </div>
      </div>
    </ToolLayout>
  );
}

function About() {
  return (
    <>
      <h2>One palette, every format</h2>
      <p>Designers think in swatches, developers think in tokens. The Export Center bridges the two by converting a palette into the formats each team actually uses. Instead of retyping HEX codes into config files, which leads to typos and slightly different shades across a product, you copy one block of code and paste it once.</p>
      <h2>Supported formats</h2>
      <ul>
        <li><strong>CSS custom properties</strong> for any modern website: <code>--brand-100: #0A8CFF;</code></li>
        <li><strong>Tailwind config</strong> that adds a color scale so you can write <code>bg-brand-100</code>.</li>
        <li><strong>SCSS variables</strong> for Sass-based projects and older design systems.</li>
        <li><strong>JSON</strong> with HEX, RGB and HSL values for design tokens pipelines, Figma plugins and mobile apps.</li>
        <li><strong>PNG image</strong> with labelled swatches for presentations, brand guides and client approval.</li>
      </ul>
      <h2>How to export a palette</h2>
      <ol>
        <li>Your most recent palette from any tool loads automatically, or edit the colors directly.</li>
        <li>Set a token prefix such as <code>brand</code> or <code>acme</code>.</li>
        <li>Choose a format tab, then copy or download the file.</li>
        <li>Download a PNG if you need a visual version.</li>
      </ol>
      <h2>Best practices for color tokens</h2>
      <p>Keep token names semantic in your app (for example <code>primary</code>, <code>surface</code>, <code>danger</code>) and map them to these raw brand tokens. That way, when your brand evolves, you change values in one place. Need a starting palette? Try the <Link to="/tools/logo-extractor">Logo Extractor</Link> or browse <Link to="/palettes">1,000 ready-made palettes</Link>.</p>
    </>
  );
}
