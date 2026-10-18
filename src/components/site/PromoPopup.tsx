import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Megaphone, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const KEY = "lcs-promo-seen";

/** Shows a "promote your website" offer once per browser session, after a short delay. */
export function PromoPopup() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem(KEY)) return;
    const t = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(KEY, "1");
    }, 12000);
    return () => clearTimeout(t);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand-gradient" />
        <DialogHeader className="items-center text-center">
          <div className="mt-2 inline-flex rounded-2xl bg-muted p-3"><Megaphone className="size-7 text-brand-orange" /></div>
          <DialogTitle className="text-2xl font-bold">Get your website paid promotion</DialogTitle>
          <DialogDescription>
            Put your brand in front of thousands of designers, developers and founders who use LogoColorStudio every day. Sponsored placements, featured listings and blog features available.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button variant="hero" asChild onClick={() => setOpen(false)}>
            <Link to="/contact">Promote my website <ArrowRight /></Link>
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>Maybe later</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
