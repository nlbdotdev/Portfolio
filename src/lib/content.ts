import records from '../../content/entries.json';
import { catalogSchema } from '../../content/schema.js';
const descriptions = import.meta.glob<string>('../../content/descriptions/*.md', {
  query: '?raw', import: 'default', eager: true
});
export const entries = catalogSchema.parse(records).map(entry => ({
  ...entry,
  body: descriptions[`../../content/${entry.description}`]
}));

import profileData from '../../content/profile.json';
import { profileSchema } from '../../content/schema.js';
export const profile = profileSchema.parse(profileData);
