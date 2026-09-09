import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { readCatalog } from './library';
import { catalogSchema, entrySchema } from '../../content/schema.ts';
import { sortTimeline, matchesSearch, trackOf } from '../../src/lib/timeline';
import { renderMarkdown } from '../../src/lib/markdown';
const entries = await readCatalog();
const example = entries.find((entry) => entry.id === 'game-project-adder')!;
test('all source entries and reference chapters are preserved', () => {
  const originalIds: string[] = JSON.parse(
    readFileSync(new URL('./fixtures/migrated-ids.json', import.meta.url), 'utf8'),
  );
  for (const id of originalIds)
    assert(
      entries.some((entry) => entry.id === id),
      `Missing migrated entry: ${id}`,
    );
});
test('duplicate IDs and unsafe item media cannot enter the catalog', () => {
  assert.equal(catalogSchema.safeParse([...entries, entries[0]]).success, false);
  assert.equal(
    entrySchema.safeParse({
      ...example,
      media: { ...example.media, cover: 'assets/../secrets.png' },
    }).success,
    false,
  );
});
test('calendar precision and ranges remain honest', () => {
  for (const date of [
    { label: 'wrong', value: '2024-02-30', precision: 'day' },
    { label: '2019', value: '2019', precision: 'day' },
    { label: 'wrong', value: '2025', precision: 'year', end: '2024' },
  ])
    assert.equal(entrySchema.safeParse({ ...example, date }).success, false);
  assert.equal(
    entrySchema.safeParse({ ...example, date: { label: 'TBD', value: null, precision: null } })
      .success,
    true,
  );
});
test('timeline is chronological, stable and keeps unknown dates last', () => {
  const sorted = sortTimeline(entries);
  assert.equal(sorted[0].id, 'company-dead-traveler');
  assert.equal(sorted.at(-1)!.date.value, null);
  assert.deepEqual(sortTimeline(sorted), sorted);
  assert.equal(trackOf(example), 'project');
  assert(matchesSearch(example, 'ADDER'));
});
test('Markdown renders prose but never active HTML or unsafe links', () => {
  const html = renderMarkdown(
    '## Notes\n\n**Hello** [link](https://example.com)\n\n<script>alert(1)</script>\n\n[bad](javascript:alert)\n\n![shot](assets/screenshots/01.png)',
    (path) => `/built/${path}`,
  );
  assert.match(html, /<h2>Notes<\/h2>/);
  assert.match(html, /<strong>Hello<\/strong>/);
  assert(!html.includes('<script>'));
  assert(!html.includes('href="javascript:'));
  assert.match(html, /loading="lazy"/);
});
