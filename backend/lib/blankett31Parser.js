const { normalizeText, normalizeForMatching, parsePdfWithOcr } = require('./ocrPdf');

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
  const match = text.match(/Beteckning:\s*([A-Za-z0-9_./-]+)/i);
  return match?.[1] || '';
};

const extractAllMatches = (text, regex) => {
  const matches = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push(match);
  }
  return matches;
};

const extractEntries = (text, granspunkt) => {
  const beteckningMatches = extractAllMatches(
    text,
    /Beteckning:\s*([A-Za-z0-9_./-]+)\s*Datum\s+fr\.?o\.?m\s*([0-9]{4}-[0-9]{2}-[0-9]{2})\s*([0-9]{2}:[0-9]{2})?/gi
  );
  const endMatches = extractAllMatches(
    text,
    /t\.?o\.?m\s*([0-9]{4}-[0-9]{2}-[0-9]{2})\s*([0-9]{2}:[0-9]{2})?/gi
  );

  return beteckningMatches.map((match, index) => ({
    beteckning: match[1] || '',
    granspunkt: granspunkt || '',
    startDate: match[2] || '',
    startTime: match[3] || '',
    endDate: endMatches[index]?.[1] || '',
    endTime: endMatches[index]?.[2] || '',
  }));
};

const extractDateTimePair = (text, labelPattern) => {
  const regex = new RegExp(`${labelPattern}\\s*([0-9]{4}-[0-9]{2}-[0-9]{2})\\s*([0-9]{2}:[0-9]{2})?`, 'i');
  const match = text.match(regex);
  return {
    date: match?.[1] || '',
    time: match?.[2] || '',
  };
};

const extractBlankett31Fields = (ocrPayload) => {
  const pages = Array.isArray(ocrPayload?.pages) ? ocrPayload.pages : [];
  const fullText = pages.map((page) => String(page.text || '')).join('\n');
  const granspunkt = extractGranspunkt(pages);
  const entries = extractEntries(fullText, granspunkt);

  return {
    beteckning: extractBeteckning(fullText),
    granspunkt,
    start: extractDateTimePair(fullText, 'Datum\\s+fr\\.?o\\.?m\\s*'),
    end: extractDateTimePair(fullText, 't\\.?o\\.?m\\s*'),
    entries,
    rawText: fullText,
  };
};

const parseBlankett31Pdf = async (buffer) => {
  const payload = await parsePdfWithOcr(buffer, 'blankett31-');
  return extractBlankett31Fields(payload);
};

module.exports = {
  parseBlankett31Pdf,
};
