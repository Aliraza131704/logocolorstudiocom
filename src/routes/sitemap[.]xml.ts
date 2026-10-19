import { createFileRoute } from "@tanstack/react-router";
import { listPosts, getSitemapContent } from "@/lib/content.functions";
import { renderSitemap, sitemapEntries } from "@/lib/sitemap";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [posts, content] = await Promise.all([listPosts(), getSitemapContent()]);
        const xml = renderSitemap(sitemapEntries(posts, content.pages, content.downloadUpdated));
        return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
      },
    },
  },
});
