import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { includesDrafts, postSchema, visiblePosts } from '$lib/blog';

const records = import.meta.glob('../../../content/blog/*.json', {
  eager: true,
  import: 'default',
});
const catalog = Object.values(records).map((record) => postSchema.parse(record));
if (new Set(catalog.map((post) => post.slug)).size !== catalog.length)
  throw new Error('Duplicate blog slug');
export const showDrafts = includesDrafts(env.VERCEL_GIT_COMMIT_REF ?? env.BLOG_BUILD_BRANCH, dev);
export const posts = visiblePosts(catalog, showDrafts);

export const siteOrigin = showDrafts ? 'https://dev.nlb.dev' : 'https://nlb.dev';
