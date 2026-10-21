import { supabase } from "@/integrations/supabase/client";

const MAX_BYTES = 10 * 1024 * 1024; // bucket limit: 10 MB per file
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
]);

/** Upload an image to the owner-only "media" bucket and return its public URL. */
export async function uploadMediaImage(file: File, folder: string): Promise<string> {
  if (!ALLOWED.has(file.type)) throw new Error("Use a JPG, PNG, WebP, GIF, AVIF or SVG image.");
  if (file.size > MAX_BYTES) throw new Error("Image must be 10 MB or smaller.");
  const base = file.name
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "image";
  const ext = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "png";
  const path = `${folder}/${Date.now()}-${base}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return `/api/public/media/${path}`;
}
