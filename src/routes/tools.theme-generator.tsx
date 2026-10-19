import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ToolLayout } from "@/components/site/ToolLayout";
import { loadPalette } from "@/components/site/tool-parts";
import { CopyButton, faqLd, breadcrumbLd, type Faq } from "@/components/site/ui-bits";
import { Button } from "@/components/ui/button";
import { adjust, contrastRatio, hexToHsl, hslToHex, normalizeHex, readableOn } from "@/lib/color";
import { pageHead } from "@/lib/seo";

const FAQS: Faq[] = [
  { q: "What does the Theme Generator create?", a: "A complete set of UI tokens (background, surface, text, muted, border, primary, accent) for both light and dark mode." },
  { q: "Are the themes accessible?", a: "Text colors are chosen for each surface to meet WCAG AA contrast where possible, and the ratio is shown for each pair." },
  { q: "Can I use it with Tailwind or shadcn/ui?", a: "Yes. Copy the CSS variables into your global stylesheet; the names follow the common shadcn convention." },
  { q: "Where do the starting colors come from?", a: "Your last palette from the Logo Extractor or Palette Generator is loaded automatically. You can also edit colors manually." },
];

export const Route = createFileRoute("/tools/theme-generator")({
  head: () =>
    pageHead({
      title: "Theme Generator — Light & Dark UI Themes",
      description: "Turn a brand palette into accessible light and dark UI themes with live preview. Copy CSS variables for Tailwind and shadcn/ui.",
      path: "/tools/theme-generator",
      jsonLd: [faqLd(FAQS), breadcrumbLd([{ label: "Tools", to: "/tools" }, { label: "Theme Generator" }], "/tools/theme-generator"), { "@context": "https://schema.org", "@type": "WebApplication", name: "Theme Generator", applicationCategory: "DesignApplication", operatingSystem: "Any" }],
    }),
  component: Page,
});

function buildTheme(primary: string, accent: string, mode: "light" | "dark") {
  const p = hexToHsl(primary);
  const bg = mode === "light" ? hslToHex({ h: p.h, s: 20, l: 98 }) : hslToHex({ h: p.h, s: 35, l: 9 });
  const surface = mode === "light" ? "#FFFFFF" : hslToHex({ h: p.h, s: 30, l: 14 });
  const text = mode === "light" ? hslToHex({ h: p.h, s: 45, l: 14 }) : hslToHex({ h: p.h, s: 20, l: 96 });
  const muted = mode === "light" ? hslToHex({ h: p.h, s: 12, l: 42 }) : hslToHex({ h: p.h, s: 14, l: 70 });
  const border = mode === "light" ? hslToHex({ h: p.h, s: 15, l: 89 }) : hslToHex({ h: p.h, s: 20, l: 22 });
  const prim = mode === "dark" && p.l < 45 ? adjust(primary, 12) : primary;
  return { background: bg, surface, foreground: text, muted, border, primary: prim, "primary-foreground": readableOn(prim), accent, "accent-foreground": readableOn(accent) };
}

