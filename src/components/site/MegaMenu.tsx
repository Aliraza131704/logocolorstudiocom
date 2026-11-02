import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronDown, Download, Grid2x2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MEGA_GROUPS } from "@/lib/tool-groups";

const SWATCHES = ["bg-brand-blue", "bg-brand-green", "bg-brand-orange", "bg-brand-red"] as const;

/**
 * Full-width mega menu for the Tools section. Opens on hover or click on
 * desktop, closes on Escape, outside click, route change or pointer leave.
 */
export function MegaMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  const show = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    onOpenChange(true);
  };
  const hide = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => onOpenChange(false), 140);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={wrapRef} className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <Button
        variant="ghost"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => onOpenChange(!open)}
        className={cn("gap-1.5 font-medium", open && "bg-accent text-accent-foreground")}
      >
        Tools
        <ChevronDown className={cn("size-4 transition-transform duration-200", open && "rotate-180")} />
      </Button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 w-screen max-w-[min(62rem,calc(100vw-2rem))] -translate-x-1/2 px-4">
          <div className="mt-2 overflow-hidden rounded-2xl border bg-popover shadow-soft">
            <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_15rem]">
              <div className="grid gap-6 sm:grid-cols-2">
                {MEGA_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {group.label}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/80">{group.blurb}</p>
                    <ul className="mt-3 space-y-0.5">
                      {group.tools.map((tool) => (
                        <li key={tool.path}>
                          <Link
                            to={tool.path}
                            onClick={() => onOpenChange(false)}
                            className="group -mx-2 flex gap-3 rounded-xl p-2 transition-colors hover:bg-accent"
                          >
                            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border bg-background">
                              <tool.icon className={cn("size-4", tool.color)} />
                            </span>
                            <span className="min-w-0">
                              <span className="flex items-center gap-2 text-sm font-medium">
                                {tool.name}
                                {tool.isNew && (
                                  <span className="rounded-full bg-brand-green/15 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-brand-green">
                                    New
                                  </span>
                                )}
                              </span>
                              <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                                {tool.short}
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                <div className="rounded-xl border bg-card p-4">
                  <div className="flex gap-1.5" aria-hidden="true">
                    {SWATCHES.map((c, i) => (
                      <span
                        key={c}
                        className={cn("size-5 rounded", c)}
                        style={{ transform: `rotate(${(i - 1.5) * 4}deg)` }}
                      />
                    ))}
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold">
                    <Sparkles className="size-4 text-brand-orange" /> Brand Colors
                  </p>
                  <p className="mt-1 text-xs leading-snug text-muted-foreground">
                    Official HEX, RGB and HSL values for 199 well-known brands.
                  </p>
                  <Link
                    to="/brand-colors"
                    onClick={() => onOpenChange(false)}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Browse brands <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>

                <div className="rounded-xl border bg-card p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Explore</p>
                  <div className="mt-2 space-y-1">
                    <Link
                      to="/palettes"
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-2 rounded-lg px-1 py-1.5 text-sm transition-colors hover:bg-accent"
                    >
                      <Grid2x2 className="size-4 text-brand-blue" /> Palette gallery
                    </Link>
                    <Link
                      to="/downloads"
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-2 rounded-lg px-1 py-1.5 text-sm transition-colors hover:bg-accent"
                    >
                      <Download className="size-4 text-brand-green" /> Asset downloads
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/40 px-6 py-3">
              <p className="text-xs text-muted-foreground">
                Every tool is free to use — no account, no watermark, no upload limits.
              </p>
              <Link
                to="/sitemap"
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                See everything on the site <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
