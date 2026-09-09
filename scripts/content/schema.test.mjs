import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { catalogSchema } from '../../content/schema.js';
const data = JSON.parse(readFileSync(new URL('../../content/entries.json', import.meta.url)));
const mutate = change => { const copy = structuredClone(data); change(copy); return catalogSchema.safeParse(copy).success; };
test('complete migrated catalog validates', () => assert.equal(catalogSchema.safeParse(data).success, true));
test('duplicate identities are rejected', () => assert.equal(mutate(x=>x.push(x[0])), false));
test('unsafe URLs and traversal are rejected', () => {
  assert.equal(mutate(x=>x[0].links[0].link='javascript:alert(1)'),false);
  assert.equal(mutate(x=>x[0].description='../secret.md'),false);
  assert.equal(mutate(x=>x[0].media.cover='/assets/../secret'),false);
});
test('invalid calendar dates and false precision are rejected', () => {
  assert.equal(mutate(x=>x[0].date={label:'Bad',value:'2024-02-30',precision:'day'}),false);
  assert.equal(mutate(x=>x[0].date={label:'2024',value:'2024',precision:'day'}),false);
});
test('unknown and partial dates are allowed without invented days', () => {
  assert.equal(mutate(x=>x[0].date={label:'TBD',value:null,precision:null}),true);
  assert.equal(mutate(x=>x[0].date={label:'2019',value:'2019',precision:'year'}),true);
});
