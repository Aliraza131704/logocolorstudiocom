import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Shuffle, Heart, Share2, Plus, GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaletteRow } from "@/components/site/PaletteRow";
import { ToolGuide } from "@/components/site/ToolGuide";
import { TOOL_GUIDES } from "@/lib/tool-guide-content";
import { loadPalette, savePalette, paletteToPng } from "@/components/site/tool-parts";
import { Breadcrumbs, FaqList, copyText, download, faqLd, type Faq } from "@/components/site/ui-bits";
import { AdSlot } from "@/components/site/AdSlot";
import { HARMONIES, adjust, exportPalette, harmony, normalizeHex, randomHex, readableOn, type Harmony } from "@/lib/color";
import { logEvent } from "@/lib/site-data";
import { toolOverride } from "@/lib/tool-overrides";
import { getRouteApi } from "@tanstack/react-router";
import { toast } from "sonner";
import { paletteTextColor } from "@/lib/palette-presentation";
import { absoluteUrl } from "@/lib/seo";

export const GENERATOR_FAQS: Faq[] = TOOL_GUIDES["palette-generator"].faqs;

/** Labels for the live brand preview so the panel reads like a real product surface. */
const PREVIEW_CARDS = [
  { title: "Primary", body: "Headlines and main buttons" },
  { title: "Secondary", body: "Cards, panels and dividers" },
  { title: "Accent", body: "Highlights, links and badges" },
];

export function PaletteGeneratorPage() {
  const [logoColors, setLogoColors] = useState<string[] | null>(null);
  const [removed, setRemoved] = useState<Record<string, number[]>>({});
  useEffect(() => { setLogoColors(loadPalette()); logEvent("tool", "palette-generator"); }, []);
  const base = logoColors?.[0] ?? "#0A8CFF";
  const auto = useMemo(() => HARMONIES.map((h) => ({ ...h, colors: harmony(base, h.id) })), [base]);
  // Owner-edited content from Admin → Tool pages, loaded in the route loader.
  const o = toolOverride(getRouteApi("/tools/palette-generator").useLoaderData(), "palette-generator");

  return (
    <div className="bg-hero">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Breadcrumbs items={[{ label: "Tools", to: "/tools" }, { label: "Palette Generator" }]} />
        <h1 className="text-4xl font-bold sm:text-5xl">{o?.title ?? TOOL_GUIDES["palette-generator"].title}</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{o?.intro ?? "Build color harmonies from your logo and create a custom palette."}</p>

        <section className="mt-12 notranslate" translate="no">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">{logoColors ? "Generated from your logo" : "Generated from a sample color"}</h2>
              <p className="text-sm text-muted-foreground">{logoColors ? <>Based on {logoColors.slice(0, 5).join(", ")}</> : <>Upload a logo in the <Link to="/tools/logo-extractor" className="text-primary underline">Logo Extractor</Link> to personalise these.</>}</p>
            </div>
            {logoColors && <div className="flex gap-1">{logoColors.slice(0, 6).map((c) => <span key={c} className="size-7 rounded-full border" style={{ backgroundColor: c }} title={c} />)}</div>}
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {auto.map((h) => {
              const colors = h.colors.filter((_, i) => !(removed[h.id] ?? []).includes(i));
              return <PaletteRow key={h.id} title={h.label} colors={colors} onRemove={(i) => { const idx = h.colors.indexOf(colors[i]); setRemoved({ ...removed, [h.id]: [...(removed[h.id] ?? []), idx] }); }} />;
            })}
          </div>
        </section>

        <AdSlot position="between_palettes" />

        <Generator initial={logoColors} />

        <div className="mt-10"><Button asChild variant="outline"><Link to="/palettes">Browse the palette gallery</Link></Button></div>

        <article className="prose-content mx-auto mt-20 max-w-3xl">
          {o?.bodyHtml ? <div dangerouslySetInnerHTML={{ __html: o.bodyHtml }} /> : <ToolGuide slug="palette-generator" />}
        </article>
        <div className="mt-16"><FaqList faqs={o?.faqs ?? GENERATOR_FAQS} /></div>
      </div>
    </div>
  );
}

