import { Image, Globe, Palette, Contrast, SunMoon, Download, Gauge, Layers, ShoppingBag, Blocks, type LucideIcon } from "lucide-react";

export type ToolDef = { slug: string; path: string; name: string; short: string; icon: LucideIcon; color: string; isNew?: boolean };

export const TOOLS: ToolDef[] = [
  { slug: "logo-extractor", path: "/tools/logo-extractor", name: "Logo Extractor", short: "Upload a logo and get its exact brand colors in HEX, RGB and HSL.", icon: Image, color: "text-brand-blue" },
  { slug: "website-extractor", path: "/tools/website-extractor", name: "Website Extractor", short: "Pull colors, fonts and the logo from any public website.", icon: Globe, color: "text-brand-green" },
  { slug: "palette-generator", path: "/palettes", name: "Palette Generator", short: "Create harmonious palettes, lock, shuffle and export.", icon: Palette, color: "text-brand-orange" },
  { slug: "contrast-checker", path: "/tools/contrast-checker", name: "Contrast Checker", short: "Test any color pair against WCAG AA and AAA.", icon: Contrast, color: "text-brand-red" },
  { slug: "theme-generator", path: "/tools/theme-generator", name: "Theme Generator", short: "Build light and dark UI themes from your palette with live preview.", icon: SunMoon, color: "text-brand-blue" },
  { slug: "export-center", path: "/tools/export-center", name: "Export Center", short: "Export colors as CSS variables, Tailwind, SCSS or JSON.", icon: Download, color: "text-brand-green" },
  { slug: "website-auditor", path: "/tools/website-auditor", name: "Website Auditor", short: "Score SEO, mobile, HTTPS and image checks with fix tips.", icon: Gauge, color: "text-brand-orange", isNew: true },
  { slug: "cms-detector", path: "/tools/cms-detector", name: "CMS Detector", short: "Find out if a site runs WordPress, Shopify, Wix, Webflow and more.", icon: Layers, color: "text-brand-red", isNew: true },
  { slug: "shopify-theme-detector", path: "/tools/shopify-theme-detector", name: "Shopify Theme Detector", short: "Detect a Shopify store's theme, version and installed apps.", icon: ShoppingBag, color: "text-brand-green", isNew: true },
  { slug: "wordpress-theme-detector", path: "/tools/wordpress-theme-detector", name: "WordPress Theme Detector", short: "Reveal a WordPress theme, its author and active plugins.", icon: Blocks, color: "text-brand-blue", isNew: true },
];
