const BASE_PHONE_OPTIONS = [
  '010-127 12 60 Helsingborg - Halmstad',
  '010-127 12 61 Helsingborg - Arlöv, Teckomatorp, Lund',
  '010-127 12 62 Helsingborg',
  '010-127 12 80 Pebberholmen',
  '010-127 12 32 Hässleholm',
  '010-127 12 42 Helsingborg - Åstorp, Teckomatorp, Hässleholm',
  '010-127 12 41 Kristianstad',
  '010-127 42 35 Borlänge',
  '010-127 42 24 Borlänge - Avesta Krylbo',
  '010-127 42 25 Storvik - Frövi',
];

const MALMO_RULES = [
  {
    phone: '010-127 12 32 Hässleholm',
    keywords: ['hassleholm', 'hm'],
    minScore: 1,
  },
  {
    phone: '010-127 12 62 Helsingborg',
    keywords: ['helsingborg', 'hbgb', 'helsingborg central'],
    minScore: 1,
  },
  {
    phone: '010-127 12 60 Helsingborg - Halmstad',
    keywords: ['helsingborg', 'kattarp', 'angelholm', 'eldsberga', 'halmstad'],
    minScore: 2,
  },
  {
    phone: '010-127 12 61 Helsingborg - Arlöv, Teckomatorp, Lund',
    keywords: [
      'helsingborg',
      'gantofta',
      'vallakra',
      'tagarp',
      'billeberga',
      'teckomatorp',
      'eslov',
      'kavlinge',
      'arlov',
      'lund',
      'malmo',
      'hyllie',
      'fosieby',
      'ostervarn',
    ],
    minScore: 2,
  },
  {
    phone: '010-127 12 42 Helsingborg - Åstorp, Teckomatorp, Hässleholm',
    keywords: [
      'helsingborg',
      'astorp',
      'bjuv',
      'teckomatorp',
      'svalov',
      'kvidinge',
      'klippan',
      'perstorp',
      'hassleholm',
    ],
    minScore: 2,
  },
  {
    phone: '010-127 12 41 Kristianstad',
    keywords: ['kristianstad', 'crgb'],
    minScore: 1,
  },
];

const normalizeCatalogText = (value = '') =>
  String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const splitCatalogTokens = (value = '') =>
  normalizeCatalogText(value)
    .split(/\s+/)
    .filter(Boolean);

export const fjtklPhoneOptions = BASE_PHONE_OPTIONS;

export const getCatalogPhoneOptions = (extraOptions = []) =>
  Array.from(new Set([...BASE_PHONE_OPTIONS, ...extraOptions].filter(Boolean)));

export const matchFjtklPhoneFromCatalog = ({
  projectName = '',
  plats = '',
  granspunkter = '',
  entry = null,
} = {}) => {
  const haystack = [
    projectName,
    plats,
    granspunkter,
    entry?.beteckning || '',
    entry?.granspunkt || '',
  ].join(' ');

  const normalizedHaystack = normalizeCatalogText(haystack);
  const haystackTokens = new Set(splitCatalogTokens(haystack));

  let bestMatch = null;

  MALMO_RULES.forEach((rule) => {
    const matchedKeywords = rule.keywords.filter((keyword) => {
      const normalizedKeyword = normalizeCatalogText(keyword);
      return normalizedHaystack.includes(normalizedKeyword) || haystackTokens.has(normalizedKeyword);
    });

    if (matchedKeywords.length < (rule.minScore || 1)) {
      return;
    }

    const candidate = {
      phone: rule.phone,
      matchedKeywords,
      score: matchedKeywords.length,
    };

    if (!bestMatch || candidate.score > bestMatch.score) {
      bestMatch = candidate;
    }
  });

  return bestMatch;
};
