import { createFileRoute } from "@tanstack/react-router";
import { isBotUserAgent, referrerHost, normalizeReferralCode, safeReferralTarget } from "@/lib/referrals";
import { SITE_URL } from "@/lib/seo";

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

/**
 * Owner-created referral link: counts the visit, then redirects to the link's page.
 * Visitors are stored only as a one-way hash (no IP or browser details are saved).
 */
export const Route = createFileRoute("/r/$code")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const code = normalizeReferralCode(params.code ?? "");
        const ua = request.headers.get("user-agent");
        const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
        const bot = isBotUserAgent(ua);
        let target = "/";
        if (code) {
          try {
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
            const visitor = await sha256(`${process.env.SUPABASE_SERVICE_ROLE_KEY ?? "lcs"}|${ip}|${ua ?? ""}`);
            const { data } = await sb.rpc("record_referral_click", {
              _code: code,
              _visitor: visitor,
              _referrer: referrerHost(request.headers.get("referer")),
              _count: !bot,
            });
            if (typeof data === "string") target = safeReferralTarget(data);
          } catch (err) {
            console.error("referral click failed", err);
          }
        }
        const origin = new URL(request.url).origin || SITE_URL;
        return new Response(null, {
          status: 302,
          headers: { Location: new URL(target, origin).toString(), "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
        });
      },
    },
  },
});
