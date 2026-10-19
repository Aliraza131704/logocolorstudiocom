import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MfaChallenge({ factorId }: { factorId: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return <main className="flex min-h-screen items-center justify-center px-4"><form className="w-full max-w-sm space-y-5" onSubmit={async e => {
    e.preventDefault(); setBusy(true); setError("");
    const result = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    setBusy(false);
    if (result.error) { setError("The code could not be verified. Try a new code."); return; }
    await router.invalidate();
  }}><h1 className="text-2xl font-bold">Verify your sign-in</h1><label htmlFor="mfa-code" className="block text-sm">Authenticator code</label><Input id="mfa-code" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" required maxLength={6} value={code} onChange={e => setCode(e.target.value)} />{error && <p role="alert">{error}</p>}<Button type="submit" disabled={busy}>{busy ? "Verifying…" : "Verify"}</Button><Button variant="outline" onClick={async () => { await supabase.auth.signOut(); await router.invalidate(); }}>Sign out</Button></form></main>;
}