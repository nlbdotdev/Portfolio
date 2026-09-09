# NLB.DEV

Nathan Bennett's web and game development portfolio. Includes project showcases, a filterable game archive, image galleries, resume, and contact form.

## Versions

- [Current portfolio](https://nlb.dev/)
- [Version 0](https://v0.nlb.dev/)
- [Version 1](https://v1.nlb.dev/)

The version links are historical deployment addresses; availability depends on their hosting and DNS. Git also retains `origin/v0` and `origin/v1` for recovery.

## Local development

Use Node.js 22.12+ and npm (the lockfile is `package-lock.json`). Do not mix npm and pnpm lockfiles.

```sh
npm ci
npm run dev
```

Open the URL printed by the local server, normally `http://localhost:8080`. The dev command watches source files, rebuilds with Rollup, and enables live reload.

For a production build and local preview:

```sh
npm run build
npm start -- --port 5173
```

Open `http://localhost:5173`. Deploy the contents of `public/` after building, with a fallback to `index.html` for client-side routes such as `/games` and `/projects/portfolio`. The preview server already provides this fallback.

## Project layout

- `src/App.svelte`: application shell and Page.js routes.
- `src/stores.js`: project/game content and theme settings.
- `src/components/` and `src/pages/`: Svelte UI and page components.
- `public/assets/`: images, game media, and resume.
- `public/global.css`: shared styles.
- `public/build/`: generated production bundles (ignored by Git).
- `rollup.config.mjs`: development and production build configuration.

## Svelte 3 baseline

This branch intentionally remains on **Svelte 3**, pinned to `3.59.2`. The original pre-migration state is commit `66c7a63`, tagged `svelte3-baseline-20260909`; commit `cb0b062` records the restoration checkpoint. The incomplete Svelte 5 work is preserved locally on `backup/dev-svelte5-20260909`.

The remote `dev` branch still contains that migration until an explicit remote-history update is made. Do not merge or pull `origin/dev` into this restored branch inadvertently.

## Dependency checks

```sh
npm ci
npm run build
npm run audit
```

Build tooling uses Rollup 4 and the maintained `@rollup/plugin-terser`. A scoped npm override updates Page.js's `path-to-regexp` dependency to `1.9.0` to address its vulnerable historical dependency.

The September 2026 cleanup reduced the audit from 12 high findings to **3 moderate findings**: Svelte and two packages that depend on it (`svelte-lightbox` and `svelte-simple-modal`). Fully resolving these requires leaving Svelte 3. This site renders in the browser, but that does not dismiss all remaining advisories. Avoid `npm audit fix --force`, which can cross the intended framework boundary.

The build still reports legacy accessibility, unused-property, and unused-CSS warnings. There is no automated test suite; before releasing, check home/games navigation, filtering, project/game dialogs, direct showcase URLs, and mobile layout. Contact submission and third-party embedded games require their external services.

## Recovering historical versions

Prefer the saved Git branches when they contain the desired version. They can be checked out into separate worktrees and built without altering this branch.

Web Archive can also recover captured HTML, CSS, JavaScript, and images for local hosting, but cannot recreate missing assets or backend services. Its availability API returned no snapshots for `v0.nlb.dev` or `v1.nlb.dev` during this cleanup; older captures of `nlb.dev` may still be useful. A restored archive needs its asset URLs and internal links rewritten and checked locally.
