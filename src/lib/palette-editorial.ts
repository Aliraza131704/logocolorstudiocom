import { getAllPalettes, PALETTE_TAGS, type Palette } from "./palettes";
import { contrastRatio, hexToHsl } from "./color";

const selected = PALETTE_TAGS.flatMap(tag => getAllPalettes().filter(p => p.tags[0] === tag && !/-\d+$/.test(p.slug)).slice(0, 15));
const selectedSlugs = new Set(selected.map(p => p.slug));
export const getIndexablePalettes = () => selected;
export const isIndexablePalette = (slug: string) => selectedSlugs.has(slug);
const styles: Record<string, { mood: string; uses: string[] }> = {
  Pastel: { mood: "soft and airy", uses: ["Wellness booking website", "Illustrator portfolio", "Children’s stationery brand"] },
  Dark: { mood: "quiet and atmospheric", uses: ["Music editorial website", "Photography portfolio", "Developer dashboard"] },
  Vibrant: { mood: "energetic and expressive", uses: ["Creative studio website", "Festival identity", "Fitness app"] },
  Retro: { mood: "nostalgic and grounded", uses: ["Independent restaurant brand", "Record store website", "Vintage clothing shop"] },
  Gradient: { mood: "flowing and cohesive", uses: ["Digital product landing page", "Event poster", "Creative portfolio"] },
  Neon: { mood: "electric and high-impact", uses: ["Gaming event website", "Nightlife poster", "Interactive music player"] },
  Earth: { mood: "organic and understated", uses: ["Outdoor equipment brand", "Local garden centre", "Ceramics portfolio"] },
  Warm: { mood: "welcoming and sunlit", uses: ["Bakery website", "Travel journal", "Community event brand"] },
  Cool: { mood: "composed and spacious", uses: ["SaaS landing page", "Architecture portfolio", "Coastal accommodation website"] },
  Brand: { mood: "confident and structured", uses: ["Business identity", "Product onboarding", "Professional services website"] },
};
export function paletteEditorial(p: Palette) {
  const style = styles[p.tags[0]] ?? styles.Brand;
  const ordered = [...p.colors].sort((a, b) => hexToHsl(a).l - hexToHsl(b).l);
  const dark = ordered[0];
  const light = ordered.at(-1) ?? dark;
  const accent = [...p.colors].sort((a, b) => hexToHsl(b).s - hexToHsl(a).s)[0];
  return {
    description: `${p.name} pairs ${p.colors[0]} with ${p.colors.slice(1, 3).join(" and ")} for a ${style.mood} impression. Its darkest shade, ${dark}, anchors the composition while ${light} supplies the lightest counterpoint; ${accent} is the strongest saturation accent. The ${contrastRatio(dark, light).toFixed(2)}:1 contrast between the endpoints helps determine whether those two shades belong in text, decoration, or separate surfaces.`,
    uses: style.uses, dark, light, accent,
  };
}