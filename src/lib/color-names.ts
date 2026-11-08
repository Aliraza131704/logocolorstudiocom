// Named colors for the /colors section. HEX values are the widely used web /
// reference values for each name; every other number on a color page (RGB,
// HSL, CMYK, shades, contrast, harmonies) is computed from that HEX.
import { contrastRatio, hexToHsl, hexToRgb, hslToHex } from "./color";
import { BRANDS, type Brand } from "./brands";

export type NamedColor = { slug: string; name: string; hex: string; about: string };

type Row = [name: string, slug: string, hex: string, about: string];

const ROWS: Row[] = [
  ["Burgundy", "burgundy", "#800020", "a deep purplish red named after the wine of the Burgundy region of France. Designers use it for premium packaging, restaurant and wine branding, autumn collections and formal invitations"],
  ["Teal", "teal", "#008080", "a dark blue-green that sits between blue and green on the color wheel. It is popular for healthcare, finance and wellness brands, dashboards and calm, modern interfaces"],
  ["Beige", "beige", "#F5F5DC", "a pale, warm off-white with a hint of yellow. It works as a soft background, a neutral for interiors and fashion, and a gentle alternative to pure white on websites"],
  ["Indigo", "indigo", "#4B0082", "a deep violet-blue between blue and violet in the visible spectrum. It suits creative, tech and night-themed designs and pairs well with gold, white and soft pinks"],
  ["Periwinkle", "periwinkle", "#CCCCFF", "a soft pastel blue with a lavender tint, named after the periwinkle flower. It is common in spring palettes, children's products, stationery and friendly app interfaces"],
  ["Maroon", "maroon", "#800000", "a dark brownish red. It appears in university and sports team colors, heritage brands and warm, earthy palettes"],
  ["Navy blue", "navy-blue", "#000080", "a very dark blue named after naval uniforms. It is one of the most trusted brand colors for banks, law firms, corporate sites and readable dark headings"],
  ["Coral", "coral", "#FF7F50", "a lively orange-pink inspired by coral reefs. It adds warmth to calls to action, summer campaigns, food brands and lifestyle websites"],
  ["Lavender", "lavender", "#E6E6FA", "a very light purple named after the lavender flower. It is used for calm backgrounds, beauty and wellness brands, and soft section dividers"],
  ["Mint green", "mint-green", "#98FF98", "a fresh, pale green. It suits health, food, eco and fintech products and works well as a success or highlight color"],
  ["Sage green", "sage-green", "#BCB88A", "a muted grey-green named after the sage herb. It is a favorite for interiors, wedding palettes, organic products and calm, natural websites"],
  ["Mustard yellow", "mustard-yellow", "#FFDB58", "a warm, slightly dark yellow. It brings a retro, friendly feel to posters, packaging and accent buttons"],
  ["Turquoise", "turquoise", "#40E0D0", "a bright blue-green named after the turquoise gemstone. It is popular for travel, beach, jewellery and playful tech brands"],
  ["Magenta", "magenta", "#FF00FF", "a vivid purplish red made of full red and full blue light. It is one of the four CMYK printing inks and a bold accent for fashion, music and entertainment designs"],
  ["Olive green", "olive-green", "#808000", "a dark yellowish green like unripe olives. It suits outdoor, military-inspired, food and earthy fashion palettes"],
  ["Emerald green", "emerald-green", "#50C878", "a brilliant green named after the emerald gemstone. It signals growth and freshness and is used in finance, eco and luxury designs"],
  ["Crimson", "crimson", "#DC143C", "a strong, deep red with a slight blue tint. It is a classic sports, university and alert color and draws attention in headlines and buttons"],
  ["Ivory", "ivory", "#FFFFF0", "an off-white with a warm, creamy tint, named after the material. It is used for elegant backgrounds, wedding stationery and premium print"],
  ["Charcoal", "charcoal", "#36454F", "a dark blue-grey named after burnt wood. It is a softer alternative to black for text, dark themes and modern interiors"],
  ["Peach", "peach", "#FFE5B4", "a light, warm orange-pink like the skin of a peach. It suits beauty, baby, food and friendly lifestyle brands"],
  ["Cyan", "cyan", "#00FFFF", "a bright greenish blue made of full green and full blue light. It is one of the four CMYK printing inks and a common tech and data-visualization accent"],
  ["Gold", "gold", "#FFD700", "a bright yellow that suggests the metal gold on screen. It is used for awards, premium badges, festive designs and luxury accents"],
  ["Lilac", "lilac", "#C8A2C8", "a pale purple named after the lilac flower. It suits spring palettes, beauty products, invitations and gentle UI accents"],
  ["Taupe", "taupe", "#483C32", "a dark brownish grey. It is a sophisticated neutral for fashion, interiors and luxury brands that want warmth without strong color"],
  ["Salmon", "salmon", "#FA8072", "a pinkish orange like the flesh of salmon. It works for food, hospitality and warm, approachable websites"],
  ["Mauve", "mauve", "#E0B0FF", "a light purple named after the mallow flower. It is used in fashion, beauty and soft, romantic palettes"],
  ["Sky blue", "sky-blue", "#87CEEB", "a light blue like a clear daytime sky. It feels open and calm and suits travel, kids, weather and SaaS designs"],
  ["Lime green", "lime-green", "#32CD32", "a bright yellowish green. It adds energy to sports, gaming and eco brands and works as an eye-catching accent"],
  ["Tan", "tan", "#D2B48C", "a pale brown like tanned leather. It is a warm neutral for fashion, leather goods, outdoor brands and earthy websites"],
  ["Rust", "rust", "#B7410E", "a reddish orange-brown like oxidized iron. It brings warmth to autumn palettes, interiors and craft or coffee brands"],
];

