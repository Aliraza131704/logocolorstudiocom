import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import {
  brandsUsingColor, getNamedColor, shadesAndTints, similarColors, temperature, textContrast, toCmyk, type NamedColor,
} from "@/lib/color-names";
import { fmtHsl, fmtRgb, harmony, hexToHsl, readableOn, wcag } from "@/lib/color";
import { BrandLogo } from "@/components/site/BrandLogo";
import { AdSlot } from "@/components/site/AdSlot";
import { Breadcrumbs, CopyButton, FaqList, breadcrumbLd, faqLd, type Faq } from "@/components/site/ui-bits";
import { pageHead } from "@/lib/seo";

const cmykText = (hex: string) => {
  const c = toCmyk(hex);
  return `cmyk(${c.c}%, ${c.m}%, ${c.y}%, ${c.k}%)`;
};

function faqsFor(c: NamedColor): Faq[] {
  const t = textContrast(c.hex);
  const temp = temperature(c.hex);
  const comp = harmony(c.hex, "complementary")[3];
  const best = t.white >= t.black ? "white" : "black";
  const bestRatio = Math.max(t.white, t.black).toFixed(2);
  return [
    { q: `What is the HEX code for ${c.name.toLowerCase()}?`, a: `The standard HEX code for ${c.name.toLowerCase()} is ${c.hex}. In RGB it is ${fmtRgb(c.hex)}, in HSL ${fmtHsl(c.hex)} and in CMYK ${cmykText(c.hex)}.` },
    { q: `What colors go with ${c.name.toLowerCase()}?`, a: `Its complementary color is ${comp}, which gives the strongest contrast. For a calmer look, use the analogous palette (${harmony(c.hex, "analogous").join(", ")}) or the shades and tints of ${c.name.toLowerCase()} shown on this page.` },
    { q: `Is ${c.name.toLowerCase()} a warm or cool color?`, a: temp === "neutral" ? `${c.name} has very low saturation, so it behaves as a neutral and works with both warm and cool palettes.` : `${c.name} is a ${temp} color, based on where its hue (${hexToHsl(c.hex).h}°) sits on the color wheel.` },
    { q: `Which text color is readable on ${c.name.toLowerCase()}?`, a: `${best === "white" ? "White" : "Black"} text has the higher contrast on ${c.hex}, at ${bestRatio}:1. ${Number(bestRatio) >= 4.5 ? "That passes WCAG AA for normal text." : Number(bestRatio) >= 3 ? "That passes WCAG AA only for large text, so keep small text off this background." : "That fails WCAG AA, so avoid placing text directly on this color."}` },
    { q: `How do I use ${c.name.toLowerCase()} in CSS?`, a: `Use the HEX value directly, for example color: ${c.hex}; or background-color: ${c.hex};. You can also store it as a variable: --${c.slug}: ${c.hex};.` },
  ];
}

export const Route = createFileRoute("/colors/$slug")({
  loader: ({ params }) => {
    const c = getNamedColor(params.slug);
    if (!c) throw notFound();
    return c;
  },
  head: ({ loaderData: c, params }) =>
    c
      ? pageHead({
          title: `${c.name} Color: HEX ${c.hex}, RGB, Palettes & Shades`,
          description: `${c.name} color code ${c.hex} — ${fmtRgb(c.hex)}, ${fmtHsl(c.hex)}. See ${c.name.toLowerCase()} shades and tints, matching color palettes, text contrast and brands that use it.`,
          path: `/colors/${params.slug}`,
          type: "article",
          follow: true,
          jsonLd: [
            breadcrumbLd([{ label: "Color names", to: "/colors" }, { label: c.name }], `/colors/${params.slug}`),
            faqLd(faqsFor(c)),
          ],
        })
      : { meta: [{ title: "Color not found" }, { name: "robots", content: "noindex" }] },
  component: Page,
});

function Strip({ colors, label }: { colors: string[]; label: string }) {
  return (
    <ul className="grid grid-cols-5 overflow-hidden rounded-xl border" aria-label={label}>
      {colors.map((h, i) => (
        <li key={`${h}-${i}`} className="flex h-24 flex-col items-center justify-end gap-1 pb-2" style={{ backgroundColor: h, color: readableOn(h) }}>
          <span className="font-mono text-xs font-semibold">{h}</span>
          <CopyButton text={h} label={h} className="h-6 w-6 text-current hover:bg-transparent" />
        </li>
      ))}
    </ul>
  );
}

