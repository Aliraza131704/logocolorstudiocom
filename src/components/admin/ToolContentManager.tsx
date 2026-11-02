import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TOOLS } from "@/lib/tools";
import { EDITABLE_PAGES, TOOL_CONTENT_KEY, faqsToText, parseToolOverrides, textToFaqs, type ToolOverride } from "@/lib/tool-overrides";
import { RichEditor } from "./RichEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const clean = (html: string) => DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });

type Draft = { metaTitle: string; metaDescription: string; title: string; intro: string; bodyHtml: string; faqsText: string };
const EMPTY: Draft = { metaTitle: "", metaDescription: "", title: "", intro: "", bodyHtml: "", faqsText: "" };

const toDraft = (o: ToolOverride | null): Draft =>
  o
    ? {
        metaTitle: o.metaTitle ?? "",
        metaDescription: o.metaDescription ?? "",
        title: o.title ?? "",
        intro: o.intro ?? "",
        bodyHtml: o.bodyHtml ?? "",
        faqsText: o.faqs ? faqsToText(o.faqs) : "",
      }
    : EMPTY;

export function ToolContentManager() {
  const qc = useQueryClient();
  const [slug, setSlug] = useState(TOOLS[0].slug);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: all = {} } = useQuery({
    queryKey: ["admin-tool-content"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", TOOL_CONTENT_KEY).maybeSingle();
      return parseToolOverrides(data?.value ?? "");
    },
  });

  const current = draft ?? toDraft(all[slug] ?? null);
  const set = (patch: Partial<Draft>) => setDraft({ ...current, ...patch });
  const hasOverride = !!all[slug];

  const save = async () => {
    setSaving(true);
    const entry: ToolOverride = {
      metaTitle: current.metaTitle.trim() || undefined,
      metaDescription: current.metaDescription.trim() || undefined,
      title: current.title.trim() || undefined,
      intro: current.intro.trim() || undefined,
      bodyHtml: current.bodyHtml.trim() && current.bodyHtml !== "<p></p>" ? clean(current.bodyHtml) : undefined,
      faqs: textToFaqs(current.faqsText).length ? textToFaqs(current.faqsText) : undefined,
    };
    const next = { ...all };
    if (Object.values(entry).some(Boolean)) next[slug] = entry;
    else delete next[slug];
    const { error } = await supabase.from("site_settings").upsert({ key: TOOL_CONTENT_KEY, value: JSON.stringify(next) });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Tool page content saved");
      setDraft(null);
      qc.invalidateQueries({ queryKey: ["admin-tool-content"] });
      qc.invalidateQueries({ queryKey: ["site_settings"] });
    }
  };

  const reset = async () => {
    setSaving(true);
    const next = { ...all };
    delete next[slug];
    const { error } = await supabase.from("site_settings").upsert({ key: TOOL_CONTENT_KEY, value: JSON.stringify(next) });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Back to default content");
      setDraft(null);
      qc.invalidateQueries({ queryKey: ["admin-tool-content"] });
      qc.invalidateQueries({ queryKey: ["site_settings"] });
    }
  };

  return (
    <div className="max-w-3xl space-y-5">
      <p className="text-sm text-muted-foreground">
        Edit the text of any tool page or main page (homepage, gallery, giveaway and more). Empty fields keep the built-in default content. The body replaces the whole
        long guide under a tool; on main pages, body and FAQs are added at the bottom.
      </p>
      <label className="block text-sm font-medium">
        Page
        <Select
          value={slug}
          onValueChange={(v) => {
            setSlug(v);
            setDraft(null);
          }}
        >
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[...TOOLS, ...EDITABLE_PAGES].map((t) => (
              <SelectItem key={t.slug} value={t.slug}>
                {t.name} {all[t.slug] ? "· edited" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      <label className="block text-sm font-medium">
        SEO title <span className="font-normal text-muted-foreground">(max 60 chars)</span>
        <Input className="mt-1" maxLength={60} value={current.metaTitle} onChange={(e) => set({ metaTitle: e.target.value })} placeholder="Default title" />
      </label>
      <label className="block text-sm font-medium">
        Meta description <span className="font-normal text-muted-foreground">(max 160 chars)</span>
        <Textarea className="mt-1" rows={2} maxLength={160} value={current.metaDescription} onChange={(e) => set({ metaDescription: e.target.value })} placeholder="Default description" />
      </label>
      <label className="block text-sm font-medium">
        Page heading (H1)
        <Input className="mt-1" value={current.title} onChange={(e) => set({ title: e.target.value })} placeholder="Default heading" />
      </label>
      <label className="block text-sm font-medium">
        Intro line under the heading
        <Textarea className="mt-1" rows={2} value={current.intro} onChange={(e) => set({ intro: e.target.value })} placeholder="Default intro" />
      </label>
      <div className="block text-sm font-medium">
        Guide body <span className="font-normal text-muted-foreground">(replaces the long article under the tool)</span>
        <div className="mt-1 rounded-xl border">
          <RichEditor value={current.bodyHtml} onChange={(h) => set({ bodyHtml: h })} />
        </div>
      </div>
      <label className="block text-sm font-medium">
        FAQs <span className="font-normal text-muted-foreground">(one per line: Question || Answer)</span>
        <Textarea className="mt-1 font-mono text-xs" rows={8} value={current.faqsText} onChange={(e) => set({ faqsText: e.target.value })} placeholder={"Is this tool free? || Yes, it is completely free."} />
      </label>
      <div className="flex gap-3">
        <Button variant="hero" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        {hasOverride && (
          <Button variant="outline" onClick={reset} disabled={saving}>Reset to default</Button>
        )}
      </div>
    </div>
  );
}
