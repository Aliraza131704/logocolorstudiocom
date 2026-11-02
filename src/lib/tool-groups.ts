import {
  Blocks,
  Contrast,
  Download,
  Gauge,
  Globe,
  Image,
  Layers,
  Palette,
  ShoppingBag,
  SunMoon,
  type LucideIcon,
} from "lucide-react";

export type MegaTool = {
  name: string;
  path: string;
  short: string;
  icon: LucideIcon;
  color: string;
  isNew?: boolean;
};

export type MegaGroup = {
  label: string;
  blurb: string;
  tools: MegaTool[];
};

export const MEGA_GROUPS: MegaGroup[] = [
  {
    label: "Extract & generate",
    blurb: "Turn a logo, a site or an idea into a working color system.",
    tools: [
      { name: "Logo Extractor", path: "/tools/logo-extractor", short: "Pull exact brand colors from any logo file", icon: Image, color: "text-brand-blue" },
      { name: "Website Extractor", path: "/tools/website-extractor", short: "Grab colors, fonts and logos from any URL", icon: Globe, color: "text-brand-green" },
      { name: "Palette Generator", path: "/tools/palette-generator", short: "Build harmonious palettes, then lock and shuffle", icon: Palette, color: "text-brand-orange" },
    ],
  },
  {
    label: "Check & export",
    blurb: "Make the palette safe to read, then ship it in your stack.",
    tools: [
      { name: "Contrast Checker", path: "/tools/contrast-checker", short: "Verify color pairs against WCAG AA and AAA", icon: Contrast, color: "text-brand-red" },
      { name: "Theme Generator", path: "/tools/theme-generator", short: "Derive light and dark UI themes from a palette", icon: SunMoon, color: "text-brand-blue" },
      { name: "Export Center", path: "/tools/export-center", short: "CSS variables, Tailwind, SCSS or JSON tokens", icon: Download, color: "text-brand-green" },
    ],
  },
  {
    label: "Site detectors",
    blurb: "See what a website is built with, in one lookup.",
    tools: [
      { name: "CMS Detector", path: "/tools/cms-detector", short: "WordPress, Shopify, Wix, Webflow and 30 more", icon: Layers, color: "text-brand-red" },
      { name: "Shopify Theme Detector", path: "/tools/shopify-theme-detector", short: "Theme name, version and installed apps", icon: ShoppingBag, color: "text-brand-green" },
      { name: "WordPress Theme Detector", path: "/tools/wordpress-theme-detector", short: "Theme, author and active plugin evidence", icon: Blocks, color: "text-brand-blue" },
    ],
  },
  {
    label: "Site audits",
    blurb: "A full-page quality report with fixes, not just scores.",
    tools: [
      { name: "Website Auditor", path: "/tools/website-auditor", short: "Score SEO, mobile, HTTPS and image health", icon: Gauge, color: "text-brand-orange", isNew: true },
    ],
  },
];

/** Flat list of every path shown in the mega menu, for active-state checks. */
export const MEGA_PATHS: string[] = MEGA_GROUPS.flatMap((g) => g.tools.map((t) => t.path));
