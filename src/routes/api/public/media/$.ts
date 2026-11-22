import { createFileRoute } from "@tanstack/react-router";

/**
 * Public read-only stream for blog images in the private "media" bucket.
 * Only owner-uploaded image paths are served, read with the publishable
 * client so storage RLS ("Public can view blog images") decides access.
 */
const MEDIA_PATH = /^(covers|og|posts)\/[a-z0-9][a-z0-9-]{0,120}\.(png|jpe?g|webp|gif|avif|svg)$/;
const TYPES: Record<string, string> = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
  gif: "image/gif", avif: "image/avif", svg: "image/svg+xml",
};

export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params._splat ?? "").toLowerCase();
        if (!MEDIA_PATH.test(path)) return new Response("Not found", { status: 404 });

        const { createClient } = await import("@supabase/supabase-js");
        const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
        const sb = createClient(process.env.SUPABASE_URL!, key, {
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
        const { data, error } = await sb.storage.from("media").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });

        const ext = path.split(".").pop()!;
        return new Response(data, {
          headers: {
            "Content-Type": TYPES[ext] ?? "application/octet-stream",
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
