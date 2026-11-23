/** Only owner-uploaded blog image paths may be served publicly. */
export const MEDIA_PATH = /^(covers|og|posts)\/[a-z0-9][a-z0-9-]{0,120}\.(png|jpe?g|webp|gif|avif|svg)$/;

export const MEDIA_TYPES: Record<string, string> = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
  gif: "image/gif", avif: "image/avif", svg: "image/svg+xml",
};

export function isPublicMediaPath(path: string): boolean {
  return MEDIA_PATH.test(path);
}
