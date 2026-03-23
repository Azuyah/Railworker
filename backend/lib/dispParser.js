const { normalizeText, normalizeForMatching, parsePdfWithOcr } = require('./ocrPdf');

const extractAllMatches = (text, regex) => {
  const matches = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push(match);
  }
  return matches;
};

const normalizeProjectTitle = (text = '') =>
  normalizeText(text)
    .replace(/\s*-\s*/g, '-')
    .replace(/\s{2,}/g, ' ')
    .trim();

const extractProjectName = (pages) => {
  const firstPageLines = String(pages[0]?.text || '')
    .split('\n')
    .map(normalizeText)
    .filter(Boolean);

  const lineName = firstPageLines.find((line) => normalizeForMatching(line).startsWith('dispositionsarbetsplan '));
  const weekAndDays = firstPageLines.find((line) => /^V\d+\s+/i.test(line));
  const objectNumber = firstPageLines.find((line) => /Banobjekt-Vnr/i.test(line));

  const projectBase = lineName ? lineName.replace(/^Dispositionsarbetsplan\s+/i, '') : '';
  const projectWeek = normalizeProjectTitle(weekAndDays || '');
  const objectValue = objectNumber?.match(/(\d+(?:-\d+)?)/)?.[1] || '';

  return normalizeProjectTitle([projectBase, projectWeek, objectValue].filter(Boolean).join(' '));
};

const extractPlats = (pages) => {
  const firstPageLines = String(pages[0]?.text || '')
    .split('\n')
    .map(normalizeText)
    .filter(Boolean);
  const objectIndex = firstPageLines.findIndex((line) => /Banobjekt-Vnr/i.test(line));
  if (objectIndex === -1) {
    return '';
  }

  const routeLines = [];
  for (let index = objectIndex + 1; index < firstPageLines.length; index += 1) {
    const line = firstPageLines[index];
    if (!line || /^\(.*\)$/.test(line)) {
      continue;
    }
    if (/Förplanera/i.test(line) || /Gränspunkter/i.test(line)) {
      break;
    }

    routeLines.push(line.replace(/\.$/, ''));
  }

  const parts = routeLines
    .join(' ')
    .split(',')
    .map((part) => normalizeText(part))
    .filter(Boolean);

  if (parts.length) {
    return parts.join(' - ');
  }

  return '';
};

const extractPhoneSection = (pages) => {
  const lastPagesText = pages.slice(-2).map((page) => String(page.text || '')).join('\n');
  return lastPagesText;
};

const formatPhone = (value = '') =>
  value
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

const extractPhoneNumbers = (text) => {
  const lines = text.split('\n').map(normalizeText).filter(Boolean);
  const telIndex = lines.findIndex((line) => normalizeForMatching(line) === 'telefonnummer.');

  if (telIndex === -1) {
    return {
      namn: '',
      telefonnummer: '',
      nodnummer: '',
    };
  }

  const scope = lines.slice(telIndex, telIndex + 30);
  const numbers = scope
    .filter((line) => /^010[- ]\s*\d{3}\s*\d{2}\s*\d{2}/.test(line))
    .map(formatPhone);
  const fjtklLine = scope.find((line) => /^Fjtkl\s+/i.test(line));

  return {
    namn: fjtklLine ? normalizeText(fjtklLine.replace(/^Fjtkl\s+/i, '')) : '',
    nodnummer: numbers[0] || '',
    telefonnummer: numbers[numbers.length - 1] || '',
  };
};

