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
- Asset downloads use a voluntary first-party sponsor video and only unlock after continuous playback completion; never tie transferable ZIP rewards to Google rewarded ads because those rewards do not meet its non-transferability rules.
- Download ZIPs and previews use Lovable Assets pointers; this is a browser-level access flow, not DRM or a private-file security boundary, because CDN files are publicly accessible.
