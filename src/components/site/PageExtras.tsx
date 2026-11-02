import { FaqList } from "./ui-bits";
import type { ToolOverride } from "@/lib/tool-overrides";

/** Owner-added content (Admin → Tool pages) shown at the bottom of a page. */
export function PageExtras({ o }: { o: ToolOverride | null }) {
  if (!o?.bodyHtml && !o?.faqs) return null;
  return (
    <div className="mx-auto mt-16 max-w-3xl px-4 pb-10 sm:px-0">
      {o.bodyHtml && <article className="prose-content" dangerouslySetInnerHTML={{ __html: o.bodyHtml }} />}
      {o.faqs && <div className="mt-12"><FaqList faqs={o.faqs} /></div>}
    </div>
  );
}
