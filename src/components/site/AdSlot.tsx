import { useEffect, useRef } from "react";
import { useLocation } from "@tanstack/react-router";
import { useAds, useSettings } from "@/lib/site-data";
import { useConsent } from "./consent";
import { cn } from "@/lib/utils";

function inject(el: HTMLElement, html: string) {
  el.innerHTML = "";
  const frag = document.createRange().createContextualFragment(html);
  el.appendChild(frag);
}

const SIZES: Record<string, string> = {
  header: "min-h-[100px]",
  footer: "min-h-[100px]",
  left_sidebar: "min-h-[600px]",
  right_sidebar: "min-h-[600px]",
  in_content: "min-h-[250px]",
  between_palettes: "min-h-[100px]",
  below_tool: "min-h-[250px]",
  mobile_sticky: "min-h-[60px]",
};

/** Renders admin-configured ad code for a position. Hidden until enabled + consented. */
export function AdSlot({ position, className }: { position: string; className?: string }) {
  const { data: ads } = useAds();
  const { consent } = useConsent();
  const ref = useRef<HTMLDivElement>(null);
  const loc = useLocation();
  const slot = ads?.find((a) => a.position === position);
  const blocked = loc.pathname.startsWith("/admin") || loc.pathname.startsWith("/login");
  const active = !!slot && slot.enabled && !!slot.code.trim() && consent.ads && !blocked && useAdsEnabled();

  useEffect(() => {
    if (active && ref.current) inject(ref.current, slot!.code);
  }, [active, slot?.code]);

  if (!active) return null;
  const vis = cn(!slot!.show_desktop && "md:hidden", !slot!.show_mobile && "hidden md:block");
  return (
    <aside aria-label="Advertisement" className={cn("my-6 w-full", vis, className)}>
      <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-muted-foreground">Advertisement</p>
      <div ref={ref} className={cn("flex w-full items-center justify-center overflow-hidden rounded-xl", SIZES[position])} />
    </aside>
  );
}

/** Injects global head/footer scripts (AdSense, Analytics) after consent. */
export function GlobalScripts() {
  const { data: s } = useSettings();
  const { consent } = useConsent();
  const loc = useLocation();
  const done = useRef<Set<string>>(new Set());
  const isAdmin = loc.pathname.startsWith("/admin") || loc.pathname.startsWith("/login");

  useEffect(() => {
    if (!s || isAdmin) return;
    const add = (key: string, html: string, target: HTMLElement) => {
      if (!html.trim() || done.current.has(key)) return;
      done.current.add(key);
      target.appendChild(document.createRange().createContextualFragment(html));
    };
    if (consent.analytics) add("header", s.header_scripts ?? "", document.head);
    if (consent.analytics) add("footer", s.footer_scripts ?? "", document.body);
    if (consent.ads) add("adsense", s.adsense_head ?? "", document.head);
  }, [s, consent, isAdmin]);
  return null;
}

/** Ad code pasted by the owner inside a blog post. Same consent rules as AdSlot. */
export function InlineAdCode({ code }: { code: string }) {
  const { consent } = useConsent();
  const ref = useRef<HTMLDivElement>(null);
  const active = consent.ads && !!code.trim();
  useEffect(() => { if (active && ref.current) inject(ref.current, code); }, [active, code]);
  if (!active) return null;
  return (
    <aside aria-label="Advertisement" className="mx-auto my-6 w-full max-w-3xl">
      <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-muted-foreground">Advertisement</p>
      <div ref={ref} className="flex min-h-[250px] w-full items-center justify-center overflow-hidden rounded-xl" />
    </aside>
  );
}

const AD_MARK = /<p>\s*\[\[(ad|adcode)(?::([A-Za-z0-9+/=]*))?\]\]\s*<\/p>/g;
export const encodeAdCode = (code: string) => btoa(unescape(encodeURIComponent(code)));
const decodeAdCode = (b: string) => { try { return decodeURIComponent(escape(atob(b))); } catch { return ""; } };

/** Splits post HTML at [[ad]] / [[adcode:...]] markers inserted by the editor. */
export function splitAdMarkers(html: string): ({ html: string } | { ad: string } | { code: string })[] {
  const out: ({ html: string } | { ad: string } | { code: string })[] = [];
  let last = 0;
  for (const m of html.matchAll(AD_MARK)) {
    out.push({ html: html.slice(last, m.index) });
    out.push(m[1] === "ad" ? { ad: "in_content" } : { code: decodeAdCode(m[2] ?? "") });
    last = m.index! + m[0].length;
  }
  out.push({ html: html.slice(last) });
  return out;
}
