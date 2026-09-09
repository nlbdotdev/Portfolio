import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalogSchema, type Entry } from '../../content/schema.ts';
export const root = fileURLToPath(new URL('../../', import.meta.url));
export async function readCatalog(): Promise<Entry[]> {
  const dirs = await readdir(join(root, 'content/items'), { withFileTypes: true });
  const records = await Promise.all(
    dirs
      .filter((dir) => dir.isDirectory())
      .map(async (dir) => {
        const entry = JSON.parse(
          await readFile(join(root, 'content/items', dir.name, 'entry.json'), 'utf8'),
        );
        if (entry.id !== dir.name) throw new Error(`Folder must match entry ID: ${dir.name}`);
        return entry;
      }),
  );
  return catalogSchema.parse(records);
}
export function collectAssets(entry: Entry): string[] {
  const paths = new Set<string>();
  function walk(value: unknown): void {
    if (typeof value === 'string' && value.startsWith('assets/')) paths.add(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') Object.values(value).forEach(walk);
  }
  walk(entry.media);
  for (const match of entry.body.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) paths.add(match[1]);
  return [...paths];
}
