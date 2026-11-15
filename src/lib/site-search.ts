import { MEGA_GROUPS } from "./tool-groups";
import { NAMED_COLORS } from "./color-names";
import { BRANDS } from "./brands";
import { getAllPalettes } from "./palettes";

export type SearchKind = "Tools" | "Colors" | "Brand colors" | "Palettes" | "Free resources" | "Blog";
export type SearchItem = { kind: SearchKind; title: string; path: string; text: string; hex?: string[] };
export const SEARCH_KINDS: SearchKind[] = ["Tools", "Colors", "Brand colors", "Palettes", "Free resources", "Blog"];

export function staticIndex(): SearchItem[] {
  return [
    ...MEGA_GROUPS.flatMap((g) => g.tools.map((t) => ({ kind: "Tools" as const, title: t.name, path: t.path, text: `${t.short} ${g.label}` }))),
    ...NAMED_COLORS.map((c) => ({ kind: "Colors" as const, title: c.name, path: `/colors/${c.slug}`, text: c.hex, hex: [c.hex] })),
    ...BRANDS.map((b) => ({ kind: "Brand colors" as const, title: b.name, path: `/brand-colors/${b.slug}`, text: `${b.category} ${b.domain} ${b.colors.map((c) => c.hex).join(" ")}`, hex: b.colors.map((c) => c.hex) })),
    ...getAllPalettes().map((p) => ({ kind: "Palettes" as const, title: p.name, path: `/palette/${p.slug}`, text: `${p.tags.join(" ")} ${p.colors.join(" ")}`, hex: p.colors })),
  ];
}

export function normalizeHex(q: string): string | null {
  const m = q.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1];
  return `#${h.toUpperCase()}`;
}

export function scoreItem(item: SearchItem, q: string): number {
  const t = item.title.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.split(/\s+/).some((w) => w.startsWith(q))) return 60;
  if (t.includes(q)) return 40;
  const words = q.split(/\s+/).filter(Boolean);
  const hay = `${t} ${item.text.toLowerCase()}`;
  return words.length && words.every((w) => hay.includes(w)) ? 20 : 0;
}

export function searchItems(items: SearchItem[], query: string, perKind = 6): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored = items.map((i) => ({ i, s: scoreItem(i, q) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
  const counts: Record<string, number> = {};
  return scored.filter(({ i }) => (counts[i.kind] = (counts[i.kind] ?? 0) + 1) <= perKind).map((x) => x.i);
}
