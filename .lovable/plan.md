# Site search

Add a search option so visitors can find colors, tools and free resources from anywhere on the site.

## What visitors get
- A search icon/box in the header (desktop and mobile). Shortcut: press `/` or Ctrl+K.
- A search window that shows instant results as you type, grouped into:
  - **Tools** (Logo Extractor, CMS Detector, Website Auditor, etc.)
  - **Colors** (named colors like "Navy Blue", plus any HEX code typed, e.g. `#0A8CFF` opens its color page)
  - **Brand colors** (Nike, Coca-Cola...)
  - **Palettes** (1,000 palettes by name or tag like "Pastel")
  - **Free resources** (themes and template kits from Downloads)
  - **Blog posts**
- Keyboard arrows + Enter to open a result; works in light and dark mode.
- A full `/search?q=...` results page (noindex) with "Show all" from the window.

## Technical details
- New `src/lib/site-search.ts`: builds an index from `tool-groups.ts`, `color-names.ts`, `brands.ts`, `palettes.ts` (all in-browser, no DB), plus downloads catalog and published blog titles loaded through existing public `content.functions.ts` reads.
- Simple scoring (exact > starts-with > contains, across name/tags/blurb); HEX detection routes to `/colors/{hex}`.
- `SearchDialog.tsx` built on existing shadcn Command/Dialog; trigger added in `SiteHeader.tsx`; marked notranslate-safe.
- `src/routes/search.tsx` with its own head() (noindex).
- Small test for ranking and HEX detection.
