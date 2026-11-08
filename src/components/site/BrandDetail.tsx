import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Copy, Download, Pipette } from "lucide-react";
import { toast } from "sonner";
import { brandPath, brandLogoUrl, categoryLabel, relatedBrands, type Brand } from "@/lib/brands";
import { brandStory } from "@/lib/brand-text";
import { exportPalette, fmtHsl, fmtRgb, hexToRgb, readableOn, rgbToHex } from "@/lib/color";
import { BrandLogo } from "./BrandLogo";
import { Button } from "@/components/ui/button";

function CopyValue({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-label={`Copy ${label} ${value}`}
      className="group flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-xs hover:border-primary"
      onClick={() => {
        navigator.clipboard.writeText(value);
        setDone(true);
        toast.success(`${value} copied`);
        setTimeout(() => setDone(false), 1200);
      }}
    >
      <span className="text-muted-foreground">{label}</span> {value}
      {done ? <Check className="size-3 text-brand-green" /> : <Copy className="size-3 opacity-40 group-hover:opacity-100" />}
    </button>
  );
}

function download(filename: string, content: string | Blob, type = "text/plain") {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPng(b: Brand) {
  const w = 1000, h = 260;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, w, h);
  const sw = w / b.colors.length;
  b.colors.forEach((c, i) => {
    ctx.fillStyle = c.hex;
    ctx.fillRect(i * sw, 0, sw, h - 60);
    ctx.fillStyle = readableOn(c.hex);
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(c.hex, i * sw + sw / 2, h - 90);
  });
  ctx.fillStyle = "#0F1B3D";
  ctx.font = "600 20px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`${b.name} brand colors — LogoColorStudio`, 16, h - 22);
  canvas.toBlob((blob) => blob && download(`${b.slug}-palette.png`, blob), "image/png");
}

/** Canvas eyedropper: click anywhere on the logo to sample the exact pixel color. */
function LogoPicker({ brand }: { brand: Brand }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const url = brandLogoUrl(brand.domain, 512);

  const load = () => {
    if (!url) { setError(true); return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const max = 420;
      const scale = Math.min(1, max / img.width);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      setReady(true);
    };
    img.onerror = () => setError(true);
    img.src = url;
  };

  const pick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);
    const d = ctx.getImageData(x, y, 1, 1).data;
    if (d[3] < 40) return;
    setPicked(rgbToHex({ r: d[0], g: d[1], b: d[2] }));
  };

  return (
    <div>
      {!ready && !error && (
        <Button variant="outline" onClick={load}>
          <Pipette className="size-4" /> Load logo picker
        </Button>
      )}
      {error && <p className="text-sm text-muted-foreground">The logo image could not be loaded for picking. Use the palette values above instead.</p>}
      <canvas
        ref={canvasRef}
        onClick={pick}
        aria-label={`${brand.name} logo color picker. Click to sample a color.`}
        className={ready ? "max-w-full cursor-crosshair rounded-lg border" : "hidden"}
      />
      {picked && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="size-10 rounded-lg border" style={{ backgroundColor: picked }} aria-hidden />
          <CopyValue label="HEX" value={picked} />
          <CopyValue label="RGB" value={fmtRgb(picked)} />
          <CopyValue label="HSL" value={fmtHsl(picked)} />
        </div>
      )}
    </div>
  );
}

export function BrandDetail({ brand, headingLevel = 1 }: { brand: Brand; headingLevel?: 1 | 2 }) {
  const H = headingLevel === 1 ? "h1" : "h2";
  const related = relatedBrands(brand);
  const story = brandStory(brand);
  const hexes = brand.colors.map((c) => c.hex);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-6">
        <BrandLogo brand={brand} size={256} className="h-24 w-24 sm:h-32 sm:w-32" />
        <div>
          <H className="text-3xl font-bold sm:text-4xl">{brand.name} logo & brand colors</H>
          <p className="mt-2 text-muted-foreground">
            {categoryLabel(brand.category)} · {brand.colors.length} logo colors
            {brand.guidelines && (
              <>
                {" · "}
                <a href={brand.guidelines} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  Official brand resources
                </a>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-6 flex h-28 overflow-hidden rounded-xl border">
        {brand.colors.map((c) => (
          <div key={c.hex} className="flex flex-1 items-end justify-center pb-2" style={{ backgroundColor: c.hex }}>
            <span className="rounded px-1.5 py-0.5 font-mono text-xs font-semibold" style={{ color: readableOn(c.hex) }}>
              {c.hex}
            </span>
          </div>
        ))}
      </div>

      <ul className="mt-6 space-y-3">
        {brand.colors.map((c) => (
          <li key={c.hex} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
            <span className="size-9 rounded-md border" style={{ backgroundColor: c.hex }} aria-hidden />
            <span className="min-w-28 font-medium">{c.name}</span>
            <CopyValue label="HEX" value={c.hex} />
            <CopyValue label="RGB" value={fmtRgb(c.hex)} />
            <CopyValue label="HSL" value={fmtHsl(c.hex)} />
          </li>
        ))}
      </ul>

      <section className="mt-8" aria-labelledby="picker-heading">
        <h2 id="picker-heading" className="text-xl font-bold">Pick a color from the {brand.name} logo</h2>
        <p className="mt-1 text-sm text-muted-foreground">Click anywhere on the logo to sample the exact pixel color.</p>
        <div className="mt-4"><LogoPicker brand={brand} /></div>
      </section>

      <section className="mt-8" aria-labelledby="download-heading">
        <h2 id="download-heading" className="text-xl font-bold">Download the {brand.name} palette</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="hero" onClick={() => downloadPng(brand)}>
            <Download className="size-4" /> PNG palette
          </Button>
          <Button variant="outline" onClick={() => download(`${brand.slug}-colors.css`, exportPalette(hexes, "css", brand.slug), "text/css")}>
            CSS variables
          </Button>
          <Button variant="outline" onClick={() => download(`${brand.slug}-tailwind.js`, exportPalette(hexes, "tailwind", brand.slug), "text/javascript")}>
            Tailwind config
          </Button>
        </div>
      </section>

      <article className="prose-content mt-10">
        <h2>About the {brand.name} color palette</h2>
        {story.map((p, i) => <p key={i}>{p}</p>)}
      </article>

      {related.length > 0 && (
        <section className="mt-10" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-xl font-bold">Related {categoryLabel(brand.category).toLowerCase()} brands</h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {related.map((r) => (
              <li key={r.slug}>
                <Link to={brandPath(r)} className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:border-primary">
                  <BrandLogo brand={r} size={128} className="h-12 w-12" />
                  <span className="text-center text-sm font-medium">{r.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
