import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Menu, Moon, Sun, X } from "lucide-react";
import { Logo } from "./Logo";
import { MegaMenu } from "./MegaMenu";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { TOOLS } from "@/lib/tools";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}

const NAV = [
  { to: "/palettes", label: "Palettes" },
  { to: "/brand-colors", label: "Brand Colors" },
  { to: "/downloads", label: "Downloads" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Brand ribbon — the site's signature line, sits above the bar */}
      <div className="h-[3px] w-full bg-brand-gradient" aria-hidden="true" />
      <div className="border-b glass">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo className="h-9" />
          <nav aria-label="Main" className="hidden items-center gap-0.5 md:flex">
            <MegaMenu open={megaOpen} onOpenChange={setMegaOpen} />
            {NAV.map((n) => (
              <Button key={n.to} variant="ghost" asChild className="font-medium">
                <Link to={n.to} activeProps={{ className: "text-primary" }} onClick={() => setMegaOpen(false)}>{n.label}</Link>
              </Button>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="hero" className="hidden lg:inline-flex" asChild>
              <Link to="/tools/logo-extractor">Start free</Link>
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>
      {open && (
        <nav aria-label="Mobile" className="overflow-y-auto border-b glass px-4 pb-6 pt-1 md:hidden">
          <button
            type="button"
            onClick={() => setToolsOpen(!toolsOpen)}
            aria-expanded={toolsOpen}
            className="flex w-full items-center justify-between px-2 py-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Tools <ChevronDown className={`size-4 transition-transform ${toolsOpen ? "rotate-180" : ""}`} />
          </button>
          {toolsOpen && (
            <div className="pb-2">
              {TOOLS.map((t) => (
                <Link key={t.slug} to={t.path} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-accent">
                  <span className="grid size-8 place-items-center rounded-lg border bg-background">
                    <t.icon className={`size-4 ${t.color}`} />
                  </span>
                  <span className="flex items-center gap-2 text-sm">
                    {t.name}
                    {t.isNew && <span className="rounded-full bg-brand-green/15 px-1.5 py-px text-[9px] font-bold uppercase text-brand-green">New</span>}
                  </span>
                </Link>
              ))}
            </div>
          )}
          <div className="my-2 border-t" />
          <button
            type="button"
            onClick={() => setMoreOpen(!moreOpen)}
            aria-expanded={moreOpen}
            className="flex w-full items-center justify-between px-2 py-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Explore <ChevronDown className={`size-4 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
          </button>
          {moreOpen && (
            <div className="pb-2">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block rounded-lg px-2 py-2.5 text-sm hover:bg-accent">{n.label}</Link>
              ))}
              <Link to="/giveaway" onClick={() => setOpen(false)} className="block rounded-lg px-2 py-2.5 text-sm hover:bg-accent">Giveaway</Link>
              <Link to="/changelog" onClick={() => setOpen(false)} className="block rounded-lg px-2 py-2.5 text-sm hover:bg-accent">Changelog</Link>
              <Link to="/sitemap" onClick={() => setOpen(false)} className="block rounded-lg px-2 py-2.5 text-sm hover:bg-accent">Sitemap</Link>
            </div>
          )}
          <div className="my-2 border-t" />
          <div className="flex flex-col gap-2 pt-2">
            <Button variant="hero" size="lg" asChild className="w-full">
              <Link to="/tools/logo-extractor" onClick={() => setOpen(false)}>Start free</Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="w-full">
              <Link to="/contact" onClick={() => setOpen(false)}>Contact us</Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
