const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, '..', 'data', 'driftplats-registry.json');

const normalizeDriftplatsLookup = (value = '') =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();

let cachedRegistry = null;

const loadRegistry = () => {
  if (cachedRegistry) {
    return cachedRegistry;
  }

  const raw = fs.readFileSync(REGISTRY_PATH, 'utf8');
  const parsed = JSON.parse(raw);
  const items = Array.isArray(parsed?.items) ? parsed.items : [];

  const exactByCode = new Map();
  const byCode = new Map();
  const byName = new Map();

  items.forEach((item) => {
    const code = String(item?.code || '').trim();
    const name = String(item?.name || '').trim();
    const kind = String(item?.kind || '').trim();
    if (!code || !name) return;

    const record = { code, name, kind };
    if (!exactByCode.has(code)) {
      exactByCode.set(code, record);
    }

    byCode.set(normalizeDriftplatsLookup(code), record);
    byName.set(normalizeDriftplatsLookup(name), record);
  });

  cachedRegistry = {
    items,
    exactByCode,
    byCode,
    byName,
    namesByLength: items
      .map((item) => String(item?.name || '').trim())
      .filter(Boolean)
      .sort((left, right) => right.length - left.length),
  };

  return cachedRegistry;
};

const getDriftplatsCatalog = () => loadRegistry().items;

const resolveDriftplatsIdentifier = (value = '') => {
  const raw = String(value || '').trim();
  if (!raw) return null;

  const registry = loadRegistry();
  return (
    registry.exactByCode.get(raw) ||
    registry.byCode.get(normalizeDriftplatsLookup(raw)) ||
    registry.byName.get(normalizeDriftplatsLookup(raw)) ||
    null
  );
};

const searchDriftplatsRegistry = (query = '', limit = 25) => {
  const normalizedQuery = normalizeDriftplatsLookup(query);
  const all = getDriftplatsCatalog();
  if (!normalizedQuery) {
    return all.slice(0, limit);
  }

  return all
    .map((item) => {
      const code = normalizeDriftplatsLookup(item.code);
      const name = normalizeDriftplatsLookup(item.name);
      let score = -1;

      if (code === normalizedQuery) score = 500;
      else if (code.startsWith(normalizedQuery)) score = 400;
      else if (name.startsWith(normalizedQuery)) score = 300;
      else if (code.includes(normalizedQuery)) score = 200;
      else if (name.includes(normalizedQuery)) score = 100;

      return { item, score };
    })
    .filter(({ score }) => score >= 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return left.item.name.localeCompare(right.item.name, 'sv');
    })
    .map(({ item }) => item)
    .slice(0, limit);
};

module.exports = {
  getDriftplatsCatalog,
  loadDriftplatsRegistry: loadRegistry,
  normalizeDriftplatsLookup,
  resolveDriftplatsIdentifier,
  searchDriftplatsRegistry,
};
