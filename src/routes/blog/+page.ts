import { redirect } from '@sveltejs/kit';

// Keep the placeholder source while the blog is disabled.
export const prerender = false;
export function load() {
  redirect(307, '/');
}
