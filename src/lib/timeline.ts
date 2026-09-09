import type { Entry } from '../../content/schema.ts';
export type Track = 'company' | 'education' | 'project';
export const tracks = [
  { id: 'company', label: 'Career', color: 'var(--career)' },
  { id: 'education', label: 'Education', color: 'var(--education)' },
  { id: 'project', label: 'Project', color: 'var(--project)' },
] as const;
export type ProjectFilter = 'all' | 'game' | 'website';
export const projectFilters = [
  { id: 'all', label: 'Everything' },
  { id: 'game', label: 'Games' },
  { id: 'website', label: 'Websites' },
] as const;
export const rails = [
  { id: 'company', track: 'company', station: 0, color: 'var(--career)' },
  { id: 'education', track: 'education', station: 1, color: 'var(--education)' },
  { id: 'game', track: 'project', station: 2, color: 'var(--project)' },
  { id: 'website', track: 'project', station: 2.65, color: 'var(--website)' },
] as const;
export function railOf(entry: Entry, splitProjects = false) {
  if (!splitProjects && entry.kind === 'project') return rails[2];
  return rails.find((rail) => rail.id === (entry.kind === 'project' ? 'website' : entry.kind))!;
}
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

export function lastActive(
  entry: Entry,
  now = new Date(),
): { value: string; label: string } | null {
  if (entry.date.ongoing) return null;
  const value = entry.date.end ?? entry.date.value;
  if (!value) return null;
  const year = value.slice(0, 4);
  const month = value.slice(5, 7);
  return {
    value,
    label:
      year === String(now.getFullYear()) && month
        ? new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' }).format(
            new Date(`${year}-${month}-01T00:00:00Z`),
          )
        : year,
  };
}
