import { createFileRoute } from "@tanstack/react-router";
import { getPage } from "@/lib/content.functions";
import { CmsPage } from "@/components/site/CmsPage";
import { pageHead } from "@/lib/seo";
import { PAGE_META } from "@/lib/page-meta";

export const Route = createFileRoute("/cookie-policy")({
  loader: () => getPage({ data: { slug: "cookies" } }),
  head: () => pageHead({ ...PAGE_META["/cookie-policy"], path: "/cookie-policy" }),
  component: () => {
    const p = Route.useLoaderData();
    return <CmsPage title={p?.title ?? "Cookie Policy"} html={p?.content ?? ""} />;
  },
});
