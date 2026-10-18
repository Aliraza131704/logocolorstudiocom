import { createFileRoute, Link } from "@tanstack/react-router";
import { TOOLS } from "@/lib/tools";
import { Breadcrumbs, Reveal } from "@/components/site/ui-bits";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/tools/")({
  head: () => pageHead({ title: "All Color & Website Tools — LogoColorStudio", description: "Browse every free LogoColorStudio tool: logo and website color extraction, palettes, contrast, themes, exports, audits and theme detectors.", path: "/tools" }),
  component: () => (
    <div className="mx-auto max-w-7xl bg-hero px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Tools" }]} />
      <h1 className="text-4xl font-bold sm:text-5xl">All tools</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">Ten free tools for brand colors and website research.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t, i) => (
          <Reveal key={t.slug} delay={(i % 3) * 0.05}>
            <Link to={t.path} className="card-hover block h-full rounded-2xl border bg-card p-6">
              <t.icon className={`size-7 ${t.color}`} />
              <h2 className="mt-4 text-xl font-semibold">{t.name}</h2>
              <p className="mt-2 text-muted-foreground">{t.short}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  ),
});
