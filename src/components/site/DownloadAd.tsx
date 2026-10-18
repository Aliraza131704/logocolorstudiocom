import { useEffect, useRef } from 'react';
import { useConsent } from './consent';

export function DownloadAd({ code }: { code: string }) {
  const { consent } = useConsent();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !consent.ads || !code.trim()) return;
    el.replaceChildren(document.createRange().createContextualFragment(code));
    return () => el.replaceChildren();
  }, [code, consent.ads]);
  if (!consent.ads || !code.trim()) return null;
  return <aside aria-label="Advertisement" className="mt-8 border-y py-5"><p className="mb-2 text-center text-xs text-muted-foreground">Advertisement</p><div ref={ref} className="flex min-h-[250px] w-full items-center justify-center overflow-hidden" /></aside>;
}