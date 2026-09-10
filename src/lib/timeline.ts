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
export function timelineDate(entry: Entry): string | null {
  return entry.date.end ?? entry.date.value;
}
export function sortTimeline(entries: Entry[]): Entry[] {
  const sorted = [...entries].sort(
    (a, b) => (timelineDate(b) ?? '').localeCompare(timelineDate(a) ?? '') || a.order - b.order,
  );
  // Editorial placement changes presentation only, never employment dates.
  for (const entry of entries) {
    if (!entry.timelineAfter) continue;
    const anchor = sorted.find((candidate) => candidate.id === entry.timelineAfter);
    if (!anchor || yearOf(anchor) !== yearOf(entry)) continue;
    sorted.splice(sorted.indexOf(entry), 1);
    sorted.splice(sorted.indexOf(anchor) + 1, 0, entry);
  }
  return sorted;
}
export function yearOf(entry: Entry): string {
  return timelineDate(entry)?.slice(0, 4) ?? 'Undated';
}
export const ARCHIVE_BEFORE_YEAR = 2020;

export function isArchive(entry: Entry): boolean {
  const date = timelineDate(entry);
  return entry.collection === 'archive' || !date || date < String(ARCHIVE_BEFORE_YEAR);
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

/** Preserve chronological order across the archive boundary, including promoted older entries. */
export function splitTimeline(entries: Entry[], includeHighlights = false) {
  let boundary = 0;
  entries.forEach((entry, index) => {
    if (!isArchive(entry) || (includeHighlights && entry.showInEverything)) boundary = index + 1;
  });
  return { visible: entries.slice(0, boundary), history: entries.slice(boundary) };
}

/** Display month precision without discarding exact source dates used for sorting. */
export function formatTimelineDate(entry: Entry): string {
  const format = (value: string) =>
    value.length === 4
      ? value
      : new Intl.DateTimeFormat('en-US', {
          month: 'short',
          year: 'numeric',
          timeZone: 'UTC',
        }).format(new Date(`${value.slice(0, 7)}-01T00:00:00Z`));
  if (!entry.date.value) return 'Date to be added';
  const start = format(entry.date.value);
  const suffix = entry.date.label?.includes(' · ')
    ? ` · ${entry.date.label.split(' · ').slice(1).join(' · ')}`
    : '';
  return `${start}${entry.date.ongoing ? ' — Present' : entry.date.end ? ` — ${format(entry.date.end)}` : ''}${suffix}`;
}
