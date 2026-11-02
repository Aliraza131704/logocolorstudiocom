import { createFileRoute } from "@tanstack/react-router";
import { CmsPage } from "@/components/site/CmsPage";
import { pageHead } from "@/lib/seo";
import { getPublicSetting } from "@/lib/content.functions";
import { TOOL_CONTENT_KEY, toolOverride, withMeta } from "@/lib/tool-overrides";
import { PageExtras } from "@/components/site/PageExtras";

const LOG = [
  { v: "2.0", d: "October 2026", items: ["New Website Auditor with SEO, mobile, security and performance checks", "New CMS Detector, Shopify Theme Detector and WordPress Theme Detector", "1,000-palette gallery with likes, search, tags and sorting", "Palettes generated automatically from your logo colors", "Light and dark mode", "Rewritten blog with table of contents and related articles"] },
  { v: "1.2", d: "August 2026", items: ["Theme Generator live preview", "Tailwind and SCSS exports"] },
  { v: "1.0", d: "June 2026", items: ["Launch: Logo Extractor, Website Extractor, Palette Generator, Contrast Checker and Export Center"] },
];

export const Route = createFileRoute("/changelog")({
  loader: () => getPublicSetting({ data: { key: TOOL_CONTENT_KEY } }),
  head: ({ loaderData }) => pageHead(withMeta(toolOverride(loaderData, "page-changelog"), { title: "Changelog — What's New in LogoColorStudio", description: "Release notes for LogoColorStudio: new tools, features and improvements to our free brand color toolkit.", path: "/changelog" })),
  component: Changelog,
});

function Changelog() {
  const o = toolOverride(Route.useLoaderData(), "page-changelog");
  return (
    <CmsPage title={o?.title ?? "Changelog"}>
      <ol className="mt-8 space-y-8 border-l pl-6">
        {LOG.map((r) => (
          <li key={r.v} className="relative">
            <span className="absolute -left-[31px] top-1.5 size-3 rounded-full bg-primary" />
            <h2 className="text-xl font-bold">Version {r.v} <span className="ml-2 text-sm font-normal text-muted-foreground">{r.d}</span></h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">{r.items.map((i) => <li key={i}>{i}</li>)}</ul>
          </li>
        ))}
      </ol>
      <PageExtras o={o} />
    </CmsPage>
  );
}
