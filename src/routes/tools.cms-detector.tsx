import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ToolLayout } from "@/components/site/ToolLayout";
import { ErrorNote, ResultSkeleton, UrlForm } from "@/components/site/tool-parts";
import { faqLd, breadcrumbLd, type Faq } from "@/components/site/ui-bits";
import { detectCms } from "@/lib/analyze.functions";
import { pageHead } from "@/lib/seo";
import { getPublicSetting } from "@/lib/content.functions";
import { TOOL_CONTENT_KEY, toolOverride } from "@/lib/tool-overrides";
import cmsDetectImg from "@/assets/guide-cms-detect.jpg";
import cmsFrameworkImg from "@/assets/guide-cms-vs-framework.jpg";

const FAQS: Faq[] = [
  { q: "What CMS is this website using?", a: "Paste the address into the CMS checker above and press Detect. It reads the page's public HTML, scripts, asset paths and server headers, then shows the most likely platform with a confidence score and the evidence it matched." },
  { q: "How can I check a website's CMS without installing software?", a: "Use this online CMS checker in any desktop or mobile browser. There is no extension, download or sign-up, and the addresses you check are not stored." },
  { q: "Can this CMS finder tell if a site uses WordPress or Shopify?", a: "Yes. WordPress is recognised from signals such as /wp-content/ paths and the wp-json endpoint, and Shopify from cdn.shopify.com assets and Shopify scripts. After a match you can open the matching theme detector to find the theme." },
  { q: "Is this CMS detector free?", a: "Yes. It is completely free, needs no account and has no daily credit system. A fair-use limit of about 20 checks per minute per visitor keeps it fast for everyone." },
  { q: "How do I check what CMS a website uses?", a: "Paste the website address into the box above and press Detect. The tool reads the page's public fingerprints and shows the most likely CMS with a confidence score and the evidence behind it." },
  { q: "Which platforms can be detected?", a: "WordPress, Shopify, Wix, Squarespace, Webflow, Joomla, Drupal, Magento, Ghost, BigCommerce, PrestaShop, WooCommerce, OpenCart, Ecwid, HubSpot CMS, Framer, Weebly, Duda, Tilda, Blogger, TYPO3, headless CMSs like Contentful and Sanity, plus 40+ frameworks, analytics tools, hosts and page builders." },
  { q: "What does the confidence score mean?", a: "It reflects how many independent fingerprints matched, such as generator tags, asset paths and server headers. 80% or more is a very strong match." },
  { q: "How accurate is the CMS detector?", a: "For mainstream platforms with clear fingerprints, results are very reliable. Accuracy drops for custom-built sites, headless setups and sites that intentionally hide their signals, which is why every match shows its evidence." },
  { q: "Why is nothing detected?", a: "The site may be custom-built, use a headless setup, hide its platform signals, or block automated visits." },
  { q: "Is it legal to check a site's CMS?", a: "Yes. We only read the same public HTML and headers your browser receives when it visits the page." },
  { q: "Can it detect WooCommerce and Magento stores?", a: "Yes. WooCommerce is recognised from its plugin assets and body classes on WordPress sites, and Magento from its static paths, cookies and scripts." },
  { q: "What is the difference between a CMS and a framework?", a: "A CMS manages and publishes content through an editor. A framework such as Next.js or Laravel is code developers use to build an application. Some sites combine both." },
  { q: "Can it see pages behind a login?", a: "No. Only public pages that load without signing in can be checked." },
  { q: "Do you store the websites I check?", a: "No. Pages are fetched, analysed and discarded. We do not keep a history of the addresses you scan." },
  { q: "Why does a site show more than one platform?", a: "Many sites layer technologies, for example a Next.js front end over a headless CMS, or a page builder on top of WordPress. Each is listed with its own score." },
  { q: "How do I find the theme after detecting the CMS?", a: "For WordPress and Shopify sites, follow the link under the result to the matching theme detector." },
];

export const Route = createFileRoute("/tools/cms-detector")({
  loader: () => getPublicSetting({ data: { key: TOOL_CONTENT_KEY } }),
  head: ({ loaderData }) => {
    const o = toolOverride(loaderData, "cms-detector");
    return pageHead({
      title: o?.metaTitle ?? "CMS Checker Online — Check What CMS Any Website Uses",
      description: o?.metaDescription ?? "Free CMS checker: see if a site runs WordPress, Shopify, Wix, Squarespace or 30+ other platforms, with evidence for every match. Check any website now.",
      path: "/tools/cms-detector",
      jsonLd: [faqLd(o?.faqs ?? FAQS), breadcrumbLd([{ label: "Tools", to: "/tools" }, { label: "CMS Detector" }], "/tools/cms-detector"), { "@context": "https://schema.org", "@type": "WebApplication", name: "CMS Detector", applicationCategory: "DeveloperApplication", operatingSystem: "Any" }],
    });
  },
  component: Page,
});

