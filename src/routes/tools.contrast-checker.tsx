import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeftRight, Check, X } from "lucide-react";
import { ToolLayout } from "@/components/site/ToolLayout";
import { faqLd, breadcrumbLd, type Faq } from "@/components/site/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adjust, contrastRatio, normalizeHex, wcag } from "@/lib/color";
import { pageHead } from "@/lib/seo";

const FAQS: Faq[] = [
  { q: "What contrast ratio do I need?", a: "WCAG AA requires 4.5:1 for normal text and 3:1 for large text. AAA requires 7:1 and 4.5:1." },
  { q: "What counts as large text?", a: "Text at least 24px regular or 18.66px (14pt) bold." },
  { q: "Does contrast apply to buttons and icons?", a: "Yes. UI components and meaningful graphics need at least 3:1 against adjacent colors." },
  { q: "How do I fix a failing pair?", a: "Use the suggested darker or lighter text color, or increase the font size so the large-text rule applies." },
];

export const Route = createFileRoute("/tools/contrast-checker")({
  head: () =>
    pageHead({
      title: "Color Contrast Checker — WCAG AA & AAA",
      description: "Check text and background color contrast against WCAG 2.2 AA and AAA. Live preview, ratio score and instant fix suggestions.",
      path: "/tools/contrast-checker",
      jsonLd: [faqLd(FAQS), breadcrumbLd([{ label: "Tools", to: "/tools" }, { label: "Contrast Checker" }], "/tools/contrast-checker"), { "@context": "https://schema.org", "@type": "WebApplication", name: "Contrast Checker", applicationCategory: "DesignApplication", operatingSystem: "Any" }],
    }),
  component: Page,
});

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [text, setText] = useState(value);
  return (
    <div>
      <label className="text-sm font-medium" htmlFor={label}>{label}</label>
      <div className="mt-2 flex gap-2">
        <input type="color" aria-label={`${label} picker`} value={value} onChange={(e) => { onChange(e.target.value.toUpperCase()); setText(e.target.value.toUpperCase()); }} className="h-11 w-14 cursor-pointer rounded-lg border bg-transparent" />
        <Input id={label} value={text} onChange={(e) => { setText(e.target.value); const n = normalizeHex(e.target.value); if (n) onChange(n); }} className="h-11 font-mono" maxLength={7} />
      </div>
    </div>
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`flex items-center justify-between rounded-xl border p-3 ${ok ? "border-brand-green/40 bg-brand-green/10" : "border-destructive/40 bg-destructive/10"}`}>
      <span className="text-sm">{label}</span>
      <span className="flex items-center gap-1 text-sm font-semibold">{ok ? <Check className="size-4" /> : <X className="size-4" />}{ok ? "Pass" : "Fail"}</span>
    </div>
  );
}

function Page() {
  const [fg, setFg] = useState("#0F1B3D");
  const [bg, setBg] = useState("#FFB11A");
  const r = contrastRatio(fg, bg);
  const w = wcag(r);
  const suggest = () => {
    let c = fg;
    const dir = contrastRatio("#000000", bg) > contrastRatio("#FFFFFF", bg) ? -4 : 4;
    for (let i = 0; i < 25 && contrastRatio(c, bg) < 4.5; i++) c = adjust(c, dir);
    return c;
  };
  return (
    <ToolLayout slug="contrast-checker" title="Contrast Checker" intro="Test any text and background pair against WCAG 2.2 accessibility levels." faqs={FAQS} about={<About />}>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5 rounded-2xl border bg-card p-6">
          <ColorField key={`f${fg}`} label="Text color" value={fg} onChange={setFg} />
          <Button variant="outline" size="sm" onClick={() => { setFg(bg); setBg(fg); }}><ArrowLeftRight /> Swap</Button>
          <ColorField key={`b${bg}`} label="Background color" value={bg} onChange={setBg} />
          <div className="rounded-2xl bg-muted p-6 text-center">
            <p className="text-sm text-muted-foreground">Contrast ratio</p>
            <p className="font-display text-5xl font-extrabold">{r.toFixed(2)}:1</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Badge ok={w.aaNormal} label="AA normal text" />
            <Badge ok={w.aaLarge} label="AA large text" />
            <Badge ok={w.aaaNormal} label="AAA normal text" />
            <Badge ok={w.aaaLarge} label="AAA large text" />
          </div>
          {!w.aaNormal && (
            <Button variant="secondary" onClick={() => setFg(suggest())}>Fix: use {suggest()} for AA</Button>
          )}
        </div>
        <div className="rounded-2xl border p-8" style={{ backgroundColor: bg, color: fg }}>
          <p className="text-sm font-semibold uppercase tracking-widest">Live preview</p>
          <h2 className="mt-4 text-3xl font-bold">Large heading text</h2>
          <p className="mt-3 text-base">This is normal body text. Good contrast keeps your content readable on any screen, in bright sunlight and for people with low vision.</p>
          <p className="mt-3 text-sm">Small caption text, 14px.</p>
          <span className="mt-6 inline-block rounded-full border-2 px-5 py-2 font-semibold" style={{ borderColor: fg }}>Button label</span>
        </div>
      </div>
    </ToolLayout>
  );
}

function About() {
  return (
    <>
      <h2>Why color contrast matters</h2>
      <p>Contrast is the difference in brightness between text and its background. Low contrast makes content hard to read for people with low vision or color blindness, for older users, and for anyone looking at a phone outdoors. The Web Content Accessibility Guidelines (WCAG) define clear minimum ratios, and many countries reference them in accessibility law.</p>
      <h2>How to use the Contrast Checker</h2>
      <ol>
        <li>Pick a text color and a background color with the color pickers, or type HEX values.</li>
        <li>Read the contrast ratio, from 1:1 (no contrast) to 21:1 (black on white).</li>
        <li>Check the pass or fail result for AA and AAA, for normal and large text.</li>
        <li>If the pair fails, click the fix button to get the closest passing text color while keeping its hue.</li>
      </ol>
      <h2>WCAG levels explained</h2>
      <ul>
        <li><strong>AA normal text: 4.5:1.</strong> The standard target for body copy on most websites.</li>
        <li><strong>AA large text: 3:1.</strong> For headings of 24px or larger, or bold text of about 19px.</li>
        <li><strong>AAA normal text: 7:1.</strong> Enhanced contrast for maximum readability.</li>
        <li><strong>AAA large text: 4.5:1.</strong></li>
      </ul>
      <p>The ratio is calculated from relative luminance using the official WCAG formula, so the result matches browser developer tools and accessibility audits.</p>
      <h2>Working with brand colors</h2>
      <p>Bright brand colors like yellow, orange and light green rarely pass as text on white. Instead, use them as backgrounds with dark text, or for decorative elements. Our <Link to="/tools/theme-generator">Theme Generator</Link> automatically picks readable text colors for every surface, and you can read more in our <Link to="/blog/$slug" params={{ slug: "wcag-contrast-guide" }}>WCAG contrast guide</Link>.</p>
    </>
  );
}
