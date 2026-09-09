# Item model

Each item owns one `entry.json`, including its Markdown `body`, and its media under `assets/`. There are no separate descriptions in the active model. Use `npm run item:new` for the complete template.

## Stable identity

- `id` is `<kind>-<slug>` and matches the folder name.
- `kind`: game, project, company, or education. Games and web/software projects share the Project category, with paired blue Game and purple Website rails. Selecting Project reveals Everything / Games / Websites subfilters; existing `game` and `project` kinds drive the split.
- `title` and `role` are presentation text; changing them does not change the slug.
- `legacyPath` preserves any historical showcase URL. New items use null.
- `draft: true` keeps unfinished entries out of the public app.
- `featured: true` includes an item in the Featured collection filter, regardless of its date. Currently featured: Dead Traveler, PsiQuantum, and Zombiehood. The three hero cards are selected separately: Zombiehood, PsiQuantum, and Pilot Flying J.

## Content and dates

`summary` is a short plain-text introduction. `body` is Markdown, with headings, paragraphs, links, and inline local images. Raw HTML is displayed as text. Keep only factual content with known provenance; don't turn TBD or Pending into invented detail.

`date.value` supports `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`; `precision` must agree. Keep the original display text in `date.label`. `end` may be another partial date; `ongoing` marks a current chapter. Unknown values and precision are null. `provenance` records the source and whether dates need confirmation.

Timeline ordering uses the start/release value, then a stable `order` tie-breaker. Unknown dates sort last. Entries before 2020, explicitly archived entries, and undated entries form the archive. Its first two and a half entries appear as a fading preview; scrolling past the prompt reveals the rest. Track buttons filter the shared timeline with a fade-and-collapse transition; searching includes the entire archive.

## Media naming

Use lowercase filenames with the original format retained:

- `assets/cover.png` (or jpg, webp, etc.)
- `assets/animation.gif`
- `assets/icon.png`
- `assets/screenshots/01.png`, `02.png`, etc.
- `assets/extras/01.png` for retained historical media outside the public gallery

Do not change a file's format just to unify an extension. References are relative to the owning item. A Markdown image looks like `![Helpful description](assets/screenshots/01.png)`. The shared loader resolves it to the Vite-built URL. `media.animation` autoplays alongside the pictures when visible; `media.images` is the still-image gallery; `media.screenshots` identifies desktop/mobile views. Videos and playable previews remain external links, without third-party iframes or tracking loaded automatically.

`technologies`, `dependencies`, and `legacyPresentation` preserve old project context. They are not dependencies of this app. Unreferenced extras remain intentional until reviewed; the audit does not delete them.

## Verification

Run `npm run content:check`, `npm test`, and `npm run check`. The migration ID fixture protects original entries while allowing additions. The asset audit writes its generated inventory to `.reports/assets.json`. Lossless optimization validates decoded output before replacing an image.

Edit `items/*/entry.json`; each item owns its Markdown and media. Previous aggregate files and loose descriptions have been removed.

Set `showInEverything: true` to keep an older entry in the initial Everything list without changing its featured status or its placement in other filters.
