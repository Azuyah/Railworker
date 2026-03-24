const {
  normalizeText,
  normalizeForMatching,
  parsePdfText,
  parsePdfWithOcr,
} = require('./ocrPdf');

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
    const normalizedLine = normalizeForMatching(line);
    if (!line || /^\(.*\)$/.test(line)) {
      continue;
    }
    if (normalizedLine.includes('forplanera') || normalizedLine.includes('granspunkter')) {
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

const extractPhoneSection = (pages) => pages.slice(-2);

const isDispBeteckning = (value = '') => /^26(?:[_\s-]?\d{4})$/i.test(normalizeText(value));
const normalizeDispBeteckning = (value = '') =>
  normalizeText(value)
    .replace(/\s*([_-])\s*/g, '_')
    .replace(/\s+/g, '_');
const hasUsefulTextPages = (pages = []) =>
  pages.some((page) => {
    const text = String(page?.text || '');
    const normalized = normalizeForMatching(text);

    return (
      normalizeText(text).length > 20 &&
      (
        normalized.includes('dispositionsarbetsplan') ||
        normalized.includes('banobjekt-vnr') ||
        normalized.includes('telefonnummer') ||
        /26(?:[_\s-]?\d{4})/.test(text) ||
        /delomrade\s+\d+/.test(normalized)
      )
    );
  });
const getPageLines = (page) =>
  String(page?.text || '')
    .split('\n')
    .map(normalizeText)
    .filter(Boolean);
const getDispTablePageScore = (page = {}) => {
  const text = String(page?.text || '');
  const normalized = normalizeForMatching(text);
  const beteckningMatches = text.match(/26(?:[_\s-]?\d{4})/gi)?.length || 0;
  const dateTimeMatches = text.match(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/g)?.length || 0;

  let score = 0;
  if (/delomrade\s+\d+/.test(normalized)) {
    score += 5;
  }
  if (beteckningMatches) {
    score += beteckningMatches * 2;
  }
  if (dateTimeMatches) {
    score += Math.min(dateTimeMatches, 4);
  }

  return score;
};
const findDispTablePage = (pages = []) => {
  const candidates = pages
    .map((page) => ({
      page,
      score: getDispTablePageScore(page),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score || Number(left.page?.page || 0) - Number(right.page?.page || 0));

  if (candidates.length) {
    return candidates[0].page;
  }

  return pages.find((page) => Number(page?.page) === 3) || pages[0] || null;
};
const extractDateTimeValues = (text = '') =>
  Array.from(
    normalizeText(text).matchAll(/(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/g),
    (match) => match[1]
  );
const createDispEntry = (beteckning, startValue, endValue) => {
  const [startDate = '', startTime = ''] = String(startValue || '').split(/\s+/);
  const [endDate = '', endTime = ''] = String(endValue || '').split(/\s+/);

  return {
    beteckning: normalizeDispBeteckning(beteckning),
    startDate,
    startTime,
    endDate,
    endTime,
  };
};
const dedupeDispEntries = (entries = []) =>
  entries.filter((entry, index, array) => {
    const key = [
      entry.beteckning,
      entry.startDate,
      entry.startTime,
      entry.endDate,
      entry.endTime,
    ].join('|');

    return index === array.findIndex((candidate) => (
      [
        candidate.beteckning,
        candidate.startDate,
        candidate.startTime,
        candidate.endDate,
        candidate.endTime,
      ].join('|') === key
    ));
  });

const formatPhone = (value = '') =>
  value
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

const extractPhoneNumbers = (phoneSection) => {
  const pages = Array.isArray(phoneSection) ? phoneSection : [];
  const text = Array.isArray(phoneSection)
    ? phoneSection.map((page) => String(page.text || '')).join('\n')
    : String(phoneSection || '');
  const lines = text.split('\n').map(normalizeText).filter(Boolean);
  const telIndex = lines.findIndex((line) => normalizeForMatching(line) === 'telefonnummer.');

  const extractPhoneFromLine = (line = '') => {
    const match = String(line || '').match(/(010[- ]\s*\d{3}\s*\d{2}\s*\d{2}(?:\s*\(\s*010[- ]\s*\d{3}\s*\d{2}\s*\d{2}\s*\))?)/);
    return match ? formatPhone(match[1]) : '';
  };

  const extractPhonesByCoordinates = (sourcePages = []) => {
    const pageWithPhoneSection = sourcePages
      .map((page) => ({
        ...page,
        lines: Array.isArray(page?.lines) ? page.lines : [],
      }))
      .find((page) =>
        page.lines.some((line) => normalizeForMatching(line.text || '') === 'telefonnummer.')
      );

    if (!pageWithPhoneSection) {
      return {};
    }

    const normalizedLines = pageWithPhoneSection.lines
      .map((line) => ({
        text: normalizeText(line.text || ''),
        normalized: normalizeForMatching(line.text || ''),
        x: Number(line.x),
        y: Number(line.y),
      }))
      .filter((line) => line.text);

    const phoneHeader = normalizedLines.find((line) => line.normalized === 'telefonnummer.');
    const scopedLines = normalizedLines.filter((line) => line.y <= (phoneHeader?.y ?? 1) + 0.01);
    const phoneCandidates = scopedLines.filter((line) => extractPhoneFromLine(line.text));

    const pickNearestPhone = (pattern) => {
      const labelLine = scopedLines.find((line) => pattern.test(line.normalized));
      if (!labelLine) return '';

      const sameRowPhone = phoneCandidates
        .filter((candidate) => candidate.x > labelLine.x && Math.abs(candidate.y - labelLine.y) <= 0.008)
        .sort((left, right) => Math.abs(left.y - labelLine.y) - Math.abs(right.y - labelLine.y))[0];

      if (sameRowPhone) {
        return extractPhoneFromLine(sameRowPhone.text);
      }

      const nearbyPhone = phoneCandidates
        .filter((candidate) => candidate.x > labelLine.x && candidate.y <= labelLine.y + 0.01 && candidate.y >= labelLine.y - 0.04)
        .sort((left, right) => Math.abs(left.y - labelLine.y) - Math.abs(right.y - labelLine.y))[0];

      return nearbyPhone ? extractPhoneFromLine(nearbyPhone.text) : '';
    };

    const fjtklLine = scopedLines.find((line) => /^fjtkl\b/.test(line.normalized));

    return {
      namn: fjtklLine ? normalizeText(fjtklLine.text.replace(/^Fjtkl\s+/i, '')) : '',
      nodnummer: pickNearestPhone(/^2\.\s*larm\s+tlc\b/),
      htsmTelefon: pickNearestPhone(/^2\.\s*htsm\b/),
      telefonnummer: pickNearestPhone(/^fjtkl\b/),
    };
  };

  const extractPhoneNearLabel = (scope = [], pattern) => {
    const labelIndex = scope.findIndex((line) => pattern.test(normalizeForMatching(line)));
    if (labelIndex === -1) return '';

    for (let index = labelIndex; index < Math.min(scope.length, labelIndex + 3); index += 1) {
      const phone = extractPhoneFromLine(scope[index]);
      if (phone) return phone;
    }

    return '';
  };

  const extractOrderedLabelPhones = (scope = []) => {
    const labelPatterns = [
      { key: 'sos', pattern: /^1\.\s*sos\s+alarm\b/ },
      { key: 'larmTlc', pattern: /^2\.\s*larm\s+tlc\b/ },
      { key: 'htsm', pattern: /^2\.\s*htsm\b/ },
      { key: 'arbetsledare', pattern: /^3\.\s*ansvarig\s+arbetsledare\b/ },
      { key: 'fjtkl', pattern: /^fjtkl\b/ },
    ];

    const labels = scope
      .map((line) => {
        const normalized = normalizeForMatching(line);
        const label = labelPatterns.find((item) => item.pattern.test(normalized));
        return label ? label.key : null;
      })
      .filter(Boolean);

    const phones = scope
      .map((line) => extractPhoneFromLine(line))
      .filter(Boolean);

    if (!labels.length || phones.length < labels.length) {
      return {};
    }

    return labels.reduce((accumulator, key, index) => {
      if (!accumulator[key] && phones[index]) {
        accumulator[key] = phones[index];
      }
      return accumulator;
    }, {});
  };

  if (telIndex === -1) {
    return {
      namn: '',
      telefonnummer: '',
      nodnummer: '',
      htsmTelefon: '',
    };
  }

  const scope = lines.slice(telIndex, telIndex + 30);
  const coordinatePhones = extractPhonesByCoordinates(pages);
  const orderedPhones = extractOrderedLabelPhones(scope);
  const numbers = scope
    .filter((line) => /^010[- ]\s*\d{3}\s*\d{2}\s*\d{2}/.test(line))
    .map(formatPhone);
  const fjtklLine = scope.find((line) => /^Fjtkl\s+/i.test(line));

  return {
    namn:
      coordinatePhones.namn ||
      (fjtklLine ? normalizeText(fjtklLine.replace(/^Fjtkl\s+/i, '')) : ''),
    nodnummer:
      coordinatePhones.nodnummer ||
      orderedPhones.larmTlc ||
      extractPhoneNearLabel(scope, /^2\.\s*larm\s+tlc\b/) ||
      numbers[0] ||
      '',
    htsmTelefon:
      coordinatePhones.htsmTelefon ||
      orderedPhones.htsm ||
      extractPhoneNearLabel(scope, /^2\.\s*htsm\b/) ||
      '',
    telefonnummer:
      coordinatePhones.telefonnummer ||
      orderedPhones.fjtkl ||
      extractPhoneNearLabel(scope, /^fjtkl\b/) ||
      numbers[numbers.length - 1] ||
      '',
  };
};

const extractDispEntriesFromText = (pages = []) => {
  const page = findDispTablePage(pages);
  const lines = getPageLines(page);
  const entries = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const labels = Array.from(line.matchAll(/(26(?:[_\s-]?\d{4}))/gi), (match) => match[1]);

    if (!labels.length) {
      continue;
    }

    const blockLines = [line];
    for (let lookahead = index + 1; lookahead < Math.min(lines.length, index + 3); lookahead += 1) {
      if (/(26(?:[_\s-]?\d{4}))/i.test(lines[lookahead])) {
        break;
      }

      blockLines.push(lines[lookahead]);
    }

    const dateTimes = extractDateTimeValues(blockLines.join(' '));
    if (!dateTimes.length) {
      continue;
    }

    labels.forEach((label, labelIndex) => {
      const startValue = dateTimes[labelIndex * 2] || dateTimes[0] || '';
      const endValue = dateTimes[(labelIndex * 2) + 1] || dateTimes[1] || '';

      entries.push(createDispEntry(label, startValue, endValue));
    });
  }

  return dedupeDispEntries(entries).filter((entry) => entry.beteckning && entry.startDate && entry.endDate);
};

const extractDispEntriesFromCoordinates = (pages = []) => {
  const page = findDispTablePage(pages);
  const lines = Array.isArray(page?.lines) ? page.lines : [];
  const labelLines = lines
    .filter((line) => isDispBeteckning(line.text || ''))
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

    return createDispEntry(labelLine.text || '', startValue, endValue);
  }).filter((entry) => entry.beteckning && entry.startDate && entry.endDate);
};

const extractDispEntries = (pages = [], fallbackPages = []) => {
  const textEntries = extractDispEntriesFromText(pages);
  if (textEntries.length) {
    return textEntries;
  }

  const fallbackTextEntries = extractDispEntriesFromText(fallbackPages);
  if (fallbackTextEntries.length) {
    return fallbackTextEntries;
  }

  const coordinateEntries = extractDispEntriesFromCoordinates(pages);
  if (coordinateEntries.length) {
    return dedupeDispEntries(coordinateEntries);
  }

  return dedupeDispEntries(extractDispEntriesFromCoordinates(fallbackPages));
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
  const page = findDispTablePage(pages);
  const lines = Array.isArray(page?.lines) ? page.lines : [];
  const normalizedLines = lines.map((line) => ({
    ...line,
    text: cleanBoundaryToken(line.text || ''),
    normalized: normalizeForMatching(cleanBoundaryToken(line.text || '')),
  }));

  const sectionRows = normalizedLines
    .filter((line) => /^delomrade\s+\d+/.test(line.normalized))
    .sort((a, b) => b.y - a.y);

  return sectionRows.map((row, index) => {
    const displayIndex = Number(String(row.normalized).match(/^delomrade\s+(\d+)/)?.[1] || index + 1);
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
          !/^spar/i.test(line.normalized) &&
          (isSignalPointToken(line.text) || /\s-\s/.test(line.text))
      )
      .sort((a, b) => a.x - b.x)[0];
    const spar = sameRow
      .filter((line) => Number(line.x) >= 0.67 && /^spar/i.test(line.normalized))
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
  const textPayload = await parsePdfText(buffer);
  const textPages = Array.isArray(textPayload?.pages) ? textPayload.pages : [];
  const ocrPayload = await parsePdfWithOcr(buffer, 'disp-');
  const ocrPages = Array.isArray(ocrPayload?.pages) ? ocrPayload.pages : [];
  const preferredPages = hasUsefulTextPages(textPages) ? textPages : ocrPages;
  const entries = extractDispEntries(preferredPages, ocrPages);
  const phoneSection = extractPhoneSection(preferredPages);
  const phones = extractPhoneNumbers(phoneSection);
  const sections = extractDispSections(ocrPages);

  return {
    projectName: extractProjectName(preferredPages),
    plats: extractPlats(preferredPages),
    namn: phones.namn,
    telefonnummer: phones.telefonnummer,
    nodnummer: phones.nodnummer,
    htsmTelefon: phones.htsmTelefon,
    entries,
    sections,
    match: compareDispWithBlankett31(entries, blankett31Entries),
  };
};

module.exports = {
  parseDispPdf,
};
