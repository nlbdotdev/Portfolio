import { catalogSchema, profileSchema, type Entry } from '../../content/schema.ts';
import profileData from '../../content/profile.json';
import { renderMarkdown } from './markdown';
import { sortTimeline } from './timeline';
const records = import.meta.glob<{ default: unknown }>('../../content/items/*/entry.json', {
  eager: true,
});
const assetUrls = import.meta.glob<string>(
  [
    '../../content/items/*/assets/**/*.{png,jpg,jpeg,gif,webp,avif,svg}',
    '!../../content/items/**/*.optimized.*',
  ],
  { query: '?url', import: 'default', eager: true },
);
export function assetUrl(entry: Entry, path: string): string {
  const url = assetUrls[`../../content/items/${entry.id}/${path}`];
  if (!url) throw new Error(`Missing asset for ${entry.id}: ${path}`);
  return url;
}
export const entries = sortTimeline(
  catalogSchema
    .parse(Object.values(records).map((module) => module.default))
    .filter((entry) => !entry.draft),
);
export const profile = profileSchema.parse(profileData);
export const descriptions = new Map(
  entries.map((entry) => [entry.id, renderMarkdown(entry.body, (path) => assetUrl(entry, path))]),
);
