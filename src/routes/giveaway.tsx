import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Gift, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pageHead } from "@/lib/seo";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  wallet: z.string().trim().regex(/^T[1-9A-HJ-NP-Za-km-z]{33}$|^0x[0-9a-fA-F]{40}$/, "Enter a valid USDT wallet address (TRC20 starting with T, or BEP20/ERC20 starting with 0x)"),
});

export const Route = createFileRoute("/giveaway")({
  head: () => pageHead({ title: "Free Monthly 50 USDT Giveaway — LogoColorStudio", description: "Enter the free LogoColorStudio monthly giveaway. No payment or purchase needed — one lucky winner receives 50 USDT at the end of every month.", path: "/giveaway" }),
  component: Page,
});

function Page() {
  const [f, setF] = useState({ name: "", email: "", wallet: "" });
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(f);
    if (!r.success) return toast.error(r.error.issues[0].message);
    if (!agree) return toast.error("Please accept the giveaway rules.");
    setBusy(true);
    const { error } = await supabase.from("giveaway_entries").insert(r.data);
    setBusy(false);
    if (error) return toast.error(error.code === "23505" ? "This email is already entered for this month." : "Could not submit. Please try again.");
    setSent(true);
    toast.success("You're entered! Good luck.");
  };
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="text-center">
        <Gift className="mx-auto size-10 text-primary" />
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Free monthly 50 USDT giveaway</h1>
        <p className="mt-3 text-muted-foreground">Enter for free. At the end of every month, one lucky winner receives <strong>50 USDT</strong>. No payment, deposit or purchase is ever required.</p>
      </div>
      {sent ? (
        <p role="status" className="mt-8 rounded-2xl border bg-card p-6 text-center font-medium">You're entered for this month. We'll email the winner after the draw.</p>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border bg-card p-6">
          <div><label htmlFor="g-name" className="text-sm font-medium">Name</label><Input id="g-name" className="mt-1" maxLength={100} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div><label htmlFor="g-email" className="text-sm font-medium">Email</label><Input id="g-email" type="email" className="mt-1" maxLength={255} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div><label htmlFor="g-wallet" className="text-sm font-medium">USDT wallet address (TRC20 or BEP20)</label><Input id="g-wallet" className="mt-1 font-mono" maxLength={64} value={f.wallet} onChange={(e) => setF({ ...f, wallet: e.target.value })} /></div>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> I have read the rules below. One entry per email per month.</label>
          <Button type="submit" variant="hero" size="lg" disabled={busy}>{busy ? "Submitting…" : "Enter giveaway"}</Button>
        </form>
      )}
      <Winners />
      <section className="mt-10 space-y-2 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">Rules</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Entry is completely free. We will never ask you to send crypto or pay a fee to enter or claim.</li>
          <li>One entry per email address each calendar month. Duplicate or fake entries are removed.</li>
          <li>One winner is picked at random after the month ends and contacted by email.</li>
          <li>The 50 USDT prize is sent to the wallet address provided. Double-check it — crypto transfers cannot be reversed.</li>
          <li>Participants must be 18+ and allowed to take part in giveaways where they live.</li>
          <li>Anyone messaging you "from LogoColorStudio" asking for payment is a scam.</li>
        </ul>
      </section>
    </div>
  );
}

function Winners() {
  const { data } = useQuery({
    queryKey: ["giveaway-winners"],
    queryFn: async () => (await supabase.from("giveaway_winners").select("*").order("month", { ascending: false })).data ?? [],
  });
  if (!data?.length) return null;
  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 text-lg font-semibold"><Trophy className="size-5 text-primary" /> Past winners</h2>
      <div className="mt-3 space-y-3">
        {data.map((w) => (
          <div key={w.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border bg-card p-4 text-sm">
            <span className="font-semibold">{w.name}</span>
            <span className="text-muted-foreground">{w.email}</span>
            <span className="font-mono text-xs text-muted-foreground">{w.wallet}</span>
            <span className="ml-auto rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{w.month} · 50 USDT</span>
          </div>
        ))}
      </div>
    </section>
  );
}
