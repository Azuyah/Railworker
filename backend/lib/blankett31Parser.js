const { normalizeText, normalizeForMatching, parsePdfWithTextOrOcr } = require('./ocrPdf');

const START_LABEL_PATTERN = '(?:datum\\s*)?fr\\.?\\s*o\\.?\\s*m\\.?';
const END_LABEL_PATTERN = '(?:datum\\s*)?t\\.?\\s*o\\.?\\s*m\\.?';
const FIELD_STOP_PATTERN = '(?:beteckning\\s*:|gr[aä]nspunkter?\\s*:|datum\\s+fr\\.?\\s*o\\.?\\s*m\\.?|fr\\.?\\s*o\\.?\\s*m\\.?|datum\\s+t\\.?\\s*o\\.?\\s*m\\.?|t\\.?\\s*o\\.?\\s*m\\.?)';
const DATE_VALUE_PATTERN = '([0-9]{4}[.\\-/][0-9]{1,2}[.\\-/][0-9]{1,2}|[0-9]{1,2}[.\\-/][0-9]{1,2}[.\\-/][0-9]{2,4})';
const TIME_VALUE_PATTERN = '([0-9]{1,2}[:.][0-9]{2})';

const cleanFieldValue = (value = '') =>
  normalizeText(value)
    .replace(/\s+/g, ' ')
    .replace(/^[\s:;,\-]+/, '')
    .trim();

const normalizeBeteckning = (value = '') =>
  cleanFieldValue(value)
    .replace(/\s*([_./-])\s*/g, '$1')
    .replace(/\s+/g, '_');

