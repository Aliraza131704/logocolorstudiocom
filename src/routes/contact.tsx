import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { getPage } from "@/lib/content.functions";
import { CmsPage } from "@/components/site/CmsPage";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { pageHead } from "@/lib/seo";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  subject: z.string().trim().max(200),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
});

export const Route = createFileRoute("/contact")({
  loader: () => getPage({ data: { slug: "contact" } }),
  head: () => pageHead({ title: "Contact — LogoColorStudio", description: "Questions, feedback or partnership ideas? Contact the LogoColorStudio team by form or at apwebventures01@gmail.com.", path: "/contact" }),
  component: Page,
});

function Page() {
  const p = Route.useLoaderData();
  const [f, setF] = useState({ name: "", email: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(f);
    if (!r.success) return toast.error(r.error.issues[0].message);
    setBusy(true);
    const { error } = await supabase.from("contact_messages").insert(r.data);
    setBusy(false);
    if (error) return toast.error("Could not send. Please email us instead.");
    toast.success("Message sent. We'll reply soon!");
    setF({ name: "", email: "", subject: "", message: "" });
  };
  return (
    <CmsPage title="Contact us" html={p?.content}>
      <a href="mailto:apwebventures01@gmail.com" className="mt-4 inline-flex items-center gap-2 font-medium text-primary"><Mail className="size-4" /> apwebventures01@gmail.com</a>
      <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="c-name" className="text-sm font-medium">Name</label><Input id="c-name" className="mt-1" maxLength={100} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div><label htmlFor="c-email" className="text-sm font-medium">Email</label><Input id="c-email" type="email" className="mt-1" maxLength={255} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
        </div>
        <div><label htmlFor="c-sub" className="text-sm font-medium">Subject</label><Input id="c-sub" className="mt-1" maxLength={200} value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></div>
        <div><label htmlFor="c-msg" className="text-sm font-medium">Message</label><Textarea id="c-msg" rows={6} className="mt-1" maxLength={5000} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></div>
        <Button type="submit" variant="hero" size="lg" disabled={busy}>{busy ? "Sending…" : "Send message"}</Button>
      </form>
    </CmsPage>
  );
}
