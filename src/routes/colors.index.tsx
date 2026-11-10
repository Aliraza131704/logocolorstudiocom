import { createFileRoute, Link } from "@tanstack/react-router";
import { COLOR_FAMILIES, NAMED_COLORS, colorFamily } from "@/lib/color-names";
import { readableOn } from "@/lib/color";
import { breadcrumbLd } from "@/components/site/ui-bits";
import { pageHead } from "@/lib/seo";
import { PAGE_META } from "@/lib/page-meta";

export const Route = createFileRoute("/colors/")({
  head: () =>
    pageHead({ ...PAGE_META["/colors"], path: "/colors",
      jsonLd: [breadcrumbLd([{ label: "Color names" }], "/colors")],
    }),
  component: Page,
});

function Page() {
  const groups = COLOR_FAMILIES.map((f) => ({ ...f, colors: NAMED_COLORS.filter((c) => colorFamily(c.hex) === f.id) })).filter((g) => g.colors.length);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-bold">Color names and HEX codes</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Look up the exact HEX, RGB, HSL and CMYK values of {NAMED_COLORS.length} popular colors. Every color page shows its shades
        and tints, ready-made color palettes, readable text colors and famous brands with similar logo colors.
      </p>
      {groups.map((g) => (
        <section key={g.id} className="mt-10" aria-labelledby={`fam-${g.id}`}>
          <h2 id={`fam-${g.id}`} className="text-xl font-bold">{g.label} colors</h2>
          <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {g.colors.map((c) => (
              <li key={c.slug}>
                <Link to="/colors/$slug" params={{ slug: c.slug }} className="group block overflow-hidden rounded-xl border bg-card hover:border-primary">
                  <span className="flex h-24 items-end p-2 font-mono text-xs font-semibold" style={{ backgroundColor: c.hex, color: readableOn(c.hex) }}>{c.hex}</span>
                  <span className="block px-3 py-2 text-sm font-semibold group-hover:text-primary">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
