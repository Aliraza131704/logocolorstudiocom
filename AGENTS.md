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
- URL-based tools fetch sites in `createServerFn` handlers (src/lib/analyze.functions.ts) with URL validation + IP rate limiting; never fetch third-party sites from the browser (CORS).
- Public SSR reads (blog, pages, settings) go through src/lib/content.functions.ts using a publishable server client; admin writes use the browser client under RLS (`has_role` admin).
- The 1,000 gallery palettes are generated deterministically in src/lib/palettes.ts (no DB rows); only likes live in the database, keyed by slug — never change the generator seed or slugs break.
- Ad slots render admin-pasted code via AdSlot; keep reserved min-heights to avoid layout shift.
- Download sponsor transitions are centralized in download-catalog helpers so the UI and tests agree: videos require continuous playback completion, website sponsors require successfully opening a new tab, banners allow immediate continue, and AdSense stays independent of download access. Never reward Google ad clicks or views with transferable ZIPs; external page loading cannot be verified cross-origin.
- Download ZIPs and previews use Lovable Assets pointers; this is a browser-level access flow, not DRM or a private-file security boundary, because CDN files are publicly accessible.
- The editable download catalog is validated JSON in the existing owner-write site_settings table; public SSR lists through content.functions.ts and owner CRUD uses browser RLS. Each asset has its own playback unlock, with optional video override and a shared sponsor fallback.
