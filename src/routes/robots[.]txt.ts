import { createFileRoute } from "@tanstack/react-router";
import { getPublicSetting } from "@/lib/content.functions";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = SITE_URL;
        const extra = await getPublicSetting({ data: { key: "robots_extra" } });
        const body = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /login\nDisallow: /r/\n${extra ? extra + "\n" : ""}\nSitemap: ${origin}/sitemap.xml\n`;
        return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
      },
    },
  },
});