const normalizeDateValue = (value = '') => {
  const match = cleanFieldValue(value).match(/^(\d{1,4})[.\-/](\d{1,2})[.\-/](\d{1,4})$/);
  if (!match) {
    return '';
  }

  let year = '';
  let month = '';
  let day = '';

  if (match[1].length === 4) {
    year = match[1];
    month = match[2];
    day = match[3];
  } else {
    day = match[1];
    month = match[2];
    year = match[3].length === 2 ? `20${match[3]}` : match[3];
  }

  return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const normalizeTimeValue = (value = '') => {
  const match = cleanFieldValue(value).match(/^(\d{1,2})[:.](\d{2})$/);
  if (!match) {
    return '';
  }

  return `${match[1].padStart(2, '0')}:${match[2]}`;
};

const extractFirstTimeValue = (value = '') => {
  const explicitMatch = String(value).match(/(?:^|[\s,;])kl\.?\s*([0-9]{1,2}[:.][0-9]{2})(?![.\-/]\d)(?!\d)/i);
  if (explicitMatch?.[1]) {
    return explicitMatch[1];
  }

  const fallbackMatch = String(value).match(/(?:^|[^\d])([0-9]{1,2}[:.][0-9]{2})(?![.\-/]\d)(?!\d)/);
  return fallbackMatch?.[1] || '';
};

const extractFieldValue = (text, labelPattern, stopPattern = FIELD_STOP_PATTERN) => {
  const regex = new RegExp(`${labelPattern}\\s*[:\\-]?\\s*([\\s\\S]{0,180}?)\\s*(?=${stopPattern}|$)`, 'i');
  const match = String(text || '').match(regex);
  return cleanFieldValue(match?.[1] || '');
};

const extractBeteckning = (text) =>
  normalizeBeteckning(extractFieldValue(text, 'beteckning'));

const extractGranspunktValue = (text) =>
  cleanFieldValue(extractFieldValue(text, 'gr[aä]nspunkter?'));

const extractDateTimePair = (text, labelPattern, stopPattern) => {
  const snippet = extractFieldValue(text, labelPattern, stopPattern);
  if (!snippet) {
    return { date: '', time: '' };
  }

  const dateMatch = snippet.match(new RegExp(DATE_VALUE_PATTERN, 'i'));

  return {
    date: normalizeDateValue(dateMatch?.[1] || ''),
    time: normalizeTimeValue(extractFirstTimeValue(snippet)),
  };
};

const extractGranspunkt = (pages) => {
  for (const page of pages) {
    const lines = String(page.text || '')
      .split('\n')
      .map(normalizeText)
      .filter(Boolean);

    for (let index = 0; index < lines.length; index += 1) {
      const currentLine = lines[index];
      const normalizedLine = normalizeForMatching(currentLine);
      if (!normalizedLine.startsWith('granspunkter')) {
        continue;
      }

      for (let lookahead = index + 1; lookahead < Math.min(lines.length, index + 4); lookahead += 1) {
        const candidate = cleanFieldValue(lines[lookahead]);
        const normalizedCandidate = normalizeForMatching(candidate);
        if (
          candidate &&
          !normalizedCandidate.startsWith('granspunkter') &&
          !normalizedCandidate.startsWith('e-post') &&
          !normalizedCandidate.startsWith('banarbetsobjekts-id') &&
          !normalizedCandidate.startsWith('beteckning')
        ) {
          return candidate;
        }
      }
    }
  }

  return '';
};

const extractDateRanges = (text = '') =>
  Array.from(
    String(text || '').matchAll(
      /(\d{4}[.\-/]\d{2}[.\-/]\d{2})\s+(\d{2}[:.]\d{2})\s+(\d{4}[.\-/]\d{2}[.\-/]\d{2})\s+(\d{2}[:.]\d{2})/g
    ),
    (match) => ({
      startDate: normalizeDateValue(match[1]),
      startTime: normalizeTimeValue(match[2]),
      endDate: normalizeDateValue(match[3]),
      endTime: normalizeTimeValue(match[4]),
    })
  );

const dedupeAndSortEntries = (entries = []) =>
  entries
    .filter((entry) => entry?.beteckning || entry?.startDate || entry?.endDate)
    .filter((entry, index, array) => {
      const key = [
        normalizeBeteckning(entry.beteckning),
        entry.startDate || '',
        entry.startTime || '',
        entry.endDate || '',
        entry.endTime || '',
      ].join('|');

      return (
        index ===
        array.findIndex((candidate) => (
          [
            normalizeBeteckning(candidate.beteckning),
            candidate.startDate || '',
            candidate.startTime || '',
            candidate.endDate || '',
            candidate.endTime || '',
          ].join('|') === key
        ))
      );
    })
    .sort((left, right) => {
      const leftKey = `${left.startDate || '9999-99-99'} ${left.startTime || '99:99'} ${left.beteckning || ''}`;
      const rightKey = `${right.startDate || '9999-99-99'} ${right.startTime || '99:99'} ${right.beteckning || ''}`;
      return leftKey.localeCompare(rightKey, 'sv');
    });

const extractReferenceMeta = (text = '') => {
  const referenceSectionMatch = String(text || '').match(
    /Banarbetsobjekts-ID\s+Referens\s+(\d+)\s+([\s\S]{0,220}?)(?=Beteckning:|Låsning av växlar|$)/i
  );

  const banarbetsobjektsId = cleanFieldValue(referenceSectionMatch?.[1] || '');
  const referenceText = cleanFieldValue(referenceSectionMatch?.[2] || '')
    .replace(/\s*Beteckning\s*:.*$/i, '')
    .trim();
  const referenceWeekMatch = referenceText.match(/\bV\.?\s*(\d{1,2})\b/i);
  const projectLabelMatch = referenceText.match(/Projekt\s+(.+)$/i);
  const referenceEntryMatch = String(text || '').match(
    /Banarbetsobjekts-ID[\s\S]{0,260}?Beteckning:\s*([A-Za-z0-9_./-]+)(?:\s+PlaneringsID:\s*([A-Za-z0-9_./-]+))?/i
  );

  return {
    banarbetsobjektsId,
    referenceText,
    referenceWeek: referenceWeekMatch ? `V${String(referenceWeekMatch[1]).padStart(2, '0')}` : '',
    projectLabel: cleanFieldValue(projectLabelMatch?.[1] || ''),
    referenceBeteckning: normalizeBeteckning(referenceEntryMatch?.[1] || ''),
    referencePlaneringsId: cleanFieldValue(referenceEntryMatch?.[2] || ''),
  };
};

const extractEntries = (text, fallbackGranspunkt) => {
  const entries = [];
  const dateRanges = extractDateRanges(text);
  const referenceMeta = extractReferenceMeta(text);

  if (referenceMeta.referenceBeteckning && dateRanges[0]) {
    entries.push({
      beteckning: referenceMeta.referenceBeteckning,
      planeringsId: referenceMeta.referencePlaneringsId,
      granspunkt: fallbackGranspunkt || '',
      ...dateRanges[0],
    });
  }

  const entryPattern =
    /Beteckning:\s*([A-Za-z0-9_./-]+)(?:\s+PlaneringsID:\s*([A-Za-z0-9_./-]+))?[\s\S]{0,140}?Datum\s+fr\.?\s*o\.?\s*m\s*t\.?\s*o\.?\s*m[\s\S]{0,80}?(\d{4}[.\-/]\d{2}[.\-/]\d{2})\s+(\d{2}[:.]\d{2})\s+(\d{4}[.\-/]\d{2}[.\-/]\d{2})\s+(\d{2}[:.]\d{2})/gi;

  let match;
  while ((match = entryPattern.exec(String(text || ''))) !== null) {
    entries.push({
      beteckning: normalizeBeteckning(match[1] || ''),
      planeringsId: cleanFieldValue(match[2] || ''),
      granspunkt: fallbackGranspunkt || '',
      startDate: normalizeDateValue(match[3] || ''),
      startTime: normalizeTimeValue(match[4] || ''),
      endDate: normalizeDateValue(match[5] || ''),
      endTime: normalizeTimeValue(match[6] || ''),
    });
  }

  return dedupeAndSortEntries(entries);
};

const extractBlankett31Fields = (ocrPayload) => {
  const pages = Array.isArray(ocrPayload?.pages) ? ocrPayload.pages : [];
  const fullText = pages.map((page) => String(page.text || '')).join('\n');
  const granspunkt = extractGranspunkt(pages);
  const meta = extractReferenceMeta(fullText);
  const entries = extractEntries(fullText, granspunkt);
  const fallbackBeteckning = extractBeteckning(fullText);
  const fallbackStart = extractDateTimePair(fullText, START_LABEL_PATTERN, `(?:${END_LABEL_PATTERN}|${FIELD_STOP_PATTERN})`);
  const fallbackEnd = extractDateTimePair(fullText, END_LABEL_PATTERN, `(?:${START_LABEL_PATTERN}|${FIELD_STOP_PATTERN})`);
  const start = entries[0]
    ? { date: entries[0].startDate || '', time: entries[0].startTime || '' }
    : fallbackStart;
  const end = entries.length
    ? {
        date: entries[entries.length - 1].endDate || '',
        time: entries[entries.length - 1].endTime || '',
      }
    : fallbackEnd;
  const beteckning = entries[0]?.beteckning || fallbackBeteckning;

  return {
    beteckning,
    granspunkt,
    meta,
    start,
    end,
    entries:
      entries.length > 0
        ? entries
        : beteckning || start.date || end.date
          ? [
              {
                beteckning,
                granspunkt,
                startDate: start.date,
                startTime: start.time,
                endDate: end.date,
                endTime: end.time,
              },
            ]
          : [],
    rawText: fullText,
  };
};

const parseBlankett31Pdf = async (buffer) => {
  const payload = await parsePdfWithTextOrOcr(buffer, 'blankett31-');
  return extractBlankett31Fields(payload);
};

module.exports = {
  parseBlankett31Pdf,
};
