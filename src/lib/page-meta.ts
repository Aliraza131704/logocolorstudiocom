/**
 * Search and social copy for every public page, in one place so titles and
 * descriptions stay unique and within length limits (see src/test/page-meta.test.ts).
 * Owner edits in Admin → Tool pages still override these defaults.
 */
import type { Palette } from "@/lib/palettes";
import type { Brand } from "@/lib/brands";
import type { NamedColor } from "@/lib/color-names";
import { fmtRgb } from "@/lib/color";

export type PageMeta = { title: string; description: string; ogTitle: string; ogDescription: string };

export const BRAND_SUFFIX = " | LogoColorStudio";
export const TITLE_MAX = 60;
export const DESC_MIN = 140;
export const DESC_MAX = 155;
export const OG_DESC_MAX = 100;

export const PAGE_META = {
  "/": {
    title: "LogoColorStudio — Free Logo Color & Brand Palette Tools",
    description: "Extract colors from any logo or website, get HEX and RGB codes, build brand palettes and check contrast in seconds. Free, no signup. Start now.",
    ogTitle: "LogoColorStudio — Free Logo Color & Brand Palette Tools",
    ogDescription: "Get HEX codes from any logo, build brand palettes and check contrast. Free, no signup.",
  },
  "/about": {
    title: "About Us — Free Color Tools by Ali Raza | LogoColorStudio",
    description: "Meet Ali Raza of APWEB Ventures, the maker of LogoColorStudio. Learn how our free color tools work and how we keep your data private. Read our story.",
    ogTitle: "About LogoColorStudio and Ali Raza",
    ogDescription: "Who builds LogoColorStudio, how the free color tools work and how we protect your privacy.",
  },
  "/contact": {
    title: "Contact Us — Questions & Feedback | LogoColorStudio",
    description: "Have a question, idea or bug to report? Send a message through our contact form or email apwebventures01@gmail.com and we will reply. Get in touch.",
    ogTitle: "Contact LogoColorStudio",
    ogDescription: "Questions, feedback or partnership ideas? Send us a message or email us.",
  },
  "/tools": {
    title: "Free Color & Website Tools for Designers | LogoColorStudio",
    description: "Browse every free LogoColorStudio tool: logo and website color extractors, a palette generator, contrast checker and theme detectors. No signup. Try one.",
    ogTitle: "Free Color & Website Tools for Designers",
    ogDescription: "Color extractors, palette generator, contrast checker and theme detectors. All free.",
  },
  "/tools/logo-extractor": {
    title: "Logo Color Changer & HEX Code Extractor | LogoColorStudio",
    description: "Upload any logo to get its exact HEX, RGB and HSL color codes, then change its colors online. Free, works in your browser and needs no signup. Try it free.",
    ogTitle: "Logo Color Changer & HEX Code Extractor",
    ogDescription: "Get the exact HEX codes from any logo and change its colors online. Free, no signup.",
  },
  "/tools/website-extractor": {
    title: "Website Color Extractor: Colors & Fonts | LogoColorStudio",
    description: "Paste any website address to get its brand colors, fonts and logo with HEX and RGB codes, ready to export as CSS or Tailwind. Free and fast. Try it free.",
    ogTitle: "Website Color Extractor: Colors, Fonts & Logo",
    ogDescription: "Pull the brand colors, fonts and logo from any website in seconds. Free to use.",
  },
  "/tools/palette-generator": {
    title: "Free Color Palette Generator Online | LogoColorStudio",
    description: "Create color palettes with harmony rules, lock the colors you like, check contrast and export CSS, JSON or PNG. Free with no signup required. Start now.",
    ogTitle: "Free Color Palette Generator",
    ogDescription: "Build color schemes, lock favorites and export CSS, JSON or PNG. Free, no signup.",
  },
  "/tools/contrast-checker": {
    title: "Color Contrast Checker for WCAG AA/AAA | LogoColorStudio",
    description: "Test text and background colors against WCAG 2.2 AA and AAA with a live preview, ratio score and fix suggestions. Free and instant. Check your colors now.",
    ogTitle: "Color Contrast Checker for WCAG AA and AAA",
    ogDescription: "Check text and background contrast with a live preview and fix suggestions. Free.",
  },
  "/tools/theme-generator": {
    title: "Light & Dark UI Theme Generator | LogoColorStudio",
    description: "Turn your brand palette into accessible light and dark UI themes with a live preview, then copy CSS variables for Tailwind and shadcn/ui. Try it free.",
    ogTitle: "Light & Dark UI Theme Generator",
    ogDescription: "Turn brand colors into accessible light and dark themes and copy the CSS. Free.",
  },
  "/tools/export-center": {
    title: "Export Palette to CSS, Tailwind & JSON | LogoColorStudio",
    description: "Turn any color palette into CSS variables, a Tailwind config, SCSS, JSON or a PNG swatch. Rename tokens and copy in one click. Free. Export yours now.",
    ogTitle: "Export a Palette to CSS, Tailwind & JSON",
    ogDescription: "Export colors as CSS variables, Tailwind, SCSS, JSON or PNG in one click. Free.",
  },
  "/tools/website-auditor": {
    title: "Free Website Audit Tool with Evidence | LogoColorStudio",
    description: "Audit any public website for SEO, accessibility, security and content issues, with evidence for each finding and PDF or CSV reports. Free. Run an audit.",
    ogTitle: "Free Website Audit Tool with Real Evidence",
    ogDescription: "Check SEO, accessibility and security issues with evidence and export reports. Free.",
  },
  "/tools/cms-detector": {
    title: "CMS Checker: Find What CMS a Site Uses | LogoColorStudio",
    description: "Check if any website runs WordPress, Shopify, Wix, Squarespace or 30+ other platforms, with evidence for every match. Free, no signup. Check a site now.",
    ogTitle: "CMS Checker: Find What CMS Any Website Uses",
    ogDescription: "See if a site runs WordPress, Shopify, Wix or 30+ other platforms. Free, no signup.",
  },
  "/tools/shopify-theme-detector": {
    title: "Shopify Theme Detector: Find Any Theme | LogoColorStudio",
    description: "Paste a Shopify store address to see its theme name, version, Theme Store link and installed apps in seconds. Free and no signup needed. Detect it now.",
    ogTitle: "Shopify Theme Detector: Find Any Store's Theme",
    ogDescription: "See any Shopify store's theme name, version and installed apps in seconds. Free.",
  },
  "/tools/wordpress-theme-detector": {
    title: "WordPress Theme Detector & Plugin Finder | LogoColorStudio",
    description: "Find the WordPress theme any site uses: name, version, author, parent theme and detected plugins, with the evidence behind each. Free. Check a site now.",
    ogTitle: "WordPress Theme Detector & Plugin Finder",
    ogDescription: "Find any WordPress site's theme, version, author and plugins. Free, no signup.",
  },
  "/palettes": {
    title: "1,000 Color Palette Ideas with HEX Codes | LogoColorStudio",
    description: "Browse 1,000 free color palettes by style, from pastel to dark. Copy HEX and RGB codes, check text contrast and export CSS. No signup. Find your palette.",
    ogTitle: "1,000 Color Palette Ideas with HEX Codes",
    ogDescription: "Pastel, dark, retro and neon palettes with HEX codes you can copy. Free.",
  },
  "/brand-colors": {
    title: "Brand Color Palettes & Logo Color Codes | LogoColorStudio",
    description: "Official logo colors and brand color palettes of nearly 200 famous brands, with HEX, RGB and HSL codes and palette downloads. Free. Find a brand now.",
    ogTitle: "Brand Color Palettes & Logo Color Codes",
    ogDescription: "Official logo colors of nearly 200 brands with HEX, RGB and HSL codes. Free.",
  },
  "/colors": {
    title: "Color Names with HEX & RGB Codes | LogoColorStudio",
    description: "HEX, RGB, HSL and CMYK codes for 30 popular colors like burgundy, teal and beige, with shades, matching palettes and text contrast. Free. Explore colors.",
    ogTitle: "Color Names with HEX & RGB Codes",
    ogDescription: "Burgundy, teal, beige and more: HEX, RGB, HSL and CMYK codes with shades. Free.",
  },
  "/blog": {
    title: "Color, Branding & Web Design Blog | LogoColorStudio",
    description: "Practical guides on brand colors, color psychology, accessibility, palettes and WordPress themes, written by Ali Raza. Free to read. Read the latest guide.",
    ogTitle: "Color, Branding & Web Design Blog",
    ogDescription: "Practical guides on brand colors, palettes, accessibility and website themes.",
  },
  "/downloads": {
    title: "Free WordPress Themes & Template Kits | LogoColorStudio",
    description: "Download free WordPress themes and template kits for WooCommerce, magazine, food and portfolio sites, including WoodMart and Newspaper. Get yours now.",
    ogTitle: "Free WordPress Themes & Template Kits",
    ogDescription: "WooCommerce, magazine, food and portfolio themes like WoodMart and Newspaper.",
  },
  "/giveaway": {
    title: "Free Monthly 50 USDT Giveaway | LogoColorStudio",
    description: "Enter the free LogoColorStudio monthly giveaway with just your name and email. No payment or purchase needed, and one winner gets 50 USDT. Enter now.",
    ogTitle: "Free Monthly 50 USDT Giveaway",
    ogDescription: "Free to enter, no purchase needed. One winner gets 50 USDT every month.",
  },
  "/changelog": {
    title: "What's New: Changelog & Release Notes | LogoColorStudio",
    description: "See every new tool, feature and fix added to LogoColorStudio, from color extractors to theme detectors, in clear release notes. Free. See what's new.",
    ogTitle: "What's New at LogoColorStudio",
    ogDescription: "Release notes for new tools, features and fixes on LogoColorStudio.",
  },
  "/sitemap": {
    title: "Sitemap: All Pages, Tools & Guides | LogoColorStudio",
    description: "Find every page on LogoColorStudio in one list: free color tools, 1,000 palettes, brand colors, color names, guides, downloads and legal pages. Browse now.",
    ogTitle: "Sitemap: Every Page on LogoColorStudio",
    ogDescription: "All tools, palettes, brand colors, guides and legal pages in one list.",
  },
  "/privacy-policy": {
    title: "Privacy Policy: Cookies, Ads & Your Data | LogoColorStudio",
    description: "Read how LogoColorStudio collects, uses and protects your data, including cookies, Google AdSense and your opt-out choices, in plain words. Read it now.",
    ogTitle: "Privacy Policy: Cookies, Ads & Your Data",
    ogDescription: "How we collect, use and protect data, including cookies and Google AdSense.",
  },
  "/terms-of-service": {
    title: "Terms of Service for Our Free Tools | LogoColorStudio",
    description: "The rules that apply when you use LogoColorStudio's free color, palette and website analysis tools, including fair use and your content. Read the terms.",
    ogTitle: "Terms of Service for LogoColorStudio",
    ogDescription: "The rules for using our free color, palette and website analysis tools.",
  },
  "/cookie-policy": {
    title: "Cookie Policy & Consent Choices | LogoColorStudio",
    description: "Learn which cookies LogoColorStudio uses, including advertising and analytics cookies, and how to change your consent at any time. Manage your cookies.",
    ogTitle: "Cookie Policy & Consent Choices",
    ogDescription: "Which cookies we use, including advertising cookies, and how to change consent.",
  },
  "/disclaimer": {
    title: "Disclaimer: Limits of Our Tool Results | LogoColorStudio",
    description: "Understand the limits of the color results, website audits and CMS or theme detections from LogoColorStudio tools before you rely on them. Read more.",
    ogTitle: "Disclaimer: Limits of Our Tool Results",
    ogDescription: "What our color results, audits and detections can and cannot tell you.",
  },
} satisfies Record<string, PageMeta>;

