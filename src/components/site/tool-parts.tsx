import { useState } from "react";
import { Loader2, Lock, LockOpen, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton, download } from "./ui-bits";
import { exportPalette, fmtHsl, fmtRgb, readableOn, type ExportFormat } from "@/lib/color";
import { cn } from "@/lib/utils";

export function UrlForm({ onSubmit, loading, placeholder = "example.com", cta = "Analyze" }: { onSubmit: (url: string) => void; loading: boolean; placeholder?: string; cta?: string }) {
  const [url, setUrl] = useState("");
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (url.trim()) onSubmit(url.trim()); }}
      className="flex flex-col gap-2 rounded-2xl border bg-card p-2 shadow-soft sm:flex-row"
    >
      <label htmlFor="tool-url" className="sr-only">Website address</label>
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input id="tool-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder={placeholder} maxLength={500} className="h-12 border-0 bg-transparent pl-11 text-base shadow-none focus-visible:ring-0" />
      </div>
      <Button type="submit" variant="hero" size="lg" disabled={loading || !url.trim()}>
        {loading ? <Loader2 className="animate-spin" /> : null} {loading ? "Analyzing…" : cta}
      </Button>
    </form>
  );
}

export function ColorCard({ hex, locked, onLock, onRemove, sub, className }: { hex: string; locked?: boolean; onLock?: () => void; onRemove?: () => void; sub?: string; className?: string }) {
  const fg = readableOn(hex);
  return (
    <div className={cn("group overflow-hidden rounded-2xl border bg-card", className)}>
      <div className="relative flex h-28 items-end p-3" style={{ backgroundColor: hex, color: fg }}>
        <span className="font-mono text-sm font-semibold">{hex}</span>
        {sub && <span className="ml-auto text-xs opacity-80">{sub}</span>}
      </div>
      <div className="space-y-0.5 p-3 font-mono text-xs text-muted-foreground">
        <p>{fmtRgb(hex)}</p>
        <p>{fmtHsl(hex)}</p>
      </div>
      <div className="flex items-center gap-0.5 border-t px-1.5 py-1">
        <CopyButton text={hex} label={hex} />
        <CopyButton text={fmtRgb(hex)} label="RGB" size="sm" className="h-8 px-2 text-xs" />
        {onLock && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onLock} aria-label={locked ? "Unlock color" : "Lock color"}>{locked ? <Lock /> : <LockOpen />}</Button>}
        {onRemove && <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={onRemove} aria-label="Remove color"><X /></Button>}
      </div>
    </div>
  );
}

export function ExportBox({ colors, name = "brand" }: { colors: string[]; name?: string }) {
  const [fmt, setFmt] = useState<ExportFormat>("css");
  const code = exportPalette(colors, fmt, name);
  const ext = { css: "css", scss: "scss", tailwind: "js", json: "json" }[fmt];
  return (
    <div className="rounded-2xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b p-3">
        <Tabs value={fmt} onValueChange={(v) => setFmt(v as ExportFormat)}>
          <TabsList>
            <TabsTrigger value="css">CSS</TabsTrigger>
            <TabsTrigger value="tailwind">Tailwind</TabsTrigger>
            <TabsTrigger value="scss">SCSS</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-1">
          <CopyButton text={code} label="Copy" size="sm" />
          <Button variant="outline" size="sm" onClick={() => download(`${name}-palette.${ext}`, code)}>Download</Button>
        </div>
      </div>
      <pre className="max-h-80 overflow-auto p-4 font-mono text-xs leading-relaxed"><code>{code}</code></pre>
    </div>
  );
}

export function ErrorNote({ msg }: { msg: string }) {
  return <p role="alert" className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">{msg}</p>;
}

export function ResultSkeleton() {
  return (
    <div className="mt-6 grid animate-pulse gap-4 sm:grid-cols-3">
      {[0, 1, 2].map((i) => <div key={i} className="h-40 rounded-2xl bg-muted" />)}
    </div>
  );
}

export function savePalette(colors: string[]) {
  const all = JSON.parse(localStorage.getItem("lcs-current-palette") ?? "null");
  localStorage.setItem("lcs-current-palette", JSON.stringify(colors));
  return all;
}
export function loadPalette(): string[] | null {
  try { return JSON.parse(localStorage.getItem("lcs-current-palette") ?? "null"); } catch { return null; }
}
