import { createFileRoute } from "@tanstack/react-router";
import { PaletteGeneratorPage, GENERATOR_FAQS } from "@/components/site/PaletteGenerator";
import { faqLd } from "@/components/site/ui-bits";
import { pageHead } from "@/lib/seo";
import { getPublicSetting } from "@/lib/content.functions";
import { TOOL_CONTENT_KEY, toolOverride } from "@/lib/tool-overrides";
import { PAGE_META } from "@/lib/page-meta";
export const Route = createFileRoute("/tools/palette-generator")({
 loader: () => getPublicSetting({ data: { key: TOOL_CONTENT_KEY } }),
 head: ({ loaderData }) => {
  const o = toolOverride(loaderData, "palette-generator");
  return pageHead({ ...withMeta(o, PAGE_META["/tools/palette-generator"]), path: "/tools/palette-generator", jsonLd: [faqLd(o?.faqs ?? GENERATOR_FAQS)] });
 },
 component: PaletteGeneratorPage,
});
