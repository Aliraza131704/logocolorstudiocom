import { readableOn, contrastRatio } from "./color";
import { categoryLabel, type Brand } from "./brands";

const CATEGORY_CONTEXT: Record<Brand["category"], { used: string; tip: string }> = {
  tech: {
    used: "app icons, product packaging, keynotes and the interfaces of the devices and services people use every day",
    tip: "tech palettes pair a confident primary with near-black neutrals, so keep body text on the darkest shade and reserve the bright accent for calls to action",
  },
  fashion: {
    used: "labels, storefronts, campaign photography and e-commerce product pages",
    tip: "fashion identities lean on high contrast, so test any colored text against the palette's darkest tone before shipping",
  },
  luxury: {
    used: "boutique signage, embossed packaging, watch dials and jewellery boxes",
    tip: "luxury palettes work best with generous whitespace and a single metallic or deep accent rather than many saturated colors at once",
  },
  automotive: {
    used: "badges, dealer showrooms, configurators and motorsport liveries",
    tip: "automotive colors are engineered for visibility at speed, which makes their primaries excellent for buttons and alerts",
  },
  food: {
    used: "packaging, restaurant signage, delivery apps and menu boards",
    tip: "food palettes use warm, appetite-friendly hues; pair them with a clean neutral so photography stays the hero",
  },
  beauty: {
    used: "product tubes, counters, shade finders and social campaigns",
    tip: "beauty branding often sits on soft neutrals, so check small text contrast carefully when using the lighter shades",
  },
  sports: {
    used: "kits, equipment, timing screens and broadcast graphics",
    tip: "sports colors are built for motion and distance recognition, so they hold up well in large headings and hero sections",
  },
  home: {
    used: "showrooms, appliance housings, catalogues and assembly guides",
    tip: "home and lifestyle palettes usually mix one bold signature color with calm neutrals that suit long-form reading",
  },
  finance: {
    used: "cards, statements, trading dashboards and branch signage",
    tip: "finance identities favor trust-building blues and deep neutrals; keep saturated accents for key actions only",
  },
  entertainment: {
    used: "title cards, streaming apps, posters, liveries and store shelves",
    tip: "entertainment palettes are designed to pop on dark screens, so they translate naturally to dark-mode interfaces",
  },
};

/** 100+ words of unique, brand-specific copy for the detail page. */
export function brandStory(b: Brand): string[] {
  const ctx = CATEGORY_CONTEXT[b.category];
  const names = b.colors.map((c) => c.name).join(", ");
  const hexes = b.colors.map((c) => c.hex).join(", ");
  const primary = b.colors[0];
  const primaryText = readableOn(primary.hex);
  const ratio = contrastRatio(primary.hex, primaryText).toFixed(1);
  const paragraphs = [
    `${b.name} is one of the most recognizable names in ${categoryLabel(b.category).toLowerCase()}, and its visual identity is a big part of that recognition. The ${b.name} logo palette is built around ${names} (${hexes}). These colors appear across ${ctx.used}, which is why they feel familiar even before you read the name.`,
    `The lead color, ${primary.name} ${primary.hex}, reads best with ${primaryText === "#FFFFFF" ? "white" : "dark navy"} text on top, at a contrast ratio of about ${ratio}:1. When you build with this palette, ${ctx.tip}. Copy any value above in HEX, RGB or HSL, click directly on the logo to sample an exact pixel, or download the whole palette as a PNG, CSS variables or a Tailwind config.`,
  ];
  return paragraphs;
}