const extractDispEntries = (pages) => {
  const page = pages.find((item) => Number(item.page) === 3);
  const lines = Array.isArray(page?.lines) ? page.lines : [];
  const labelLines = lines
    .filter((line) => /^26_[0-9]{4}$/i.test(normalizeText(line.text || '')))
    .sort((a, b) => b.y - a.y);
  const dateTimeCandidates = lines
    .flatMap((line) => {
      const rawText = String(line.text || '');
      const normalized = normalizeText(rawText);
      const matches = Array.from(normalized.matchAll(/(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/g));

      if (!matches.length) {
        return [];
      }

      return matches.map((match, matchIndex) => ({
        x: Number(line.x) + (matchIndex * 0.2),
        y: Number(line.y),
        rawText,
        text: match[1],
      }));
    })
    .sort((a, b) => b.y - a.y || a.x - b.x);
  const startCandidates = dateTimeCandidates
    .filter((line) => line.x < 0.55)
    .sort((a, b) => b.y - a.y || a.x - b.x);
  const endCandidates = dateTimeCandidates
    .filter((line) => line.x >= 0.45 || /^[\-\u2022]/.test(normalizeText(line.rawText || '')))
    .sort((a, b) => b.y - a.y || a.x - b.x);

  return labelLines.map((labelLine, index) => {
    const rowY = Number(labelLine.y);
    const sameRowValues = dateTimeCandidates
      .filter((candidate) => Math.abs(candidate.y - rowY) < 0.013)
      .sort((a, b) => a.x - b.x);

    let startValue = '';
    let endValue = '';

    if (sameRowValues.length >= 2) {
      startValue = sameRowValues[0].text;
      endValue = sameRowValues[sameRowValues.length - 1].text;
    } else if (sameRowValues.length === 1) {
      if (sameRowValues[0].x < 0.5) {
        startValue = sameRowValues[0].text;
      } else {
        endValue = sameRowValues[0].text;
      }
    }

    if (!startValue) {
      startValue = startCandidates[index]?.text || '';
    }
    if (!endValue) {
      endValue = endCandidates[index]?.text || '';
    }

    const [startDate = '', startTime = ''] = String(startValue || '').split(/\s+/);
    const [endDate = '', endTime = ''] = String(endValue || '').split(/\s+/);

    return {
      beteckning: normalizeText(labelLine.text || ''),
      startDate,
      startTime,
      endDate,
      endTime,
    };
  }).filter((entry) => entry.beteckning && entry.startDate && entry.endDate);
};

const normalizeBeteckningKey = (value = '') =>
  String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

const entryMatchesPeriod = (left = {}, right = {}) =>
  left.startDate === right.startDate &&
  left.startTime === right.startTime &&
  left.endDate === right.endDate &&
  left.endTime === right.endTime;

const cleanBoundaryToken = (value = '') =>
  normalizeText(value)
    .replace(/\.+/g, '')
    .replace(/B[Il1]b/gi, 'Blb')
    .replace(/Тр/gi, 'Tp')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/[\s\-–—]+$/, '')
    .trim();

const isSignalPointToken = (value = '') => /\d/.test(cleanBoundaryToken(value));
const extractSignalTokens = (value = '') =>
  cleanBoundaryToken(value)
    .match(/[A-Za-zÅÄÖåäö]{1,4}\d+(?:,\s*[A-Za-zÅÄÖåäö]{1,4}\d+)*/g) || [];

