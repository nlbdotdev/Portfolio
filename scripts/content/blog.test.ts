import test from 'node:test';
import assert from 'node:assert/strict';
import { includesDrafts, postSchema, visiblePosts } from '../../src/lib/blog.ts';

const published = postSchema.parse({
  title: 'Published',
  slug: 'published',
  date: '2026-09-13',
  description: 'Published',
  paragraphs: [],
});
const draft = postSchema.parse({ ...published, title: 'Draft', slug: 'draft', draft: true });
test('draft visibility follows deployment branch and fails closed in unknown builds', () => {
  for (const branch of ['main', 'feature/foo', '']) assert.equal(includesDrafts(branch), false);
  assert.equal(includesDrafts(undefined), false);
  assert.equal(includesDrafts('main', true), false);
  assert.equal(includesDrafts('dev'), true);
  assert.equal(includesDrafts(undefined, true), true);
  assert.deepEqual(visiblePosts([draft, published], false), [published]);
  assert.equal(visiblePosts([draft, published], true).length, 2);
});
test('posts reject unsafe slugs and malformed draft values', () => {
  assert.equal(postSchema.safeParse({ ...published, slug: '../secret' }).success, false);
  assert.equal(postSchema.safeParse({ ...published, draft: 'false' }).success, false);
});
