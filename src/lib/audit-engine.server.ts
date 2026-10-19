import { getRequestHeader } from "@tanstack/react-start/server";
import { auditFetch, blockedAuditPage, robotsAllowed } from "./audit-fetch.server";
import { publicWebsiteUrl } from "./audit-url";
import { crawlUrl } from "./audit-crawl";
import { inspectAuditPage } from "./audit-checks";
import { MAX_AUDIT_LINKS, summarizeAudit, type AuditFinding, type AuditOptions, type AuditReport } from "./audit-types";

export async function consumeAuditRequest() {
  const ip = getRequestHeader("cf-connecting-ip") || getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("consume_audit_request", { _ip: ip });
  if (error) throw new Error("Audit request checks are temporarily unavailable. Please try again later.");
  if (!data) throw new Error("Too many audits. Please wait a minute before starting another scan.");
}

export async function runWebsiteAudit(options: AuditOptions): Promise<AuditReport> {
  const started = Date.now();
  const target = publicWebsiteUrl(options.url);
  const findings: AuditFinding[] = [];
  const pages: AuditReport["pages"] = [];
  const notes = ["Static HTML audit; scripts are not executed. Scores describe tested checks only, not full website quality.", "Recommendations are evidence-based rules, not generated assessments. No complete grammar analysis, conversion measurements or screenshots.", "DNS screening and redirect validation reduce SSRF risk; this host cannot pin outbound DNS. No credentials are sent or forms submitted."];
  const maxDuration = 45_000;
  const requestCache = new Map<string, Awaited<ReturnType<typeof auditFetch>>>();
  let requests = 0;
  async function request(url: string, method: "GET" | "HEAD" = "GET", max?: number) {
    if (Date.now() - started > maxDuration || requests >= 24) throw new Error("Scan budget reached; remaining checks were not tested.");
    const key = `${method} ${url}`;
    const cached = requestCache.get(key);
    if (cached) return cached;
    requests++;
    const result = await auditFetch(url, method, max);
    requestCache.set(key, result);
    return result;
  }
  const robotsUrl = new URL("/robots.txt", target).href;
  let robotsText = "";
  const robots = await request(robotsUrl, "GET", 100_000);
  if (robots.status >= 500 || robots.status === 429 || robots.truncated) throw new Error("The website's crawl policy could not be safely read. No audit was performed.");
  if (robots.status >= 200 && robots.status < 300) {
    if (/text\/html/i.test(robots.headers["content-type"] ?? "") || /<html/i.test(robots.html)) throw new Error("The website returned HTML instead of a readable crawl policy. No audit was performed.");
    robotsText = robots.html;
  }
  if (!robotsAllowed(robotsText, target)) throw new Error("This website's robots.txt disallows scanning this page. No audit was performed.");
  const queue = options.pageUrls?.map(url => {
    const u = publicWebsiteUrl(url);
    if (!crawlUrl(u.href, target.origin)) throw new Error("Scan pages must be safe URLs on the selected website.");
    return u.href;
  }) ?? [target.href];
  const discovery = new Set<string>();
  const seen = new Set<string>();
  const discoveredLinks = new Set<string>();
  const discoveredImages = new Set<string>();
  let firstPage: Awaited<ReturnType<typeof auditFetch>> | undefined;
  while (queue.length && pages.length < options.maxPages) {
    const url = queue.shift();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    let normalized: URL;
    try { normalized = publicWebsiteUrl(url); } catch { continue; }
    if (normalized.origin !== target.origin || !robotsAllowed(robotsText, normalized)) continue;
    try {
      const page = await request(url);
      if (!firstPage && blockedAuditPage(page)) throw new Error("This website restricts automated access. No audit score was created.");
      if (!firstPage && page.status >= 400) throw new Error(`The website returned HTTP ${page.status}. No page audit was performed.`);
      if (!/text\/html|application\/xhtml\+xml/i.test(page.headers["content-type"] ?? "")) throw new Error("This address did not return an HTML web page.");
      if (new URL(page.url).origin !== target.origin && pages.length) throw new Error("Page redirected outside the selected website; skipped.");
      if (!robotsAllowed(robotsText, new URL(page.url))) throw new Error("Redirected path is excluded by robots.txt.");
      if (!firstPage) firstPage = page;
      if (blockedAuditPage(page) || page.status >= 400) throw new Error(`HTTP ${page.status} or restricted page; not parsed.`);
      const inspected = inspectAuditPage(page);
      pages.push({ url: page.url, status: page.status, bytes: page.bytes, responseMs: page.ms, title: inspected.title });
      findings.push(...inspected.findings);
      if (page.truncated) notes.push(`HTML for ${page.url} exceeded the 1 MB limit; checks cover only downloaded markup.`);
      inspected.links.forEach(href => {
        discoveredLinks.add(href);
        const eligible = crawlUrl(href, target.origin);
        if (eligible && robotsAllowed(robotsText, new URL(eligible)) && discovery.size < 1000) discovery.add(eligible);
        try {
          const u = publicWebsiteUrl(href);
          if (!options.pageUrls && u.origin === target.origin && !u.search && !/\.(pdf|zip|png|jpe?g|gif|webp|svg|mp4|mp3)$/i.test(u.pathname) && !/\/(logout|signout|delete|remove|cart|checkout)(\/|$)/i.test(u.pathname) && !seen.has(u.href) && queue.length < 12) queue.push(u.href);
        } catch { /* unsafe or non-web URL is not crawled */ }
      });
      inspected.imageUrls.forEach(href => discoveredImages.add(href));
    } catch (error) {
      if (!firstPage && !options.pageUrls) throw error;
      notes.push(`${url}: ${error instanceof Error ? error.message : "Page unavailable"}`);
    }
  }
  if (!firstPage || !pages.length) throw new Error("No public HTML pages could be audited.");
  const reportUrl = firstPage.url;
  const add = (finding: Omit<AuditFinding, "id" | "url"> & { id: string; url?: string }) => findings.push({ ...finding, id: `scan#${finding.id}`, url: finding.url ?? reportUrl });
  add({ id: "robots", category: "SEO", label: "robots.txt availability", status: robots.status >= 200 && robots.status < 300 ? "Passed" : "Warning", severity: "low", url: robotsUrl, evidence: `HTTP ${robots.status}; selected path permitted`, explanation: "A missing robots.txt does not itself prevent indexing. Crawl restrictions were honored for this scan.", fix: "Publish a plain-text crawl policy with a sitemap reference if appropriate." });
  const sitemapMatch = robotsText.match(/^sitemap:\s*(https?:\/\/\S+)/im)?.[1];
  const sitemapUrl = sitemapMatch ?? new URL("/sitemap.xml", target).href;
  try {
    if (new URL(sitemapUrl).origin !== target.origin) throw new Error("Sitemap is external; not fetched by this same-origin scan.");
    const sitemap = await request(sitemapUrl, "GET", 200_000);
    const valid = sitemap.status === 200 && /<(urlset|sitemapindex)(\s|>)/i.test(sitemap.html);
    if (options.discoverSite && valid) {
      const { parseHTML } = await import("linkedom");
      const locations = (xml: string) => [...parseHTML(xml).document.querySelectorAll("loc")].map(el => el.textContent?.trim() ?? "");
      const collect = (xml: string) => locations(xml).forEach(href => { const u = crawlUrl(href, target.origin); if (u && robotsAllowed(robotsText, new URL(u)) && discovery.size < 1000) discovery.add(u); });
      if (/<urlset(\s|>)/i.test(sitemap.html)) collect(sitemap.html);
      else {
        const children = locations(sitemap.html).slice(0, 3);
        notes.push("Sitemap index discovery inspects up to three child documents; larger or nested indexes may remain partially discovered.");
        for (const child of children) {
          try {
            const u = publicWebsiteUrl(child);
            if (u.origin !== target.origin || !robotsAllowed(robotsText, u)) continue;
            const xml = await request(u.href, "GET", 200_000);
            if (xml.status === 200 && /<urlset(\s|>)/i.test(xml.html)) collect(xml.html);
            if (xml.truncated) notes.push(`Sitemap ${child} was truncated; some URLs may not be discovered.`);
          } catch { notes.push(`Sitemap ${child} could not be read.`); }
        }
      }
    }
    add({ id: "sitemap", category: "SEO", label: "Sitemap document signal", status: valid ? "Passed" : "Warning", severity: "medium", url: sitemapUrl, evidence: `HTTP ${sitemap.status}; XML root ${valid ? "found" : "not found"}${sitemap.truncated ? "; truncated" : ""}`, explanation: "This validates availability and XML-root signals, not every listed URL or Google submission.", fix: "Publish an XML sitemap containing canonical, indexable pages." });
  } catch (error) { add({ id: "sitemap", category: "SEO", label: "Sitemap document", status: "Not Tested", severity: "medium", url: sitemapUrl, evidence: error instanceof Error ? error.message : "Unavailable", explanation: "The sitemap was not inspected.", fix: "Check sitemap access and retry." }); }
  const links = [...discoveredLinks].flatMap(href => {
    try {
      const u = publicWebsiteUrl(href);
      return u.origin === target.origin && !u.search && robotsAllowed(robotsText, u) && !/\/(logout|signout|delete|remove|cart|checkout)(\/|$)/i.test(u.pathname) ? [u.href] : [];
    } catch { return []; }
  }).slice(0, MAX_AUDIT_LINKS);
  async function checkResource(url: string, category: "Links" | "Images", index: number) {
    try {
      const response = await request(url, "HEAD");
      const blocked = [401, 403, 429, 405].includes(response.status);
      add({ id: `${category}-${index}`, category, label: category === "Links" ? "Sampled link availability" : "Sampled image availability", status: blocked ? "Not Tested" : response.status >= 400 ? "Failed" : "Passed", severity: category === "Links" ? "high" : "medium", url, evidence: `HEAD returned HTTP ${response.status}`, explanation: blocked ? "Restricted or unsupported HEAD request is not proof of a broken resource." : "This checks HTTP availability, not rendered content or successful image decoding.", fix: "Repair the URL or resource if missing; verify restricted resources manually." });
    } catch (error) { add({ id: `${category}-${index}`, category, label: "Resource availability", status: "Not Tested", severity: "medium", url, evidence: error instanceof Error ? error.message : "Request failed", explanation: "An unreachable resource is not automatically labeled broken.", fix: "Verify access manually and retry the scan." }); }
  }
  if (options.checkLinks && links.length) {
    for (let i = 0; i < links.length; i += 3) await Promise.all(links.slice(i, i + 3).map((url, j) => checkResource(url, "Links", i + j)));
  } else add({ id: "links-off", category: "Links", label: "Sampled link availability", status: "Not Tested", severity: "medium", evidence: options.checkLinks ? "No eligible same-origin links" : "Disabled in scan settings", explanation: "Only same-origin, permitted links are sampled, up to 12. External links are excluded.", fix: "Enable link checking or inspect other URLs separately." });
  const images = [...discoveredImages].filter(href => { try { const u = publicWebsiteUrl(href); return u.origin === target.origin && robotsAllowed(robotsText, u); } catch { return false; } }).slice(0, 4);
  if (options.checkImages && images.length) await Promise.all(images.map((url, index) => checkResource(url, "Images", index)));
  else add({ id: "images-off", category: "Images", label: "Image HTTP availability", status: "Not Tested", severity: "low", evidence: options.checkImages ? "No eligible same-origin image URLs" : "Disabled in scan settings", explanation: "External CDN images and actual image decoding are not tested.", fix: "Review externally hosted and script-loaded images in a browser." });
  const m = await import("./analyze.server");
  const { runCms } = await import("./detect.server");
  const detection = await runCms(m, firstPage, false);
  const detected = detection.results.map(r => `${r.name}: ${r.evidence.join(", ")}`).concat(detection.tech.map(t => `${t.name} (${t.category})`));
  add({ id: "cms", category: "Technology", label: "CMS and technology fingerprints", status: detected.length ? "Passed" : "Not Tested", severity: "low", evidence: detected.join("; ") || "No known fingerprint detected", explanation: "Static HTML and response-header fingerprints indicate possible technologies, not verified versions or vulnerability status.", fix: "Confirm detected tools with the website owner before implementing platform-specific changes." });
  for (const [id, category, label, evidence] of [
    ["visual", "Visual", "Desktop/mobile rendering and screenshots", "No browser-rendering service connected; overlaps, overflow, missing sections and pixel layouts were not measured."],
    ["responsive", "Mobile", "Rendered responsive usability", "No rendered-browser checks; touch targets, breakpoints and mobile navigation untested."],
    ["contrast", "Accessibility", "Rendered contrast and keyboard interaction", "No computed colors, focus order, screen-reader or keyboard-interaction measurements."],
    ["vitals", "Performance", "Core Web Vitals and Lighthouse", "No browser/field metrics provider; LCP, CLS, INP and Lighthouse untested."],
    ["grammar", "Content", "Full spelling and grammar", "Only a limited typo checklist is available; full language analysis is not connected."],
    ["javascript", "JavaScript", "Runtime errors", "JavaScript was not executed. Browser console errors and dynamic routes untested."],
  ] as const) add({ id, category, label, status: "Not Tested", severity: "medium", evidence, explanation: "No result or metric is inferred for this unsupported check.", fix: "Use an authorized rendered-browser or specialist review for this check." });
  const duplicateTitles = pages.filter((p, i) => p.title && pages.findIndex(other => other.title === p.title) !== i);
  if (pages.length > 1) add({ id: "duplicate-titles", category: "SEO", label: "Duplicate titles across scanned pages", status: duplicateTitles.length ? "Warning" : "Passed", severity: "medium", evidence: duplicateTitles.length ? duplicateTitles.map(p => `${p.url}: ${p.title}`).join("; ") : `${pages.length} scanned pages have no duplicate non-empty titles`, explanation: "This compares only the small scanned sample, not the whole site.", fix: "Give each distinct page a unique title." });
  notes.push(`${pages.length}/${options.maxPages} page limit used; ${links.length} eligible links sampled; same-origin crawling only. Up to 24 fetch operations with a 45-second scheduling budget.`);
  return { version: 2, url: reportUrl, checkedAt: new Date().toISOString(), durationMs: Date.now() - started, ...summarizeAudit(findings), findings, pages, limits: { maxPages: options.maxPages, maxLinks: MAX_AUDIT_LINKS }, notes, discovered: [...discovery] };
}