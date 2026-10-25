import { Link } from "@tanstack/react-router";
import { TOOL_GUIDES } from "@/lib/tool-guide-content";
import { TOOLS } from "@/lib/tools";
import website from "@/assets/guide-website-extract.jpg";
import webPalette from "@/assets/guide-web-palette.jpg";
import contrast from "@/assets/guide-contrast-check.jpg";
import accessibility from "@/assets/guide-accessibility.jpg";
import theme from "@/assets/guide-theme-generate.jpg";
import darkMode from "@/assets/guide-dark-mode.jpg";
import shopify from "@/assets/guide-shopify-detect.jpg";
import apps from "@/assets/guide-shopify-apps.jpg";
import wordpress from "@/assets/guide-wordpress-detect.jpg";
import plugins from "@/assets/guide-wp-plugins.jpg";
import exportCode from "@/assets/guide-export-code.jpg";
import tokens from "@/assets/guide-design-tokens.jpg";
import palette from "@/assets/guide-palette-generate.jpg";
import harmonies from "@/assets/guide-harmony-rules.jpg";

type GuideImage = { src: string; alt: string; caption: string };
const IMAGES: Record<string, GuideImage[]> = {
  "website-extractor": [
    { src: website, alt: "Illustration of a website being inspected for its colors and font styles", caption: "Inspect public styles, then compare the extracted values with the original page." },
    { src: webPalette, alt: "Illustration of website colors arranged into a palette", caption: "Separate brand accents from the neutrals used for text, backgrounds and borders." },
  ],
  "contrast-checker": [
    { src: contrast, alt: "Illustration comparing readable and low-contrast text and background combinations", caption: "Contrast belongs to a specific foreground and background pair." },
    { src: accessibility, alt: "Illustration of accessible interface elements and contrasting colors", caption: "Color contrast supports readability but is only one part of accessibility." },
  ],
  "theme-generator": [
    { src: theme, alt: "Illustration of brand colors applied to interface surfaces and controls", caption: "Semantic roles turn a small brand palette into useful interface colors." },
    { src: darkMode, alt: "Illustration comparing light and dark interface themes", caption: "Review foregrounds, surfaces and accents separately in both modes." },
  ],
  "shopify-theme-detector": [
    { src: shopify, alt: "Illustration of a storefront being inspected for theme clues", caption: "Public storefront metadata can provide clues about a Shopify theme." },
    { src: apps, alt: "Illustration of integrations connected to an online storefront", caption: "Visible integration signatures are not a complete installed-app inventory." },
  ],
  "wordpress-theme-detector": [
    { src: wordpress, alt: "Illustration of a website and its underlying theme files", caption: "Theme paths and readable stylesheet headers help identify public theme candidates." },
    { src: plugins, alt: "Illustration of modular plugin blocks connected to a website", caption: "Themes, page builders and plugins contribute different parts of a website." },
  ],
  "export-center": [
    { src: exportCode, alt: "Illustration of a color palette becoming code files", caption: "Export raw color values without retyping every swatch." },
    { src: tokens, alt: "Illustration connecting color swatches with design-token roles", caption: "Map exported values to semantic roles in your own design system." },
  ],
  "palette-generator": [
    { src: palette, alt: "Illustration of color swatches arranged around a palette workspace", caption: "Explore a starting palette, then refine it for the actual project." },
    { src: harmonies, alt: "Illustration of color-wheel relationships and coordinated swatches", caption: "Harmony rules describe hue relationships, not guaranteed readability." },
  ],
};

function GuideFigure({ image }: { image: GuideImage | undefined }) {
  if (!image) return null;
  return (
    <figure>
      <img src={image.src} alt={image.alt} loading="lazy" decoding="async" className="aspect-video w-full rounded-lg border object-contain bg-muted" />
      <figcaption>{image.caption}</figcaption>
    </figure>
  );
}

export function ToolGuide({ slug }: { slug: string }) {
  const guide = TOOL_GUIDES[slug];
  if (!guide) return null;
  const images = IMAGES[slug];
  const related = TOOLS.filter(tool => guide.related.includes(tool.slug));
  return (
    <>
      <h2>{guide.title}</h2>
      {guide.intro.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      <GuideFigure image={images?.[0]} />
      <h2>How to use the {TOOLS.find(tool => tool.slug === slug)?.name}</h2>
      <ol>{guide.steps.map(step => <li key={step}>{step}</li>)}</ol>
      <h2>12 key features</h2>
      <ul>{guide.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
      {guide.sections.map((section, index) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          {index === 1 && <GuideFigure image={images?.[1]} />}
        </section>
      ))}
      <h2>Continue your workflow</h2>
      <ul>{related.map(tool => <li key={tool.slug}><Link to={tool.path}>{tool.name}</Link> — {tool.short}</li>)}</ul>
    </>
  );
}