function Page() {
  const c = Route.useLoaderData();
  const { shades, tints } = shadesAndTints(c.hex);
  const t = textContrast(c.hex);
  const brands = brandsUsingColor(c.hex);
  const similar = similarColors(c);
  const faqs = faqsFor(c);
  const codes: [string, string][] = [["HEX", c.hex], ["RGB", fmtRgb(c.hex)], ["HSL", fmtHsl(c.hex)], ["CMYK", cmykText(c.hex)]];
  const palettes: [string, string[]][] = [
    ["Complementary", harmony(c.hex, "complementary")],
    ["Analogous", harmony(c.hex, "analogous")],
    ["Triadic", harmony(c.hex, "triadic")],
    ["Monochromatic", harmony(c.hex, "monochromatic")],
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Color names", to: "/colors" }, { label: c.name }]} />

      <div className="grid gap-6 md:grid-cols-[1fr_1.2fr] md:items-center">
        <div className="flex aspect-[4/3] items-end rounded-2xl border p-5" style={{ backgroundColor: c.hex, color: readableOn(c.hex) }}>
          <span className="font-mono text-2xl font-bold">{c.hex}</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">{c.name} color</h1>
          <p className="mt-3 text-muted-foreground">
            <strong className="text-foreground">{c.name}</strong> ({c.hex}) is {c.about}.
          </p>
          <dl className="mt-5 grid gap-2 sm:grid-cols-2">
            {codes.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{k}</dt>
                  <dd className="font-mono text-sm">{v}</dd>
                </div>
                <CopyButton text={v} label={`${k} ${v}`} />
              </div>
            ))}
          </dl>
        </div>
      </div>

      <section className="mt-12" aria-labelledby="shades">
        <h2 id="shades" className="text-2xl font-bold">{c.name} shades and tints</h2>
        <p className="mt-2 text-sm text-muted-foreground">Darker shades for text and borders, lighter tints for backgrounds and hover states. Click a value to copy it.</p>
        <div className="mt-4 space-y-3">
          <Strip colors={shades} label={`${c.name} shades`} />
          <Strip colors={tints} label={`${c.name} tints`} />
        </div>
      </section>

      <section className="mt-12" aria-labelledby="palettes">
        <h2 id="palettes" className="text-2xl font-bold">{c.name} color palettes</h2>
        <p className="mt-2 text-sm text-muted-foreground">Ready-made color schemes built around {c.hex} using standard color-wheel rules.</p>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          {palettes.map(([name, colors]) => (
            <div key={name}>
              <h3 className="mb-2 font-semibold">{name} palette</h3>
              <Strip colors={colors} label={`${name} palette with ${c.name.toLowerCase()}`} />
            </div>
          ))}
        </div>
        <Link to="/tools/palette-generator" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          Make your own palette in the Color Palette Generator <ArrowRight className="size-4" />
        </Link>
      </section>

      <AdSlot position="below_tool" className="mt-10" />

      <section className="mt-12" aria-labelledby="contrast">
        <h2 id="contrast" className="text-2xl font-bold">Text contrast on {c.name.toLowerCase()}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {([["White text", "#FFFFFF", t.white], ["Black text", "#000000", t.black]] as const).map(([label, fg, ratio]) => {
            const g = wcag(ratio);
            return (
              <div key={label} className="rounded-xl border p-5" style={{ backgroundColor: c.hex, color: fg }}>
                <p className="text-lg font-bold">{label}</p>
                <p className="mt-1 font-mono text-sm">{ratio.toFixed(2)}:1 · {g.aaNormal ? "Passes AA" : g.aaLarge ? "AA large text only" : "Fails AA"}</p>
              </div>
            );
          })}
        </div>
        <Link to="/tools/contrast-checker" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          Check any color pair in the Contrast Checker <ArrowRight className="size-4" />
        </Link>
      </section>

      {brands.length > 0 && (
        <section className="mt-12" aria-labelledby="brands">
          <h2 id="brands" className="text-2xl font-bold">Brands with {c.name.toLowerCase()}-like logo colors</h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {brands.map(({ brand, color }) => (
              <li key={brand.slug}>
                <Link to="/brand-colors/$slug" params={{ slug: brand.slug }} className="flex items-center gap-3 rounded-xl border bg-card p-3 hover:border-primary">
                  <BrandLogo brand={brand} size={64} className="h-9 w-9" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{brand.name}</span>
                    <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                      <span className="size-2.5 rounded-full border" style={{ backgroundColor: color.hex }} aria-hidden />
                      {color.hex}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-12" aria-labelledby="similar">
        <h2 id="similar" className="text-2xl font-bold">Colors similar to {c.name.toLowerCase()}</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {similar.map((s) => (
            <li key={s.slug}>
              <Link to="/colors/$slug" params={{ slug: s.slug }} className="block overflow-hidden rounded-xl border hover:border-primary">
                <span className="block h-14" style={{ backgroundColor: s.hex }} aria-hidden />
                <span className="block px-2 py-1.5 text-sm font-medium">{s.name}</span>
                <span className="block px-2 pb-2 font-mono text-xs text-muted-foreground">{s.hex}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-14">
        <FaqList faqs={faqs} title={`${c.name} color FAQ`} />
      </div>
    </div>
  );
}
