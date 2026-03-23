const { normalizeText, normalizeForMatching, parsePdfWithTextOrOcr } = require('./ocrPdf');

const getNextNonEmptyLine = (lines, startIndex) => {
  for (let index = startIndex; index < lines.length; index += 1) {
    const candidate = normalizeText(lines[index]);
    if (candidate) {
      return candidate;
    }
  }

  return '';
};

const extractGranspunkt = (pages) => {
  for (const page of pages) {
    const lines = String(page.text || '').split('\n');
    for (let index = 0; index < lines.length; index += 1) {
      const currentLine = normalizeForMatching(lines[index]);
      if (currentLine === 'granspunkter') {
        return getNextNonEmptyLine(lines, index + 1);
      }
    }
  }

  return '';
};

const extractBeteckning = (text) => {
  const lines = String(text || '')
    .split('\n')
    .map(normalizeText)
    .filter(Boolean);
  const beteckningLine = lines.find((line) => normalizeForMatching(line).startsWith('beteckning:'));
  const rawValue = beteckningLine ? beteckningLine.replace(/^Beteckning:\s*/i, '') : '';

  return normalizeText(rawValue)
    .replace(/\s*([_./-])\s*/g, '$1')
    .replace(/\s+/g, '_');
};

const extractDateTimePair = (text, labelPattern) => {
  const regex = new RegExp(`${labelPattern}\\s*([0-9]{4}-[0-9]{2}-[0-9]{2})\\s*([0-9]{2}:[0-9]{2})?`, 'i');
  const match = text.match(regex);
  return {
    date: match?.[1] || '',
    time: match?.[2] || '',
  };
};

const extractEntries = (text, granspunkt) => {
  const lines = String(text || '')
    .split('\n')
    .map(normalizeText)
    .filter(Boolean);
  const entries = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!normalizeForMatching(line).startsWith('beteckning:')) {
      continue;
    }

    const beteckning = extractBeteckning(line);
    let start = { date: '', time: '' };
    let end = { date: '', time: '' };

    for (let lookahead = index; lookahead < Math.min(lines.length, index + 6); lookahead += 1) {
      const candidate = lines[lookahead];
      if (lookahead > index && normalizeForMatching(candidate).startsWith('beteckning:')) {
        break;
      }

      if (!start.date) {
        start = extractDateTimePair(candidate, 'Datum\\s+fr\\.?o\\.?m\\s*');
      }
      if (!end.date) {
        end = extractDateTimePair(candidate, 't\\.?o\\.?m\\s*');
      }
    }

    if (beteckning || start.date || end.date) {
      entries.push({
        beteckning,
        granspunkt: granspunkt || '',
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
  const beteckning = extractBeteckning(fullText);
  const start = extractDateTimePair(fullText, 'Datum\\s+fr\\.?o\\.?m\\s*');
  const end = extractDateTimePair(fullText, 't\\.?o\\.?m\\s*');

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
