import type { Entry } from '../../content/schema.ts';
export type Track = 'company' | 'education' | 'project';
export const tracks = [
  { id: 'company', label: 'Company', color: '#b54c2d' },
  { id: 'education', label: 'Education', color: '#64794b' },
  { id: 'project', label: 'Project', color: '#366b8a' },
] as const;
export function trackOf(entry: Entry): Track {
  return entry.kind === 'company'
    ? 'company'
    : entry.kind === 'education'
      ? 'education'
      : 'project';
}
export function sortTimeline(entries: Entry[]): Entry[] {
  return [...entries].sort(
    (a, b) => (b.date.value ?? '').localeCompare(a.date.value ?? '') || a.order - b.order,
  );
}
export function yearOf(entry: Entry): string {
  return entry.date.value?.slice(0, 4) ?? 'Undated';
}
export function isArchive(entry: Entry): boolean {
  return entry.collection === 'archive' || !entry.date.value || entry.date.value < '2020';
}
export function matchesSearch(entry: Entry, query: string): boolean {
  return `${entry.title} ${entry.role} ${entry.summary} ${entry.tags.join(' ')}`
    .toLowerCase()
    .includes(query.trim().toLowerCase());
}
