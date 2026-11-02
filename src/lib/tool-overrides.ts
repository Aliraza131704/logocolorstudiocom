import type { Faq } from "@/components/site/ui-bits";

// Owner-editable tool page content, stored as validated JSON in site_settings
// under TOOL_CONTENT_KEY (same pattern as the download catalog). Empty fields
// fall back to the built-in default content in each route file.
export const TOOL_CONTENT_KEY = "tool_content";

export type ToolOverride = {
  metaTitle?: string;
  metaDescription?: string;
  title?: string;
  intro?: string;
  bodyHtml?: string;
  faqs?: Faq[];
};

const str = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);

export function parseToolOverrides(raw: string): Record<string, ToolOverride> {
  if (!raw) return {};
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};
    const out: Record<string, ToolOverride> = {};
    for (const [slug, v] of Object.entries(data as Record<string, unknown>)) {
      if (!/^[a-z0-9-]{2,40}$/.test(slug) || !v || typeof v !== "object" || Array.isArray(v)) continue;
      const o = v as Record<string, unknown>;
      const faqs = Array.isArray(o.faqs)
        ? (o.faqs as unknown[])
            .filter((f): f is { q: string; a: string } => {
              const x = f as { q?: unknown; a?: unknown } | null;
              return !!x && typeof x.q === "string" && typeof x.a === "string" && !!x.q.trim() && !!x.a.trim();
            })
            .slice(0, 20)
            .map((f) => ({ q: f.q.trim().slice(0, 200), a: f.a.trim().slice(0, 2000) }))
        : undefined;
      const entry: ToolOverride = {
        metaTitle: str(o.metaTitle, 70),
        metaDescription: str(o.metaDescription, 170),
        title: str(o.title, 120),
        intro: str(o.intro, 300),
        bodyHtml: str(o.bodyHtml, 60000),
        faqs: faqs?.length ? faqs : undefined,
      };
      if (Object.values(entry).some(Boolean)) out[slug] = entry;
    }
    return out;
  } catch {
    return {};
  }
}

export const toolOverride = (raw: string | undefined | null, slug: string): ToolOverride | null =>
  parseToolOverrides(raw ?? "")[slug] ?? null;

/** FAQ textarea format for the admin editor: one per line, "Question | Answer". */
export const faqsToText = (faqs: Faq[]) => faqs.map((f) => `${f.q} | ${f.a}`).join("\n");
export const textToFaqs = (text: string): Faq[] =>
  text
    .split("\n")
    .map((line) => line.split("|"))
    .filter((parts) => parts.length >= 2 && parts[0].trim() && parts.slice(1).join("|").trim())
    .map((parts) => ({ q: parts[0].trim(), a: parts.slice(1).join("|").trim() }));
