import { entries, profile } from '$lib/content';
import { renderLlms } from '$lib/llms';
export const prerender = true;
export function GET() {
  return new Response(renderLlms(entries, profile, true), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