function Page() {
  const [primary, setPrimary] = useState("#0A8CFF");
  const [accent, setAccent] = useState("#FFB11A");
  const [mode, setMode] = useState<"light" | "dark">("light");
  useEffect(() => { const p = loadPalette(); if (p?.[0]) { setPrimary(p[0]); if (p[1]) setAccent(p[1]); } }, []);
  const light = useMemo(() => buildTheme(primary, accent, "light"), [primary, accent]);
  const dark = useMemo(() => buildTheme(primary, accent, "dark"), [primary, accent]);
  const t = mode === "light" ? light : dark;
  const css = `:root {\n${Object.entries(light).map(([k, v]) => `  --${k}: ${v};`).join("\n")}\n}\n.dark {\n${Object.entries(dark).map(([k, v]) => `  --${k}: ${v};`).join("\n")}\n}`;

  return (
    <ToolLayout slug="theme-generator" title="Theme Generator" intro="Generate matching light and dark UI themes from your brand colors and preview them live." faqs={FAQS} about={<About />}>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-5 rounded-2xl border bg-card p-6">
          {[["Primary", primary, setPrimary], ["Accent", accent, setAccent]].map(([l, v, set]) => (
            <div key={l as string}>
              <label className="text-sm font-medium">{l as string}</label>
              <div className="mt-2 flex items-center gap-2">
                <input type="color" value={v as string} aria-label={`${l} color`} onChange={(e) => (set as (s: string) => void)(normalizeHex(e.target.value)!)} className="h-11 w-14 cursor-pointer rounded-lg border bg-transparent" />
                <span className="font-mono text-sm">{v as string}</span>
              </div>
            </div>
          ))}
          <div role="group" aria-label="Theme preview mode" className="flex gap-1">
            <Button className="flex-1" variant={mode === "light" ? "secondary" : "ghost"} aria-pressed={mode === "light"} onClick={() => setMode("light")}>Light</Button>
            <Button className="flex-1" variant={mode === "dark" ? "secondary" : "ghost"} aria-pressed={mode === "dark"} onClick={() => setMode("dark")}>Dark</Button>
          </div>
          <ul className="space-y-1.5 text-sm">
            {Object.entries(t).map(([k, v]) => (
              <li key={k} className="flex items-center gap-2">
                <span className="inline-block size-5 rounded border" style={{ backgroundColor: v }} />
                <span className="flex-1">{k}</span>
                <span className="font-mono text-xs text-muted-foreground">{v}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">Text on background: {contrastRatio(t.foreground, t.background).toFixed(1)}:1 · Button: {contrastRatio(t["primary-foreground"], t.primary).toFixed(1)}:1</p>
        </div>
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border" style={{ backgroundColor: t.background, color: t.foreground }}>
            <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: t.border }}>
              <span className="font-bold">Acme Studio</span>
              <div className="hidden gap-5 text-sm sm:flex" style={{ color: t.muted }}><span>Product</span><span>Pricing</span><span>Docs</span></div>
              <span className="rounded-full px-4 py-1.5 text-sm font-semibold" style={{ backgroundColor: t.primary, color: t["primary-foreground"] }}>Get started</span>
            </div>
            <div className="px-6 py-12 text-center">
              <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: t.accent, color: t["accent-foreground"] }}>New release</span>
              <h2 className="mt-4 text-3xl font-bold">Design faster with your own colors</h2>
              <p className="mx-auto mt-3 max-w-md" style={{ color: t.muted }}>A preview of how your theme looks across headings, text, buttons and cards.</p>
              <div className="mt-6 flex justify-center gap-3">
                <span className="rounded-full px-5 py-2 font-semibold" style={{ backgroundColor: t.primary, color: t["primary-foreground"] }}>Start free</span>
                <span className="rounded-full border px-5 py-2 font-semibold" style={{ borderColor: t.border }}>Book a demo</span>
              </div>
            </div>
            <div className="grid gap-4 px-6 pb-8 sm:grid-cols-3">
              {["Extract", "Customize", "Ship"].map((x) => (
                <div key={x} className="rounded-xl border p-4" style={{ backgroundColor: t.surface, borderColor: t.border }}>
                  <div className="mb-3 h-2 w-10 rounded-full" style={{ backgroundColor: t.primary }} />
                  <p className="font-semibold">{x}</p>
                  <p className="mt-1 text-sm" style={{ color: t.muted }}>Short supporting text for this card.</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border bg-card">
            <div className="flex items-center justify-between border-b p-3"><span className="text-sm font-medium">CSS variables (light + dark)</span><CopyButton text={css} label="Copy" size="sm" /></div>
            <pre tabIndex={0} aria-label="Theme CSS variables" className="max-h-72 overflow-auto p-4 font-mono text-xs">{css}</pre>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

function About() {
  return (
    <>
      <h2>From brand colors to a complete UI theme</h2>
      <p>A logo usually gives you two or three colors, but an interface needs many more: page backgrounds, card surfaces, primary and secondary text, borders, buttons and accents, all in both light and dark mode. The Theme Generator builds that full token set from just a primary and an accent color, and shows a realistic preview so you can judge it in context.</p>
      <h2>How it works</h2>
      <ol>
        <li>Choose your primary brand color and an accent. Colors from your last extraction are loaded automatically.</li>
        <li>Switch between Light and Dark to preview both modes.</li>
        <li>Check the contrast ratios for text and buttons shown under the token list.</li>
        <li>Copy the CSS variables and paste them into your global stylesheet.</li>
      </ol>
      <h2>How tokens are derived</h2>
      <p>Neutrals are tinted with the hue of your primary color so the whole interface feels related rather than generic gray. Light themes use a very light tinted background with white cards; dark themes use deep, desaturated shades of the same hue. If your primary color is too dark to stand out in dark mode, it is lightened automatically. Foreground colors for buttons and badges are picked by comparing contrast against white and navy.</p>
      <h2>Using the theme</h2>
      <p>The variable names match popular conventions used by Tailwind CSS and shadcn/ui, so you can drop them into most modern stacks. For more export formats, use the <Link to="/tools/export-center">Export Center</Link>, and validate custom pairs with the <Link to="/tools/contrast-checker">Contrast Checker</Link>.</p>
    </>
  );
}
