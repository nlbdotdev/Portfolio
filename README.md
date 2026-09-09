# NLB.DEV — V2 foundation

Nathan Bennett's portfolio, now on **Svelte 5, SvelteKit, TypeScript, and Tailwind CSS 4**. This stage focuses on portable content and validation. The frontend is intentionally a plain, searchable content library.

- [Current website](https://nlb.dev/)
- [Historical V0](https://v0.nlb.dev/)
- [Preserved V1](https://v1.nlb.dev/)

V1's Svelte 3 source remains in Git at `99c5560` and on the `v1` branch. This migration does not update those deployments. Submit changes through PRs into `dev`; release to `main` separately.

## Run locally

Use Node.js 22.12+ and npm. Vercel's runtime is explicitly Node 22; Node 26 also works for local tooling. Use the committed npm lockfile, not a second package manager.

```sh
npm ci
npm run dev
```

Open the printed URL, normally `http://localhost:5173`.

```sh
npm run check           # Svelte + TypeScript diagnostics
npm test                # Content schema regression tests
npm run content:check   # Schema, descriptions, local references
npm run content:audit   # Above plus .reports/assets.json inventory
npm run build           # Content validation and production build
npm run preview         # Serve the production build locally
npm run audit           # Dependency security audit
```

The root page is prerendered. Catalog JSON and Markdown are imported directly at build time; there is no database, API, or fetch route. The Vercel adapter supports adding server features later. Existing showcase paths are preserved as content metadata, but the old showcase routes and contact form are intentionally absent from this foundation.

## Content and assets

- `content/entries.json`: 22 games, 3 main projects, 6 archive projects.
- `content/descriptions/*.md`: 31 standalone descriptions, including historical portfolio links and gallery images.
- `content/profile.json`: biography, skills, contact links, resume, and historical contact endpoint.
- `content/schema.js`: shared Zod schemas, usable independently of Svelte.
- `content/review.json`: unresolved source-content questions; do not guess these values.
- `content/provenance.json`: source commit and migration provenance.
- `static/assets/`: all 222 original asset files, preserved byte-for-byte with unchanged public `/assets/...` URLs.
- `src/lib/content.ts`: imports and validates local content for the app.

See [content editing rules](content/README.md). The audit reports unreferenced files and duplicate hashes; it never deletes assets. Unreferenced does not mean disposable—some files belong to the historical frontend.

The old UI, Page.js, modal packages, and Rollup configuration were removed from the active tree. Recover them from V1 when needed rather than maintaining two content sources. Markdown displays as escaped plain text for now; no raw HTML rendering is enabled.

## Current limitations

Dates preserve year/month/day precision, and unknown dates stay null. Historical descriptions and links have not been fact-checked against current external services. Editorial review remains necessary before a redesigned public release. The inspiration timeline and employment history have not been imported in this pass.

The framework's transitive `cookie` package is scoped to patched `0.7.2` through an npm override. The validated install reports zero audit vulnerabilities. Reassess this override when upgrading SvelteKit.
