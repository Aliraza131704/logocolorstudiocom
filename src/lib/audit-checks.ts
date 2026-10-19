import { parseHTML } from "linkedom";
import type { Fetched } from "./analyze.server";
import type { AuditCategory, AuditFinding, AuditSeverity, AuditStatus } from "./audit-types";

export function inspectAuditPage(page: Fetched) {
  const { document } = parseHTML(page.html);
  const findings: AuditFinding[] = [];
  const all = (selector: string) => Array.from(document.querySelectorAll(selector));
  const text = (element: Element) => (element.textContent ?? "").replace(/\s+/g, " ").trim();
  const meta = (key: string) => all("meta").find(e => (e.getAttribute("name") ?? e.getAttribute("property") ?? "").toLowerCase() === key)?.getAttribute("content") ?? "";
  const add = (id: string, category: AuditCategory, label: string, status: AuditStatus, evidence: string, explanation: string, fix: string, example?: string, severity: AuditSeverity = "medium") => findings.push({ id: `${page.url}#${id}`, category, label, status, severity, url: page.url, evidence: evidence.slice(0, 1800), explanation, fix, example });
  const check = (id: string, category: AuditCategory, label: string, pass: boolean, evidence: string, explanation: string, fix: string, example?: string, severity: AuditSeverity = "medium") => add(id, category, label, pass ? "Passed" : "Failed", evidence, explanation, fix, example, severity);
  const title = document.querySelector("title")?.textContent?.trim() ?? "";
  check("title", "SEO", "Page title", title.length >= 10 && title.length <= 60, title ? `“${title}” · ${title.length} characters` : "No title element", "A descriptive title helps people identify a page in search results. Length is an editorial guideline, not a ranking guarantee.", "Give this page a unique, descriptive title.", '<title>Service name | Business name</title>', "high");
  const description = meta("description");
  check("description", "SEO", "Meta description", description.length >= 50 && description.length <= 160, description ? `${description} · ${description.length} characters` : "No description metadata", "Search engines may use this summary; displayed length varies.", "Write a page-specific summary of roughly 120–160 characters.", '<meta name="description" content="A concise summary of the service and its main benefit.">');
  const h1s = all("h1");
  check("h1", "SEO", "Primary heading", h1s.length === 1, `${h1s.length} H1 elements: ${h1s.map(text).join("; ")}`, "One clear primary heading improves document structure.", "Use a descriptive primary heading; organize subsections with H2/H3.", "<h1>Your main service</h1>");
  const canonical = all("link").find(e => (e.getAttribute("rel") ?? "").split(/\s+/).includes("canonical"))?.getAttribute("href");
  let canonicalValid = false;
  try { canonicalValid = !!canonical && ["http:", "https:"].includes(new URL(canonical).protocol); } catch { /* invalid URL */ }
  check("canonical", "SEO", "Absolute canonical URL", canonicalValid, canonical ?? "No canonical link", "An absolute canonical declares a preferred URL; this does not verify Google's selected canonical.", "Set an absolute canonical to the preferred public page.", `<link rel="canonical" href="${page.url.replace(/"/g, "&quot;")}">`);
  const robots = `${meta("robots")} ${page.headers["x-robots-tag"] ?? ""}`.trim();
  add("indexability", "SEO", "Indexing directive", /noindex|none/i.test(robots) ? "Warning" : "Passed", robots || "No noindex directive in HTML or response headers", "A noindex directive may be intentional. This is not a live indexing-status check.", "Remove noindex only if this page should appear in search results.", undefined, "high");
  check("sharing", "SEO", "Social sharing metadata", !!meta("og:title") && !!meta("og:description") && /^https:\/\//.test(meta("og:image")), `Title: ${meta("og:title") || "missing"}; description: ${meta("og:description") || "missing"}; image: ${meta("og:image") || "missing"}`, "Sharing previews use these tags; image retrieval is not validated by this check.", "Add page-specific title, description and an absolute HTTPS image URL.", '<meta property="og:title" content="Your page title">');
  const htmlElement = document.querySelector("html");
  check("lang", "Accessibility", "Document language", !!htmlElement?.getAttribute("lang"), `lang=${htmlElement?.getAttribute("lang") ?? "missing"}`, "Assistive technology uses the document language for pronunciation.", "Set the correct language code on the HTML element.", '<html lang="en">');
  const viewport = meta("viewport");
  check("viewport", "Mobile", "Responsive viewport declaration", /width\s*=\s*device-width/i.test(viewport), viewport || "No viewport metadata", "This declaration supports mobile layout; actual rendered layout is not tested.", "Use device width and an initial scale of 1.", '<meta name="viewport" content="width=device-width, initial-scale=1">', "high");
  check("zoom", "Mobile", "Zoom remains enabled", !/user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(?:\.0)?(?:\s*[,;]|$)/i.test(viewport), viewport || "No zoom restriction declared", "Disabling zoom can prevent people from enlarging text.", "Remove user-scalable=no and restrictive maximum-scale.");
  const images = all("img");
  const missingAlt = images.filter(e => !e.hasAttribute("alt"));
  check("alt", "Accessibility", "Image alt attributes", missingAlt.length === 0, `${missingAlt.length}/${images.length} images missing alt: ${missingAlt.slice(0, 5).map(e => e.outerHTML.slice(0, 180)).join("; ")}`, "Empty alt can be correct for decoration. Descriptive accuracy requires human review.", "Add meaningful alt text, or alt=\"\" for decorative images.", '<img src="product.webp" alt="Blue ceramic mug">', "high");
  const unlabeled = all("button").filter(e => !text(e) && !e.getAttribute("aria-label") && !e.getAttribute("aria-labelledby") && !e.querySelector("img[alt]"));
  check("buttons", "Accessibility", "Button label signals", unlabeled.length === 0, `${unlabeled.length} buttons without a static text or label signal`, "This checks markup signals, not the browser-computed accessible name.", "Provide a visible label or accessible name.", '<button aria-label="Search">…</button>');
  const headingLevels = all("h1,h2,h3,h4,h5,h6").map(e => Number(e.tagName.slice(1)));
  const skips = headingLevels.filter((n, i) => i > 0 && n > headingLevels[i - 1] + 1).length;
  check("headings", "Accessibility", "Heading hierarchy", skips === 0, `${skips} skipped heading levels; sequence: ${headingLevels.join(", ") || "none"}`, "Sequential headings improve navigation for assistive technology.", "Avoid jumping from H1 directly to H3.");
  check("https", "Security", "HTTPS connection", page.url.startsWith("https:"), page.url, "HTTPS encrypts transport; certificate configuration is not separately tested.", "Serve all public pages over HTTPS and redirect HTTP traffic.", undefined, "critical");
  const mixed = all("img[src],script[src],link[href],iframe[src]").filter(e => /^http:\/\//i.test(e.getAttribute("src") ?? e.getAttribute("href") ?? ""));
  check("mixed", "Security", "Insecure resource references", mixed.length === 0, `${mixed.length} HTTP resource references: ${mixed.slice(0, 4).map(e => e.outerHTML.slice(0, 140)).join("; ")}`, "HTTP assets on HTTPS pages can be blocked or weaken transport privacy.", "Use HTTPS URLs for resources.", undefined, "high");
  for (const [key, label, why, example] of [
    ["strict-transport-security", "HSTS header", "HSTS tells browsers to prefer HTTPS after a secure visit.", "Strict-Transport-Security: max-age=31536000"],
    ["content-security-policy", "Content Security Policy", "A suitable policy can reduce script injection impact; presence alone does not prove a secure policy.", "Content-Security-Policy: default-src 'self'; object-src 'none'; base-uri 'self'"],
    ["x-content-type-options", "Content type protection", "nosniff reduces MIME-type guessing.", "X-Content-Type-Options: nosniff"],
    ["referrer-policy", "Referrer policy", "A referrer policy limits information sent to other websites.", "Referrer-Policy: strict-origin-when-cross-origin"],
  ]) add(key, "Security", label, page.headers[key] ? "Passed" : "Warning", page.headers[key] ?? "Header not returned", why, "Review this header with your hosting configuration and test compatibility.", example);
  const scripts = all("script[src]");
  add("scripts", "Performance", "External script count", scripts.length <= 20 ? "Passed" : "Warning", `${scripts.length} external script elements in fetched HTML`, "Script count is a static heuristic; execution cost is not measured.", "Remove unused scripts and defer non-critical scripts.", '<script src="app.js" defer></script>', "low");
  add("size", "Performance", "Downloaded HTML size", page.bytes <= 300_000 ? "Passed" : "Warning", `${page.bytes} bytes of decoded HTML downloaded`, "This measures fetched HTML, not total page transfer or browser resource weight.", "Reduce duplicate markup and large inline data.");
  add("duration", "Performance", "Fetch duration observation", "Not Tested", `${page.ms} ms including DNS screening and HTML download`, "This is a single network observation, not TTFB, Lighthouse or a performance score.", "Measure Core Web Vitals with a rendered-browser or field-data service.");
  const noDimensions = images.filter(e => !e.getAttribute("width") || !e.getAttribute("height"));
  add("dimensions", "Images", "Image dimension attributes", noDimensions.length ? "Warning" : "Passed", `${noDimensions.length}/${images.length} images without both width and height attributes`, "CSS may reserve space instead. Missing attributes are a review hint, not measured layout shift.", "Reserve image aspect ratios with dimensions or CSS.", '<img src="photo.webp" width="1200" height="800" alt="…">');
  add("lazy", "Images", "Image loading hints", images.length < 4 || images.some(e => e.getAttribute("loading") === "lazy") ? "Passed" : "Warning", `${images.filter(e => e.getAttribute("loading") === "lazy").length}/${images.length} images use loading=lazy`, "The scanner cannot determine which images are below the fold.", "Lazy-load below-the-fold images, not the main visible image.", '<img loading="lazy" src="photo.webp" alt="…">', "low");
  const body = document.querySelector("body");
  body?.querySelectorAll("script,style,noscript,template").forEach(e => e.remove());
  const bodyText = body ? text(body) : "";
  const words = bodyText.split(/\s+/).filter(Boolean).length;
  add("content", "Content", "Content depth signal", words >= 150 ? "Passed" : "Warning", `${words} words in static body text`, "Length is not quality; short utility and contact pages can be appropriate. Script-rendered content is excluded.", "Review whether the page answers its visitors' questions with useful examples.", undefined, "low");
  const typos: Record<string, string> = { teh: "the", recieve: "receive", definately: "definitely", seperate: "separate", accomodate: "accommodate", occured: "occurred", succesful: "successful", buisness: "business" };
  const foundTypos = Object.entries(typos).filter(([word]) => new RegExp(`\\b${word}\\b`, "i").test(bodyText));
  add("spelling", "Content", "Common English spelling review", foundTypos.length ? "Warning" : "Passed", foundTypos.length ? foundTypos.map(([a, b]) => `${a} → ${b}`).join("; ") : "No matches in the limited eight-word typo checklist", "This is a limited English typo checklist, not complete spelling or grammar analysis. Names may be intentional.", "Review the matched words in context before correcting them.", foundTypos.length ? foundTypos.map(([a, b]) => `${a} → ${b}`).join("\n") : undefined, "low");
  const ctas = all("a,button,input[type=submit]").filter(e => /contact|buy|shop|start|book|subscribe|download|sign up|try|get started/i.test(text(e) || e.getAttribute("value") || ""));
  add("cta", "CRO", "Action wording signals", ctas.length ? "Passed" : "Warning", `${ctas.length} action labels matched: ${ctas.slice(0, 5).map(text).join("; ")}`, "Keyword matching is a CRO hint, not evidence of conversion performance or placement.", "Use one relevant, specific primary action and test it with real visitors.", '<a href="/contact">Book a consultation</a>', "low");
  const forms = all("form");
  const controls = all("input:not([type=hidden]):not([type=submit]):not([type=button]),select,textarea");
  const unlabeledControls = controls.filter(e => {
    const id = e.getAttribute("id");
    return !e.getAttribute("aria-label") && !e.getAttribute("aria-labelledby") && !e.closest("label") && !all("label").some(l => id && l.getAttribute("for") === id);
  });
  if (controls.length) check("form-labels", "Forms", "Form field label signals", unlabeledControls.length === 0, `${unlabeledControls.length}/${controls.length} fields without associated static labels`, "Placeholders are not a substitute for labels. Computed accessible names are not tested.", "Associate a label with every field.", '<label for="email">Email</label>\n<input id="email" name="email" type="email">', "high");
  else add("form-labels", "Forms", "Form field labels", "Not Tested", "No form controls in fetched HTML", "There are no static controls to inspect.", "Review any forms that appear after JavaScript runs.");
  add("form-submission", "Forms", "Form submission and validation", "Not Tested", `${forms.length} form elements; no submissions attempted`, "Forms are never submitted, avoiding account changes, messages and purchases.", "Test required fields, validation and success/error states in an authorized test environment.");
  const navs = all("nav,[role=navigation]");
  add("navigation", "Navigation", "Navigation landmark", navs.length ? "Passed" : "Warning", `${navs.length} navigation landmarks`, "Simple single-page sites may not need a navigation region.", "Wrap primary navigation in a named nav element.", '<nav aria-label="Main">…</nav>', "low");
  const genericLinks = all("a[href]").filter(e => /^(click here|here|read more)$/i.test(text(e)) && !e.getAttribute("aria-label"));
  add("link-labels", "Navigation", "Descriptive link text", genericLinks.length ? "Warning" : "Passed", `${genericLinks.length} generic link labels: ${genericLinks.slice(0, 5).map(text).join("; ")}`, "Generic labels can be ambiguous outside surrounding context.", "Name the destination or action in the link label.", '<a href="/services">Explore our design services</a>', "low");
  const links = [...new Set(all("a[href]").map(e => e.getAttribute("href") ?? "").filter(h => h && !/^(#|mailto:|tel:|javascript:|data:)/i.test(h)).flatMap(h => { try { return [new URL(h, page.url).href.split("#")[0]]; } catch { return []; } }))];
  const longUrls = links.filter(h => h.length > 200 || /[?&](session|token|password)=/i.test(h));
  add("urls", "Links", "URL hygiene signals", longUrls.length ? "Warning" : "Passed", `${longUrls.length} long or sensitive-parameter URL signals; ${links.length} unique links`, "Length is a review hint; authentication data should not be placed in public URLs.", "Keep public URLs descriptive and avoid exposing sensitive query parameters.", undefined, "low");
  const schemas: unknown[] = [];
  const schemaElements = all('script[type="application/ld+json"]');
  // These scripts may have been removed from body above, so parse schema from the original document.
  const original = parseHTML(page.html).document;
  const originalSchemas = Array.from(original.querySelectorAll('script[type="application/ld+json"]'));
  let invalidSchema = 0;
  for (const element of originalSchemas) { try { schemas.push(JSON.parse(element.textContent ?? "")); } catch { invalidSchema++; } }
  const schemaTypes: string[] = [];
  const collect = (v: unknown, depth = 0) => {
    if (depth > 12 || !v || typeof v !== "object") return;
    if (Array.isArray(v)) { v.forEach(x => collect(x, depth + 1)); return; }
    const object = v as Record<string, unknown>;
    if (typeof object["@type"] === "string") schemaTypes.push(object["@type"]);
    if (Array.isArray(object["@type"])) object["@type"].forEach(t => { if (typeof t === "string") schemaTypes.push(t); });
    Object.values(object).forEach(x => collect(x, depth + 1));
  };
  schemas.forEach(s => collect(s));
  add("schema", "Schema", "JSON-LD syntax and type signals", invalidSchema ? "Failed" : originalSchemas.length ? "Passed" : "Warning", `${originalSchemas.length} JSON-LD blocks; ${invalidSchema} invalid JSON; types: ${[...new Set(schemaTypes)].join(", ") || "none"}`, "Valid JSON is not a full schema.org or rich-result eligibility validation.", "Add appropriate schema with valid JSON and verify required fields in a rich-result validator.", '{"@context":"https://schema.org","@type":"Organization","name":"Business name"}');
  const local = schemaTypes.some(t => /LocalBusiness|Store|Restaurant|Dentist|Hotel/.test(t));
  add("local", "Local SEO", "Local business markup", local ? "Passed" : "Not Tested", local ? `Local type detected: ${schemaTypes.join(", ")}` : "No explicit local-business type; applicability unknown", "This does not verify Google Business Profile, citations or address consistency.", "If this is a local business, add an accurate address, opening hours and business type.");
  const product = schemaTypes.includes("Product") || /woocommerce|Shopify\./i.test(page.html);
  add("product", "E-commerce", "Product markup signal", product ? (schemaTypes.includes("Product") ? "Passed" : "Warning") : "Not Tested", product ? `Product/CMS signals; schema types: ${schemaTypes.join(", ") || "none"}` : "No clear store or product signal", "Store applicability is inferred from static markup. No cart, checkout, payment or purchase is tested.", "Use accurate Product and Offer markup on product pages and manually test checkout.");
  const imageUrls = images.flatMap(e => { const src = e.getAttribute("src"); try { return src && !src.startsWith("data:") ? [new URL(src, page.url).href] : []; } catch { return []; } });
  return { findings, title, links, imageUrls };
}