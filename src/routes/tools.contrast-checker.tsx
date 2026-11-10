import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeftRight, Check, X } from "lucide-react";
import { ToolLayout } from "@/components/site/ToolLayout";
import { ToolGuide } from "@/components/site/ToolGuide";
import { TOOL_GUIDES } from "@/lib/tool-guide-content";
import { faqLd, breadcrumbLd, type Faq } from "@/components/site/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adjust, contrastRatio, normalizeHex, wcag } from "@/lib/color";
import { pageHead } from "@/lib/seo";
import { getPublicSetting } from "@/lib/content.functions";
import { TOOL_CONTENT_KEY, toolOverride, withMeta } from "@/lib/tool-overrides";
import { PAGE_META } from "@/lib/page-meta";

const FAQS: Faq[] = TOOL_GUIDES["contrast-checker"].faqs;

export const Route = createFileRoute("/tools/contrast-checker")({
  loader: () => getPublicSetting({ data: { key: TOOL_CONTENT_KEY } }),
  head: ({ loaderData }) => {
    const o = toolOverride(loaderData, "contrast-checker");
    return pageHead({
      ...withMeta(o, PAGE_META["/tools/contrast-checker"]),
      path: "/tools/contrast-checker",
      jsonLd: [faqLd(o?.faqs ?? FAQS), breadcrumbLd([{ label: "Tools", to: "/tools" }, { label: "Contrast Checker" }], "/tools/contrast-checker"), { "@context": "https://schema.org", "@type": "WebApplication", name: "Contrast Checker", applicationCategory: "DesignApplication", operatingSystem: "Any" }],
    });
  },
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
  const o = toolOverride(Route.useLoaderData(), "contrast-checker");
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
    <ToolLayout override={o} slug="contrast-checker" title={TOOL_GUIDES["contrast-checker"].title} intro="Test any text and background pair against WCAG 2.2 accessibility levels." faqs={FAQS} about={<About />}>
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
  return <ToolGuide slug="contrast-checker" />;
}
