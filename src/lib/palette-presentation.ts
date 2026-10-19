import { contrastRatio, readableOn } from "./color";

// Preserve the brand neutral where it passes; fall back to black only for
// mid-luminance swatches where neither the brand neutral nor white meets AA.
export function paletteTextColor(background: string) {
  const preferred = readableOn(background);
  return contrastRatio(background, preferred) >= 4.5 ? preferred : "#000000";
}