import { createFileRoute } from "@tanstack/react-router";
import { getPage } from "@/lib/content.functions";
import { CmsPage } from "@/components/site/CmsPage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy-policy")({
  loader: () => getPage({ data: { slug: "privacy" } }),
  head: () => pageHead({ title: "Privacy Policy — LogoColorStudio", description: "How LogoColorStudio collects, uses and protects data, including cookies, Google AdSense and your opt-out choices.", path: "/privacy-policy" }),
  component: () => {
    const p = Route.useLoaderData();
    return <CmsPage title={p?.title ?? "Privacy Policy"} html={p?.content ?? ""} />;
  },
});
