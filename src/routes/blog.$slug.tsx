import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Twitter, Linkedin, Facebook, Link2 } from "lucide-react";
import { getPost, listPosts } from "@/lib/content.functions";
import { Breadcrumbs, breadcrumbLd, copyText } from "@/components/site/ui-bits";
import { AdSlot, InlineAdCode, splitAdMarkers } from "@/components/site/AdSlot";
import { LogoImage } from "@/components/site/Logo";
import { pageHead, absoluteUrl } from "@/lib/seo";
import { EDITORIAL_AUTHOR, editorialAuthorName } from "@/lib/editorial-config";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const [post, all] = await Promise.all([getPost({ data: { slug: params.slug } }), listPosts()]);
    if (!post) throw notFound();
    const related = all.filter((p) => p.slug !== post.slug).sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category)).slice(0, 3);
    return { post, related };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Article unavailable" }, { name: "robots", content: "noindex" }] };
    const p = loaderData.post;
    const path = `/blog/${params.slug}`;
    const h = pageHead({
      title: (p.seo_title || p.title).slice(0, 60),
      description: (p.meta_description || p.excerpt).slice(0, 160),
      path,
      type: "article",
      image: p.og_image || p.cover_image || undefined,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "@id": `${absoluteUrl(path)}#article`,
          headline: p.title,
          description: p.meta_description || p.excerpt,
          datePublished: p.published_at,
          dateModified: p.updated_at,
          inLanguage: "en",
          author: { "@type": "Person", name: editorialAuthorName(p.author), url: absoluteUrl("/about") },
          publisher: { "@id": `${absoluteUrl("/")}#organization` },
          image: p.cover_image || p.og_image ? [absoluteUrl(p.cover_image || p.og_image)] : undefined,
          keywords: p.tags.length ? p.tags.join(", ") : undefined,
          articleSection: p.category,
          mainEntityOfPage: { "@id": `${absoluteUrl(path)}#webpage` },
          isPartOf: { "@id": `${absoluteUrl("/")}#website` },
        },
        breadcrumbLd([{ label: "Blog", to: "/blog" }, { label: p.title }], path),
      ],
    });
    h.meta.push({ name: "robots", content: "index, follow, max-image-preview:large" }, { property: "article:published_time", content: p.published_at }, { property: "article:modified_time", content: p.updated_at });
    return h;
  },
  component: Page,
});

function slugify(s: string) { return s.toLowerCase().replace(/<[^>]+>/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

function Page() {
  const { post, related } = Route.useLoaderData();
  const toc: { id: string; text: string }[] = [];
  const html = post.content.replace(/<h2>(.*?)<\/h2>/g, (_, t: string) => { const id = slugify(t); toc.push({ id, text: t.replace(/<[^>]+>/g, "") }); return `<h2 id="${id}">${t}</h2>`; });
  const words = post.content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  const share = absoluteUrl(`/blog/${post.slug}`);
  const author = editorialAuthorName(post.author) || EDITORIAL_AUTHOR.name;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Blog", to: "/blog" }, { label: post.title }]} />
      <header className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">{post.category}</p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-5xl">{post.title}</h1>
        <p className="mt-4 text-muted-foreground">By <Link to="/about" className="font-medium text-foreground hover:text-primary">{author}</Link> · <time dateTime={post.published_at}>{new Date(post.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}</time>{post.updated_at && post.updated_at.slice(0, 10) > post.published_at.slice(0, 10) && <> · Updated <time dateTime={post.updated_at}>{new Date(post.updated_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}</time></>} · {Math.max(1, Math.ceil(words / 220))} min read</p>
      </header>
      {post.cover_image && <img src={post.cover_image} alt={post.title} width={1200} height={630} className="mx-auto mt-8 aspect-[1200/630] w-full max-w-4xl rounded-3xl border object-cover" />}
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_240px]">
        <div className="min-w-0">
          {toc.length > 0 && (
            <details className="mx-auto mb-8 max-w-3xl rounded-2xl border bg-card p-4 text-sm lg:hidden">
              <summary className="cursor-pointer font-semibold">On this page</summary>
              <ol className="mt-3 space-y-2">{toc.map((t) => <li key={t.id}><a href={`#${t.id}`} className="text-muted-foreground hover:text-primary">{t.text}</a></li>)}</ol>
            </details>
          )}
          {splitAdMarkers(html).map((part, i) => "html" in part
            ? <article key={i} className="prose-content mx-auto max-w-3xl" dangerouslySetInnerHTML={{ __html: part.html }} />
            : "ad" in part ? <AdSlot key={i} position={part.ad} className="mx-auto max-w-3xl" /> : <InlineAdCode key={i} code={part.code} />)}
          <AdSlot position="in_content" className="mx-auto max-w-3xl" />
          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Share:</span>
            <a className="rounded-full border p-2" aria-label="Share on X" target="_blank" rel="noopener noreferrer" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(share)}&text=${encodeURIComponent(post.title)}`}><Twitter className="size-4" /></a>
            <a className="rounded-full border p-2" aria-label="Share on LinkedIn" target="_blank" rel="noopener noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(share)}&title=${encodeURIComponent(post.title)}`}><Linkedin className="size-4" /></a>
            <a className="rounded-full border p-2" aria-label="Share on Facebook" target="_blank" rel="noopener noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(share)}&quote=${encodeURIComponent(post.title)}`}><Facebook className="size-4" /></a>
            <Button variant="outline" size="icon" aria-label="Copy link" onClick={() => copyText(share, "Link copied")}><Link2 className="size-4" /></Button>
            <div className="ml-auto flex flex-wrap gap-1">{post.tags.map((t) => <span key={t} className="rounded-full bg-muted px-3 py-1 text-xs">#{t}</span>)}</div>
          </div>
          <div className="mx-auto mt-8 flex max-w-3xl items-center gap-4 rounded-2xl border bg-card p-5">
            {EDITORIAL_AUTHOR.photo && <img src={EDITORIAL_AUTHOR.photo} alt={author} width={64} height={64} className="size-16 rounded-full object-cover" />}
            <div><p className="font-semibold">{author}</p><p className="text-sm text-muted-foreground">{EDITORIAL_AUTHOR.bio}</p><Link to="/about" className="mt-2 inline-block text-sm text-primary underline">About LogoColorStudio</Link></div>
          </div>
        </div>
        {toc.length > 0 && (
          <aside className="hidden lg:block">
            <nav aria-label="Table of contents" className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border bg-card p-5 text-sm">
              <p className="font-semibold">On this page</p>
              <ol className="mt-3 space-y-2">{toc.map((t) => <li key={t.id}><a href={`#${t.id}`} className="text-muted-foreground hover:text-primary">{t.text}</a></li>)}</ol>
            </nav>
          </aside>
        )}
      </div>
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold">Related articles</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {related.map((r) => (
              <Link key={r.slug} to="/blog/$slug" params={{ slug: r.slug }} className="card-hover overflow-hidden rounded-2xl border bg-card">
                {r.cover_image && <img src={r.cover_image} alt={`Cover image for ${r.title}`} width={1200} height={630} loading="lazy" className="aspect-[1200/630] w-full object-cover" />}
                <p className="p-4 font-semibold">{r.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
