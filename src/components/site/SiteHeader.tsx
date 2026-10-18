import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Moon, Sun, X, ChevronDown, LayoutDashboard } from "lucide-react";
import { useIsAdmin } from "@/lib/use-is-admin";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { TOOLS } from "@/lib/tools";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const isAdmin = useIsAdmin();
  return (
    <header className="sticky top-0 z-50 border-b glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">Tools <ChevronDown /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              {TOOLS.map((t) => (
                <DropdownMenuItem key={t.slug} asChild>
                  <Link to={t.path} className="flex items-center gap-3">
                    <t.icon className={t.color} /> {t.name}
                    {t.isNew && <span className="ml-auto rounded-full bg-brand-green/15 px-2 text-[10px] font-semibold text-brand-green">NEW</span>}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {NAV.map((n) => (
            <Button key={n.to} variant="ghost" asChild>
              <Link to={n.to} activeProps={{ className: "text-primary" }}>{n.label}</Link>
            </Button>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          {isAdmin && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin"><LayoutDashboard /> Admin</Link>
            </Button>
          )}
          <ThemeToggle />
          <Button variant="hero" className="hidden sm:inline-flex" asChild>
            <Link to="/tools/logo-extractor">Start free</Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open && (
        <nav aria-label="Mobile" className="max-h-[80vh] overflow-y-auto border-t px-4 pb-6 pt-2 md:hidden">
          <p className="px-2 pb-1 pt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tools</p>
          {TOOLS.map((t) => (
            <Link key={t.slug} to={t.path} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-accent">
              <t.icon className={`size-5 ${t.color}`} /> {t.name}
            </Link>
          ))}
          <div className="my-2 border-t" />
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block rounded-lg px-2 py-3 hover:bg-accent">{n.label}</Link>
          ))}
          <Link to="/contact" onClick={() => setOpen(false)} className="block rounded-lg px-2 py-3 hover:bg-accent">Contact</Link>
        </nav>
      )}
    </header>
  );
}