export type MetaPath = keyof typeof PAGE_META;

/** Picks the first title that fits, so long names fall back to a shorter pattern. */
const fitTitle = (options: string[]) => options.map((t) => t + BRAND_SUFFIX).find((t) => t.length <= TITLE_MAX) ?? options[options.length - 1].slice(0, TITLE_MAX - BRAND_SUFFIX.length) + BRAND_SUFFIX;

/** Returns the longest candidate that fits the description limit. */
const fitDescription = (candidates: string[]) => candidates.filter((d) => d.length <= DESC_MAX).sort((a, b) => b.length - a.length)[0] ?? candidates[candidates.length - 1].slice(0, DESC_MAX);

export function paletteMeta(p: Palette): PageMeta {
  const codes = p.colors.join(", ");
  const style = p.tags.join(" and ").toLowerCase();
  const intro = `${p.name} is a free ${style} color palette: ${codes}.`;
  return {
    title: fitTitle([`${p.name} Color Palette ${p.colors[0]}`, `${p.name} Palette ${p.colors[0]}`]),
    description: fitDescription([
      `${intro} Copy HEX and RGB codes, check contrast or export CSS. Get your colors.`,
      `${intro} Copy HEX and RGB codes or export CSS and Tailwind. Get your colors.`,
      `${intro} Copy HEX and RGB codes or export to CSS. Get your colors.`,
      `${intro} Copy HEX codes or export CSS and Tailwind. Get your colors.`,
      `${intro} Copy the HEX codes or export CSS. Get your colors.`,
      `${intro} Copy HEX codes or export CSS. Get your colors.`,
      `${intro} Copy the HEX codes free. Get your colors.`,
      `${intro} Copy HEX codes. Get your colors.`,
    ]),
    ogTitle: `${p.name} Color Palette`,
    ogDescription: `${codes}. Copy the HEX codes free.`,
  };
}

