import { posts } from '$lib/server/blog';
export function load() {
  return { posts: posts.map(({ paragraphs, sections, ...summary }) => summary) };
}
