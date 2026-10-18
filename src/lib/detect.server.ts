// Server-only fingerprinting engine for the CMS, Shopify and WordPress detectors.
import type { Fetched } from "./analyze.server";
type M = typeof import("./analyze.server");

type Sig = { w: number; why: string; t: (h: string, hd: Record<string, string>) => boolean };
type Platform = { name: string; category: string; sigs: Sig[] };

const gen = (re: RegExp) => (h: string) => new RegExp(`<meta[^>]+name=["']generator["'][^>]+content=["'][^"']*${re.source}`, "i").test(h) || new RegExp(`<meta[^>]+content=["'][^"']*${re.source}[^>]+name=["']generator["']`, "i").test(h);
const hdr = (k: string, re?: RegExp) => (_: string, hd: Record<string, string>) => (hd[k] !== undefined) && (!re || re.test(hd[k]));
const cookie = (re: RegExp) => (_: string, hd: Record<string, string>) => re.test(hd["set-cookie"] ?? "");
const html = (re: RegExp) => (h: string) => re.test(h);

const PLATFORMS: Platform[] = [
  { name: "WordPress", category: "CMS", sigs: [
    { w: 45, why: "/wp-content/ asset paths", t: html(/\/wp-content\//) },
    { w: 30, why: "/wp-includes/ scripts", t: html(/\/wp-includes\//) },
    { w: 50, why: "Generator meta tag", t: gen(/WordPress/) },
    { w: 30, why: "REST API link (wp-json)", t: (h, hd) => /wp-json/.test(h) || /wp-json/.test(hd.link ?? "") },
    { w: 20, why: "WordPress cookies", t: cookie(/wordpress_|wp-settings|wp_woocommerce/) },
    { w: 15, why: "X-Pingback header", t: hdr("x-pingback") },
  ] },
  { name: "WooCommerce", category: "Ecommerce", sigs: [
    { w: 60, why: "WooCommerce plugin assets", t: html(/plugins\/woocommerce\//) },
    { w: 30, why: "woocommerce body classes", t: html(/class=["'][^"']*woocommerce/) },
    { w: 20, why: "WooCommerce cookies", t: cookie(/woocommerce_|wp_woocommerce_session/) },
  ] },
  { name: "Shopify", category: "Ecommerce", sigs: [
    { w: 45, why: "Shopify CDN assets", t: html(/cdn\.shopify\.com|\/cdn\/shop\//) },
    { w: 45, why: "Shopify.theme object", t: html(/Shopify\.theme\s*=/) },
    { w: 40, why: "Shopify response headers", t: (_, hd) => !!(hd["x-shopid"] || hd["x-shopify-stage"] || hd["x-sorting-hat-shopid"] || /shopify/i.test(hd["powered-by"] ?? "")) },
    { w: 20, why: "Shopify cookies", t: cookie(/_shopify_|cart_sig|secure_customer_sig/) },
    { w: 20, why: "myshopify.com reference", t: html(/[a-z0-9-]+\.myshopify\.com/) },
  ] },
  { name: "Wix", category: "Site builder", sigs: [
    { w: 60, why: "Wix static assets", t: html(/static\.wixstatic\.com|static\.parastorage\.com/) },
    { w: 40, why: "Generator meta tag", t: gen(/Wix/) },
    { w: 40, why: "Wix headers", t: (_, hd) => !!(hd["x-wix-request-id"] || /wix/i.test(hd["server"] ?? "")) },
  ] },
  { name: "Squarespace", category: "Site builder", sigs: [
    { w: 60, why: "Squarespace CDN", t: html(/static1\.squarespace\.com|images\.squarespace-cdn\.com/) },
    { w: 30, why: "Squarespace context script", t: html(/Static\.SQUARESPACE_CONTEXT|squarespace\.com\/universal/) },
    { w: 30, why: "Squarespace server header", t: hdr("server", /squarespace/i) },
  ] },
  { name: "Webflow", category: "Site builder", sigs: [
    { w: 60, why: "data-wf-page / data-wf-site attributes", t: html(/data-wf-page|data-wf-site/) },
    { w: 40, why: "Generator meta tag", t: gen(/Webflow/) },
    { w: 25, why: "Webflow CDN", t: html(/website-files\.com|assets\.website-files\.com|webflow\.com\/css/) },
  ] },
  { name: "Framer", category: "Site builder", sigs: [
    { w: 60, why: "Framer CDN", t: html(/framerusercontent\.com|framer\.com\/m\//) },
    { w: 40, why: "Generator meta tag", t: gen(/Framer/) },
    { w: 20, why: "data-framer attributes", t: html(/data-framer-/) },
  ] },
  { name: "Joomla", category: "CMS", sigs: [
    { w: 60, why: "Generator meta tag", t: gen(/Joomla/) },
    { w: 40, why: "Joomla paths", t: html(/\/media\/jui\/|\/media\/system\/js\/|\/components\/com_/) },
  ] },
  { name: "Drupal", category: "CMS", sigs: [
    { w: 60, why: "Generator meta tag", t: gen(/Drupal/) },
    { w: 40, why: "Drupal settings / files", t: html(/\/sites\/default\/files|drupal-settings-json|Drupal\.settings/) },
    { w: 35, why: "Drupal headers", t: (_, hd) => !!(hd["x-drupal-cache"] || hd["x-drupal-dynamic-cache"] || /drupal/i.test(hd["x-generator"] ?? "")) },
  ] },
  { name: "Magento / Adobe Commerce", category: "Ecommerce", sigs: [
    { w: 50, why: "Magento init scripts", t: html(/text\/x-magento-init|Magento_/) },
    { w: 40, why: "Magento static paths", t: html(/\/static\/version\d+\/frontend\/|mage\/cookies/) },
    { w: 30, why: "Magento headers/cookies", t: (h, hd) => !!hd["x-magento-cache-debug"] || /mage-cache|X-Magento/i.test(hd["set-cookie"] ?? "") },
  ] },
  { name: "BigCommerce", category: "Ecommerce", sigs: [
    { w: 70, why: "BigCommerce CDN / Stencil", t: html(/cdn\d*\.bigcommerce\.com|stencil-utils|bigcommerce\.com\/s-/) },
    { w: 30, why: "BigCommerce headers", t: (_, hd) => /bigcommerce/i.test(JSON.stringify(hd)) },
  ] },
  { name: "PrestaShop", category: "Ecommerce", sigs: [
    { w: 50, why: "prestashop variable", t: html(/var prestashop\s*=|prestashop\.urls/) },
    { w: 40, why: "Generator / powered-by", t: (h, hd) => gen(/PrestaShop/)(h) || /prestashop/i.test(hd["powered-by"] ?? "") },
    { w: 20, why: "PrestaShop cookie", t: cookie(/PrestaShop-/) },
  ] },
  { name: "OpenCart", category: "Ecommerce", sigs: [{ w: 70, why: "OpenCart routes", t: html(/index\.php\?route=(common|product)\//) }, { w: 20, why: "OCSESSID cookie", t: cookie(/OCSESSID/) }] },
  { name: "Ecwid", category: "Ecommerce", sigs: [{ w: 80, why: "Ecwid script", t: html(/app\.ecwid\.com\/script\.js/) }] },
  { name: "Ghost", category: "CMS", sigs: [{ w: 70, why: "Generator meta tag", t: gen(/Ghost/) }, { w: 30, why: "Ghost portal / API", t: html(/ghost-portal|\/ghost\/api\/|data-ghost/) }] },
  { name: "HubSpot CMS", category: "CMS", sigs: [{ w: 50, why: "HubSpot hosted assets", t: html(/hubspotusercontent|hs-sites\.com|\/hs-fs\//) }, { w: 40, why: "Generator meta tag", t: gen(/HubSpot/) }, { w: 20, why: "HubSpot headers", t: (_, hd) => !!hd["x-hs-hub-id"] }] },
  { name: "Weebly", category: "Site builder", sigs: [{ w: 70, why: "Weebly assets", t: html(/weebly\.com|editmysite\.com/) }] },
  { name: "GoDaddy Website Builder", category: "Site builder", sigs: [{ w: 70, why: "GoDaddy builder assets", t: html(/img1\.wsimg\.com|websites\.godaddy\.com/) }, { w: 30, why: "Generator meta tag", t: gen(/Starfield|Go Daddy/) }] },
  { name: "Duda", category: "Site builder", sigs: [{ w: 70, why: "Duda CDN", t: html(/irp\.cdn-website\.com|dudaone|multiscreensite\.com/) }] },
  { name: "Jimdo", category: "Site builder", sigs: [{ w: 70, why: "Jimdo assets", t: html(/jimdo|jimstatic\.com/) }] },
  { name: "Carrd", category: "Site builder", sigs: [{ w: 70, why: "Carrd assets", t: html(/carrd\.co/) }] },
  { name: "Tilda", category: "Site builder", sigs: [{ w: 70, why: "Tilda CDN", t: html(/tildacdn\.com|tilda\.ws/) }] },
  { name: "Blogger", category: "CMS", sigs: [{ w: 70, why: "Blogger assets", t: html(/blogger\.com\/static|blogblog\.com|\.blogspot\.com/) }, { w: 30, why: "Generator meta tag", t: gen(/Blogger/) }] },
  { name: "Medium", category: "CMS", sigs: [{ w: 70, why: "Medium assets", t: html(/cdn-client\.medium\.com|miro\.medium\.com/) }] },
  { name: "Substack", category: "CMS", sigs: [{ w: 70, why: "Substack assets", t: html(/substackcdn\.com|substack\.com\/api/) }] },
  { name: "TYPO3", category: "CMS", sigs: [{ w: 60, why: "Generator meta tag", t: gen(/TYPO3/) }, { w: 40, why: "typo3 paths", t: html(/\/typo3conf\/|\/typo3temp\//) }] },
  { name: "Craft CMS", category: "CMS", sigs: [{ w: 60, why: "Craft headers/cookies", t: (_, hd) => /craft/i.test(hd["x-powered-by"] ?? "") || /CraftSessionId/.test(hd["set-cookie"] ?? "") }] },
  { name: "Contentful", category: "Headless CMS", sigs: [{ w: 60, why: "Contentful asset CDN", t: html(/images\.ctfassets\.net|ctfassets\.net/) }] },
  { name: "Sanity", category: "Headless CMS", sigs: [{ w: 60, why: "Sanity CDN", t: html(/cdn\.sanity\.io/) }] },
  { name: "Strapi", category: "Headless CMS", sigs: [{ w: 50, why: "Strapi uploads", t: html(/\/uploads\/[a-z0-9_]+_[a-f0-9]{10}\.(jpg|png|webp)|strapi/i) }] },
  { name: "Storyblok", category: "Headless CMS", sigs: [{ w: 60, why: "Storyblok CDN", t: html(/a\.storyblok\.com/) }] },
  { name: "Prismic", category: "Headless CMS", sigs: [{ w: 60, why: "Prismic CDN", t: html(/images\.prismic\.io|prismic\.io/) }] },
  { name: "Lovable", category: "Site builder", sigs: [{ w: 60, why: "Lovable hosting", t: (h, hd) => /lovable\.app|lovable-tagger|gpteng/.test(h) || /lovable/i.test(hd["x-deployed-by"] ?? "") }] },
];

const TECH: { name: string; category: string; t: (h: string, hd: Record<string, string>) => boolean }[] = [
  { name: "Next.js", category: "Framework", t: (h, hd) => /__NEXT_DATA__|\/_next\/static/.test(h) || /next\.js/i.test(hd["x-powered-by"] ?? "") },
  { name: "Nuxt", category: "Framework", t: html(/__NUXT__|\/_nuxt\//) },
  { name: "Gatsby", category: "Framework", t: html(/___gatsby|gatsby-/) },
  { name: "Astro", category: "Framework", t: html(/astro-island|data-astro-/) },
  { name: "SvelteKit", category: "Framework", t: html(/__sveltekit|data-sveltekit/) },
  { name: "Remix", category: "Framework", t: html(/__remixContext/) },
  { name: "Angular", category: "Framework", t: html(/ng-version=|ng-app/) },
  { name: "Vue.js", category: "Framework", t: html(/data-v-[a-f0-9]{8}|vue(\.min|\.runtime)?\.js/) },
  { name: "React", category: "Framework", t: html(/data-reactroot|react-dom|__REACT/) },
  { name: "jQuery", category: "Library", t: html(/jquery(\.min)?\.js|jquery-\d/) },
  { name: "Bootstrap", category: "Library", t: html(/bootstrap(\.min)?\.(css|js)/) },
  { name: "Tailwind CSS", category: "Library", t: html(/class=["'][^"']*\b(?:flex|grid) [^"']*\b(?:px|py|mt|mb)-\d/) },
  { name: "Elementor", category: "Page builder", t: html(/elementor/) },
  { name: "Divi", category: "Page builder", t: html(/themes\/Divi\/|et_pb_/) },
  { name: "WPBakery", category: "Page builder", t: html(/js_composer|vc_row/) },
  { name: "Beaver Builder", category: "Page builder", t: html(/fl-builder/) },
  { name: "Gutenberg blocks", category: "Page builder", t: html(/wp-block-/) },
  { name: "Google Analytics", category: "Analytics", t: html(/googletagmanager\.com\/gtag|google-analytics\.com/) },
  { name: "Google Tag Manager", category: "Analytics", t: html(/googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]+/) },
  { name: "Meta Pixel", category: "Analytics", t: html(/connect\.facebook\.net\/[^"']*fbevents/) },
  { name: "Hotjar", category: "Analytics", t: html(/static\.hotjar\.com/) },
  { name: "Microsoft Clarity", category: "Analytics", t: html(/clarity\.ms/) },
  { name: "Plausible", category: "Analytics", t: html(/plausible\.io\/js/) },
  { name: "Google AdSense", category: "Advertising", t: html(/pagead2\.googlesyndication\.com/) },
  { name: "Stripe", category: "Payments", t: html(/js\.stripe\.com/) },
  { name: "PayPal", category: "Payments", t: html(/paypal\.com\/sdk|paypalobjects/) },
  { name: "Intercom", category: "Support", t: html(/widget\.intercom\.io|intercomcdn/) },
  { name: "Zendesk", category: "Support", t: html(/zdassets\.com|zendesk/) },
  { name: "Cloudflare", category: "CDN / Hosting", t: (_, hd) => !!hd["cf-ray"] || /cloudflare/i.test(hd["server"] ?? "") },
  { name: "Vercel", category: "CDN / Hosting", t: (_, hd) => !!hd["x-vercel-id"] || /vercel/i.test(hd["server"] ?? "") },
  { name: "Netlify", category: "CDN / Hosting", t: (_, hd) => !!hd["x-nf-request-id"] || /netlify/i.test(hd["server"] ?? "") },
  { name: "Fastly", category: "CDN / Hosting", t: (_, hd) => /fastly/i.test((hd["x-served-by"] ?? "") + (hd["via"] ?? "")) },
  { name: "Amazon CloudFront", category: "CDN / Hosting", t: (_, hd) => !!hd["x-amz-cf-id"] },
  { name: "WP Engine", category: "CDN / Hosting", t: (_, hd) => !!hd["wpe-backend"] || /wpengine/i.test(JSON.stringify(hd)) },
  { name: "Kinsta", category: "CDN / Hosting", t: (_, hd) => !!hd["x-kinsta-cache"] },
  { name: "Nginx", category: "Web server", t: hdr("server", /nginx/i) },
  { name: "Apache", category: "Web server", t: hdr("server", /apache/i) },
  { name: "LiteSpeed", category: "Web server", t: hdr("server", /litespeed/i) },
  { name: "PHP", category: "Language", t: (_, hd) => /php/i.test(hd["x-powered-by"] ?? "") || /PHPSESSID/.test(hd["set-cookie"] ?? "") },
  { name: "ASP.NET", category: "Language", t: (_, hd) => /asp\.net/i.test((hd["x-powered-by"] ?? "") + (hd["x-aspnet-version"] ?? "")) },
];

function blockedError(m: M, page: Fetched) {
  if (m.isBlocked(page) && page.html.length < 30000)
    throw new Error("This website blocks automated visitors (bot protection), so it couldn't be scanned. Try another page of the site or a different address.");
}

export async function runCms(m: M, page: Fetched) {
  blockedError(m, page);
  const h = page.html, hd = page.headers;
  const origin = new URL(page.url).origin;
  // Secondary probes for stronger evidence.
  const [wpJson, shopMeta] = await Promise.all([
    /wp-|wordpress/i.test(h) || !/shopify/i.test(h) ? m.fetchJson<{ name?: string; namespaces?: string[] }>(`${origin}/wp-json/`) : null,
    /shopify/i.test(h) ? m.fetchJson<{ myshopify_domain?: string }>(`${origin}/meta.json`) : null,
  ]);
  const results = PLATFORMS.map((p) => {
    const evidence = p.sigs.filter((s) => { try { return s.t(h, hd); } catch { return false; } });
    let score = evidence.reduce((a, s) => a + s.w, 0);
    const why = evidence.map((s) => s.why);
    if (p.name === "WordPress" && wpJson?.namespaces) { score += 50; why.push("WordPress REST API responds"); }
    if (p.name === "Shopify" && shopMeta?.myshopify_domain) { score += 50; why.push("Shopify store metadata endpoint"); }
    return { name: p.name, category: p.category, confidence: Math.min(100, score), evidence: why };
  }).filter((r) => r.confidence >= 15).sort((a, b) => b.confidence - a.confidence);
  const tech = TECH.filter((x) => { try { return x.t(h, hd); } catch { return false; } }).map(({ name, category }) => ({ name, category }));
  const title = h.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? null;
  const lang = h.match(/<html[^>]*\blang=["']([^"']+)/i)?.[1] ?? null;
  return {
    url: page.url, status: page.status, title: title ? m.decode(title) : null, lang,
    generator: m.metaContent(h, "generator"), server: hd["server"] ?? null, poweredBy: hd["x-powered-by"] ?? null,
    responseMs: page.ms, sizeKb: Math.round(page.bytes / 1024),
    results, tech,
  };
}

const SHOP_APPS: [string, RegExp][] = [
  ["Klaviyo", /klaviyo/i], ["Judge.me Reviews", /judge\.me|judgeme/i], ["Yotpo", /yotpo/i], ["Loox Reviews", /loox\.io/i], ["Okendo Reviews", /okendo/i], ["Stamped.io", /stamped\.io/i],
  ["Privy", /privy\.com/i], ["ReCharge Subscriptions", /rechargecdn|rechargepayments/i], ["Skio Subscriptions", /skio/i], ["Gorgias", /gorgias/i], ["Omnisend", /omnisend/i], ["Attentive", /attn\.tv|attentive/i],
  ["Postscript SMS", /postscript\.io/i], ["Hotjar", /hotjar/i], ["Google Analytics", /googletagmanager|google-analytics/i], ["Meta Pixel", /connect\.facebook\.net/i], ["TikTok Pixel", /analytics\.tiktok\.com/i],
  ["Pinterest Tag", /pintrk|s\.pinimg\.com\/ct/i], ["Snapchat Pixel", /sc-static\.net/i], ["Shop Pay", /shop_pay|shopify-pay|shopPay/i], ["Shop Pay Installments", /shopify-installments|shop-pay-installments/i],
  ["PageFly", /pagefly/i], ["GemPages", /gempages/i], ["Shogun", /shogun/i], ["Replo", /replo/i], ["Smile.io Rewards", /smile\.io|smile-ui/i], ["LoyaltyLion", /loyaltylion/i], ["Yotpo Loyalty", /swell|yotpo-loyalty/i],
  ["Tidio Chat", /tidio/i], ["Zendesk", /zdassets/i], ["Intercom", /intercom/i], ["Afterpay", /afterpay/i], ["Klarna", /klarna/i], ["Affirm", /affirm/i], ["Sezzle", /sezzle/i],
  ["Rebuy", /rebuyengine/i], ["Bold Apps", /boldapps|boldcommerce/i], ["Searchanise", /searchanise/i], ["Boost Commerce", /boost-pfs|boostcommerce/i], ["Algolia", /algolia/i], ["Nosto", /nosto/i],
  ["Weglot Translate", /weglot/i], ["Langify", /langify/i], ["Route Protection", /routeapp|route\.com/i], ["Aftership", /aftership/i], ["Wishlist Plus", /swymrelay|swym/i], ["Growave", /growave|socialshopwave/i],
  ["Vitals", /vitals/i], ["Hextom", /hextom/i], ["Lucky Orange", /luckyorange/i], ["Elevar", /elevar/i], ["Triple Whale", /triplewhale|triplepixel/i],
];

export async function runShopify(m: M, page: Fetched) {
  blockedError(m, page);
  const h = page.html, hd = page.headers;
  const origin = new URL(page.url).origin;
  const meta = await m.fetchJson<{ id?: number; name?: string; myshopify_domain?: string; currency?: string; country?: string; city?: string; published_products_count?: number; description?: string }>(`${origin}/meta.json`);
  const isShopify = /cdn\.shopify\.com|\/cdn\/shop\/|Shopify\.theme|myshopify\.com/.test(h) || !!hd["x-shopid"] || !!hd["x-sorting-hat-shopid"] || !!meta?.myshopify_domain;
  if (!isShopify) return { url: page.url, isShopify: false as const };

  let theme: Record<string, unknown> = {};
  const raw = h.match(/Shopify\.theme\s*=\s*(\{[\s\S]*?\});/)?.[1];
  if (raw) { try { theme = JSON.parse(raw); } catch { /* ignore */ } }
  const pick = (re: RegExp) => h.match(re)?.[1];
  const themeName = (theme.name as string | undefined) ?? pick(/BOOMR\.themeName\s*=\s*"([^"]+)"/) ?? pick(/"theme"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"/) ?? null;
  const themeId = theme.id ? String(theme.id) : pick(/BOOMR\.themeId\s*=\s*(\d+)/) ?? pick(/\/cdn\/shop\/t\/(\d+)\//) ?? null;
  const schemaName = (theme.schema_name as string | undefined) ?? pick(/"schema_name"\s*:\s*"([^"]+)"/) ?? null;
  const schemaVer = (theme.schema_version as string | undefined) ?? pick(/"schema_version"\s*:\s*"([^"]+)"/) ?? pick(/BOOMR\.themeVersion\s*=\s*"([^"]+)"/) ?? null;
  const storeId = theme.theme_store_id ? String(theme.theme_store_id) : pick(/"theme_store_id"\s*:\s*(\d+)/) ?? null;
  const shop = pick(/Shopify\.shop\s*=\s*"([^"]+)"/) ?? meta?.myshopify_domain ?? null;
  const currency = pick(/Shopify\.currency\s*=\s*\{[^}]*"active"\s*:\s*"([A-Z]{3})"/) ?? meta?.currency ?? null;
  const locale = pick(/Shopify\.locale\s*=\s*"([^"]+)"/) ?? null;
  const country = pick(/Shopify\.country\s*=\s*"([^"]+)"/) ?? meta?.country ?? null;
  const os2 = /"schema_name"|shopify-section-template--|\/sections\//.test(h);
  const headless = /hydrogen|oxygen/i.test(JSON.stringify(hd)) || /hydrogen/i.test(h.slice(0, 5000));
  const apps = SHOP_APPS.filter(([, r]) => r.test(h)).map(([n]) => n);
  const q = schemaName ?? themeName ?? "";
  return {
    url: page.url,
    isShopify: true as const,
    shop, storeName: meta?.name ?? null, storeDescription: meta?.description ?? null,
    themeName, themeId, role: (theme.role as string | undefined) ?? null,
    schemaName, version: schemaVer, themeStoreId: storeId,
    isCustom: !storeId && !schemaName,
    themeStoreLink: q ? `https://themes.shopify.com/themes?q=${encodeURIComponent(q)}` : null,
    currency, locale, country, productsCount: meta?.published_products_count ?? null,
    onlineStore2: os2, headless,
    apps,
  };
}

type WpPlugin = { slug: string; version: string | null; url: string };

export async function runWordpress(m: M, page: Fetched) {
  blockedError(m, page);
  const h = page.html;
  const origin = new URL(page.url).origin;
  const api = await m.fetchJson<{ name?: string; description?: string; url?: string; namespaces?: string[] }>(`${origin}/wp-json/`);
  const isWp = /wp-content\/|wp-includes\//.test(h) || !!api?.namespaces || /generator["'][^>]*WordPress/i.test(h);
  if (!isWp) return { url: page.url, isWordPress: false as const };

  // Themes: asset paths (also absolute CDN URLs) + stylesheet ids.
  const themeSlugs = [...new Set([...h.matchAll(/wp-content\/themes\/([a-zA-Z0-9_.-]+)\//g)].map((x) => x[1]))];
  const parseHeader = (css: string) => {
    const block = css.match(/\/\*([\s\S]*?)\*\//)?.[1] ?? "";
    const get = (k: string) => block.match(new RegExp(`^[\\s*]*${k}\\s*:\\s*(.+)$`, "im"))?.[1]?.trim() ?? null;
    return { name: get("Theme Name"), version: get("Version"), author: get("Author"), authorUri: get("Author URI"), themeUri: get("Theme URI"), description: get("Description"), template: get("Template"), license: get("License"), requires: get("Requires at least"), textDomain: get("Text Domain") };
  };
  const themes = await Promise.all(themeSlugs.slice(0, 4).map(async (slug) => {
    const r = await m.fetchText(`${origin}/wp-content/themes/${slug}/style.css`, 20_000);
    const head = r.ok && /Theme Name/i.test(r.text) ? parseHeader(r.text) : null;
    return { slug, ...(head ?? {}), found: !!head, screenshot: `${origin}/wp-content/themes/${slug}/screenshot.png`, directory: `https://wordpress.org/themes/${slug}/` };
  }));
  // Put the active (child) theme first.
  themes.sort((a, b) => Number(!!("template" in b && b.template)) - Number(!!("template" in a && a.template)));
  const child = themes.find((t) => "template" in t && t.template);

  // Plugins from asset paths with versions.
  const pmap = new Map<string, string | null>();
  for (const x of h.matchAll(/wp-content\/plugins\/([a-zA-Z0-9_.-]+)\/[^"'\s)]*?(?:\?ver=([\w.-]+))?["'\s)]/g)) {
    if (!pmap.has(x[1]) || (!pmap.get(x[1]) && x[2])) pmap.set(x[1], x[2] ?? null);
  }
  // Plugins from REST namespaces.
  const NS: Record<string, string> = { "wc/v3": "woocommerce", "yoast/v1": "wordpress-seo", "rankmath/v1": "seo-by-rank-math", "elementor/v1": "elementor", "contact-form-7/v1": "contact-form-7", "jetpack/v4": "jetpack", "wpforms/v1": "wpforms-lite", "gf/v2": "gravityforms", "litespeed/v1": "litespeed-cache", "redirection/v1": "redirection", "wordfence/v1": "wordfence", "akismet/v1": "akismet", "mailchimp-for-wp/v1": "mailchimp-for-wp", "wp-rocket/v1": "wp-rocket", "aioseo/v1": "all-in-one-seo-pack", "tribe/events/v1": "the-events-calendar", "ninja-forms/v1": "ninja-forms", "wpml/v1": "sitepress-multilingual-cms", "pll/v1": "polylang", "llar/v1": "limit-login-attempts-reloaded", "complianz/v1": "complianz-gdpr", "wp-statistics/v2": "wp-statistics" };
  for (const ns of api?.namespaces ?? []) { const s = NS[ns]; if (s && !pmap.has(s)) pmap.set(s, null); }
  // Comment / class fingerprints.
  const FP: [string, RegExp][] = [["wordpress-seo", /Yoast SEO/i], ["seo-by-rank-math", /Rank Math/i], ["all-in-one-seo-pack", /All in One SEO/i], ["wp-rocket", /WP Rocket/i], ["w3-total-cache", /W3 Total Cache/i], ["wp-super-cache", /WP-Super-Cache/i], ["litespeed-cache", /LiteSpeed Cache/i], ["autoptimize", /autoptimize/i], ["elementor", /elementor-/], ["google-site-kit", /Site Kit by Google/i], ["jetpack", /jetpack/i]];
  for (const [s, re] of FP) if (re.test(h) && !pmap.has(s)) pmap.set(s, null);
  const plugins: WpPlugin[] = [...pmap].slice(0, 60).map(([slug, version]) => ({ slug, version, url: `https://wordpress.org/plugins/${slug}/` }));

  const wpVer = m.metaContent(h, "generator")?.match(/WordPress\s*([\d.]+)/i)?.[1] ?? h.match(/wp-includes\/[^"']+\?ver=(\d+\.\d+(?:\.\d+)?)/)?.[1] ?? null;
  const ecommerce = pmap.has("woocommerce") || /woocommerce/.test(h);
  const builders = [["Elementor", /elementor/], ["Divi", /et_pb_|themes\/Divi/], ["WPBakery", /js_composer|vc_row/], ["Beaver Builder", /fl-builder/], ["Oxygen", /oxygen-/], ["Bricks", /bricks-/], ["Gutenberg", /wp-block-/]].filter(([, r]) => (r as RegExp).test(h)).map(([n]) => n as string);
  return {
    url: page.url,
    isWordPress: true as const,
    siteName: api?.name ?? null, tagline: api?.description ?? null,
    wpVersion: wpVer, restApi: !!api?.namespaces, ecommerce, builders,
    themes,
    parentTheme: child && "template" in child ? child.template : null,
    plugins,
  };
}
