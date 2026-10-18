import { createFileRoute } from "@tanstack/react-router";
import { getPage } from "@/lib/content.functions";
import { CmsPage } from "@/components/site/CmsPage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  loader: () => getPage({ data: { slug: "about" } }),
  head: () => pageHead({ title: "About LogoColorStudio — Free Brand Color Tools", description: "Learn who builds LogoColorStudio, how our free color and website tools work, and how we protect your privacy.", path: "/about" }),
  component: () => {
    const p = Route.useLoaderData();
    return <CmsPage title={p?.title ?? "About LogoColorStudio"} html={p?.content ?? ""} />;
  },
});
