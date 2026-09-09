import { z } from 'zod';

export const assetPathSchema = z
  .string()
  .regex(/^assets\/(?:screenshots\/|extras\/)?[a-z0-9-]+\.(?:png|jpe?g|gif|webp|avif|svg)$/);
const externalUrl = z.url({ protocol: /^https?$/ });
const linkSchema = z.object({ label: z.string().trim().min(1), link: externalUrl }).strict();
const imageSchema = z.object({ src: assetPathSchema, alt: z.string().trim().min(1) }).strict();
const partialDate = z
  .string()
  .regex(/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/)
  .refine((value) => {
    const expanded =
      value.length === 4 ? `${value}-01-01` : value.length === 7 ? `${value}-01` : value;
    return (
      Number.isFinite(Date.parse(expanded)) &&
      new Date(expanded).toISOString().slice(0, 10) === expanded
    );
  }, 'Invalid calendar date');
export const dateSchema = z
  .object({
    label: z.string().nullable(),
    value: partialDate.nullable(),
    precision: z.enum(['year', 'month', 'day']).nullable(),
    end: partialDate.nullable().default(null),
    ongoing: z.boolean().default(false),
  })
  .strict()
  .superRefine((date, ctx) => {
    const precision =
      date.value?.length === 4
        ? 'year'
        : date.value?.length === 7
          ? 'month'
          : date.value?.length === 10
            ? 'day'
            : null;
    if (date.precision !== precision)
      ctx.addIssue({ code: 'custom', message: 'Date precision must match its value' });
    if (date.end && date.value && date.end < date.value)
      ctx.addIssue({ code: 'custom', message: 'End precedes start' });
    if (date.end && date.ongoing)
      ctx.addIssue({ code: 'custom', message: 'Ongoing entries cannot have an end date' });
  });
export const entrySchema = z
  .object({
    id: z.string().regex(/^(game|project|company|education)-[a-z0-9]+(?:-[a-z0-9]+)*$/),
    kind: z.enum(['game', 'project', 'company', 'education']),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    legacyPath: z
      .string()
      .regex(/^\/(games|projects)\/[^/]+$/)
      .nullable(),
    title: z.string().trim().min(1),
    role: z.string().trim().min(1),
    summary: z.string().trim().min(1),
    body: z.string().trim().min(1),
    date: dateSchema,
    featured: z.boolean(),
    showInEverything: z.boolean().default(false),
    draft: z.boolean().default(false),
    collection: z.enum(['games', 'projects', 'archive', 'timeline']),
    tags: z.array(z.string().min(1)),
    links: z.array(linkSchema),
    media: z
      .object({
        cover: assetPathSchema.nullable(),
        animation: assetPathSchema.nullable(),
        icon: assetPathSchema.nullable(),
        images: z.array(imageSchema),
        videos: z.array(z.object({ label: z.string(), src: externalUrl }).strict()),
        screenshots: z.record(z.string(), assetPathSchema),
      })
      .strict(),
    preview: z
      .object({ url: externalUrl.nullable(), desktop: z.boolean(), mobile: z.boolean() })
      .strict(),
    technologies: z.array(linkSchema),
    dependencies: z.array(linkSchema),
    legacyPresentation: z.record(
      z.string(),
      z.union([z.string(), z.boolean(), z.array(z.string())]),
    ),
    order: z.number().int().nonnegative(),
    provenance: z.object({ source: z.string().min(1), datesNeedReview: z.boolean() }).strict(),
  })
  .strict()
  .superRefine((entry, ctx) => {
    if (entry.id !== `${entry.kind}-${entry.slug}`)
      ctx.addIssue({ code: 'custom', message: 'ID must match kind and stable slug' });
    if ((entry.preview.desktop || entry.preview.mobile) && !entry.preview.url)
      ctx.addIssue({ code: 'custom', message: 'Playable preview needs a URL' });
  });
export type Entry = z.infer<typeof entrySchema>;
export const catalogSchema = z
  .array(entrySchema)
  .min(1)
  .superRefine((entries, ctx) => {
    for (const field of ['id', 'slug', 'legacyPath', 'order'] as const) {
      const seen = new Set<string | number>();
      for (const entry of entries) {
        const value = entry[field];
        if (value !== null) {
          if (seen.has(value))
            ctx.addIssue({ code: 'custom', message: `Duplicate ${field}: ${value}` });
          seen.add(value);
        }
      }
    }
  });
export const profileSchema = z
  .object({
    name: z.string().min(1),
    headline: z.string().min(1),
    bio: z.array(z.string()),
    gameIntroduction: z.array(z.string()),
    skills: z.array(
      z.object({ label: z.string(), category: z.enum(['frontend', 'backend', 'other']) }).strict(),
    ),
    links: z.array(
      z.object({ label: z.string(), url: z.url({ protocol: /^(https?|mailto)$/ }) }).strict(),
    ),
    resume: z.string().regex(/^\/assets\/resume\/[a-z0-9.-]+\.pdf$/),
    legacyContactEndpoint: externalUrl,
  })
  .strict();
