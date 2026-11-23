import { createFileRoute } from "@tanstack/react-router";
import { isPublicMediaPath, MEDIA_TYPES } from "@/lib/media-path";

/**
 * Public read-only stream for blog images in the private "media" bucket.
 * The bucket has no public storage policy: this route validates the path
 * against the strict blog-image pattern first, then reads that single file
 * server-side. Nothing else in storage can be reached or listed.
 */
export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params._splat ?? "").toLowerCase();
        if (!isPublicMediaPath(path)) return new Response("Not found", { status: 404 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("media").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });

        const ext = path.split(".").pop() ?? "";
        return new Response(data, {
          headers: {
            "Content-Type": MEDIA_TYPES[ext] ?? "application/octet-stream",
            "Cache-Control": "public, max-age=31536000, immutable",
            "Access-Control-Allow-Origin": "*",
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
          },
        });
      },
    },
  },
});