const extractDispSections = (pages) => {
  const page = pages.find((item) => Number(item.page) === 3);
  const lines = Array.isArray(page?.lines) ? page.lines : [];
  const normalizedLines = lines.map((line) => ({
    ...line,
    text: cleanBoundaryToken(line.text || ''),
  }));

  const sectionRows = normalizedLines
    .filter((line) => /^Delområde\s+\d+/i.test(line.text))
    .sort((a, b) => b.y - a.y);

  return sectionRows.map((row, index) => {
    const displayIndex = Number(String(row.text).match(/^Delområde\s+(\d+)/i)?.[1] || index + 1);
    const sameRow = normalizedLines.filter((line) => Math.abs(Number(line.y) - Number(row.y)) < 0.015);
    const leftBoundary = sameRow
      .filter(
        (line) =>
          Number(line.x) >= 0.34 &&
          Number(line.x) < 0.45 &&
          line.text !== '-' &&
          isSignalPointToken(line.text)
      )
      .sort((a, b) => a.x - b.x)[0];
    const rightBoundary = sameRow
      .filter(
        (line) =>
          Number(line.x) >= 0.47 &&
          Number(line.x) < 0.62 &&
          !/^Spår/i.test(line.text) &&
          (isSignalPointToken(line.text) || /\s-\s/.test(line.text))
      )
      .sort((a, b) => a.x - b.x)[0];
    const spar = sameRow
      .filter((line) => Number(line.x) >= 0.67 && /^Spår/i.test(line.text))
      .sort((a, b) => a.x - b.x)[0];

    const leftText = cleanBoundaryToken(leftBoundary?.text || '');
    const rightText = cleanBoundaryToken(rightBoundary?.text || '');
    const rightContainsFullRange = /\s-\s/.test(rightText);
    const mergedSignalTokens = extractSignalTokens(leftText);
    let startBoundary = rightContainsFullRange ? cleanBoundaryToken(rightText.split(/\s-\s/)[0] || '') : leftText;
    let endBoundary = rightContainsFullRange ? cleanBoundaryToken(rightText.split(/\s-\s/).slice(1).join(' - ') || '') : rightText;

    if (!rightText && mergedSignalTokens.length >= 2) {
      startBoundary = mergedSignalTokens[mergedSignalTokens.length - 2];
      endBoundary = mergedSignalTokens[mergedSignalTokens.length - 1];
    }

    const boundaryText = [startBoundary, endBoundary].filter(Boolean).join(' - ');

    return {
      index,
      displayIndex,
      type: 'Delområde',
      namingMode: 'NUMBERS',
      signal: [boundaryText, cleanBoundaryToken(spar?.text || '')].filter(Boolean).join(', '),
      granspunktStart: startBoundary,
      granspunktSlut: endBoundary,
      granspunkter: boundaryText,
      spar: cleanBoundaryToken(spar?.text || ''),
    };
  }).filter((section) => section.granspunkter || section.spar);
};

const compareDispWithBlankett31 = (dispEntries = [], blankett31Entries = []) => {
  if (!blankett31Entries.length) {
    return { matches: true, issues: [] };
  }

  const issues = [];

  blankett31Entries.forEach((blankettEntry) => {
    const exactKey = normalizeBeteckningKey(blankettEntry.beteckning);
    let dispEntry = dispEntries.find(
      (entry) =>
        entry.beteckning === blankettEntry.beteckning ||
        normalizeBeteckningKey(entry.beteckning) === exactKey
    );

    if (!dispEntry) {
      const samePeriodEntries = dispEntries.filter((entry) => entryMatchesPeriod(entry, blankettEntry));
      if (samePeriodEntries.length === 1) {
        dispEntry = samePeriodEntries[0];
      }
    }

    if (!dispEntry) {
      issues.push(`Saknar disp-post för ${blankettEntry.beteckning}`);
      return;
    }

    if (
      dispEntry.startDate !== blankettEntry.startDate ||
      dispEntry.startTime !== blankettEntry.startTime ||
      dispEntry.endDate !== blankettEntry.endDate ||
      dispEntry.endTime !== blankettEntry.endTime
    ) {
      issues.push(`Datum/tid matchar inte för ${blankettEntry.beteckning}`);
    }
  });

  return {
    matches: issues.length === 0,
    issues,
  };
};

const parseDispPdf = async (buffer, blankett31Entries = []) => {
  const payload = await parsePdfWithOcr(buffer, 'disp-');
  const pages = Array.isArray(payload?.pages) ? payload.pages : [];
  const entries = extractDispEntries(pages);
  const phoneSection = extractPhoneSection(pages);
  const phones = extractPhoneNumbers(phoneSection);

  return {
    projectName: extractProjectName(pages),
    plats: extractPlats(pages),
    namn: phones.namn,
    telefonnummer: phones.telefonnummer,
    nodnummer: phones.nodnummer,
    entries,
    sections: extractDispSections(pages),
    match: compareDispWithBlankett31(entries, blankett31Entries),
  };
};

module.exports = {
  parseDispPdf,
};
