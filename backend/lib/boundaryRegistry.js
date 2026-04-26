const {
  getDriftplatsCatalog,
  normalizeDriftplatsLookup,
} = require('./driftplatsRegistry');

const escapeRegExp = (value = '') => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getRegistryMaps = () => {
  const items = getDriftplatsCatalog();
  const exactByCode = new Map();
  const byCode = new Map();
  const byName = new Map();

  items.forEach((item) => {
    const code = String(item?.code || '').trim();
    const name = String(item?.name || '').trim();
    if (!code || !name) return;

    if (!exactByCode.has(code)) {
      exactByCode.set(code, {
        code,
        name,
        kind: String(item?.kind || '').trim(),
      });
    }

    byCode.set(normalizeDriftplatsLookup(code), {
      code,
      name,
      kind: String(item?.kind || '').trim(),
    });
    byName.set(normalizeDriftplatsLookup(name), {
      code,
      name,
      kind: String(item?.kind || '').trim(),
    });
  });

  const namesByLength = [...byName.values()]
    .sort((left, right) => right.name.length - left.name.length)
    .map((item) => item.name);

  return { exactByCode, byCode, byName, namesByLength };
};

const REGISTRY = getRegistryMaps();

const normalizeBoundaryToken = (value = '') =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .trim();

const resolveFromFullName = (token = '') => {
  const normalized = normalizeBoundaryToken(token);
  for (const name of REGISTRY.namesByLength) {
    const regex = new RegExp(`^(${escapeRegExp(name)})\\s*(.*)$`, 'i');
    const match = normalized.match(regex);
    if (!match) continue;

    const meta = REGISTRY.byName.get(normalizeDriftplatsLookup(name));
    if (!meta) continue;

    const point = String(match[2] || '').trim();
    return {
      raw: token,
      input: normalized,
      code: meta.code,
      name: meta.name,
      kind: meta.kind,
      point,
      canonicalShort: [meta.code, point].filter(Boolean).join(' '),
      canonicalLong: [meta.name, point].filter(Boolean).join(' '),
    };
  }

  return null;
};

const resolveFromCode = (token = '') => {
  const normalized = normalizeBoundaryToken(token);
  const match = normalized.match(/^([A-Za-zÅÄÖåäö]{1,8})\s*(.*)$/);
  if (!match) {
    return null;
  }

  const code = String(match[1] || '').trim();
  const meta = REGISTRY.exactByCode.get(code) || REGISTRY.byCode.get(normalizeDriftplatsLookup(code));
  if (!meta) {
    return null;
  }

  const point = String(match[2] || '').trim();
  return {
    raw: token,
    input: normalized,
    code: meta.code,
    name: meta.name,
    kind: meta.kind,
    point,
    canonicalShort: [meta.code, point].filter(Boolean).join(' '),
    canonicalLong: [meta.name, point].filter(Boolean).join(' '),
  };
};

const looksLikeInheritedPointToken = (token = '') =>
  /^[A-Za-z]?\d+[A-Za-z0-9/]*$/i.test(String(token || '').trim());

const resolveBoundaryToken = (token = '', inheritedCode = '') => {
  const normalized = normalizeBoundaryToken(token);
  if (!normalized) {
    return null;
  }

  if (inheritedCode && looksLikeInheritedPointToken(normalized)) {
    const inheritedMeta = REGISTRY.exactByCode.get(inheritedCode) || REGISTRY.byCode.get(normalizeDriftplatsLookup(inheritedCode));
    if (inheritedMeta) {
      return {
        raw: token,
        input: normalized,
        code: inheritedMeta.code,
        name: inheritedMeta.name,
        kind: inheritedMeta.kind,
        point: normalized,
        canonicalShort: `${inheritedMeta.code} ${normalized}`.trim(),
        canonicalLong: `${inheritedMeta.name} ${normalized}`.trim(),
      };
    }
  }

  const resolvedFromName = resolveFromFullName(normalized);
  if (resolvedFromName) {
    return resolvedFromName;
  }

  const resolvedFromCode = resolveFromCode(normalized);
  if (resolvedFromCode) {
    return resolvedFromCode;
  }

  if (inheritedCode) {
    const inheritedMeta = REGISTRY.byCode.get(normalizeDriftplatsLookup(inheritedCode));
    if (inheritedMeta) {
      return {
        raw: token,
        input: normalized,
        code: inheritedMeta.code,
        name: inheritedMeta.name,
        kind: inheritedMeta.kind,
        point: normalized,
        canonicalShort: `${inheritedMeta.code} ${normalized}`.trim(),
        canonicalLong: `${inheritedMeta.name} ${normalized}`.trim(),
      };
    }
  }

  return {
    raw: token,
    input: normalized,
    code: '',
    name: '',
    kind: '',
    point: normalized,
    canonicalShort: normalized,
    canonicalLong: normalized,
  };
};

const parseBoundaryGroup = (groupText = '') => {
  const normalized = normalizeBoundaryToken(groupText);
  if (!normalized) {
    return [];
  }

  let inheritedCode = '';
  return normalized
    .split(/\s*,\s*/)
    .map((part) => {
      const resolved = resolveBoundaryToken(part, inheritedCode);
      if (resolved?.code) {
        inheritedCode = resolved.code;
      }
      return resolved;
    })
    .filter(Boolean);
};

const resolveBoundaryExpression = (value = '') => {
  const normalized = normalizeBoundaryToken(value);
  const groups = normalized
    .split(/\s*-\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => ({
      raw: part,
      tokens: parseBoundaryGroup(part),
    }));

  const flatTokens = groups.flatMap((group) => group.tokens);
  return {
    input: value,
    normalized,
    groups,
    flatTokens,
    canonicalShort: groups
      .map((group) => group.tokens.map((token) => token.canonicalShort).join(', '))
      .join(' - '),
    canonicalLong: groups
      .map((group) => group.tokens.map((token) => token.canonicalLong).join(', '))
      .join(' - '),
  };
};

const searchBoundaryRegistry = (query = '', limit = 25) => {
  const normalizedQuery = normalizeDriftplatsLookup(query);
  const all = [...REGISTRY.exactByCode.values()];
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
  normalizeBoundaryToken,
  resolveBoundaryToken,
  resolveBoundaryExpression,
  searchBoundaryRegistry,
};
