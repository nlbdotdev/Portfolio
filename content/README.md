# Content editing

This directory is the source of truth; it does not import Svelte components.

1. Add or edit a record in `entries.json` and its Markdown description.
2. Use an immutable `id` and explicit `slug`. Preserve `legacyPath` even if the title changes. New entries without an old URL use null.
3. Keep short metadata in JSON and long prose in Markdown. Markdown links/images must use HTTP(S) URLs or `/assets/...` paths.
4. Store images under `static/assets/`. Reference their public `/assets/...` URLs, with meaningful alternative text. Keep original source media until explicitly approved for removal.
5. Run `npm run content:check` and `npm test` before committing.

## Fields

- `kind`: game or project. `collection`: games, projects, or archive (the old “other projects” grouping).
- `featured`: explicit existing featured status; tags describe the work, not display placement.
- `date`: original label, normalized `value` (`YYYY`, `YYYY-MM`, or `YYYY-MM-DD`), and matching precision. Unknown values and precision are null. Never convert an unknown month/day to January 1.
- `media`: cover, animation, icon, gallery images, video links, and desktop/mobile screenshots. Unused optional single assets are null; collections are empty arrays/objects.
- `preview`: playable URL and device support flags. A disabled historical URL may remain for reference. Do not infer playability just because a URL exists.
- `technologies` and `dependencies`: descriptive historical project information, not this repository's current npm dependencies.
- `legacyPresentation`: retained old layout hints, not a requirement for the V2 design.

Original ordering is preserved. Missing project dates and summaries remain missing rather than being synthesized. The catalog may be imported directly by other tools; the app adds description text without modifying the stored records.

## Review and preservation

`review.json` records the malformed Project Adder preview value, its TBD release date, and the two Pending descriptions. Existing claims about availability, hosting, and release status are historical and need editorial verification.

`npm run content:audit` generates an ignored inventory at `.reports/assets.json`, listing duplicate hashes, large assets, and files unreferenced by the catalog/profile/descriptions. No conversions, downloads, or deletions occur. Unreferenced historical design assets remain preserved.
