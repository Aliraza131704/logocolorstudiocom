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
- Website Auditor uses a bounded static-HTML engine with its own DNS-screened, manual-redirect fetcher and atomic request limit; unsupported rendered checks never affect scores. This prevents invented measurements and unsafe secondary fetches without altering other tools.
- Auditor report history is explicitly browser-local (maximum ten reports), not account-backed; CSV escapes spreadsheet formulas and PDF exports carry coverage and evidence so reports remain portable and honest.
- Palette indexing is governed by a stable editorial selection separate from the generator; use that same selection for page robots tags and sitemap inclusion so existing slugs never change.
- Palette presentation chooses a readable foreground separately from color-generation algorithms; keep brand colors unchanged while satisfying text contrast.
- Keep the generator implementation in the shared PaletteGenerator component and the gallery at /palettes; existing color algorithms remain unchanged.
- Canonical, sharing and sitemap origins come from SITE_URL in seo.ts; page-specific revision dates are editorial records, never build timestamps.
- Blog content lives in the owner-editable content table; shared placeholder identities live in editorial-config.ts to avoid inventing real authors.
- Enrolled owner MFA is challenged before panel rendering and enforced by has_role in database policies so low-assurance sessions cannot bypass the screen.
- URL-based tools fetch sites in `createServerFn` handlers (src/lib/analyze.functions.ts) with URL validation + IP rate limiting; never fetch third-party sites from the browser (CORS).
- Public SSR reads (blog, pages, settings) go through src/lib/content.functions.ts using a publishable server client; admin writes use the browser client under RLS (`has_role` admin).
- The 1,000 gallery palettes are generated deterministically in src/lib/palettes.ts (no DB rows); only likes live in the database, keyed by slug — never change the generator seed or slugs break.
- Ad slots render admin-pasted code via AdSlot; keep reserved min-heights to avoid layout shift.
- Download sponsor transitions are centralized in download-catalog helpers so the UI and tests agree: videos require continuous playback completion, website sponsors require successfully opening a new tab, banners allow immediate continue, and AdSense stays independent of download access. Never reward Google ad clicks or views with transferable ZIPs; external page loading cannot be verified cross-origin.
- Download ZIPs and previews use Lovable Assets pointers; this is a browser-level access flow, not DRM or a private-file security boundary, because CDN files are publicly accessible.
- The editable download catalog is validated JSON in the existing owner-write site_settings table; public SSR lists through content.functions.ts and owner CRUD uses browser RLS. Each asset has its own playback unlock, with optional video override and a shared sponsor fallback.
