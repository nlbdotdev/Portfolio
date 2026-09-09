import { readFile, readdir, stat, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { catalogSchema, profileSchema } from '../../content/schema.js';
const root = new URL('../../', import.meta.url);
const entries = catalogSchema.parse(JSON.parse(await readFile(new URL('content/entries.json', root), 'utf8')));
const referenced = new Set();
function collect(value) {
  if (typeof value === 'string' && value.startsWith('/assets/')) referenced.add(value);
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === 'object') Object.values(value).forEach(collect);
}
const profile = profileSchema.parse(JSON.parse(await readFile(new URL('content/profile.json', root), 'utf8')));
collect(profile);
const errors = [];
for (const entry of entries) {
  collect(entry);
  const body = await readFile(new URL(`content/${entry.description}`, root), 'utf8');
  if (!body.trim()) errors.push(`${entry.id}: empty description`);
  if (/<\/?(?:script|style|ImageSpan)\b/.test(body)) errors.push(`${entry.id}: component markup in content`);
  for (const match of body.matchAll(/\]\(([^)]+)\)/g)) {
    if (match[1].startsWith('/assets/')) referenced.add(match[1]);
    else if (!/^https?:\/\//.test(match[1])) errors.push(`${entry.id}: invalid Markdown URL ${match[1]}`);
  }
}
for (const path of referenced) {
  if (path.includes('..') || path.includes('\\')) { errors.push(`Unsafe asset path: ${path}`); continue; }
  try { if (!(await stat(new URL(`static${path}`, root))).isFile()) errors.push(`Not a file: ${path}`); }
  catch { errors.push(`Missing asset: ${path}`); }
}
const descriptions = await readdir(new URL('content/descriptions/', root));
for (const file of descriptions) if (!entries.some(e => e.description === `descriptions/${file}`)) errors.push(`Orphan description: ${file}`);
if (errors.length) throw new Error(errors.join('\n'));
console.log(`Validated ${entries.length} entries, ${descriptions.length} descriptions, ${referenced.size} referenced assets.`);
if (process.argv.includes('--report')) {
  const files = [];
  async function walk(dir) {
    for (const entry of await readdir(new URL(dir, root), { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) await walk(path);
      else if (entry.isFile()) {
        const bytes = await readFile(new URL(path, root));
        files.push({ path: path.replace(/^static/, ''), bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
      }
    }
  }
  await walk('static/assets');
  files.sort((a,b) => a.path.localeCompare(b.path));
  const hashes = new Map();
  for (const f of files) hashes.set(f.sha256, [...(hashes.get(f.sha256) || []), f.path]);
  const report = { entries: entries.length, assets: files.length, totalBytes: files.reduce((n,f)=>n+f.bytes,0),
    unreferenced: files.filter(f=>!referenced.has(f.path)), duplicates: [...hashes.values()].filter(paths=>paths.length>1),
    largest: [...files].sort((a,b)=>b.bytes-a.bytes).slice(0,20) };
  await mkdir(new URL('.reports/', root), { recursive: true });
  await writeFile(new URL('.reports/assets.json', root), JSON.stringify(report,null,2)+'\n');
  console.log(`Asset inventory: ${fileURLToPath(new URL('.reports/assets.json', root))}`);
}
