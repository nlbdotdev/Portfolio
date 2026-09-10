import { parseArgs } from 'node:util';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { readCatalog, root } from './library';
import { entrySchema } from '../../content/schema.ts';
const { values } = parseArgs({
  options: { kind: { type: 'string' }, slug: { type: 'string' }, title: { type: 'string' } },
});
if (!values.kind || !values.slug || !values.title)
  throw new Error(
    'Usage: npm run item:new -- --kind project --slug my-project --title "My project"',
  );
const entries = await readCatalog();
const id = `${values.kind}-${values.slug}`;
const entry = entrySchema.parse({
  id,
  kind: values.kind,
  slug: values.slug,
  title: values.title,
  role: 'Project',
  summary: 'Add a short summary.',
  body: 'Add the story of this project in Markdown.',
  date: { label: null, value: null, precision: null },
  legacyPath: null,
  featured: false,
  draft: true,
  collection: 'archive',
  tags: [],
  links: [],
  media: { cover: null, animation: null, icon: null, images: [], videos: [], screenshots: {} },
  preview: { url: null, desktop: false, mobile: false },
  technologies: [],
  dependencies: [],
  legacyPresentation: {},
  order: Math.max(...entries.map((entry) => entry.order)) + 1,
  provenance: { source: 'Manual entry', datesNeedReview: true },
});
if (entries.some((e) => e.id === id || e.slug === entry.slug))
  throw new Error('This entry already exists');
const folder = join(root, 'content/items', id);
await mkdir(folder);
await mkdir(join(folder, 'assets/screenshots'), { recursive: true });
await writeFile(join(folder, 'entry.json'), JSON.stringify(entry, null, 2) + '\n');
console.log(`Created draft ${id}. Edit entry.json and set draft to false when ready.`);
