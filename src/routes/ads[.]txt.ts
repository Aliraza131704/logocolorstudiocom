import { createFileRoute } from "@tanstack/react-router";
import { getPublicSetting } from "@/lib/content.functions";

export const Route = createFileRoute("/ads.txt")({
  server: {
    handlers: {
      GET: async () => {
        const v = await getPublicSetting({ data: { key: "ads_txt" } });
        return new Response(v || "# ads.txt — add entries in the admin panel\n", { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=600" } });
      },
    },
  },
});
