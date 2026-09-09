# NLB.DEV — Work & life

Nathan Bennett's portfolio: selected work and one chronological timeline with Company, Education, and Project rails. Built with Svelte 5, SvelteKit, TypeScript, and Tailwind CSS 4.

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

No database or API is required. SvelteKit imports the item files and asset URLs at build time. The homepage is prerendered; search, track highlighting, archive disclosure, and media expansion run locally in the browser. Large animations are behind an explicit disclosure instead of autoplaying in the timeline.

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
- Older entries are initially folded under “Earlier chapters.” Search includes them, and expanding the archive keeps them in the same timeline.
- The scoped `cookie` override patches SvelteKit's transitive dependency; revisit it on framework upgrades.
- During the pending cleanup approval, the old aggregate catalog, description files, and original static asset copies remain alongside the new item folders. They are not consumed by the new app. PDN removal and branch consolidation are also awaiting approval.
