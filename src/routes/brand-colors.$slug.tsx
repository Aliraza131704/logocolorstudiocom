import { createFileRoute, notFound } from "@tanstack/react-router";
import { getBrand } from "@/lib/brands";
import { BrandDetail } from "@/components/site/BrandDetail";
import { AdSlot } from "@/components/site/AdSlot";
import { Breadcrumbs, breadcrumbLd } from "@/components/site/ui-bits";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/brand-colors/$slug")({
  loader: ({ params }) => {
    const brand = getBrand(params.slug);
    if (!brand) throw notFound();
    return brand;
  },
  head: ({ loaderData: b, params }) =>
    b
      ? pageHead({
          title: `${b.name} Brand Colors: HEX, RGB & Logo Palette`.slice(0, 60),
          description: `The official ${b.name} logo colors: ${b.colors.map((c) => `${c.name} ${c.hex}`).join(", ")}. Copy HEX, RGB and HSL, pick colors from the logo, and download the palette.`,
          path: `/brand-colors/${params.slug}`,
          type: "article",
          follow: true,
          jsonLd: [
            breadcrumbLd(
              [{ label: "Brand Colors", to: "/brand-colors" }, { label: b.name }],
              `/brand-colors/${params.slug}`,
            ),
          ],
        })
      : { meta: [{ title: "Brand not found" }, { name: "robots", content: "noindex" }] },
  component: Page,
});

function Page() {
  const brand = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Brand Colors", to: "/brand-colors" }, { label: brand.name }]} />
      <BrandDetail brand={brand} />
      <AdSlot position="below_tool" className="mt-10" />
    </div>
  );
}
