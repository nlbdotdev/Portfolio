import type { Entry } from '../../content/schema';
import { formatTimelineDate } from './timeline';

const origin = 'https://nlb.dev';
const groups = [
  ['Career', 'company'],
  ['Education', 'education'],
  ['Games', 'game'],
  ['Web and software projects', 'project'],
] as const;
const line = (value: string) => value.replace(/[\r\n]+/g, ' ').trim();
const label = (value: string) => line(value).replace(/[\[\]\\]/g, '\\$&');

export function renderLlms(
  entries: Entry[],
  profile: {
    name: string;
    headline: string;
    bio: string[];
    skills: { label: string; url: string | null }[];
  },
  full = false,
) {
  const published = entries.filter((entry) => !entry.draft);
  const result = [
    `# ${profile.name} — NLB.DEV`,
    '',
    `> Personal portfolio: ${profile.headline}. Career history, education, games, and software projects.`,
    '',
    ...profile.bio.map(line),
    '',
    'Dates describe the recorded activity or employment period. Present means ongoing. Display order may be editorial; use the stated dates for chronology. Some historical dates are approximate. Company and game references describe experience, not endorsement.',
    '',
    '## Site',
    '',
    `- [Work](${origin}/): Interactive portfolio and timeline; item links open individual details.`,
    `- [About](${origin}/about): Background and skills.`,
    `- [Blog](${origin}/blog): Placeholder; no published articles yet.`,
    `- [Full portfolio text](${origin}/llms-full.txt): All published entry descriptions, dates, skills, and external links without JavaScript.`,
    '',
  ];
  for (const [heading, kind] of groups) {
    result.push(`## ${heading}`, '');
    for (const entry of published.filter((entry) => entry.kind === kind)) {
      const url = `${origin}/?item=${encodeURIComponent(entry.slug)}`;
      if (!full) {
        result.push(
          `- [${label(entry.title)}](${url}): ${line(entry.role)}; ${formatTimelineDate(entry)}. ${line(entry.summary)}`,
        );
      } else {
        result.push(
          `### ${line(entry.title)}`,
          '',
          `Role: ${line(entry.role)}`,
          `Dates: ${formatTimelineDate(entry)}`,
          `View: ${url}`,
          '',
        );
        if (entry.provenance.datesNeedReview)
          result.push('Historical date precision may need confirmation.', '');
        result.push(
          entry.summary,
          '',
          entry.body.replace(/!\[[^\]]*\]\(assets\/[^)]+\)/g, '').trim(),
          '',
        );
        for (const link of entry.links) result.push(`- [${label(link.label)}](${link.link})`);
        if (entry.preview.url) result.push(`- [Playable preview](${entry.preview.url})`);
        if (entry.technologies.length)
          result.push('', `Technologies: ${entry.technologies.map((t) => t.label).join(', ')}`);
        result.push('');
      }
    }
    result.push('');
  }
  if (full) {
    result.push('## Skills', '');
    for (const skill of profile.skills)
      result.push(skill.url ? `- [${label(skill.label)}](${skill.url})` : `- ${line(skill.label)}`);
  }
  return result.join('\n').trim() + '\n';
}
