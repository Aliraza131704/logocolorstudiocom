import { Link } from "@tanstack/react-router";
import { Twitter, Instagram, Github, Dribbble, Mail } from "lucide-react";
import { LogoImage } from "./Logo";
import { Newsletter } from "./Newsletter";
import { useConsent } from "./consent";
import { useSettings } from "@/lib/site-data";
import { AdSlot } from "./AdSlot";
import { TOOLS } from "@/lib/tools";
import { Button } from "@/components/ui/button";

const COLS = [
  { title: "Tools", links: TOOLS.map(t => [t.name, t.path]) },
  { title: "Company", links: [["About", "/about"], ["Contact", "/contact"], ["Blog", "/blog"], ["Downloads", "/downloads"], ["Giveaway", "/giveaway"], ["Changelog", "/changelog"]] },
  { title: "Legal", links: [["Privacy Policy", "/privacy-policy"], ["Terms of Service", "/terms-of-service"], ["Cookie Policy", "/cookie-policy"], ["Disclaimer", "/disclaimer"]] },
] as const;

export function SiteFooter() {
  const { open } = useConsent();
  const { data: s } = useSettings();
  const socials = [
    { href: s?.social_twitter, icon: Twitter, label: "Twitter" },
    { href: s?.social_instagram, icon: Instagram, label: "Instagram" },
    { href: s?.social_github, icon: Github, label: "GitHub" },
    { href: s?.social_dribbble, icon: Dribbble, label: "Dribbble" },
  ].filter((x) => x.href);
  return (
    <footer className="mt-24 border-t bg-card/40">
      <div className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <Newsletter />
        <AdSlot position="footer" />
        <div className="grid gap-10 py-14 md:grid-cols-5">
          <div className="md:col-span-2">
            <LogoImage className="h-10" />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">Extract, generate and ship accessible brand color systems from a logo or website, free.</p>
            <div className="mt-4 flex gap-3">
              {socials.map((x) => (
                <a key={x.label} href={x.href} target="_blank" rel="noopener noreferrer" aria-label={x.label} className="rounded-full border p-2 hover:text-primary"><x.icon className="size-4" /></a>
              ))}
              <a href={`mailto:${s?.contact_email || "apwebventures01@gmail.com"}`} aria-label="Email us" className="rounded-full border p-2 hover:text-primary"><Mail className="size-4" /></a>
            </div>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{c.title}</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {c.links.map(([l, h]) => (
                  <li key={h}><Link to={h} className="text-foreground/80 hover:text-primary">{l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t py-6 text-sm text-muted-foreground sm:flex-row">
          <p>© 2026 LogoColorStudio. All rights reserved.</p>
          <div className="flex gap-4">
            <Button variant="link" onClick={open}>Cookie settings</Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
