import { createFileRoute } from "@tanstack/react-router";
import { getPage } from "@/lib/content.functions";
import { CmsPage } from "@/components/site/CmsPage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/disclaimer")({
  loader: () => getPage({ data: { slug: "disclaimer" } }),
  head: () => pageHead({ title: "Disclaimer — LogoColorStudio", description: "Important limitations of the results, audits and detections provided by LogoColorStudio tools.", path: "/disclaimer" }),
  component: () => {
    const p = Route.useLoaderData();
    return <CmsPage title={p?.title ?? "Disclaimer"} html={p?.content ?? ""} />;
  },
});
