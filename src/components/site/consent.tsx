import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Link } from "@tanstack/react-router";

type Consent = { decided: boolean; ads: boolean; analytics: boolean };
const KEY = "lcs-consent";
const Ctx = createContext<{ consent: Consent; open: () => void }>({
  consent: { decided: false, ads: false, analytics: false },
  open: () => {},
});

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<Consent>({ decided: true, ads: false, analytics: false });
  const [show, setShow] = useState(false);
  const [manage, setManage] = useState(false);
  const [draft, setDraft] = useState({ ads: true, analytics: true });

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setConsent({ ...JSON.parse(raw), decided: true });
    else { setConsent({ decided: false, ads: false, analytics: false }); setShow(true); }
  }, []);

  const save = (c: { ads: boolean; analytics: boolean }) => {
    const v = { ...c, decided: true };
    localStorage.setItem(KEY, JSON.stringify(v));
    setConsent(v);
    setShow(false);
    setManage(false);
  };

  return (
    <Ctx.Provider value={{ consent, open: () => { setShow(true); setManage(true); } }}>
      {children}
      {show && (
        <div role="dialog" aria-label="Cookie consent" className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-2xl rounded-2xl glass p-5 shadow-soft sm:inset-x-6">
          <p className="text-sm font-semibold">We value your privacy</p>
          <p className="mt-1 text-sm text-muted-foreground">
            We use essential cookies to run this site and, with your permission, cookies for analytics and ads (including Google AdSense). See our{" "}
            <Link to="/cookie-policy" className="underline">Cookie Policy</Link>.
          </p>
          {manage && (
            <div className="mt-4 space-y-3 rounded-xl bg-muted/60 p-4 text-sm">
              <label className="flex items-center justify-between gap-4"><span>Essential (always on)</span><Switch checked disabled aria-label="Essential cookies" /></label>
              <label className="flex items-center justify-between gap-4"><span>Analytics</span><Switch checked={draft.analytics} onCheckedChange={(v) => setDraft({ ...draft, analytics: v })} aria-label="Analytics cookies" /></label>
              <label className="flex items-center justify-between gap-4"><span>Advertising</span><Switch checked={draft.ads} onCheckedChange={(v) => setDraft({ ...draft, ads: v })} aria-label="Advertising cookies" /></label>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => save({ ads: true, analytics: true })}>Accept all</Button>
            <Button variant="outline" onClick={() => save({ ads: false, analytics: false })}>Reject</Button>
            {manage ? (
              <Button variant="ghost" onClick={() => save(draft)}>Save choices</Button>
            ) : (
              <Button variant="ghost" onClick={() => setManage(true)}>Manage</Button>
            )}
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

export const useConsent = () => useContext(Ctx);
