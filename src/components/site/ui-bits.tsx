import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, Copy, ChevronRight } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { absoluteUrl } from "@/lib/seo";

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ y: 18 }} whileInView={{ y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay }} className={className}>
      {children}
    </motion.div>
  );
}

export async function copyText(text: string, label = "Copied") {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(label);
  } catch {
    toast.error("Copy failed");
  }
}

export function CopyButton({ text, label, className, size = "icon" }: { text: string; label?: string; className?: string; size?: "icon" | "sm" }) {
  const [ok, setOk] = useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      className={cn(size === "icon" && "h-8 w-8", className)}
      aria-label={`Copy ${label ?? text}`}
      onClick={() => { copyText(text, `Copied ${label ?? text}`); setOk(true); setTimeout(() => setOk(false), 1200); }}
    >
      {ok ? <Check /> : <Copy />} {size === "sm" && (label ?? "Copy")}
    </Button>
  );
}

export type Crumb = { label: string; to?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        <li><Link to="/" className="hover:text-primary">Home</Link></li>
        {items.map((c) => (
          <li key={c.label} className="flex items-center gap-1">
            <ChevronRight className="size-3.5" />
            {c.to ? <Link to={c.to} className="hover:text-primary">{c.label}</Link> : <span aria-current="page" className="text-foreground">{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function breadcrumbLd(items: Crumb[], path: string) {
  const all = [{ label: "Home", to: "/" }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: absoluteUrl(c.to ?? path) })),
  };
}

export type Faq = { q: string; a: string };

export function faqLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function FaqList({ faqs, title = "Frequently asked questions" }: { faqs: Faq[]; title?: string }) {
  return (
    <section className="mx-auto max-w-3xl">
      <h2 className="text-center text-3xl font-bold">{title}</h2>
      <div className="mt-8">
        {faqs.map((f) => (
          <details key={f.q} className="border-b py-4">
            <summary className="cursor-pointer text-base font-medium">{f.q}</summary>
            <p className="pt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Swatch({ hex, className, children }: { hex: string; className?: string; children?: ReactNode }) {
  return <div className={cn("rounded-xl", className)} style={{ backgroundColor: hex }}>{children}</div>;
}

export function SectionTitle({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && <p className="text-sm font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>}
      <h2 className="mt-2 text-3xl font-bold sm:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function download(filename: string, content: string | Blob, type = "text/plain") {
  const blob = typeof content === "string" ? new Blob([content], { type }) : content;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
