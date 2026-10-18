import { hslToHex } from "./color";

export type Palette = { slug: string; name: string; colors: string[]; tags: string[]; index: number };

export const PALETTE_TAGS = ["Pastel", "Dark", "Vibrant", "Retro", "Gradient", "Neon", "Earth", "Warm", "Cool", "Brand"] as const;

function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ADJ = ["Velvet", "Quiet", "Golden", "Misty", "Electric", "Sunlit", "Frosted", "Wild", "Coastal", "Urban", "Silent", "Bright", "Lunar", "Desert", "Royal", "Cosmic", "Tropical", "Nordic", "Vintage", "Candy", "Midnight", "Autumn", "Spring", "Ocean", "Forest", "Citrus", "Smoky", "Rosy", "Copper", "Crystal"];
const NOUN = ["Dawn", "Harbor", "Bloom", "Ember", "Lagoon", "Meadow", "Canyon", "Orchid", "Horizon", "Grove", "Dune", "Reef", "Aurora", "Summit", "Breeze", "Sorbet", "Pulse", "Echo", "Garden", "Tide", "Prism", "Nectar", "Haze", "Spice", "Glacier", "Vista", "Fable", "Mosaic", "Lantern", "Willow"];

type Style = { tag: (typeof PALETTE_TAGS)[number]; gen: (r: () => number) => string[]; extra?: string[] };

const STYLES: Style[] = [
  { tag: "Pastel", gen: (r) => { const h = r() * 360; return [0, 35, 70, 140, 210].map((d) => hslToHex({ h: h + d + r() * 15, s: 55 + r() * 25, l: 80 + r() * 8 })); }, extra: ["Cool"] },
  { tag: "Dark", gen: (r) => { const h = r() * 360; return [0, 10, 25, 180, 40].map((d, i) => hslToHex({ h: h + d, s: 25 + r() * 35, l: [8, 14, 22, 32, 55][i] + r() * 5 })); } },
  { tag: "Vibrant", gen: (r) => { const h = r() * 360; return [0, 60, 130, 200, 280].map((d) => hslToHex({ h: h + d + r() * 20, s: 85 + r() * 15, l: 50 + r() * 10 })); }, extra: ["Brand"] },
  { tag: "Retro", gen: (r) => { const h = 15 + r() * 30; return [h, h + 25, 175 + r() * 20, h + 340, 45].map((hh, i) => hslToHex({ h: hh, s: 50 + r() * 25, l: [45, 58, 38, 30, 85][i] })); }, extra: ["Warm"] },
  { tag: "Gradient", gen: (r) => { const h = r() * 360, span = 40 + r() * 80; return [0, 1, 2, 3, 4].map((i) => hslToHex({ h: h + (span * i) / 4, s: 70 + r() * 20, l: 45 + i * 8 })); } },
  { tag: "Neon", gen: (r) => { const h = r() * 360; return [hslToHex({ h, s: 30, l: 7 }), ...[0, 90, 180, 270].map((d) => hslToHex({ h: h + d + r() * 30, s: 100, l: 55 + r() * 8 }))]; }, extra: ["Dark"] },
  { tag: "Earth", gen: (r) => { const hs = [25, 35, 80, 100, 40]; return hs.map((h, i) => hslToHex({ h: h + r() * 15, s: 25 + r() * 25, l: [30, 50, 40, 28, 82][i] + r() * 6 })); }, extra: ["Warm"] },
  { tag: "Warm", gen: (r) => { const h = r() * 50; return [0, 12, 24, 36, 48].map((d, i) => hslToHex({ h: (h + d + 340) % 360, s: 70 + r() * 25, l: 40 + i * 9 })); } },
  { tag: "Cool", gen: (r) => { const h = 170 + r() * 90; return [0, 15, 30, 45, 60].map((d, i) => hslToHex({ h: h + d, s: 45 + r() * 40, l: 22 + i * 14 })); } },
  { tag: "Brand", gen: (r) => { const h = r() * 360; return [hslToHex({ h, s: 80, l: 50 }), hslToHex({ h: h + 180, s: 75, l: 55 }), hslToHex({ h, s: 30, l: 12 }), hslToHex({ h, s: 15, l: 96 }), hslToHex({ h: h + 30, s: 90, l: 60 })]; } },
];

let cache: Palette[] | null = null;

export function getAllPalettes(): Palette[] {
  if (cache) return cache;
  const out: Palette[] = [];
  const used = new Set<string>();
  for (let i = 0; i < 1000; i++) {
    const r = mulberry32(i * 7919 + 17);
    const style = STYLES[i % STYLES.length];
    const colors = style.gen(r);
    let name = `${ADJ[Math.floor(r() * ADJ.length)]} ${NOUN[Math.floor(r() * NOUN.length)]}`;
    let slug = name.toLowerCase().replace(/\s+/g, "-");
    if (used.has(slug)) slug = `${slug}-${i}`;
    used.add(slug);
    if (slug.endsWith(`-${i}`)) name = `${name} ${(i % 9) + 2}`;
    out.push({ slug, name, colors, tags: [style.tag, ...(style.extra ?? [])], index: i });
  }
  cache = out;
  return out;
}

export const getPalette = (slug: string) => getAllPalettes().find((p) => p.slug === slug);