type Res = Awaited<ReturnType<typeof detectCms>>;

function Page() {
  const o = toolOverride(Route.useLoaderData(), "cms-detector");
  const fn = useServerFn(detectCms);
  const [res, setRes] = useState<Res | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const run = async (url: string) => {
    setLoading(true); setErr(""); setRes(null);
    try { setRes(await fn({ data: { url } })); } catch (e) { setErr(e instanceof Error ? e.message : "Detection failed."); }
    setLoading(false);
  };
  return (
    <ToolLayout override={o} slug="cms-detector" title="CMS Checker: What CMS Is This Website Using?" intro="Use this free CMS checker to find the content management system or site builder behind any website in seconds. Our CMS Detector reads public headers, scripts and file paths, then shows a confidence score and the evidence for every match." faqs={FAQS} about={<About />}>
      <UrlForm onSubmit={run} loading={loading} cta="Detect" />
      {loading && <ResultSkeleton />}
      {err && <ErrorNote msg={err} />}
      {res && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border bg-card p-6">
            {res.results.length === 0 ? (
              <p className="text-muted-foreground">No known CMS fingerprints found. The site may be custom-built or headless.</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Most likely</p>
                <p className="font-display text-4xl font-extrabold">{res.results[0].name}</p>
                <div className="mt-6 space-y-4">
                  {res.results.map((r) => (
                    <div key={r.name}>
                      <div className="flex justify-between text-sm"><span className="font-medium">{r.name}</span><span className="font-semibold">{r.confidence}%</span></div>
                      <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-brand-gradient" style={{ width: `${r.confidence}%` }} /></div>
                      <p className="mt-1 text-xs text-muted-foreground">{r.category} · {r.evidence.join(" · ")}</p>
                    </div>
                  ))}
                </div>
                {res.results[0].name === "WordPress" && <p className="mt-6 text-sm">Next: <Link to="/tools/wordpress-theme-detector" className="text-primary underline">detect the WordPress theme</Link></p>}
                {res.results[0].name === "Shopify" && <p className="mt-6 text-sm">Next: <Link to="/tools/shopify-theme-detector" className="text-primary underline">detect the Shopify theme</Link></p>}
              </>
            )}
          </div>
          <dl className="space-y-3 rounded-2xl border bg-card p-6 text-sm">
            <div><dt className="text-muted-foreground">URL</dt><dd className="break-all">{res.url}</dd></div>
            <div><dt className="text-muted-foreground">Page title</dt><dd>{res.title ?? "—"}</dd></div>
            <div><dt className="text-muted-foreground">Status / speed / size</dt><dd>{res.status} · {res.responseMs} ms · {res.sizeKb} KB</dd></div>
            <div><dt className="text-muted-foreground">Language</dt><dd>{res.lang ?? "—"}</dd></div>
            <div><dt className="text-muted-foreground">Generator tag</dt><dd>{res.generator ?? "—"}</dd></div>
            <div><dt className="text-muted-foreground">Server</dt><dd>{res.server ?? "—"}</dd></div>
            <div><dt className="text-muted-foreground">X-Powered-By</dt><dd>{res.poweredBy ?? "—"}</dd></div>
          </dl>
          <div className="rounded-2xl border bg-card p-6 lg:col-span-2">
            <h2 className="font-semibold">Technology stack ({res.tech.length})</h2>
            {res.tech.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No extra technologies detected.</p> : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...new Set(res.tech.map((t) => t.category))].map((c) => (
                  <div key={c}><p className="text-xs uppercase tracking-wide text-muted-foreground">{c}</p>
                    <div className="mt-2 flex flex-wrap gap-2">{res.tech.filter((t) => t.category === c).map((t) => <span key={t.name} className="rounded-full border px-3 py-1 text-sm">{t.name}</span>)}</div></div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}

function About() {
  return (
    <>
      <h2>A free website technology checker for any public site</h2>
      <p>Ever landed on a beautifully built website and wondered what platform it runs on? The LogoColorStudio CMS Detector answers that question in a few seconds. Paste an address, press Detect, and the tool tells you which content management system, website builder or ecommerce platform most likely powers the page, how confident that match is, and which supporting technologies it spotted along the way.</p>
      <p>A content management system, or CMS, is the software a team uses to create, edit and publish pages without writing every line of code by hand. WordPress, Shopify, Wix, Squarespace, Webflow, Drupal, Joomla, Magento, Ghost and many others all fall into this group. Some are self-hosted open-source projects, some are hosted builders that bundle design, hosting and editing, and some are headless systems that only store content while a separate front end displays it.</p>
      <p>The tool is built for people who need a quick, honest answer: designers researching inspiration, developers scoping a migration, agencies qualifying leads, marketers checking which integrations a partner can support, and SEO specialists auditing competitors. Students learning how the web works also use it to see real examples of each platform in the wild.</p>
      <p>Knowing the platform matters because it shapes almost everything else about a site: how pages are structured, which plugins or apps are available, how fast the site can be, how easy it is to move content, and what it typically costs to maintain. Instead of digging through source code yourself, the detector collects the evidence and explains it in plain language. It is free, needs no account, and only reads the same public information your own browser receives when you visit a page.</p>

      <figure><img src={cmsDetectImg} alt="Magnifying glass revealing the code, database, store and plugin layers behind a website" width={1200} height={688} loading="lazy" className="rounded-2xl border" /><figcaption>The detector looks beneath the page to reveal the platform and technology layers that power it.</figcaption></figure>
      <h2>How to find out what CMS a website uses</h2>
      <ol>
        <li><strong>Copy the address.</strong> Open the site you are curious about and copy its URL, or simply type the domain, such as <code>example.com</code>. The scheme is added for you.</li>
        <li><strong>Paste it into the field above</strong> and click <strong>Detect</strong>. The check usually finishes in a few seconds.</li>
        <li><strong>Read the most likely platform.</strong> The large heading shows the strongest match. Below it, bars show the confidence for every platform that matched.</li>
        <li><strong>Review the evidence.</strong> Each match lists the signals behind it, such as a generator tag, an asset folder or a response header, so you can judge the result yourself.</li>
        <li><strong>Check the technical panel.</strong> The side panel shows the page title, status code, response time, page size, language, generator tag, server and X-Powered-By header.</li>
        <li><strong>Go deeper.</strong> For WordPress and Shopify sites, follow the link to the matching theme detector to learn the exact theme, plugins or apps.</li>
      </ol>

      <h2>Key features</h2>
      <ul>
        <li>Weighted fingerprints for more than thirty CMS, builder and ecommerce platforms.</li>
        <li>A confidence percentage for every match, not a single unexplained guess.</li>
        <li>Visible evidence for each result so you can verify it.</li>
        <li>Detection of 40+ supporting technologies: JavaScript frameworks, analytics, tag managers, CDNs, hosting and page builders.</li>
        <li>Recognition of headless setups, such as a Next.js front end over a headless CMS.</li>
        <li>Detect Shopify, detect WooCommerce, detect Magento, BigCommerce, PrestaShop and other store platforms.</li>
        <li>Response details: status code, speed and page weight.</li>
        <li>Generator, server and X-Powered-By header readout.</li>
        <li>Clear messages when a site blocks automated visits instead of a misleading empty result.</li>
        <li>One-click hand-off to the WordPress and Shopify theme detectors.</li>
        <li>No sign-up, no installs and no browser extension required.</li>
        <li>Works on desktop and mobile.</li>
      </ul>

      <h2>Why knowing a website's platform matters</h2>
      <p><strong>Competitor analysis.</strong> If several leading competitors in your niche use the same platform, that tells you something about what works for businesses like yours. A store on Shopify Plus suggests a different budget and growth stage than one on a free website builder. Pairing the platform with the technology stack, such as which analytics, email or review tools are present, gives you a practical picture of how a rival operates online.</p>
      <p><strong>SEO planning.</strong> Every platform handles search basics differently. WordPress gives you enormous control through plugins but depends on good configuration. Hosted builders make clean defaults easy but can limit custom markup, redirects or server settings. When you audit a site, knowing the CMS tells you where titles, canonical tags, sitemaps and structured data are probably generated, and which fixes are realistic. It also explains common patterns, such as duplicate collection URLs on Shopify or tag archives on WordPress.</p>
      <p><strong>Web development and migrations.</strong> Before quoting a redesign or a move to a new system, developers need to know what they are migrating from. Content export options, URL structures, image storage and plugin data vary widely. A quick check helps you estimate effort, ask the right questions and avoid surprises halfway through a project.</p>
      <p><strong>Sales and partnerships.</strong> Agencies, app makers and freelancers often specialise in one ecosystem. Checking the platform first means you only pitch services that genuinely fit, which saves time on both sides and makes outreach more relevant.</p>
      <p><strong>Security awareness.</strong> Site owners can confirm what their own site reveals publicly. If your generator tag advertises an exact old version number, you may want to update the software and hide that detail. The detector shows only public signals, so it is a useful way to see your site the way any visitor or scanner sees it.</p>
      <p><strong>Learning and inspiration.</strong> Designers often fall in love with a layout and want to know whether they could build something similar with tools they already know. Finding out a site was made in Webflow, Framer or Squarespace instantly tells you whether that look is within reach.</p>

      <h2>Who uses the CMS Detector</h2>
      <p><strong>Designers</strong> use it to research inspiration and understand which builders produce the layouts they admire. Combined with the <Link to="/tools/website-extractor">Website Extractor</Link>, they can capture both the platform and the color and font system of a reference site.</p>
      <p><strong>Developers</strong> run checks before estimating work, when inheriting an unfamiliar project, or when debugging an integration that behaves differently on each platform. Seeing the framework, CDN and hosting signals together saves time spent reading source code.</p>
      <p><strong>Marketers</strong> check which analytics, tag managers and email tools competitors use, and whether a partner's site can support a particular widget, pixel or integration before planning a campaign.</p>
      <p><strong>SEO professionals</strong> identify the platform at the start of every audit so their recommendations match what the site can actually change. They often follow up with the <Link to="/tools/website-auditor">Website Auditor</Link> to review titles, headings, links and other on-page factors.</p>
      <p><strong>Store owners and sales teams</strong> use it to benchmark rival shops, qualify leads by ecommerce platform and find the theme or apps behind a store with the <Link to="/tools/shopify-theme-detector">Shopify Theme Detector</Link> or <Link to="/tools/wordpress-theme-detector">WordPress Theme Detector</Link>.</p>

      <h2>CMS vs framework: what is the difference?</h2>
      <p>A CMS manages content: it has an editor, stores pages and posts, and usually renders the final HTML. A framework such as React, Next.js, Vue, Nuxt or Laravel is a set of building blocks developers use to write an application. A site can use both: a headless CMS like Contentful or Sanity can store the content while a Next.js front end displays it. That is why the detector reports platforms and technologies separately, and why one site can show several results at once.</p>

      <figure><img src={cmsFrameworkImg} alt="A content editor dashboard on the left and code framework building blocks on the right" width={1200} height={688} loading="lazy" className="rounded-2xl border" /><figcaption>A CMS gives editors a dashboard for content; a framework gives developers code building blocks.</figcaption></figure>
      <h2>How to inspect a site's source code yourself</h2>
      <p>You can confirm many results manually. In most browsers, right-click and choose <em>View page source</em>, then search for clues: a <code>&lt;meta name="generator"&gt;</code> tag, paths like <code>/wp-content/</code>, <code>/cdn/shop/</code> or <code>/sites/default/files/</code>, or scripts from a builder's domain. Your browser's developer tools also show response headers in the Network tab, where values like <code>x-powered-by</code> or platform-specific headers often appear.</p>

      <h2>Technical deep dive: how detection works</h2>
      <p>When you submit a URL, our server validates it, refuses private or internal network addresses, and requests the page with a normal browser-style request. Fetching happens on the server because browsers block most cross-site requests. The tool then examines several independent sources of evidence.</p>
      <p>First, the HTML: generator meta tags, characteristic class names and data attributes, links to theme and asset folders, inline JavaScript objects such as <code>Shopify.theme</code>, and script sources loaded from known platform domains. Second, the HTTP response headers: server names, X-Powered-By values, cookies and platform-specific headers. Third, where useful, a small number of light secondary checks against well-known public paths help confirm a weak match.</p>
      <p>Each signal carries a weight. A generator tag that names the platform is strong evidence; a shared library is weak evidence. The weights are combined into a score capped at 100%. Results above roughly 80% are very strong matches; lower scores mean fewer signals were found. If a site is custom-built, heavily cached behind a firewall or deliberately hides its fingerprints, the detector says so instead of inventing an answer. Requests are rate limited per visitor to keep the service fast, and scanned pages are not stored.</p>
    </>
  );
}