function Generator({ initial }: { initial: string[] | null }) {
  const [colors, setColors] = useState<string[]>(["#0A8CFF", "#4CC53F", "#FFB11A", "#FF3B4E", "#0F1B3D"]);
  const [locked, setLocked] = useState<boolean[]>([false, false, false, false, false]);
  const [rule, setRule] = useState<Harmony | "random">("analogous");
  const [bright, setBright] = useState(0);
  const [sat, setSat] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);
  const [favs, setFavs] = useState<string[][]>([]);

  useEffect(() => {
    const shared = new URLSearchParams(window.location.search).get("c");
    const fromUrl = shared?.split("-").map((h) => normalizeHex(h)).filter(Boolean) as string[] | undefined;
    const start = fromUrl?.length ? fromUrl : initial;
    if (start?.length) { setColors(start.slice(0, 5)); setLocked(start.slice(0, 5).map(() => false)); }
    setFavs(JSON.parse(localStorage.getItem("lcs-favs") ?? "[]"));
  }, [initial]);

  const shown = colors.map((c) => adjust(c, bright, sat));

  const shuffle = () => {
    const anchor = colors.find((_, i) => locked[i]) ?? randomHex();
    const gen = rule === "random" ? colors.map(() => randomHex()) : harmony(rule === "monochromatic" ? anchor : randomHex(), rule, 5);
    setColors(colors.map((c, i) => (locked[i] ? c : gen[i % gen.length])));
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === "Space" && (e.target as HTMLElement).tagName === "BODY") { e.preventDefault(); shuffle(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const applyRule = (r: Harmony | "random") => {
    setRule(r);
    if (r === "random") return;
    const gen = harmony(colors[0], r, 5);
    setColors(colors.map((c, i) => (locked[i] ? c : gen[i % gen.length])));
  };
  const reorder = (to: number) => {
    if (drag === null || drag === to) return;
    const c = [...colors], l = [...locked];
    const [x] = c.splice(drag, 1); const [y] = l.splice(drag, 1);
    c.splice(to, 0, x); l.splice(to, 0, y);
    setColors(c); setLocked(l); setDrag(to);
  };
  const saveFav = () => {
    const next = [shown, ...favs].slice(0, 30);
    setFavs(next); localStorage.setItem("lcs-favs", JSON.stringify(next)); toast.success("Saved to favorites");
  };
  const share = () => copyText(`${absoluteUrl("/tools/palette-generator")}?c=${shown.map((c) => c.slice(1)).join("-")}`, "Share link copied");
  useEffect(() => { savePalette(shown); }, [shown.join()]);

  return (
    <section className="mt-16 notranslate" translate="no" aria-labelledby="gen">
      <h2 id="gen" className="text-2xl font-bold">Custom palette generator</h2>
      <p className="text-sm text-muted-foreground">Pick 1–5 colors, choose a harmony, lock and shuffle (press Space), drag to reorder.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex min-h-56 flex-col overflow-hidden rounded-2xl border sm:flex-row">
            {shown.map((c, i) => (
              <div key={i} draggable onDragStart={() => setDrag(i)} onDragOver={(e) => { e.preventDefault(); reorder(i); }} onDragEnd={() => setDrag(null)}
                className="flex flex-1 flex-row items-center justify-between gap-2 p-4 sm:flex-col sm:justify-between" style={{ backgroundColor: c, color: paletteTextColor(c) }}>
                <GripVertical className="size-4 cursor-grab opacity-60" aria-hidden />
                <div className="flex flex-col items-center gap-2">
                  <input type="color" value={colors[i]} aria-label={`Edit color ${i + 1}`} onChange={(e) => setColors(colors.map((x, j) => (j === i ? normalizeHex(e.target.value) ?? x : x)))} className="h-8 w-8 cursor-pointer rounded-full border-0 bg-transparent" />
                  <p className="font-mono text-sm font-bold">{c}</p>
                  <div className="flex gap-0.5">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-inherit hover:bg-black/10" onClick={() => setLocked(locked.map((l, j) => (j === i ? !l : l)))}>{locked[i] ? "Locked" : "Lock"}</Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-inherit hover:bg-black/10" aria-label="Copy" onClick={() => copyText(c, `Copied ${c}`)}>⧉</Button>
                    {colors.length > 1 && <Button variant="ghost" size="icon" className="h-7 w-7 text-inherit hover:bg-black/10" aria-label="Remove" onClick={() => { setColors(colors.filter((_, j) => j !== i)); setLocked(locked.filter((_, j) => j !== i)); }}><X /></Button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* sample UI */}
          <div className="overflow-hidden rounded-2xl border" style={{ backgroundColor: shown[shown.length - 1] ?? "#fff", color: paletteTextColor(shown[shown.length - 1] ?? "#fff") }}>
            <div className="flex items-center justify-between px-6 py-4">
              <span className="font-bold">Brand preview</span>
              <span className="rounded-full px-4 py-1.5 text-sm font-semibold" style={{ backgroundColor: shown[0], color: paletteTextColor(shown[0]) }}>Sign up</span>
            </div>
            <div className="grid gap-4 px-6 pb-6 sm:grid-cols-3">
              {shown.slice(0, 3).map((c, i) => {
                const card = PREVIEW_CARDS[i % PREVIEW_CARDS.length];
                return (
                  <div key={i} className="rounded-xl p-4" style={{ backgroundColor: c, color: paletteTextColor(c) }}>
                    <p className="font-semibold">{card.title}</p><p className="text-sm">{card.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="space-y-5 rounded-2xl border bg-card p-5">
          <div>
            <label className="text-sm font-medium">Harmony rule</label>
            <Select value={rule} onValueChange={(v) => applyRule(v as Harmony)}>
              <SelectTrigger className="mt-2" aria-label="Harmony rule"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="random">Random</SelectItem>
                {HARMONIES.map((h) => <SelectItem key={h.id} value={h.id}>{h.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <AddHex onAdd={(h) => { if (colors.length < 5) { setColors([...colors, h]); setLocked([...locked, false]); } else toast("Maximum 5 colors"); }} />
          <div><label className="text-sm font-medium">Brightness {bright > 0 ? "+" : ""}{bright}</label><Slider className="mt-3" min={-30} max={30} value={[bright]} onValueChange={([v]) => setBright(v)} aria-label="Brightness" /></div>
          <div><label className="text-sm font-medium">Saturation {sat > 0 ? "+" : ""}{sat}</label><Slider className="mt-3" min={-50} max={50} value={[sat]} onValueChange={([v]) => setSat(v)} aria-label="Saturation" /></div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="hero" onClick={shuffle}><Shuffle /> Shuffle</Button>
            <Button variant="outline" onClick={saveFav}><Heart /> Save</Button>
            <Button variant="outline" onClick={share}><Share2 /> Share</Button>
            <Button variant="outline" onClick={() => paletteToPng(shown)}>PNG</Button>
            <Button variant="outline" onClick={() => download("palette.css", exportPalette(shown, "css"))}>CSS</Button>
            <Button variant="outline" onClick={() => download("palette.json", exportPalette(shown, "json"))}>JSON</Button>
            <Button variant="outline" className="col-span-2" onClick={() => download("tailwind.config.js", exportPalette(shown, "tailwind"))}>Tailwind config</Button>
          </div>
          {favs.length > 0 && (
            <div>
              <p className="text-sm font-medium">Favorites</p>
              <div className="mt-2 max-h-48 space-y-2 overflow-y-auto">
                {favs.map((f, i) => (
                  <button key={i} onClick={() => { setColors(f); setLocked(f.map(() => false)); setBright(0); setSat(0); }} className="flex h-7 w-full overflow-hidden rounded-lg border" aria-label="Load favorite">
                    {f.map((c, j) => <span key={j} className="flex-1" style={{ backgroundColor: c }} />)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function AddHex({ onAdd }: { onAdd: (h: string) => void }) {
  const [v, setV] = useState("");
  return (
    <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const n = normalizeHex(v); if (n) { onAdd(n); setV(""); } else toast.error("Enter a valid HEX like #FF3B4E"); }}>
      <Input aria-label="Add HEX color" placeholder="#FF3B4E" value={v} onChange={(e) => setV(e.target.value)} maxLength={7} className="font-mono" />
      <Button type="submit" variant="outline" size="icon" aria-label="Add color"><Plus /></Button>
    </form>
  );
}
