import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  // SvelteKit's default allow list includes src, but our item-owned assets live in content.
  server: { fs: { allow: [fileURLToPath(new URL('./content', import.meta.url))] } },
});
