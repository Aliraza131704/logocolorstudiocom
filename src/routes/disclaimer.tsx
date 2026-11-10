import { createFileRoute } from "@tanstack/react-router";
import { getPage } from "@/lib/content.functions";
import { CmsPage } from "@/components/site/CmsPage";
import { pageHead } from "@/lib/seo";
import { PAGE_META } from "@/lib/page-meta";

export const Route = createFileRoute("/disclaimer")({
  loader: () => getPage({ data: { slug: "disclaimer" } }),
  head: () => pageHead({ ...PAGE_META["/disclaimer"], path: "/disclaimer" }),
  component: () => {
    const p = Route.useLoaderData();
    return <CmsPage title={p?.title ?? "Disclaimer"} html={p?.content ?? ""} />;
  },
});
