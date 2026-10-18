import { createFileRoute } from "@tanstack/react-router";
import { getPublicSetting } from "@/lib/content.functions";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const extra = await getPublicSetting({ data: { key: "robots_extra" } });
        const body = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /login\n${extra ? extra + "\n" : ""}\nSitemap: ${origin}/sitemap.xml\n`;
        return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
      },
    },
  },
});
