import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { ToolLayout } from "@/components/site/ToolLayout";
import { ToolGuide } from "@/components/site/ToolGuide";
import { TOOL_GUIDES } from "@/lib/tool-guide-content";
import { ExportBox, loadPalette, savePalette, paletteToPng } from "@/components/site/tool-parts";
import { faqLd, breadcrumbLd, type Faq } from "@/components/site/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeHex, randomHex } from "@/lib/color";
import { pageHead } from "@/lib/seo";
import { getPublicSetting } from "@/lib/content.functions";
import { TOOL_CONTENT_KEY, toolOverride } from "@/lib/tool-overrides";

const FAQS: Faq[] = TOOL_GUIDES["export-center"].faqs;

export const Route = createFileRoute("/tools/export-center")({
  loader: () => getPublicSetting({ data: { key: TOOL_CONTENT_KEY } }),
  head: ({ loaderData }) => {
    const o = toolOverride(loaderData, "export-center");
    return
    pageHead({
      title: o?.metaTitle ?? "Export Center — CSS, Tailwind, SCSS & JSON",
      description: o?.metaDescription ?? "Export any color palette as CSS variables, Tailwind config, SCSS, JSON or a PNG swatch image. Rename tokens and copy in one click.",
      path: "/tools/export-center",
      jsonLd: [faqLd(o?.faqs ?? FAQS), breadcrumbLd([{ label: "Tools", to: "/tools" }, { label: "Export Center" }], "/tools/export-center")],
    });
  },
  component: Page,
});

function Page() {
  const [colors, setColors] = useState<string[]>(["#0A8CFF", "#4CC53F", "#FFB11A", "#FF3B4E", "#0F1B3D"]);
  const [name, setName] = useState("brand");
  useEffect(() => { const p = loadPalette(); if (p?.length) setColors(p); }, []);
  useEffect(() => { savePalette(colors); }, [colors]);
  return (
    <ToolLayout slug="export-center" title={TOOL_GUIDES["export-center"].title} intro="Turn any palette into production-ready code or a shareable image." faqs={FAQS} about={<About />}>
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4 rounded-2xl border bg-card p-6">
          <div>
            <label htmlFor="tok" className="text-sm font-medium">Token prefix</label>
            <Input id="tok" className="mt-2" value={name} maxLength={24} onChange={(e) => setName(e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "brand")} />
          </div>
          <div className="space-y-2">
            {colors.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="color" aria-label={`Color ${i + 1}`} value={c} onChange={(e) => setColors(colors.map((x, j) => (j === i ? normalizeHex(e.target.value) ?? x : x)))} className="h-10 w-12 cursor-pointer rounded-lg border bg-transparent" />
                <Input aria-label={`Color ${i + 1} HEX value`} defaultValue={c} key={c} className="font-mono" onBlur={(e) => { const n = normalizeHex(e.target.value); if (n) setColors(colors.map((x, j) => (j === i ? n : x))); }} />
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
  return <ToolGuide slug="export-center" />;
}
