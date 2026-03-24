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

      const candidate = extractGranspunktValue(lines.slice(index, index + 3).join('\n'));
      if (candidate) {
        return candidate;
      }
    }
  }

  return '';
};

const extractEntries = (text, fallbackGranspunkt) => {
  const lines = String(text || '')
    .split('\n')
    .map(normalizeText)
    .filter(Boolean);
  const entries = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!normalizeForMatching(line).startsWith('beteckning')) {
      continue;
    }

    const segmentLines = [line];
    for (let lookahead = index + 1; lookahead < Math.min(lines.length, index + 10); lookahead += 1) {
      const candidate = lines[lookahead];
      if (normalizeForMatching(candidate).startsWith('beteckning')) {
        break;
      }
      segmentLines.push(candidate);
    }

    const segmentText = segmentLines.join('\n');
    const beteckning = extractBeteckning(segmentText);
    const granspunkt = extractGranspunktValue(segmentText) || fallbackGranspunkt || '';
    const start = extractDateTimePair(segmentText, START_LABEL_PATTERN, `(?:${END_LABEL_PATTERN}|${FIELD_STOP_PATTERN})`);
    const end = extractDateTimePair(segmentText, END_LABEL_PATTERN, `(?:${START_LABEL_PATTERN}|${FIELD_STOP_PATTERN})`);

    if (beteckning || start.date || end.date) {
      entries.push({
        beteckning,
        granspunkt,
        startDate: start.date,
        startTime: start.time,
        endDate: end.date,
        endTime: end.time,
      });
    }
  }

  return entries;
};

const extractBlankett31Fields = (ocrPayload) => {
  const pages = Array.isArray(ocrPayload?.pages) ? ocrPayload.pages : [];
  const fullText = pages.map((page) => String(page.text || '')).join('\n');
  const granspunkt = extractGranspunkt(pages);
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
