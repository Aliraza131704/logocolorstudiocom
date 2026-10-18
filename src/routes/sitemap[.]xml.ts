import { createFileRoute } from "@tanstack/react-router";
import { listPosts } from "@/lib/content.functions";
import { getAllPalettes } from "@/lib/palettes";
import { TOOLS } from "@/lib/tools";

const STATIC = ["/", "/tools", "/palettes", "/blog", "/about", "/contact", "/changelog", "/privacy-policy", "/terms-of-service", "/cookie-policy", "/disclaimer"];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const o = new URL(request.url).origin;
        const posts = await listPosts();
        const urls = [
          ...STATIC.map((p) => ({ loc: p, pr: p === "/" ? "1.0" : "0.7" })),
          ...TOOLS.filter((t) => t.path.startsWith("/tools/")).map((t) => ({ loc: t.path, pr: "0.9" })),
          ...posts.map((p) => ({ loc: `/blog/${p.slug}`, pr: "0.8", lm: p.published_at })),
          ...getAllPalettes().map((p) => ({ loc: `/palette/${p.slug}`, pr: "0.5" })),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${o}${u.loc}</loc>${"lm" in u && u.lm ? `<lastmod>${u.lm.slice(0, 10)}</lastmod>` : ""}<priority>${u.pr}</priority></url>`).join("\n")}\n</urlset>`;
        return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
      },
    },
  },
});
