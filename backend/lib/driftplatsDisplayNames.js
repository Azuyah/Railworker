const cleanText = (value = '') =>
  String(value || '')
    .replace(/\r/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const escapeRegExp = (value = '') => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeDisplayNameKey = (value = '') => cleanText(value).toLowerCase();

const DISP_DISPLAY_NAME_OVERRIDES = new Map([
  ['Landskrona Östra', 'Landskrona Ö'],
  ['Båstad norra', 'Båstad N'],
]);

const DISP_DISPLAY_CODE_OVERRIDES = new Map([
  ['Lkö', 'Landskrona Ö'],
  ['Bån', 'Båstad N'],
  ['Blb', 'Billeberga'],
]);

const getDispDisplayNameForOfficialName = (value = '') => {
  const cleaned = cleanText(value);
  if (!cleaned) return '';

  const directMatch = DISP_DISPLAY_NAME_OVERRIDES.get(cleaned);
  if (directMatch) return directMatch;

  const normalizedKey = normalizeDisplayNameKey(cleaned);
  for (const [officialName, displayName] of DISP_DISPLAY_NAME_OVERRIDES.entries()) {
    if (normalizeDisplayNameKey(officialName) === normalizedKey) {
      return displayName;
    }
  }

  return cleaned;
};

const getDispDisplayNameForCode = (code = '', fallbackName = '') => {
  const cleanedCode = cleanText(code);
  if (cleanedCode && DISP_DISPLAY_CODE_OVERRIDES.has(cleanedCode)) {
    return DISP_DISPLAY_CODE_OVERRIDES.get(cleanedCode);
  }

  return getDispDisplayNameForOfficialName(fallbackName);
};

const applyDispDisplayNames = (value = '') => {
  let text = cleanText(value);
  if (!text) return '';

  const names = [...DISP_DISPLAY_NAME_OVERRIDES.keys()].sort((left, right) => right.length - left.length);
  names.forEach((officialName) => {
    const displayName = DISP_DISPLAY_NAME_OVERRIDES.get(officialName);
    const regex = new RegExp(
      `(^|[\\s,\\-–(/])(${escapeRegExp(officialName)})(?=([\\s,\\-–)./]|$))`,
      'giu'
    );
    text = text.replace(regex, (_, prefix = '') => `${prefix}${displayName}`);
  });

  return text;
};

module.exports = {
  DISP_DISPLAY_NAME_OVERRIDES,
  DISP_DISPLAY_CODE_OVERRIDES,
  getDispDisplayNameForOfficialName,
  getDispDisplayNameForCode,
  applyDispDisplayNames,
};
