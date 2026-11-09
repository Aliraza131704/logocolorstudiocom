import { createFileRoute } from "@tanstack/react-router";
import { getPublicSetting } from "@/lib/content.functions";

export const Route = createFileRoute("/ads.txt")({
  server: {
    handlers: {
      GET: async () => {
        const v = await getPublicSetting({ data: { key: "ads_txt" } });
        const fallback = "google.com, pub-6808242478186603, DIRECT, f08c47fec0942fa0\n";
        return new Response(v?.trim() ? v : fallback, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=600" } });
      },
    },
  },
});
