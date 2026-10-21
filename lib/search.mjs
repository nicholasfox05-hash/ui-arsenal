const groups = [
  ['sidebar', 'rail', 'navigation', 'nav'],
  ['motion', 'animated', 'animation', 'animate', 'moving', 'move', 'gliding', 'glide', 'sliding', 'slide', 'stretch', 'spring'],
  ['table', 'tables', 'tabular', 'grid', 'rows', 'columns'],
  ['menu', 'menus', 'submenu', 'dropdown', 'popover'],
  ['onboarding', 'checklist', 'welcome', 'setup', 'getting started'],
  ['resize', 'resizable', 'resizing', 'responsive', 'fluid', 'adaptive'],
  ['chat', 'conversation', 'messages', 'messaging', 'composer'],
  ['loading', 'skeleton', 'placeholder'],
  ['active', 'selected', 'selection', 'indicator', 'highlight'],
];
const stop = new Set('a an the with and or for to of in on that which is are i want need show find me some please something it can has have like only components component ui'.split(' '));
export const normalize = text => String(text).normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
export const words = text => [...new Set(normalize(text).split(/\s+/).filter(x => x && !stop.has(x)))];
function variants(term) {
  const group = groups.find(g => g.includes(term));
  return new Set(group || [term]);
}
function terms(query) { return words(query).map(term => ({ term, variants: variants(term) })); }
function matchFields(record, queryTerms) {
  const fields = [[record.title, 5], [record.tags.join(' '), 4], [record.category, 3], [record.summary, 1]];
  let score = 0; const matches = [];
  for (const { term, variants: set } of queryTerms) {
    let best = 0, matched = '';
    for (const [text, weight] of fields) for (const token of words(text)) {
      const value = token === term ? weight * 2 : set.has(token) ? weight : 0;
      if (value > best) { best = value; matched = token; }
    }
    if (best) { score += best; matches.push({ term, matched, kind: matched === term ? 'exact' : 'related-term' }); }
  }
  return { score, matches };
}
export function search(catalog, query = '', options = {}) {
  if (typeof query !== 'string' || query.length > 500) throw new RangeError('Search must be 500 characters or fewer.');
  const queryTerms = terms(query);
  const limit = options.limit ?? 50;
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError('Limit must be between 1 and 100.');
  const rows = catalog.filter(r => (!options.status || r.status === options.status) && (!options.category || r.category === options.category));
  const results = rows.map(component => ({ component, ...matchFields(component, queryTerms) }))
    .filter(r => !queryTerms.length || r.score > 0)
    .sort((a, b) => b.score - a.score || a.component.title.localeCompare(b.component.title) || a.component.id.localeCompare(b.component.id));
  return { query, mode: 'local-vocabulary', total: results.length, results: results.slice(0, limit), terms: queryTerms.map(x => x.term) };
}
export function related(catalog, id, limit = 5) {
  const item = catalog.find(x => x.id === id);
  if (!item) return [];
  const tags = new Set(item.tags.flatMap(t => [...variants(normalize(t))]));
  return catalog.filter(x => x.id !== id).map(component => {
    const sharedTags = component.tags.filter(tag => tags.has(normalize(tag)));
    return { component, sharedTags, score: sharedTags.length + (component.category === item.category ? 1 : 0) };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score || a.component.title.localeCompare(b.component.title)).slice(0, limit);
}
