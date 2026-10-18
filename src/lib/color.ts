export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };

const clamp = (n: number, a = 0, b = 255) => Math.min(b, Math.max(a, n));

export function hexToRgb(hex: string): RGB | null {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }: RGB): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.round(clamp(v)).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  h = ((h % 360) + 360) % 360; s = clamp(s, 0, 100) / 100; l = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let [r, g, b] = [0, 0, 0];
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

export const hexToHsl = (hex: string) => rgbToHsl(hexToRgb(hex) ?? { r: 0, g: 0, b: 0 });
export const hslToHex = (hsl: HSL) => rgbToHex(hslToRgb(hsl));
export const normalizeHex = (hex: string) => {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHex(rgb) : null;
};

export const fmtRgb = (hex: string) => {
  const c = hexToRgb(hex)!;
  return `rgb(${c.r}, ${c.g}, ${c.b})`;
};
export const fmtHsl = (hex: string) => {
  const c = hexToHsl(hex);
  return `hsl(${c.h}, ${c.s}%, ${c.l}%)`;
};

function lum({ r, g, b }: RGB) {
  const f = (v: number) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrastRatio(a: string, b: string): number {
  const A = hexToRgb(a), B = hexToRgb(b);
  if (!A || !B) return 1;
  const la = lum(A), lb = lum(B);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function wcag(ratio: number) {
  return {
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  };
}

export const readableOn = (bg: string) =>
  contrastRatio(bg, "#FFFFFF") >= contrastRatio(bg, "#0F1B3D") ? "#FFFFFF" : "#0F1B3D";

export const adjust = (hex: string, dl = 0, ds = 0, dh = 0) => {
  const c = hexToHsl(hex);
  return hslToHex({ h: c.h + dh, s: clamp(c.s + ds, 0, 100), l: clamp(c.l + dl, 0, 100) });
};

export type Harmony =
  | "complementary"
  | "analogous"
  | "triadic"
  | "split-complementary"
  | "tetradic"
  | "monochromatic"
  | "pastel"
  | "dark"
  | "vibrant";

export const HARMONIES: { id: Harmony; label: string }[] = [
  { id: "complementary", label: "Complementary" },
  { id: "analogous", label: "Analogous" },
  { id: "triadic", label: "Triadic" },
  { id: "split-complementary", label: "Split-complementary" },
  { id: "tetradic", label: "Tetradic" },
  { id: "monochromatic", label: "Monochromatic" },
  { id: "pastel", label: "Pastel" },
  { id: "dark", label: "Dark" },
  { id: "vibrant", label: "Vibrant" },
];

export function harmony(base: string, rule: Harmony, count = 5): string[] {
  const c = hexToHsl(base);
  const at = (dh: number, s = c.s, l = c.l) => hslToHex({ h: c.h + dh, s, l });
  let out: string[] = [];
  switch (rule) {
    case "complementary":
      out = [at(0, c.s, Math.max(c.l - 20, 12)), base, at(0, c.s * 0.6, Math.min(c.l + 25, 92)), at(180), at(180, c.s, Math.max(c.l - 18, 12))];
      break;
    case "analogous":
      out = [at(-40), at(-20), base, at(20), at(40)];
      break;
    case "triadic":
      out = [base, at(120), at(240), at(0, c.s * 0.4, 92), at(120, c.s, Math.max(c.l - 25, 12))];
      break;
    case "split-complementary":
      out = [base, at(150), at(210), at(0, c.s * 0.3, 94), at(0, c.s, Math.max(c.l - 25, 10))];
      break;
    case "tetradic":
      out = [base, at(90), at(180), at(270), at(0, 15, 95)];
      break;
    case "monochromatic":
      out = [15, 32, 50, 68, 86].map((l) => at(0, c.s, l));
      break;
    case "pastel":
      out = [0, 40, 80, 160, 220].map((d) => at(d, 65, 84));
      break;
    case "dark":
      out = [0, 20, 180, 200, 30].map((d, i) => at(d, Math.min(c.s, 55), [10, 18, 26, 34, 55][i]));
      break;
    case "vibrant":
      out = [0, 72, 144, 216, 288].map((d) => at(d, 92, 55));
      break;
  }
  return out.slice(0, count);
}

/** Extract dominant colors from ImageData using k-means on sampled opaque pixels. */
export function extractColors(data: Uint8ClampedArray, k = 6): { hex: string; share: number }[] {
  const px: number[][] = [];
  const step = Math.max(1, Math.floor(data.length / 4 / 20000));
  for (let i = 0; i < data.length; i += 4 * step) {
    if (data[i + 3] < 200) continue;
    px.push([data[i], data[i + 1], data[i + 2]]);
  }
  if (!px.length) return [];
  // init with spread picks
  let centers = Array.from({ length: Math.min(k, px.length) }, (_, i) => px[Math.floor((i * px.length) / k)].slice());
  let assign = new Array(px.length).fill(0);
  for (let it = 0; it < 12; it++) {
    for (let p = 0; p < px.length; p++) {
      let best = 0, bd = Infinity;
      for (let c = 0; c < centers.length; c++) {
        const d = (px[p][0] - centers[c][0]) ** 2 + (px[p][1] - centers[c][1]) ** 2 + (px[p][2] - centers[c][2]) ** 2;
        if (d < bd) { bd = d; best = c; }
      }
      assign[p] = best;
    }
    const sums = centers.map(() => [0, 0, 0, 0]);
    px.forEach((p, i) => { const s = sums[assign[i]]; s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; s[3]++; });
    centers = sums.map((s, i) => (s[3] ? [s[0] / s[3], s[1] / s[3], s[2] / s[3]] : centers[i]));
  }
  const counts = centers.map((_, i) => assign.filter((a) => a === i).length);
  const res = centers
    .map((c, i) => ({ hex: rgbToHex({ r: c[0], g: c[1], b: c[2] }), share: counts[i] / px.length }))
    .filter((c) => c.share > 0.005)
    .sort((a, b) => b.share - a.share);
  // merge near duplicates
  const merged: { hex: string; share: number }[] = [];
  for (const c of res) {
    const dup = merged.find((m) => {
      const a = hexToRgb(m.hex)!, b = hexToRgb(c.hex)!;
      return Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b) < 40;
    });
    if (dup) dup.share += c.share; else merged.push({ ...c });
  }
  return merged;
}

export type ExportFormat = "css" | "scss" | "tailwind" | "json";

export function exportPalette(colors: string[], format: ExportFormat, name = "brand"): string {
  const keys = colors.map((_, i) => `${name}-${(i + 1) * 100}`);
  switch (format) {
    case "css":
      return `:root {\n${colors.map((c, i) => `  --${keys[i]}: ${c};`).join("\n")}\n}`;
    case "scss":
      return colors.map((c, i) => `$${keys[i]}: ${c};`).join("\n");
    case "tailwind":
      return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        ${name}: {\n${colors.map((c, i) => `          ${(i + 1) * 100}: "${c}",`).join("\n")}\n        },\n      },\n    },\n  },\n};`;
    case "json":
      return JSON.stringify(
        Object.fromEntries(colors.map((c, i) => [keys[i], { hex: c, rgb: fmtRgb(c), hsl: fmtHsl(c) }])),
        null,
        2,
      );
  }
}

export function randomHex(rand = Math.random) {
  return hslToHex({ h: rand() * 360, s: 45 + rand() * 50, l: 35 + rand() * 40 });
}