export function brandMeta(b: Brand): PageMeta {
  const named = b.colors.map((c) => `${c.name} ${c.hex}`);
  const candidates: string[] = [];
  for (let n = named.length; n >= 1; n--) {
    const list = named.slice(0, n).join(", ");
    candidates.push(
      `Official ${b.name} logo and brand colors: ${list}. Copy HEX, RGB and HSL codes, pick colors from the logo and download the palette. Free. Copy now.`,
      `Official ${b.name} logo colors: ${list}. Copy HEX, RGB and HSL codes, pick colors from the logo and download the palette. Free. Copy now.`,
      `Official ${b.name} logo colors: ${list}. Copy HEX, RGB and HSL codes and download the palette for free. Copy now.`,
      `Official ${b.name} logo colors: ${list}. Copy HEX, RGB and HSL codes for free. Copy now.`,
      `${b.name} logo colors: ${list}. Copy HEX, RGB and HSL codes free. Copy now.`,
    );
  }
  return {
    title: fitTitle([`${b.name} Logo Colors & HEX Codes`, `${b.name} Logo Colors`, `${b.name} Colors`]),
    description: fitDescription(candidates),
    ogTitle: `${b.name} Logo Colors & HEX Codes`,
    ogDescription: `Official ${b.name} brand colors with HEX, RGB and HSL codes. Free to copy.`,
  };
}

export function colorNameMeta(c: NamedColor): PageMeta {
  const lower = c.name.toLowerCase();
  const intro = `${c.name} color code ${c.hex}, ${fmtRgb(c.hex)}.`;
  return {
    title: fitTitle([`${c.name} Color Code: HEX ${c.hex} & RGB`, `${c.name} Color: HEX ${c.hex}`]),
    description: fitDescription([
      `${intro} See ${lower} shades and tints, matching palettes, text contrast and HSL and CMYK values, all free. Copy the code.`,
      `${intro} See ${lower} shades and tints, matching palettes, text contrast and CMYK values, all free. Copy the code.`,
      `${intro} See ${lower} shades and tints, matching palettes and text contrast, all free. Copy the code.`,
      `${intro} See ${lower} shades, matching palettes and text contrast for free. Copy the code.`,
    ]),
    ogTitle: `${c.name} Color: HEX ${c.hex}`,
    ogDescription: `${c.name} HEX ${c.hex} and ${fmtRgb(c.hex)}, with shades and matching palettes.`,
  };
}
