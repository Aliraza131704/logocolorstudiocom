import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Megaphone, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/site-data";

const KEY = "lcs-promo-seen";

/** Admin-controlled "promote your website" popup, shown once per browser session. */
export function PromoPopup() {
  const { data: s } = useSettings();
  const [open, setOpen] = useState(false);
  const enabled = s ? (s.promo_enabled ?? "on").trim().toLowerCase() !== "off" : false;
  const delay = Math.max(0, Number(s?.promo_delay) || 12) * 1000;

  useEffect(() => {
    if (!enabled || sessionStorage.getItem(KEY)) return;
    const t = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(KEY, "1");
    }, delay);
    return () => clearTimeout(t);
  }, [enabled, delay]);

  if (!enabled) return null;
  const title = s?.promo_title?.trim() || "Get your website paid promotion";
  const text = s?.promo_text?.trim() || "Put your brand in front of thousands of designers, developers and founders who use LogoColorStudio every day. Sponsored placements, featured listings and blog features available.";
  const btn = s?.promo_button?.trim() || "Promote my website";
  const link = s?.promo_link?.trim() || "/contact";
  const external = /^https?:\/\//i.test(link);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand-gradient" />
        <DialogHeader className="items-center text-center">
          <div className="mt-2 inline-flex rounded-2xl bg-muted p-3"><Megaphone className="size-7 text-brand-orange" /></div>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription className="whitespace-pre-line">{text}</DialogDescription>
        </DialogHeader>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button variant="hero" asChild onClick={() => setOpen(false)}>
            {external ? (
              <a href={link} target="_blank" rel="noopener noreferrer">{btn} <ArrowRight /></a>
            ) : (
              <Link to={link}>{btn} <ArrowRight /></Link>
            )}
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>Maybe later</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
