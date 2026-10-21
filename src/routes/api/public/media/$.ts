import { createFileRoute } from "@tanstack/react-router";

/**
 * Public read-only stream for images uploaded by the owner into the private
 * "media" storage bucket. Images are embedded in public blog pages, so reads
 * are intentionally anonymous; writes stay owner-only via storage RLS.
 */
export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const raw = params._splat ?? "";
        // Sanitize: no traversal, no leading/duplicate slashes.
        const path = raw.split("/").filter((p) => p && p !== "." && p !== "..").join("/");
        if (!path) return new Response("Not found", { status: 404 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("media").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(data, {
          headers: {
            "Content-Type": data.type || "application/octet-stream",
            "Cache-Control": "public, max-age=31536000, immutable",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
