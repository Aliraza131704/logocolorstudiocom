import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { listDownloadAssets, listPosts } from "@/lib/content.functions";
import { normalizeHex, searchItems, SEARCH_KINDS, staticIndex, type SearchItem } from "@/lib/site-search";

let remote: Promise<SearchItem[]> | null = null;
export function loadRemoteItems(): Promise<SearchItem[]> {
  remote ??= Promise.all([listDownloadAssets().catch(() => []), listPosts().catch(() => [])]).then(([d, p]) => [
    ...d.map((a) => ({ kind: "Free resources" as const, title: a.title, path: "/downloads", text: `${a.category} ${a.author} ${a.description}` })),
    ...p.map((b) => ({ kind: "Blog" as const, title: b.title, path: `/blog/${b.slug}`, text: `${b.category} ${(b.tags ?? []).join(" ")} ${b.excerpt}` })),
  ]);
  return remote;
}

export function useSearchIndex() {
  const base = useMemo(() => staticIndex(), []);
  const [extra, setExtra] = useState<SearchItem[]>([]);
  useEffect(() => { loadRemoteItems().then(setExtra); }, []);
  return useMemo(() => [...base, ...extra], [base, extra]);
}

function Swatches({ hex }: { hex?: string[] }) {
  if (!hex?.length) return null;
  return <span className="ml-auto flex shrink-0 overflow-hidden rounded" aria-hidden="true">{hex.slice(0, 5).map((h, i) => <span key={i} className="h-4 w-4" style={{ background: h }} />)}</span>;
}

function SearchDialogBody({ onClose }: { onClose: () => void }) {
  const items = useSearchIndex();
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const results = useMemo(() => searchItems(items, q), [items, q]);
  const hex = normalizeHex(q);
  const go = (path: string) => { onClose(); navigate({ to: path }); };
  return (
    <>
      <CommandInput value={q} onValueChange={setQ} placeholder="Search colors, tools, palettes, free resources..." />
      <CommandList className="notranslate">
        {q && <CommandEmpty>No results for “{q}”.</CommandEmpty>}
        {hex && (
          <CommandGroup heading="HEX color">
            <CommandItem value={`hex ${hex}`} onSelect={() => go("/tools/palette-generator")}>
              <span className="h-4 w-4 rounded" style={{ background: hex }} aria-hidden="true" /> Build a palette with {hex}
            </CommandItem>
          </CommandGroup>
        )}
        {SEARCH_KINDS.map((k) => {
          const list = results.filter((r) => r.kind === k);
          return list.length ? (
            <CommandGroup key={k} heading={k}>
              {list.map((r) => (
                <CommandItem key={r.kind + r.path + r.title} value={`${r.kind} ${r.title} ${r.path}`} onSelect={() => go(r.path)}>
                  <span className="truncate">{r.title}</span><Swatches hex={r.hex} />
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null;
        })}
        {q.trim() && (
          <CommandGroup>
            <CommandItem value={`all results ${q}`} onSelect={() => { onClose(); navigate({ to: "/search", search: { q } }); }}>
              <Search /> Show all results for “{q}”
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </>
  );
}

export function SiteSearch() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el?.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(el?.tagName ?? "");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Search the site">
        <Search />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0" aria-describedby={undefined}>
          <DialogTitle className="sr-only">Search LogoColorStudio</DialogTitle>
          <Command shouldFilter={false} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3">
            {open && <SearchDialogBody onClose={() => setOpen(false)} />}
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
