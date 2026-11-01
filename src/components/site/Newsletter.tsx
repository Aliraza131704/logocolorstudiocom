import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.string().trim().email().max(255);

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = schema.safeParse(email);
    if (!p.success) return toast.error("Please enter a valid email address.");
    setBusy(true);
    const { error } = await supabase.from("subscribers").insert({ email: p.data.toLowerCase() });
    setBusy(false);
    if (error && !error.message.includes("duplicate")) return toast.error("Could not subscribe. Try again.");
    toast.success("You're subscribed. Thanks!");
    setEmail("");
  };
  return (
    <section className="relative overflow-hidden rounded-3xl border bg-card p-8 shadow-soft sm:p-10">
      <div className="absolute inset-x-0 top-0 h-1 bg-brand-gradient" />
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Join the LogoColorStudio newsletter list</h2>
          <p className="mt-1 text-muted-foreground">Leave your email for future updates.</p>
        </div>
        <form onSubmit={submit} className="flex w-full max-w-md gap-2">
          <label htmlFor="nl-email" className="sr-only">Email address</label>
          <Input id="nl-email" type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-full px-5" />
          <Button type="submit" variant="hero" size="lg" disabled={busy}>Subscribe</Button>
        </form>
      </div>
    </section>
  );
}
