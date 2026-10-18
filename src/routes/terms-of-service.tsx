import { createFileRoute } from "@tanstack/react-router";
import { getPage } from "@/lib/content.functions";
import { CmsPage } from "@/components/site/CmsPage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/terms-of-service")({
  loader: () => getPage({ data: { slug: "terms" } }),
  head: () => pageHead({ title: "Terms of Service — LogoColorStudio", description: "The terms that apply when you use LogoColorStudio's free color, palette and website analysis tools.", path: "/terms-of-service" }),
  component: () => {
    const p = Route.useLoaderData();
    return <CmsPage title={p?.title ?? "Terms of Service"} html={p?.content ?? ""} />;
  },
});
