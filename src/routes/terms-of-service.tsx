import { createFileRoute } from "@tanstack/react-router";
import { getPage } from "@/lib/content.functions";
import { CmsPage } from "@/components/site/CmsPage";
import { pageHead } from "@/lib/seo";
import { PAGE_META } from "@/lib/page-meta";

export const Route = createFileRoute("/terms-of-service")({
  loader: () => getPage({ data: { slug: "terms" } }),
  head: () => pageHead({ ...PAGE_META["/terms-of-service"], path: "/terms-of-service" }),
  component: () => {
    const p = Route.useLoaderData();
    return <CmsPage title={p?.title ?? "Terms of Service"} html={p?.content ?? ""} />;
  },
});
