import { z } from 'zod';
const localPath = z.string().regex(/^\/assets\/(?!.*(?:\.\.|\\)).+/);
const url = z.url({ protocol: /^https?$/ });
const link = z.object({ label: z.string().trim().min(1), link: url }).strict();
const image = z.object({ src: localPath, alt: z.string().trim().min(1) }).strict();
const date = z.object({
  label: z.string().nullable(),
  value: z.string().regex(/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/).nullable(),
  precision: z.enum(['year', 'month', 'day']).nullable()
}).strict().superRefine((d, ctx) => {
  const expected = d.value?.length === 4 ? 'year' : d.value?.length === 7 ? 'month' : d.value?.length === 10 ? 'day' : null;
  const expanded = d.value?.length === 4 ? `${d.value}-01-01` : d.value?.length === 7 ? `${d.value}-01` : d.value;
  if (d.precision !== expected || (expanded && (!Number.isFinite(Date.parse(expanded)) || new Date(expanded).toISOString().slice(0, 10) !== expanded))) {
    ctx.addIssue({ code: 'custom', message: 'Invalid date or inconsistent precision' });
  }
});
export const entrySchema = z.object({
  id: z.string().regex(/^(game|project)-[a-z0-9]+(?:-[a-z0-9]+)*$/),
  kind: z.enum(['game', 'project']), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  legacyPath: z.string().regex(/^\/(games|projects)\/[^/]+$/).nullable(),
  title: z.string().trim().min(1), summary: z.string().nullable(),
  description: z.string().regex(/^descriptions\/[a-z0-9-]+\.md$/), date,
  featured: z.boolean(), collection: z.enum(['games', 'projects', 'archive']), tags: z.array(z.string().min(1)),
  links: z.array(link),
  media: z.object({ cover: localPath.nullable(), animation: localPath.nullable(), icon: localPath.nullable(),
    images: z.array(image), videos: z.array(z.object({ label: z.string(), src: url }).strict()),
    screenshots: z.record(z.string(), localPath) }).strict(),
  preview: z.object({ url: url.nullable(), desktop: z.boolean(), mobile: z.boolean() }).strict(),
  technologies: z.array(link), dependencies: z.array(link),
  legacyPresentation: z.record(z.string(), z.union([z.string(), z.boolean(), z.array(z.string())]))
}).strict();
export const catalogSchema = z.array(entrySchema).min(1).superRefine((entries, ctx) => {
  for (const field of ['id', 'slug', 'legacyPath', 'description']) {
    const seen = new Set();
    for (const entry of entries) {
      const value = entry[/** @type {'id'|'slug'|'legacyPath'|'description'} */ (field)];
      if (value && seen.has(value)) ctx.addIssue({ code: 'custom', message: `Duplicate ${field}: ${value}` });
      if (value) seen.add(value);
    }
  }
});
export const profileSchema = z.object({
  name: z.string().min(1), headline: z.string().min(1), bio: z.array(z.string().min(1)),
  gameIntroduction: z.array(z.string().min(1)),
  skills: z.array(z.object({label:z.string().min(1), category:z.enum(['frontend','backend','other'])}).strict()),
  links: z.array(z.object({label:z.string().min(1),url:z.url({protocol:/^(https?|mailto)$/})}).strict()),
  resume: localPath, legacyContactEndpoint: url
}).strict();
