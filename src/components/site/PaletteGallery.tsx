import { Link } from "@tanstack/react-router";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Heart, Search } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getAllPalettes, PALETTE_TAGS } from "@/lib/palettes";
import { getVisitorId } from "@/lib/site-data";
import { paletteTextColor } from "@/lib/palette-presentation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { copyText } from "./ui-bits";
import { AdSlot } from "./AdSlot";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PER = 24;

export const likesQuery = { queryKey: ["palette_likes"], queryFn: async () => {
  const { data } = await supabase.rpc("palette_like_totals");
  return Object.fromEntries((data ?? []).map((r) => [r.palette_slug!, r.likes!])) as Record<string, number>;
} };

export function useLike() {
  const qc = useQueryClient();
  const [mine, setMine] = useState<Set<string>>(new Set());
  useEffect(() => { setMine(new Set(JSON.parse(localStorage.getItem("lcs-liked") ?? "[]"))); }, []);
  const like = async (slug: string) => {
    if (mine.has(slug)) return toast("You already liked this palette");
    const next = new Set(mine).add(slug);
    setMine(next);
    localStorage.setItem("lcs-liked", JSON.stringify([...next]));
    qc.setQueryData<Record<string, number>>(["palette_likes"], (d) => ({ ...(d ?? {}), [slug]: (d?.[slug] ?? 0) + 1 }));
    await supabase.from("palette_likes").insert({ palette_slug: slug, visitor_id: getVisitorId() });
  };
  return { mine, like };
}

export function PaletteGallery() {
  const all = useMemo(() => getAllPalettes(), []);
  const { data: likes = {} } = useQuery(likesQuery);
  const { mine, like } = useLike();
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [seed, setSeed] = useState(1);

  useEffect(() => { const s = new URLSearchParams(window.location.search).get("q"); if (s) setQ(s); }, []);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    let l = all.filter((p) => (!tag || p.tags.includes(tag)) && (!term || p.name.toLowerCase().includes(term) || p.tags.some((t) => t.toLowerCase().includes(term)) || p.colors.some((c) => c.toLowerCase().includes(term))));
    if (sort === "liked") l = [...l].sort((a, b) => (likes[b.slug] ?? 0) - (likes[a.slug] ?? 0));
    else if (sort === "random") l = [...l].sort((a, b) => ((a.index * 9301 + seed * 49297) % 233280) - ((b.index * 9301 + seed * 49297) % 233280));
    else l = [...l].reverse();
    return l;
  }, [all, q, tag, sort, likes, seed]);

  const pages = Math.max(1, Math.ceil(list.length / PER));
  const items = list.slice((page - 1) * PER, page * PER);

  return (
    <section aria-labelledby="gallery">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="gallery" className="text-3xl font-bold">Palette gallery</h2>
          <p className="mt-1 text-muted-foreground">{list.length.toLocaleString()} curated palettes. Click a color to copy it.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input aria-label="Search palettes" placeholder="Search name, tag or #hex" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="w-56 pl-9" />
          </div>
          <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); if (v === "random") setSeed(Math.floor(Math.random() * 1000)); }}>
            <SelectTrigger className="w-36" aria-label="Sort palettes"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="liked">Most liked</SelectItem>
              <SelectItem value="random">Random</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {[null, ...PALETTE_TAGS].map((t) => (
          <Button variant={tag === t ? "default" : "outline"} key={t ?? "all"} onClick={() => { setTag(t); setPage(1); }}>
            {t ?? "All"}
          </Button>
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((p, i) => (
          <Fragment key={p.slug}>
            {i === 12 && <div className="col-span-full"><AdSlot position="between_palettes" /></div>}
            <article className="card-hover overflow-hidden rounded-2xl border bg-card">
              <div className="flex h-28">
                {p.colors.map((c) => (
                  <button key={c} onClick={() => copyText(c, `Copied ${c}`)} className="group relative flex-1 transition-[flex] hover:flex-[1.6]" style={{ backgroundColor: c, color: paletteTextColor(c) }} aria-label={`Copy ${c}`}>
                    <span className="absolute inset-x-0 bottom-1 hidden text-center font-mono text-[10px] font-bold group-hover:block">{c.slice(1)}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <Link to="/palette/$slug" params={{ slug: p.slug }} className="min-w-0">
                  <h3 className="truncate text-sm font-semibold hover:text-primary">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{p.tags.join(" · ")}</p>
                </Link>
                <button onClick={() => like(p.slug)} aria-label={`Like ${p.name}`} aria-pressed={mine.has(p.slug)} className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs">
                  <Heart className={cn("size-3.5", mine.has(p.slug) && "fill-brand-red text-brand-red")} /> {likes[p.slug] ?? 0}
                </button>
              </div>
            </article>
          </Fragment>
        ))}
      </div>
      <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
        <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
        <span className="px-3 text-sm text-muted-foreground">Page {page} of {pages}</span>
        <Button variant="outline" disabled={page === pages} onClick={() => setPage(page + 1)}>Next</Button>
      </nav>
    </section>
  );
}
