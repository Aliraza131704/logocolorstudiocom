import { createFileRoute } from "@tanstack/react-router";
import { PaletteGeneratorPage, GENERATOR_FAQS } from "@/components/site/PaletteGenerator";
import { faqLd } from "@/components/site/ui-bits";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/tools/palette-generator")({
 head: () => pageHead({ title: "Palette Generator — LogoColorStudio", description: "Generate color harmonies, lock colors, shuffle, preview and export your custom palette as CSS, JSON or PNG.", path: "/tools/palette-generator", jsonLd: [faqLd(GENERATOR_FAQS)] }),
 component: PaletteGeneratorPage,
});
