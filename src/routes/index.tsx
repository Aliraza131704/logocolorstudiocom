import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Upload, Wand2, Download, ShieldCheck, Zap, Lock } from "lucide-react";
import hero from "@/assets/hero.webp";
import heroSmall from "@/assets/hero-800.webp";
import { Button } from "@/components/ui/button";
import { TOOLS } from "@/lib/tools";
import { FaqList, Reveal, SectionTitle, faqLd, type Faq } from "@/components/site/ui-bits";
import { pageHead } from "@/lib/seo";
import { getPublicSetting } from "@/lib/content.functions";
import { TOOL_CONTENT_KEY, toolOverride, withMeta } from "@/lib/tool-overrides";
import { PageExtras } from "@/components/site/PageExtras";
import { getFeaturedPalettes } from "@/lib/palette-editorial";

const FAQS: Faq[] = [
  { q: "Is LogoColorStudio free?", a: "Yes. Every tool is free to use with no sign-up required." },
  { q: "Which image formats are supported?", a: "PNG, JPG, WebP, SVG and GIF logos up to 10 MB. Transparent PNG or SVG give the cleanest results." },
  { q: "Are my uploaded logos stored?", a: "No. Logo color extraction runs entirely in your browser, so your files never leave your device." },
  { q: "How accurate is the color extraction?", a: "We cluster every opaque pixel and ignore anti-aliased edges, so the returned colors match the real brand colors to the exact HEX value in most logos." },
  { q: "What export formats are available?", a: "CSS variables, SCSS variables, Tailwind config, JSON and PNG palette images." },
  { q: "Can I check accessibility?", a: "Yes. The Contrast Checker tests every color pair against WCAG 2.2 AA and AAA for normal and large text." },
];

export const Route = createFileRoute("/")({
  loader: () => getPublicSetting({ data: { key: TOOL_CONTENT_KEY } }),
  head: ({ loaderData }) => pageHead(withMeta(toolOverride(loaderData, "page-home"), {
      title: "LogoColorStudio — Extract & Generate Brand Colors",
      description: "Extract colors from any logo or website, generate palettes, check WCAG contrast and export CSS, Tailwind and JSON. Free brand color tools.",
      path: "/",
      jsonLd: [faqLd(FAQS)],
    })),
  component: Index,
});

function Index() {
  const o = toolOverride(Route.useLoaderData(), "page-home");
  const featured = getFeaturedPalettes().filter((_, i) => i % 15 === 0).slice(0, 6);
  return (
    <>
      <section className="relative overflow-hidden bg-hero">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-2 lg:pt-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-brand-green" /> 10 free tools · No sign-up
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] sm:text-6xl">
              {o?.title ?? <>Extract, generate &amp; ship <span className="text-gradient">brand colors</span> in seconds</>}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              {o?.intro ?? <>Upload a logo or paste a website URL. Get exact HEX, RGB and HSL values, harmonious palettes, accessible themes and ready-to-paste code.</>}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="hero" size="lg" asChild><Link to="/tools/logo-extractor">Upload a logo <ArrowRight /></Link></Button>
              <Button variant="glass" size="lg" asChild><Link to="/palettes">Browse {getFeaturedPalettes().length} featured palettes</Link></Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><Lock className="size-4 text-brand-green" /> Files stay on your device</span>
              <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-brand-blue" /> WCAG checks built in</span>
              <span className="flex items-center gap-2"><Zap className="size-4 text-brand-orange" /> Instant exports</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-brand-gradient opacity-20 blur-3xl" />
            <img src={heroSmall} srcSet={`${heroSmall} 800w, ${hero} 1280w`} sizes="(min-width: 1024px) 600px, 100vw" decoding="async" alt="Floating brand color swatches in blue, green, orange and red" width={1280} height={960} fetchPriority="high" className="relative w-full rounded-[2rem] border shadow-soft" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionTitle eyebrow="Toolkit" title="All tools" sub="Everything you need to go from a logo to a production-ready color system." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {TOOLS.map((t, i) => (
            <Reveal key={t.slug} delay={(i % 5) * 0.05}>
              <Link to={t.path} className="card-hover group relative block h-full rounded-2xl border bg-card p-5">
                {t.isNew && <span className="absolute right-4 top-4 rounded-full bg-brand-green/15 px-2 py-0.5 text-[10px] font-bold text-brand-green">NEW</span>}
                <div className="inline-flex rounded-xl bg-muted p-2.5"><t.icon className={`size-5 ${t.color}`} /></div>
                <h3 className="mt-4 font-semibold">{t.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.short}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y bg-card/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle eyebrow="Workflow" title="How it works" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Upload, t: "Upload", d: "Drop a logo or paste a website URL. We read every pixel or stylesheet.", c: "text-brand-blue" },
              { icon: Wand2, t: "Analyze", d: "Get dominant colors, harmonies, contrast scores and a ready UI theme.", c: "text-brand-orange" },
              { icon: Download, t: "Export", d: "Copy CSS variables, Tailwind, SCSS or JSON and ship it to production.", c: "text-brand-green" },
            ].map((s, i) => (
              <Reveal key={s.t} delay={i * 0.08}>
                <div className="rounded-2xl border bg-card p-6">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-sm text-muted-foreground">0{i + 1}</span>
                    <s.icon className={`size-6 ${s.c}`} />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{s.t}</h3>
                  <p className="mt-2 text-muted-foreground">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionTitle eyebrow="Inspiration" title="Featured palettes" sub="Curated color combinations you can copy in one click." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <Link key={p.slug} to="/palette/$slug" params={{ slug: p.slug }} className="card-hover overflow-hidden rounded-2xl border bg-card">
              <div className="flex h-28">{p.colors.map((c) => <div key={c} className="flex-1" style={{ backgroundColor: c }} />)}</div>
              <div className="flex items-center justify-between p-4"><span className="font-medium">{p.name}</span><span className="text-xs text-muted-foreground">{p.tags[0]}</span></div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center"><Button variant="outline" asChild><Link to="/palettes">See all palettes <ArrowRight /></Link></Button></div>
      </section>

      <section className="px-4 py-10 sm:px-6"><FaqList faqs={FAQS} /></section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-brand-navy px-6 py-16 text-center sm:px-12">
          <div className="absolute inset-0 bg-brand-gradient opacity-25" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">Your brand colors are one upload away</h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">Free, private and built for designers and developers who ship.</p>
            <Button variant="hero" size="lg" className="mt-8" asChild><Link to="/tools/logo-extractor">Start Studio <ArrowRight /></Link></Button>
          </div>
        </div>
      </section>
      <PageExtras o={o} />
    </>
  );
}
