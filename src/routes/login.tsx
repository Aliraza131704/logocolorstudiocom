import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoImage } from "@/components/site/Logo";
import { ThemeToggle } from "@/components/site/SiteHeader";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  head: () => pageHead({ title: "Admin sign in — LogoColorStudio", description: "Sign in to the LogoColorStudio owner panel.", path: "/login", noindex: true }),
  component: Page,
});

function Page() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      setBusy(false);
      if (error) return toast.error(error.message);
      nav({ to: "/admin" });
    } else {
      const { error } = await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: `${window.location.origin}/login` } });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Check your inbox to confirm your email, then sign in.");
      setMode("in");
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4">
      <div className="absolute right-4 top-4"><ThemeToggle /></div>
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-3xl border bg-card p-8 shadow-soft">
        <Link to="/" className="block"><LogoImage className="mx-auto h-12" /></Link>
        <h1 className="text-center text-xl font-bold">{mode === "in" ? "Admin sign in" : "Create admin account"}</h1>
        <div><label htmlFor="em" className="text-sm font-medium">Email</label><Input id="em" type="email" required className="mt-1" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label htmlFor="pw" className="text-sm font-medium">Password</label><Input id="pw" type="password" required minLength={8} className="mt-1" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}</Button>
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="w-full text-center text-sm text-muted-foreground hover:text-primary">
          {mode === "in" ? "First time? Create the admin account" : "Have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
