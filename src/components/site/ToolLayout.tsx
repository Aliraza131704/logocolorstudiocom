import { Link } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { AdSlot } from "./AdSlot";
import { Breadcrumbs, FaqList, Reveal, type Faq } from "./ui-bits";
import { TOOLS } from "@/lib/tools";
import { logEvent } from "@/lib/site-data";

export function ToolLayout({ slug, title, intro, children, about, faqs }: { slug: string; title: string; intro: string; children: ReactNode; about: ReactNode; faqs: Faq[] }) {
  const tool = TOOLS.find((t) => t.slug === slug);
  useEffect(() => { logEvent("tool", slug); }, [slug]);
  const related = TOOLS.filter((t) => t.slug !== slug).slice(0, 4);
  return (
    <div className="bg-hero">
      <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-8 sm:px-6">
        <div className="grid gap-6 xl:grid-cols-[160px_1fr_160px]">
          <div className="hidden xl:block"><div className="sticky top-24"><AdSlot position="left_sidebar" /></div></div>
          <div className="min-w-0">
            <Breadcrumbs items={[{ label: "Tools", to: "/tools" }, { label: tool?.name ?? title }]} />
            <header className="mb-8 max-w-3xl">
              <h1 className="text-3xl font-bold sm:text-5xl">{title}</h1>
              <p className="mt-3 text-lg text-muted-foreground">{intro}</p>
            </header>
            {children}
            <AdSlot position="below_tool" />
            <article className="prose-content mx-auto mt-16 max-w-3xl">{about}</article>
            <AdSlot position="in_content" className="mx-auto max-w-3xl" />
            <div className="mt-16"><FaqList faqs={faqs} /></div>
            <section className="mt-16">
              <h2 className="text-2xl font-bold">Related tools</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((t, i) => (
                  <Reveal key={t.slug} delay={i * 0.05}>
                    <Link to={t.path} className="card-hover group block h-full rounded-2xl border bg-card p-5">
                      <t.icon className={`size-6 ${t.color}`} />
                      <h3 className="mt-3 font-semibold">{t.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{t.short}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary">Open <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </section>
          </div>
          <div className="hidden xl:block"><div className="sticky top-24"><AdSlot position="right_sidebar" /></div></div>
        </div>
      </div>
    </div>
  );
}
