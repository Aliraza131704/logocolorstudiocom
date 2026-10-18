import { Lock, LockOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton, copyText } from "./ui-bits";
import { exportPalette, fmtRgb, readableOn } from "@/lib/color";

/** Large horizontal palette strip with HEX + RGB and per-color actions. */
export function PaletteRow({ colors, title, locked, onLock, onRemove, actions = true }: { colors: string[]; title?: string; locked?: boolean[]; onLock?: (i: number) => void; onRemove?: (i: number) => void; actions?: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
          <h3 className="text-sm font-semibold">{title}</h3>
          {actions && (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => copyText(colors.join(", "), "Copied colors")}>Copy</Button>
              <Button variant="ghost" size="sm" onClick={() => copyText(exportPalette(colors, "css"), "Copied CSS")}>CSS</Button>
              <Button variant="ghost" size="sm" onClick={() => copyText(exportPalette(colors, "json"), "Copied JSON")}>JSON</Button>
            </div>
          )}
        </div>
      )}
      <div className="flex min-h-40 flex-col sm:flex-row">
        {colors.map((c, i) => {
          const fg = readableOn(c);
          return (
            <div key={`${c}-${i}`} className="group flex flex-1 flex-row items-center justify-between gap-2 p-3 sm:flex-col sm:justify-end sm:text-center" style={{ backgroundColor: c, color: fg }}>
              <div>
                <p className="font-mono text-sm font-bold">{c}</p>
                <p className="font-mono text-[11px] opacity-80">{fmtRgb(c).replace("rgb", "")}</p>
              </div>
              <div className="flex gap-0.5 [&_button]:text-inherit [&_button:hover]:bg-black/10">
                {onLock && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onLock(i)} aria-label={locked?.[i] ? "Unlock" : "Lock"}>{locked?.[i] ? <Lock /> : <LockOpen />}</Button>}
                <CopyButton text={c} className="h-7 w-7" />
                {onRemove && colors.length > 1 && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRemove(i)} aria-label="Remove"><X /></Button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
