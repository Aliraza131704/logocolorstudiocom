import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { searchItems, SEARCH_KINDS } from "@/lib/site-search";
import { useSearchIndex } from "@/components/site/SiteSearch";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => ({ q: typeof s.q === "string" ? s.q.slice(0, 100) : undefined }),
  head: () => ({
    meta: [
      { title: "Search colors, tools and free resources | LogoColorStudio" },
      { name: "description", content: "Search LogoColorStudio for color names, brand colors, palettes, design tools, free WordPress themes and guides." },
      { property: "og:title", content: "Search LogoColorStudio" },
      { property: "og:description", content: "Find colors, palettes, brand colors, tools and free resources." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q: initial = "" } = Route.useSearch();
  const [q, setQ] = useState(initial);
  const items = useSearchIndex();
  const results = useMemo(() => searchItems(items, q, 60), [items, q]);
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Search</h1>
      <Input className="mt-6 h-12 text-base" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search colors, tools, palettes, free resources..." aria-label="Search" autoFocus />
      {q.trim() && !results.length && <p className="mt-8 text-muted-foreground">No results for “{q}”.</p>}
      <div className="notranslate">
      {SEARCH_KINDS.map((k) => {
        const list = results.filter((r) => r.kind === k);
        return list.length ? (
          <section key={k} className="mt-8">
            <h2 className="font-display text-lg font-semibold">{k} <span className="text-sm text-muted-foreground">({list.length})</span></h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {list.map((r) => (
                <li key={r.path + r.title}>
                  <Link to={r.path} className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:border-primary">
                    <span className="truncate font-medium">{r.title}</span>
                    {r.hex && <span className="ml-auto flex overflow-hidden rounded" aria-hidden="true">{r.hex.slice(0, 5).map((h, i) => <span key={i} className="h-5 w-5" style={{ background: h }} />)}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null;
      })}
      </div>
    </main>
  );
}
