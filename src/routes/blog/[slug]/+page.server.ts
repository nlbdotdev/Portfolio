import { error } from '@sveltejs/kit';
import { posts } from '$lib/server/blog';
import type { EntryGenerator, PageServerLoad } from './$types';
export const entries: EntryGenerator = () => posts.map(({ slug }) => ({ slug }));
export const load: PageServerLoad = ({ params }) => {
  const post = posts.find((post) => post.slug === params.slug);
  if (!post) error(404, 'Post not found');
  return { post };
};
