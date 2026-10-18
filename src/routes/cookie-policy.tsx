import { createFileRoute } from "@tanstack/react-router";
import { getPage } from "@/lib/content.functions";
import { CmsPage } from "@/components/site/CmsPage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/cookie-policy")({
  loader: () => getPage({ data: { slug: "cookies" } }),
  head: () => pageHead({ title: "Cookie Policy — LogoColorStudio", description: "Which cookies LogoColorStudio uses, including advertising cookies, and how to manage your consent.", path: "/cookie-policy" }),
  component: () => {
    const p = Route.useLoaderData();
    return <CmsPage title={p?.title ?? "Cookie Policy"} html={p?.content ?? ""} />;
  },
});
