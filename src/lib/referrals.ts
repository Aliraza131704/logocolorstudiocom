/** Shared, browser-safe helpers for owner-created referral links (/r/{code}). */

export const REFERRAL_PREFIX = "/r/";

/** Turns a label or typed code into a URL-safe code: lowercase letters, numbers and dashes, max 40. */
export function normalizeReferralCode(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

export function isValidReferralCode(code: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,39}$/.test(code);
}

/**
 * Referral links only send visitors to pages on this site. Accepts "/page",
 * "page" or a full URL on the site's own host; anything else falls back to "/".
 */
export function safeReferralTarget(raw: string, siteHost = "logocolorstudio.com"): string {
  let v = (raw ?? "").trim();
  if (!v) return "/";
  if (/^https?:\/\//i.test(v)) {
    try {
      const u = new URL(v);
      const host = u.hostname.replace(/^www\./, "");
      if (host !== siteHost) return "/";
      v = u.pathname + u.search + u.hash;
    } catch {
      return "/";
    }
  }
  if (!v.startsWith("/")) v = "/" + v;
  if (v.startsWith("//") || v.includes("\\")) return "/";
  return v.slice(0, 300);
}

const BOT_RE = /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|whatsapp|telegrambot|discordbot|skypeuripreview|curl|wget|python-requests|headless|lighthouse/i;

/** Link-preview fetchers and crawlers are redirected but never counted as clicks. */
export function isBotUserAgent(ua: string | null | undefined): boolean {
  if (!ua) return true;
  return BOT_RE.test(ua);
}

export function referrerHost(referrer: string | null | undefined): string {
  if (!referrer) return "";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "").slice(0, 120);
  } catch {
    return "";
  }
}
