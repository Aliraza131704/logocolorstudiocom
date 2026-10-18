import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function pub() {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type PostRow = {
  id: string; slug: string; title: string; excerpt: string; content: string; cover_image: string; category: string; tags: string[];
  author: string; published_at: string; seo_title: string; meta_description: string; canonical: string; og_image: string; updated_at: string;
};

export const listPosts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await pub();
  const { data } = await sb.from("blog_posts").select("id,slug,title,excerpt,cover_image,category,tags,author,published_at,content").eq("status", "published").lte("published_at", new Date().toISOString()).order("published_at", { ascending: false });
  return (data ?? []).map((p) => ({ ...p, content: undefined, words: String(p.content).replace(/<[^>]+>/g, " ").split(/\s+/).length })) as (Omit<PostRow, "content" | "seo_title" | "meta_description" | "canonical" | "og_image" | "updated_at"> & { words: number })[];
});

export const getPost = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().max(200) }).parse(d))
  .handler(async ({ data }) => {
    const sb = await pub();
    const { data: p } = await sb.from("blog_posts").select("*").eq("slug", data.slug).eq("status", "published").lte("published_at", new Date().toISOString()).maybeSingle();
    return (p as PostRow | null) ?? null;
  });

export const getPage = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().max(60) }).parse(d))
  .handler(async ({ data }) => {
    const sb = await pub();
    const { data: p } = await sb.from("pages").select("slug,title,content,updated_at").eq("slug", data.slug).maybeSingle();
    return p as { slug: string; title: string; content: string; updated_at: string } | null;
  });

export const getPublicSetting = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ key: z.string().max(60) }).parse(d))
  .handler(async ({ data }) => {
    const sb = await pub();
    const { data: r } = await sb.from("site_settings").select("value").eq("key", data.key).maybeSingle();
    return (r?.value as string | undefined) ?? "";
  });

export const listDownloadAssets = createServerFn({ method: 'GET' }).handler(async () => {
  const sb = await pub();
  const { CATALOG_KEY, parseCatalog } = await import('./download-catalog');
  const { data, error } = await sb.from('site_settings').select('value').eq('key', CATALOG_KEY).maybeSingle();
  if (error) throw new Error('Could not load downloads');
  return parseCatalog(data?.value ?? '').filter(a => a.published);
});
