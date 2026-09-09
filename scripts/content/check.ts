import { readdir, stat, readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { root, readCatalog, collectAssets } from './library';
import { assetPathSchema, profileSchema } from '../../content/schema.ts';
const entries = await readCatalog();
const profile = profileSchema.parse(
  JSON.parse(await readFile(join(root, 'content/profile.json'), 'utf8')),
);
const refs = new Set<string>();
const errors: string[] = [];
for (const entry of entries) {
  for (const path of collectAssets(entry)) {
    if (!assetPathSchema.safeParse(path).success) {
      errors.push(`${entry.id}: unsafe asset path ${path}`);
      continue;
    }
    const absolute = join(root, 'content/items', entry.id, path);
    refs.add(absolute);
    try {
      if (!(await stat(absolute)).isFile()) errors.push(`Not a file: ${absolute}`);
    } catch {
      errors.push(`Missing: ${absolute}`);
    }
  }
  if (/<\/?(?:script|style|ImageSpan)\b/i.test(entry.body))
    errors.push(`${entry.id}: executable or component markup in Markdown`);
  for (const match of entry.body.matchAll(/(?<!!)\[[^\]]*\]\(([^)]+)\)/g))
    if (!/^(https?:\/\/|mailto:|#)/.test(match[1]))
      errors.push(`${entry.id}: unsupported link ${match[1]}`);
}
if (!(await stat(join(root, 'static', profile.resume))).isFile()) errors.push('Missing resume');
if (errors.length) throw new Error(errors.join('\n'));
console.log(
  `Validated ${entries.length} self-contained entries and ${refs.size} referenced item assets.`,
);
if (process.argv.includes('--report')) {
  const files: { path: string; bytes: number; sha256: string; referenced: boolean }[] = [];
  async function walk(dir: string): Promise<void> {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (!path.endsWith('.json')) {
        const bytes = await readFile(path);
        files.push({
          path: relative(root, path),
          bytes: bytes.length,
          sha256: createHash('sha256').update(bytes).digest('hex'),
          referenced: refs.has(path),
        });
      }
    }
  }
  await walk(join(root, 'content/items'));
  await walk(join(root, 'static/assets'));
  files.sort((a, b) => a.path.localeCompare(b.path));
  const groups = new Map<string, string[]>();
  for (const file of files)
    groups.set(file.sha256, [...(groups.get(file.sha256) ?? []), file.path]);
  await mkdir(join(root, '.reports'), { recursive: true });
  await writeFile(
    join(root, '.reports/assets.json'),
    JSON.stringify(
      {
        entries: entries.length,
        files: files.length,
        bytes: files.reduce((n, file) => n + file.bytes, 0),
        duplicates: [...groups.values()].filter((paths) => paths.length > 1),
        unreferenced: files.filter((file) => !file.referenced),
        largest: [...files].sort((a, b) => b.bytes - a.bytes).slice(0, 20),
      },
      null,
      2,
    ) + '\n',
  );
  console.log('Asset inventory written to .reports/assets.json');
}
