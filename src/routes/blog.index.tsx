import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { listPosts } from "@/lib/content.functions";
import { Breadcrumbs, Reveal } from "@/components/site/ui-bits";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/blog/")({
  loader: () => listPosts(),
  head: () => pageHead({ title: "Blog — Color, Branding & Web Design Guides", description: "Practical guides on brand colors, color psychology, accessibility, palettes and website themes from the LogoColorStudio team.", path: "/blog" }),
  component: Page,
});

const PER = 9;

function Page() {
  const posts = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const cats = [...new Set(posts.map((p) => p.category))];
  const tags = [...new Set(posts.flatMap((p) => p.tags))];
  const list = useMemo(() => posts.filter((p) => (!cat || p.category === cat) && (!tag || p.tags.includes(tag)) && (!q || (p.title + p.excerpt).toLowerCase().includes(q.toLowerCase()))), [posts, q, cat, tag]);
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const items = list.slice((page - 1) * PER, page * PER);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Blog" }]} />
      <h1 className="text-4xl font-bold sm:text-5xl">Blog</h1>
      <p className="mt-3 text-lg text-muted-foreground">Guides on brand colors, accessibility and building better websites.</p>
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {[null, ...cats].map((c) => <Button variant={cat === c ? "default" : "outline"} key={c ?? "all"} onClick={() => { setCat(c); setPage(1); }}>{c ?? "All"}</Button>)}
        </div>
        <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search articles" placeholder="Search articles" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="w-64 pl-9" /></div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {tags.map((t) => <Button size="sm" variant={tag === t ? "default" : "secondary"} key={t} onClick={() => setTag(tag === t ? null : t)}>#{t}</Button>)}
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 0.05}>
            <Link to="/blog/$slug" params={{ slug: p.slug }} className="card-hover block h-full overflow-hidden rounded-2xl border bg-card">
              {p.cover_image && <img src={p.cover_image} alt="" width={1200} height={630} loading="lazy" className="aspect-[1200/630] w-full object-cover" />}
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">{p.category}</p>
                <h2 className="mt-2 text-lg font-bold leading-snug">{p.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                <p className="mt-4 text-xs text-muted-foreground">{new Date(p.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {Math.max(1, Math.ceil(p.words / 220))} min read</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
      {list.length === 0 && <p className="mt-10 text-center text-muted-foreground">No articles match your search.</p>}
      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex justify-center gap-2">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="self-center px-3 text-sm">Page {page} of {pages}</span>
          <Button variant="outline" disabled={page === pages} onClick={() => setPage(page + 1)}>Next</Button>
        </nav>
      )}
    </div>
  );
}
