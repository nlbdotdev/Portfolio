import { z } from 'zod';

export const postSchema = z
  .object({
    title: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    description: z.string().min(1),
    draft: z.boolean().default(false),
    paragraphs: z.array(z.string()),
    sections: z
      .array(z.object({ heading: z.string(), paragraphs: z.array(z.string()) }))
      .default([]),
  })
  .strict();
export type Post = z.infer<typeof postSchema>;

// Deployment branch is authoritative; unknown production builds fail closed.
export function includesDrafts(branch: string | undefined, localDev = false) {
  return branch ? branch === 'dev' : localDev;
}
export function visiblePosts(posts: Post[], drafts: boolean) {
  return posts.filter((post) => drafts || !post.draft).sort((a, b) => b.date.localeCompare(a.date));
}
export function postDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}
