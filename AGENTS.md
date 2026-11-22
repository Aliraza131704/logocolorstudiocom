<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Expanded tool guides use shared browser-safe editorial content and ToolGuide figures, with the same FAQ data in page content and structured metadata; keep guide changes separate from tool algorithms.
- Website Auditor uses a bounded static-HTML engine with its own DNS-screened, manual-redirect fetcher and atomic request limit; unsupported rendered checks never affect scores. This prevents invented measurements and unsafe secondary fetches without altering other tools.
- Site-wide audits are browser-orchestrated, paced small batches with a capped discovery queue, same-origin sitemap/link discovery and explicit partial reports; retain per-invocation safety limits to avoid long-running requests and unrestricted crawling.
- Auditor report history is explicitly browser-local (maximum ten reports), not account-backed; CSV escapes spreadsheet formulas and PDF exports carry coverage and evidence so reports remain portable and honest.
- Palette indexing: all 1,000 palettes are indexable (no noindex) and listed in the sitemap; the stable 150-palette featured selection (base names only) separately drives the homepage strip, gallery copy and share-image coverage, so existing slugs never change.
- Palette presentation chooses a readable foreground separately from color-generation algorithms; keep brand colors unchanged while satisfying text contrast.
- Keep the generator implementation in the shared PaletteGenerator component and the gallery at /palettes; existing color algorithms remain unchanged.
- Canonical, sharing and sitemap origins come from SITE_URL in seo.ts; page-specific revision dates are editorial records, never build timestamps.
- Public page metadata links WebPage, WebSite and Organization through stable URL-based identifiers; private noindex pages omit public page schema so entity context stays accurate.
- Blog content lives in the owner-editable content table; shared placeholder identities live in editorial-config.ts to avoid inventing real authors.
- Enrolled owner MFA is challenged before panel rendering and enforced by has_role in database policies so low-assurance sessions cannot bypass the screen.
- URL-based tools fetch sites in `createServerFn` handlers (src/lib/analyze.functions.ts) with URL validation, IP rate limiting and safeFetch (DNS-screened public hosts, manually re-validated redirects); never fetch third-party sites from the browser (CORS) and never use raw fetch on user URLs, to block internal-network requests.
- Public SSR reads (blog, pages, settings) go through src/lib/content.functions.ts using a publishable server client; admin writes use the browser client under RLS (`has_role` admin).
- The 1,000 gallery palettes are generated deterministically in src/lib/palettes.ts (no DB rows); only likes live in the database, keyed by slug — never change the generator seed or slugs break.
- Ad slots render admin-pasted code via AdSlot; keep reserved min-heights to avoid layout shift.
- Download sponsor transitions are centralized in download-catalog helpers so the UI and tests agree: videos require continuous playback completion, website sponsors require successfully opening a new tab, banners allow immediate continue, and AdSense stays independent of download access. Never reward Google ad clicks or views with transferable ZIPs; external page loading cannot be verified cross-origin.
- Download ZIPs and previews use Lovable Assets pointers; this is a browser-level access flow, not DRM or a private-file security boundary, because CDN files are publicly accessible.
- The editable download catalog is validated JSON in the existing owner-write site_settings table; public SSR lists through content.functions.ts and owner CRUD uses browser RLS. Each asset has its own playback unlock, with optional video override and a shared sponsor fallback.
- Blog images upload through src/lib/media-upload.ts into the private `media` storage bucket (public buckets are blocked in this workspace) and are served by the read-only route /api/public/media/*, which only accepts covers/og/posts image paths and reads with the publishable client under a matching storage policy (never the admin client), so other stored files stay private; writes stay admin-only via storage RLS, max 10 MB per image.
- Extra admins are created and revoked only by the owner email through server functions in src/lib/team.functions.ts (admin client after owner check); the owner can never be removed.
- Brand Colors section: brand data (slug, domain, official colors) lives in src/lib/brands.ts; the grid at /brand-colors opens a modal with pushState to /brand-colors/{slug}, which is also a real SSR page. Logos come from Logo.dev (VITE_LOVABLE_CONNECTOR_LOGO_DEV_API_KEY) with a monogram fallback; never hardcode logo files.
- Tool page content is owner-editable: overrides live as validated JSON in site_settings key tool_content (src/lib/tool-overrides.ts), edited in Admin → Tool pages, merged in ToolLayout/PaletteGeneratorPage (client) and in each tool route head via a getPublicSetting loader. Defaults in route files and tool-guide-content.ts stay the fallback.
- Header Tools mega menu (MegaMenu.tsx) reads columns only from src/lib/tool-groups.ts, the single source of tool entries and blurbs.
- Referral links (/r/{code}) record clicks only via the record_referral_click security-definer function and admins read referral_stats, so visitors never touch the tables and redirects stay on-site.
- Named colors live in src/lib/color-names.ts; all other /colors/{slug} values are computed from the HEX so codes cannot drift.
- Site translation is opt-in, browser-side Google website translation driven by the googtrans cookie (src/components/site/SiteTranslate.tsx, rules in src/lib/languages.ts); English SSR pages remain the only indexed version, and tool workspaces/admin are marked notranslate because translated text nodes go stale under React updates.
- Page titles/descriptions come from src/lib/page-meta.ts (limits tested); Admin overrides win via withMeta.
