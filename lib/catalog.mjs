import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

export const statuses = new Set(['reference', 'received', 'ready', 'in-progress', 'needs-info', 'built']);
const slugPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const string = (value, max) => typeof value === 'string' && value.length > 0 && value.length <= max;
function source(value) {
  if (value == null || value === '') return null;
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.href.length > 2000) throw Error('Invalid source URL');
  return url.href;
}
export function categoryFor(tags) {
  const value = tags.join(' ').toLowerCase();
  for (const [category, regex] of [['Navigation', /sidebar|navigation/], ['Tables', /table|grid/], ['Menus', /menu|popover/], ['Onboarding', /onboard|checklist/], ['Messaging', /chat|messag/], ['Feedback', /skeleton|loading/]]) if (regex.test(value)) return category;
  return 'Other';
}
export function fromLedger(ledger) {
  if (ledger?.schema_version !== 1 || !Array.isArray(ledger.entries) || ledger.entries.length > 5000) throw Error('Unsupported or oversized ledger');
  const seen = new Set();
  return ledger.entries.map(entry => {
    if (!string(entry.slug, 100) || !slugPattern.test(entry.slug) || !Number.isSafeInteger(entry.revision) || entry.revision < 1 || !string(entry.title, 240) || !statuses.has(entry.status) || !Array.isArray(entry.tags) || entry.tags.length > 40 || entry.tags.some(t => !string(t, 80))) throw Error('Invalid package metadata');
    const id = `${entry.slug}@${entry.revision}`;
    if (seen.has(id)) throw Error('Duplicate revision');
    seen.add(id);
    // Deliberately do not spread entry: transport, body, paths and other fields stay private.
    return { id, slug: entry.slug, revision: entry.revision, title: entry.title,
      tags: entry.tags, category: categoryFor(entry.tags), status: entry.status,
      summary: `Package revision ${entry.revision}. ${entry.status === 'built' ? 'Build recorded in local intake; inspect its evidence before reuse.' : 'Reference package; no reusable implementation has been verified here.'}`,
      sourceUrl: source(entry.source_url), demo: false, implementationAvailable: false,
      humanApproved: false };
  });
}
export async function loadLedger(root) {
  const path = join(root, 'data', 'ledger.json');
  if ((await stat(path)).size > 5_000_000) throw Error('Ledger is too large');
  return fromLedger(JSON.parse((await readFile(path, 'utf8')).replace(/^\uFEFF/, '')));
}
export const demoCatalog = [
  ['gliding-sidebar', 'Gliding sidebar', 'A sectioned navigation rail with a moving active indicator and folding groups.', ['sidebar', 'motion', 'active', 'navigation']],
  ['fluid-table', 'Fluid table', 'An adaptive data table with resizable columns and animated row transitions.', ['table', 'resize', 'motion']],
  ['intent-menu', 'Intent-aware menu', 'A nested submenu that tolerates diagonal pointer movement.', ['menu', 'submenu', 'pointer']],
  ['setup-checklist', 'Setup checklist', 'A compact onboarding checklist with progress and contextual guidance.', ['onboarding', 'checklist', 'progress']],
  ['conversation-composer', 'Conversation composer', 'A chat input that grows with a message and supports attachments.', ['chat', 'composer', 'resize']],
  ['loading-skeleton', 'Loading skeleton', 'A calm placeholder layout while real content is loading.', ['loading', 'skeleton', 'motion']],
].map(([slug, title, summary, tags]) => ({ id: `demo-${slug}`, slug, revision: 0, title, summary, tags,
  category: categoryFor(tags), status: 'reference', sourceUrl: null, demo: true,
  implementationAvailable: false, humanApproved: false }));