export const NAMED_COLORS: NamedColor[] = ROWS.map(([name, slug, hex, about]) => ({ name, slug, hex, about }));

const bySlug = new Map(NAMED_COLORS.map((c) => [c.slug, c]));
export const getNamedColor = (slug: string) => bySlug.get(slug);
export const colorPath = (c: NamedColor) => `/colors/${c.slug}`;

export function toCmyk(hex: string) {
  const rgb = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const k = 1 - Math.max(r, g, b);
  if (k >= 1) return { c: 0, m: 0, y: 0, k: 100 };
  const f = (x: number) => Math.round(((1 - x - k) / (1 - k)) * 100);
  return { c: f(r), m: f(g), y: f(b), k: Math.round(k * 100) };
}

/** Five darker shades and five lighter tints, computed from the base HSL. */
export function shadesAndTints(hex: string) {
  const c = hexToHsl(hex);
  const shades = [1, 2, 3, 4, 5].map((i) => hslToHex({ ...c, l: Math.max(2, c.l - (c.l * i) / 6) }));
  const tints = [1, 2, 3, 4, 5].map((i) => hslToHex({ ...c, l: Math.min(98, c.l + ((100 - c.l) * i) / 6) }));
  return { shades, tints };
}

export type ColorFamily = "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "neutral";
export const COLOR_FAMILIES: { id: ColorFamily; label: string }[] = [
  { id: "red", label: "Red" },
  { id: "orange", label: "Orange" },
  { id: "yellow", label: "Yellow" },
  { id: "green", label: "Green" },
  { id: "blue", label: "Blue" },
  { id: "purple", label: "Purple" },
  { id: "pink", label: "Pink" },
  { id: "neutral", label: "Black & white" },
];

/** Hue-based family; very dark, very light or greyish colors count as neutral. */
export function colorFamily(hex: string): ColorFamily {
  const { h, s, l } = hexToHsl(hex);
  if (s < 15 || l < 8 || l > 95) return "neutral";
  if (h < 12 || h >= 345) return "red";
  if (h < 42) return "orange";
  if (h < 68) return "yellow";
  if (h < 170) return "green";
  if (h < 255) return "blue";
  if (h < 300) return "purple";
  return "pink";
}

export const brandFamilies = (b: Brand) => [...new Set(b.colors.map((c) => colorFamily(c.hex)))];

/** Warm hues are reds, oranges and yellows; greys/neutrals have no clear temperature. */
export function temperature(hex: string): "warm" | "cool" | "neutral" {
  const { h, s } = hexToHsl(hex);
  if (s < 15) return "neutral";
  return h < 75 || h >= 330 ? "warm" : "cool";
}

function distance(a: string, b: string) {
  const x = hexToRgb(a), y = hexToRgb(b);
  if (!x || !y) return Infinity;
  // Weighted RGB distance approximates perceived difference cheaply.
  return Math.sqrt(2 * (x.r - y.r) ** 2 + 4 * (x.g - y.g) ** 2 + 3 * (x.b - y.b) ** 2);
}

/** Brands with a logo color close to this color, nearest first. */
export function brandsUsingColor(hex: string, n = 8, max = 120) {
  return BRANDS.map((b) => {
    const best = b.colors.reduce((m, c) => Math.min(m, distance(hex, c.hex)), Infinity);
    const color = b.colors.find((c) => distance(hex, c.hex) === best)!;
    return { brand: b, color, d: best };
  })
    .filter((x) => x.d <= max)
    .sort((a, b) => a.d - b.d)
    .slice(0, n);
}

export const similarColors = (c: NamedColor, n = 6) =>
  NAMED_COLORS.filter((x) => x.slug !== c.slug)
    .sort((a, b) => distance(c.hex, a.hex) - distance(c.hex, b.hex))
    .slice(0, n);

export function textContrast(hex: string) {
  return { white: contrastRatio(hex, "#FFFFFF"), black: contrastRatio(hex, "#000000") };
}
