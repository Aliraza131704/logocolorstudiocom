import { Link } from "@tanstack/react-router";
import { Twitter, Instagram, Github, Dribbble, Mail, Heart, Palette } from "lucide-react";
import { LogoImage } from "./Logo";
import { Newsletter } from "./Newsletter";
import { useConsent } from "./consent";
import { useSettings } from "@/lib/site-data";
import { AdSlot } from "./AdSlot";
import { TOOLS } from "@/lib/tools";
import { Button } from "@/components/ui/button";

const COLS = [
  { title: "Tools", links: TOOLS.map(t => [t.name, t.path]) },
  { title: "Company", links: [["About", "/about"], ["Contact", "/contact"], ["Blog", "/blog"], ["Brand Colors", "/brand-colors"], ["Color Names", "/colors"], ["Downloads", "/downloads"], ["Giveaway", "/giveaway"], ["Changelog", "/changelog"]] },
  { title: "Legal", links: [["Privacy Policy", "/privacy-policy"], ["Terms of Service", "/terms-of-service"], ["Cookie Policy", "/cookie-policy"], ["Disclaimer", "/disclaimer"], ["Sitemap", "/sitemap"]] },
] as const;

export const PINTEREST_URL = "https://www.pinterest.com/logocolorstudio/";
export const INSTAGRAM_URL = "https://www.instagram.com/logocolorstudio/";
export const THREADS_URL = "https://www.threads.com/@logocolorstudio";

function ThreadsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.69 11.23c-.1-.05-.21-.1-.31-.14-.18-3.37-2.03-5.3-5.12-5.32h-.04c-1.85 0-3.39.79-4.33 2.22l1.7 1.17c.71-1.07 1.81-1.3 2.63-1.3h.03c1.02.01 1.78.3 2.28.88.36.42.6 1 .72 1.73-.9-.15-1.88-.2-2.92-.14-2.94.17-4.83 1.88-4.7 4.27.06 1.21.67 2.25 1.7 2.93.88.58 2 .86 3.17.8 1.54-.08 2.75-.67 3.6-1.75.64-.82 1.05-1.89 1.23-3.23.73.44 1.28 1.03 1.58 1.73.51 1.2.54 3.17-1.07 4.78-1.41 1.41-3.11 2.02-5.67 2.04-2.85-.02-5-.93-6.4-2.72-1.31-1.67-1.98-4.08-2.01-7.17.03-3.09.7-5.5 2.01-7.17 1.4-1.79 3.55-2.7 6.4-2.72 2.86.02 5.05.94 6.5 2.73.71.88 1.25 1.98 1.6 3.27l1.99-.53c-.42-1.58-1.09-2.94-2.01-4.07C17.19 1.2 14.44.02 10.92 0h-.01C7.4.02 4.69 1.2 2.86 3.53 1.23 5.6.39 8.48.36 12.09v.02c.03 3.61.87 6.49 2.5 8.56C4.69 23 7.4 24.18 10.91 24.2h.01c3.12-.02 5.32-.84 7.13-2.65 2.37-2.37 2.3-5.33 1.52-7.15-.56-1.31-1.63-2.37-3.08-3.07l1.2-.1Zm-5.39 5.06c-1.3.07-2.65-.51-2.72-1.76-.05-.93.66-1.96 2.8-2.09.25-.01.49-.02.72-.02.78 0 1.5.08 2.16.22-.25 3.06-1.69 3.58-2.96 3.65Z" />
    </svg>
  );
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.64 7.86 6.36 9.32-.09-.79-.17-2 .03-2.87.18-.78 1.17-4.97 1.17-4.97s-.3-.6-.3-1.48c0-1.39.81-2.43 1.81-2.43.86 0 1.27.64 1.27 1.41 0 .86-.55 2.15-.83 3.34-.24 1 .5 1.81 1.48 1.81 1.78 0 3.14-1.87 3.14-4.58 0-2.39-1.72-4.07-4.18-4.07-2.85 0-4.52 2.14-4.52 4.35 0 .86.33 1.78.74 2.28.08.1.09.19.07.29-.08.31-.24 1-.28 1.13-.04.18-.14.22-.33.13-1.25-.58-2.03-2.4-2.03-3.87 0-3.15 2.29-6.05 6.6-6.05 3.46 0 6.16 2.47 6.16 5.77 0 3.45-2.17 6.22-5.19 6.22-1.01 0-1.97-.53-2.29-1.15l-.62 2.38c-.23.87-.84 1.96-1.25 2.62.94.29 1.94.45 2.97.45 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  );
}

const SWATCHES = ["bg-brand-blue", "bg-brand-green", "bg-brand-orange", "bg-brand-red"] as const;

export function SiteFooter() {
  const { open } = useConsent();
  const { data: s } = useSettings();
  const socials = [
    { href: s?.social_twitter, icon: Twitter, label: "Twitter" },
    { href: s?.social_instagram || INSTAGRAM_URL, icon: Instagram, label: "Instagram" },
    { href: s?.social_threads || THREADS_URL, icon: ThreadsIcon, label: "Threads" },
    { href: s?.social_github, icon: Github, label: "GitHub" },
    { href: s?.social_dribbble, icon: Dribbble, label: "Dribbble" },
    { href: s?.social_pinterest || PINTEREST_URL, icon: PinterestIcon, label: "Pinterest" },
  ].filter((x) => x.href);
  return (
    <footer className="relative mt-24 overflow-hidden border-t bg-card/40">
      {/* Brand color ribbon */}
      <div className="grid h-1.5 grid-cols-4" aria-hidden="true">
        {SWATCHES.map((c) => <div key={c} className={c} />)}
      </div>
      <div className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <Newsletter />
        <AdSlot position="footer" />
        <div className="grid gap-10 py-14 md:grid-cols-5">
          <div className="md:col-span-2">
            <LogoImage className="h-10" />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">Extract, generate and ship accessible brand color systems from a logo or website, free.</p>
            {/* Color swatch strip — the site's signature */}
            <div className="mt-5 flex items-center gap-2" aria-hidden="true">
              {SWATCHES.map((c, i) => (
                <span key={c} className={`size-6 rounded-md shadow-sm ring-1 ring-border transition-transform hover:-translate-y-1 ${c}`} style={{ transform: `rotate(${(i - 1.5) * 4}deg)` }} />
              ))}
              <span className="ml-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Palette className="size-3.5" /> 1,000+ free palettes</span>
            </div>
            <div className="mt-4 flex gap-3">
              {socials.map((x) => (
                <a key={x.label} href={x.href} target="_blank" rel="noopener noreferrer" aria-label={x.label} className="rounded-full border p-2 transition-colors hover:border-primary hover:text-primary"><x.icon className="size-4" /></a>
              ))}
              <a href={`mailto:${s?.contact_email || "apwebventures01@gmail.com"}`} aria-label="Email us" className="rounded-full border p-2 transition-colors hover:border-primary hover:text-primary"><Mail className="size-4" /></a>
            </div>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <span className="h-px w-4 bg-gradient-to-r from-brand-blue to-transparent" aria-hidden="true" />
                {c.title}
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {c.links.map(([l, h]) => (
                  <li key={h}><Link to={h} className="text-foreground/80 transition-colors hover:text-primary">{l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t py-6 text-sm text-muted-foreground sm:flex-row">
          <p>© 2026 LogoColorStudio. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-xs">Crafted with <Heart className="size-3.5 fill-brand-red text-brand-red" aria-label="love" /> for designers &amp; developers</p>
          <div className="flex gap-4">
            <Button variant="link" onClick={open}>Cookie settings</Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
