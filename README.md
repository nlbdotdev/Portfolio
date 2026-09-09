# NLB.DEV — Work & life

Nathan Bennett's portfolio: selected work and one chronological timeline with Career, Education, and Project rails. Built with Svelte 5, SvelteKit, TypeScript, and Tailwind CSS 4.

- [Current website](https://nlb.dev/)
- [Historical V0](https://v0.nlb.dev/)
- [Preserved V1](https://v1.nlb.dev/)

V1's Svelte 3 source remains at `99c5560` and on the `v1` branch. V2 includes 31 original portfolio items plus 14 chapters from the user-selected prototype (career, education, and Zombiehood). Dates and historical claims still need editorial confirmation.

## Develop and verify

Use Node.js 22.12+ and npm with the committed lockfile. Vercel's runtime is explicitly Node 22.

```sh
npm ci
npm run dev
```

Open the printed URL, normally `http://localhost:5173`.

```sh
npm run check           # TypeScript and Svelte, including content scripts
npm test                # Content preservation, schema, timeline and Markdown safety
npm run content:check   # Item structure, local references and Markdown links
npm run content:audit   # Asset sizes, duplicate hashes and unreferenced files
npm run build           # Validate and prerender the production app
npm run preview         # Serve that production build
npm run format          # Consistent formatting across source and content
npm run format:check    # Check formatting without edits
npm run audit           # Dependency security audit
```

No database or API is required. SvelteKit imports the item files and asset URLs at build time. The homepage is prerendered; search, animated track filtering, archive disclosure, and media expansion run locally in the browser. Gameplay animations sit alongside screenshots in Notes & media and autoplay only while visible. Offscreen animations and hidden tabs stop rendering; reduced-motion visitors get a still image with a Play control.

## Self-contained items

```text
content/items/game-project-adder/
  entry.json             # Metadata + Markdown body in one record
  assets/
    cover.png
    animation.gif
    screenshots/01.jpg
    screenshots/02.jpg
    extras/01.png        # Preserved historical media, not in the public gallery
```

The common schema is `content/schema.ts`. `src/lib/content.ts` validates and imports the records. `PortfolioItem.svelte` is the reusable presentation component; Company and Education use the same item model without requiring media. Vite imports generate fingerprinted asset URLs, so moving an item folder and its record does not require hand-maintaining public URLs.

```sh
npm run item:new -- --kind project --slug my-project --title "My project"
```

This creates a draft with a screenshots folder. Edit its JSON, add media, and set `draft` to false when ready. Drafts validate but do not appear in the app. See [content editing rules](content/README.md).

`content/profile.json` contains biography, skills, contact links, and the resume reference. `content/asset-migrations.json` maps historical asset URLs to item folders. Existing deep-link paths remain metadata until a future routing pass. The old contact form is not part of this MVP.

## Lossless asset optimization

```sh
brew install optipng gifsicle jpeg-turbo
# Python 3 with Pillow is required for independent decoded-image verification.
npm run assets:optimize
```

The TypeScript command runs OptiPNG, Gifsicle and jpegtran. It accepts only smaller outputs with identical decoded RGBA pixels, frame durations, loop count, ICC profile, and EXIF. It never uses JPEG re-encoding or lossy GIF options. Failures keep the original. Detailed results are written to `.reports/lossless-optimization.json`.

## Preservation and remaining review

- The catalog's Markdown renders through an explicit renderer: raw HTML is escaped, unsafe link schemes are rejected, and images resolve only to local item assets.
- Unknown dates remain unknown; year-only and month-only dates keep their precision. Imported reference dates carry provenance and `datesNeedReview`.
- “Earlier chapters” previews two and a half older entries with a fading edge. Continuing to scroll past its prompt reveals the full archive; the prompt also supports keyboard activation. Close archive returns to the preview. Search includes all history directly.
- The scoped `cookie` override patches SvelteKit's transitive dependency; revisit it on framework upgrades.
- Superseded aggregate content, loose descriptions, duplicate item assets, and Paint.NET source files have been removed. Historical source remains available in Git and on `v1`.

## Appearance and company imagery

The header theme selector supports System (default), Light, and Dark. Explicit choices persist locally; System tracks OS appearance changes. Company logos and studio artwork are stored within their owning items; source URLs are recorded in `content/image-sources.json`. Logo artwork retains its original colors on a suitable light or dark surface. The hero uses Dead Traveler’s official studio background. Oswald is self-hosted with its SIL Open Font License in `static/fonts/`.

`npm run assets:modernize` uses `gif2webp` (Homebrew `webp`) and Python/Pillow to generate lossless animated WebP variants. A variant is selected only when smaller and every decoded frame, duration, loop count, ICC profile and EXIF match. Original GIFs remain in their item folders; `content/animation-optimization.json` records verification and hashes.
