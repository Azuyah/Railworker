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

const getMatchingPages = (pages = [], scorePage, isRelevant = (score) => score > 0) =>
  pages
    .map((page) => ({
      page,
      score: Number(scorePage(page)) || 0,
    }))
    .filter(({ page, score }) => isRelevant(score, page))
    .sort((left, right) => right.score - left.score || Number(left.page?.page || 0) - Number(right.page?.page || 0))
    .map(({ page }) => page);

const getOverviewPageScore = (page = {}) => {
  const text = String(page?.text || '');
  const normalized = normalizeForMatching(text);

  let score = 0;
  if (normalized.includes('dispositionsarbetsplan')) {
    score += 5;
  }
  if (normalized.includes('banobjekt-vnr')) {
    score += 4;
  }
  if (/^v\d+\s+/im.test(text)) {
    score += 2;
  }
  if (normalized.includes('granspunkter')) {
    score += 1;
  }

  return score;
};

const findOverviewPage = (pages = []) =>
  getMatchingPages(pages, getOverviewPageScore)[0] || pages[0] || null;

const extractProjectName = (pages) => {
  const firstPageLines = getPageLines(findOverviewPage(pages));

  const lineName = firstPageLines.find((line) => normalizeForMatching(line).startsWith('dispositionsarbetsplan '));
  const weekAndDays = firstPageLines.find((line) => /^V\d+\s+/i.test(line));
  const objectNumber = firstPageLines.find((line) => /Banobjekt-Vnr/i.test(line));

  const projectBase = lineName ? lineName.replace(/^Dispositionsarbetsplan\s+/i, '') : '';
  const projectWeek = normalizeProjectTitle(weekAndDays || '');
  const objectValue = objectNumber?.match(/(\d+(?:-\d+)?)/)?.[1] || '';

  return normalizeProjectTitle([projectBase, projectWeek, objectValue].filter(Boolean).join(' '));
};

function cleanMatchedValue(value = '') {
  return normalizeText(value)
    .replace(/\s+/g, ' ')
    .replace(/^[\s:;,\-]+/, '')
    .trim();
}

const extractOverviewMeta = (pages) => {
  const firstPageLines = getPageLines(findOverviewPage(pages));
  const normalizedLines = firstPageLines.map((line) => ({
    raw: line,
    normalized: normalizeForMatching(line),
  }));

  const topTitleLine = normalizedLines.find((line) => line.normalized.startsWith('dispositionsarbetsplan '))?.raw || '';
  const standaloneTitleIndex = normalizedLines.findIndex((line) => line.normalized === 'dispositionsarbetsplan');
  const mainWeekLine =
    standaloneTitleIndex >= 0 &&
    /^v\d+/i.test(firstPageLines[standaloneTitleIndex + 2] || '')
      ? firstPageLines[standaloneTitleIndex + 2]
      : '';
  const weekLine =
    mainWeekLine ||
    normalizedLines.find(
      (line) =>
        /^v\d+/i.test(line.raw) &&
        !line.normalized.includes('versionsnummer') &&
        !line.normalized.includes('antal sidor')
    )?.raw || '';
  const banobjektLine = normalizedLines.find((line) => line.normalized.includes('banobjekt-vnr'))?.raw || '';
  const forplaneraLine = normalizedLines.find((line) => line.normalized.includes('forplanera ca'))?.raw || '';
  const outerBoundaryIndex = normalizedLines.findIndex((line) =>
    line.normalized.includes('granspunkter som ej far passeras utan tkl')
  );

  const outerGranspunkter =
    outerBoundaryIndex >= 0
      ? normalizedLines.slice(outerBoundaryIndex + 1).find((line) => line.raw && !line.normalized.startsWith('('))?.raw || ''
      : '';

  return {
    banName: normalizeProjectTitle(topTitleLine.replace(/^Dispositionsarbetsplan\s+/i, '')),
    stracka:
      standaloneTitleIndex >= 0
        ? normalizeProjectTitle(firstPageLines[standaloneTitleIndex + 1] || '')
        : '',
    weekLine: normalizeProjectTitle(weekLine),
    banobjektVnr: cleanMatchedValue(banobjektLine.replace(/^.*Banobjekt-Vnr\s*/i, '')),
    forplaneraCa: cleanMatchedValue(forplaneraLine.replace(/^.*Förplanera ca\s*:?\s*/i, '')),
    outerGranspunkter: normalizeProjectTitle(outerGranspunkter),
  };
};

const extractPlats = (pages) => {
  const firstPageLines = getPageLines(findOverviewPage(pages));
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

const getPhoneSectionPageScore = (page = {}) => {
  const text = String(page?.text || '');
  const normalized = normalizeForMatching(text);
  const phoneMatches = text.match(/010[- ]\s*\d{3}\s*\d{2}\s*\d{2}/g)?.length || 0;

  let score = 0;
  if (normalized.includes('telefonnummer')) {
    score += 5;
  }
  if (normalized.includes('fjtkl')) {
    score += 3;
  }
  if (normalized.includes('larm tlc')) {
    score += 2;
  }
  if (/\bhtsm\b/.test(normalized)) {
    score += 2;
  }
  if (normalized.includes('sos alarm')) {
    score += 1;
  }
  if (phoneMatches) {
    score += Math.min(phoneMatches, 4);
  }

  return score;
};

const extractPhoneSection = (pages) => {
  const matches = getMatchingPages(pages, getPhoneSectionPageScore);
  if (!matches.length) {
    return pages.slice(-2);
  }

  const pageNumbers = new Set();
  matches.forEach((page) => {
    const pageNumber = Number(page?.page) || 0;
    if (!pageNumber) {
      return;
    }

    pageNumbers.add(pageNumber);
    pageNumbers.add(pageNumber + 1);
  });

  return pages
    .filter((page) => pageNumbers.has(Number(page?.page) || 0))
    .sort((left, right) => Number(left?.page || 0) - Number(right?.page || 0));
};

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
const isDispTablePage = (page = {}) => {
  const text = String(page?.text || '');
  const normalized = normalizeForMatching(text);
  const beteckningMatches = text.match(/26(?:[_\s-]?\d{4})/gi)?.length || 0;
  const dateTimeMatches = text.match(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/g)?.length || 0;

  return (
    beteckningMatches > 0 ||
    dateTimeMatches >= 2 ||
    /delomrade\s+\d+/.test(normalized)
  );
};
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
const getDispTablePages = (pages = []) => {
  const matches = getMatchingPages(pages, getDispTablePageScore, (score, page) => score > 0 && isDispTablePage(page))
    .sort((left, right) => Number(left?.page || 0) - Number(right?.page || 0));

  if (matches.length) {
    return matches;
  }

  return [pages.find((page) => Number(page?.page) === 3) || pages[0]].filter(Boolean);
};
const findDispTablePage = (pages = []) => getDispTablePages(pages)[0] || null;
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
const sortDispEntries = (entries = []) =>
  [...entries].sort((left, right) => {
    const leftKey = `${left.startDate || '9999-99-99'} ${left.startTime || '99:99'} ${left.beteckning || ''}`;
    const rightKey = `${right.startDate || '9999-99-99'} ${right.startTime || '99:99'} ${right.beteckning || ''}`;
    return leftKey.localeCompare(rightKey, 'sv');
  });
const dedupeDispEntries = (entries = []) =>
  sortDispEntries(entries).reduce((accumulator, entry) => {
    const key = [
      normalizeDispBeteckning(entry?.beteckning || ''),
      entry?.startDate || '',
      entry?.endDate || '',
    ].join('|');

    if (!key.replace(/\|/g, '')) {
      return accumulator;
    }

    const existingIndex = accumulator.findIndex((candidate) => (
      [
        normalizeDispBeteckning(candidate?.beteckning || ''),
        candidate?.startDate || '',
        candidate?.endDate || '',
      ].join('|') === key
    ));

    if (existingIndex === -1) {
      accumulator.push({ ...entry });
      return accumulator;
    }

    accumulator[existingIndex] = {
      ...entry,
      ...accumulator[existingIndex],
      beteckning: accumulator[existingIndex].beteckning || entry.beteckning,
      startTime: accumulator[existingIndex].startTime || entry.startTime,
      endTime: accumulator[existingIndex].endTime || entry.endTime,
    };

    return accumulator;
  }, []);

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

  const scope = telIndex === -1
    ? lines
        .filter((line) => (
          /^010[- ]\s*\d{3}\s*\d{2}\s*\d{2}/.test(line) ||
          /^fjtkl\b/i.test(line) ||
          /^2\.\s*larm\s+tlc\b/i.test(line) ||
          /^2\.\s*htsm\b/i.test(line) ||
          /^1\.\s*sos\s+alarm\b/i.test(line)
        ))
        .slice(0, 30)
    : lines.slice(telIndex, telIndex + 30);

  if (!scope.length) {
    return {
      namn: '',
      telefonnummer: '',
      nodnummer: '',
      htsmTelefon: '',
    };
  }

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

const pickParsedValue = (...values) =>
  values
    .map((value) => normalizeText(String(value || '')))
    .find(Boolean) || '';

const mergeParsedPhones = (...sources) => ({
  namn: pickParsedValue(...sources.map((source) => source?.namn)),
  telefonnummer: pickParsedValue(...sources.map((source) => source?.telefonnummer)),
  nodnummer: pickParsedValue(...sources.map((source) => source?.nodnummer)),
  htsmTelefon: pickParsedValue(...sources.map((source) => source?.htsmTelefon)),
});

const extractDispEntriesFromText = (pages = []) => {
  const entries = [];
  const pagesWithTables = getDispTablePages(pages);

  pagesWithTables.forEach((page) => {
    const lines = getPageLines(page);

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const labels = Array.from(line.matchAll(/(26(?:[_\s-]?\d{4}))/gi), (match) => match[1]);

      if (!labels.length) {
        continue;
      }

      const blockLines = [line];
      for (let lookahead = index + 1; lookahead < Math.min(lines.length, index + 6); lookahead += 1) {
        const nextLine = lines[lookahead];
        const normalizedNextLine = normalizeForMatching(nextLine);
        if (
          /(26(?:[_\s-]?\d{4}))/i.test(nextLine) ||
          /^delomrade\s+\d+/.test(normalizedNextLine) ||
          normalizedNextLine.includes('telefonnummer')
        ) {
          break;
        }

        blockLines.push(nextLine);

        if (extractDateTimeValues(blockLines.join(' ')).length >= labels.length * 2) {
          break;
        }
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
  });

  return dedupeDispEntries(entries).filter((entry) => entry.beteckning && entry.startDate && entry.endDate);
};

const extractDispEntriesFromCoordinates = (pages = []) => {
  const pagesWithTables = getDispTablePages(pages);

  return dedupeDispEntries(
    pagesWithTables.flatMap((page) => {
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
    })
  );
};

const extractDispEntries = (pages = [], fallbackPages = []) => {
  return dedupeDispEntries([
    ...extractDispEntriesFromText(pages),
    ...extractDispEntriesFromText(fallbackPages),
    ...extractDispEntriesFromCoordinates(pages),
    ...extractDispEntriesFromCoordinates(fallbackPages),
  ]).filter((entry) => entry.beteckning && entry.startDate && entry.endDate);
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
    .replace(/[\u2012\u2013\u2014\u2212]+/g, '-')
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

const DISP_SECTION_POINT_TOKEN_PATTERN = '[A-Za-z\\u00C5\\u00C4\\u00D6\\u00E5\\u00E4\\u00F6]{1,4}\\d+(?:,\\s*[A-Za-z\\u00C5\\u00C4\\u00D6\\u00E5\\u00E4\\u00F6]{1,4}\\d+)*';
const DISP_SECTION_BOUNDARY_RANGE_REGEX = new RegExp(
  `(${DISP_SECTION_POINT_TOKEN_PATTERN})\\s+-\\s+(${DISP_SECTION_POINT_TOKEN_PATTERN})$`,
  'i'
);

const normalizeSectionRowText = (value = '') =>
  normalizeText(value)
    .replace(/[\u2012\u2013\u2014\u2212]+/g, '-')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim();

const dedupeDispSections = (sections = []) =>
  [...sections]
    .filter((section, index, array) => {
      const key = `${section.displayIndex || ''}|${section.granspunkter || ''}|${section.spar || ''}`;
      return index === array.findIndex((candidate) => (
        `${candidate.displayIndex || ''}|${candidate.granspunkter || ''}|${candidate.spar || ''}` === key
      ));
    })
    .sort((left, right) => Number(left.displayIndex || 999) - Number(right.displayIndex || 999))
    .map((section, index) => ({
      ...section,
      index,
    }));

const hasSectionContent = (section = {}) =>
  Boolean(section?.signal || section?.granspunkter || section?.spar);

const mergeDispSections = (sections = []) =>
  [...sections]
    .filter(hasSectionContent)
    .sort((left, right) => Number(left.displayIndex || 999) - Number(right.displayIndex || 999))
    .reduce((accumulator, section) => {
      const key = Number(section.displayIndex || 0) || Number(accumulator.length + 1);
      const existingIndex = accumulator.findIndex((candidate) => Number(candidate.displayIndex || 0) === key);

      if (existingIndex === -1) {
        accumulator.push({
          ...section,
          displayIndex: key,
        });
        return accumulator;
      }

      const current = accumulator[existingIndex];
      accumulator[existingIndex] = {
        ...current,
        ...section,
        displayIndex: current.displayIndex || section.displayIndex || key,
        type: pickParsedValue(current.type, section.type) || 'Delområde',
        namingMode: pickParsedValue(current.namingMode, section.namingMode) || 'NUMBERS',
        signal: pickParsedValue(current.signal, section.signal),
        granspunkter: pickParsedValue(current.granspunkter, section.granspunkter),
        granspunktStart: pickParsedValue(current.granspunktStart, section.granspunktStart),
        granspunktSlut: pickParsedValue(current.granspunktSlut, section.granspunktSlut),
        spar: pickParsedValue(current.spar, section.spar),
      };

      return accumulator;
    }, [])
    .map((section, index) => ({
      ...section,
      index,
    }));

const normalizeSectionField = (value = '') =>
  cleanBoundaryToken(value)
    .replace(/^(signaler?|granspunkter?|spar)\s*[:\-]?\s*/i, '')
    .trim();

const buildDispSection = ({
  displayIndex,
  signal = '',
  granspunkter = '',
  spar = '',
  type = 'Delområde',
  namingMode = 'NUMBERS',
} = {}) => {
  const normalizedSignal = normalizeSectionField(signal);
  const normalizedBoundaries = normalizeSectionField(granspunkter);
  const normalizedTrack = normalizeSectionField(spar);
  const boundaryTokens = normalizedBoundaries.split(/\s+-\s+/).map((part) => cleanBoundaryToken(part)).filter(Boolean);
  const mergedSignalTokens = extractSignalTokens(normalizedBoundaries);
  const granspunktStart = boundaryTokens[0] || mergedSignalTokens[mergedSignalTokens.length - 2] || '';
  const granspunktSlut = boundaryTokens[1] || mergedSignalTokens[mergedSignalTokens.length - 1] || '';

  return {
    displayIndex: Number(displayIndex || 0) || null,
    type,
    namingMode,
    signal: normalizedSignal || [normalizedBoundaries, normalizedTrack].filter(Boolean).join(', '),
    granspunktStart,
    granspunktSlut,
    granspunkter: normalizedBoundaries,
    spar: normalizedTrack,
  };
};

const parseInlineDispSectionText = (value = '') => {
  const normalizedRow = normalizeSectionRowText(value);
  if (!normalizedRow) {
    return null;
  }

  const rowMatch = normalizedRow.match(/^Delomr(?:\u00E5de|ade)\s+(\d+)\s+(.+)$/i);
  if (!rowMatch) {
    return null;
  }

  const displayIndex = Number(rowMatch[1] || 0);
  const remainder = rowMatch[2] || '';
  const trackMatch = remainder.match(/^(.*?)\s+Sp(?:\u00E5|a)r\s+(.+)$/i);
  if (!trackMatch) {
    return null;
  }

  const body = normalizeSectionRowText(trackMatch[1] || '');
  const spar = normalizeSectionRowText(trackMatch[2] || '');
  const boundaryMatch = body.match(DISP_SECTION_BOUNDARY_RANGE_REGEX);
  if (!boundaryMatch) {
    return null;
  }

  const sectionName = normalizeSectionRowText(body.slice(0, boundaryMatch.index));
  const granspunkter = `${cleanBoundaryToken(boundaryMatch[1] || '')} - ${cleanBoundaryToken(boundaryMatch[2] || '')}`;

  return {
    ...buildDispSection({
      displayIndex,
      signal: granspunkter,
      granspunkter,
      spar,
    }),
    displayIndex,
    name: sectionName,
  };
};

const groupLinesByApproximateRow = (lines = [], tolerance = 0.012) => {
  const groups = [];

  lines
    .filter((line) => line?.text)
    .sort((left, right) => Number(right.y) - Number(left.y) || Number(left.x) - Number(right.x))
    .forEach((line) => {
      const existingGroup = groups.find((group) => Math.abs(Number(group.y) - Number(line.y)) <= tolerance);
      if (existingGroup) {
        existingGroup.lines.push(line);
        return;
      }

      groups.push({
        y: Number(line.y),
        lines: [line],
      });
    });

  return groups.map((group) => ({
    ...group,
    lines: group.lines.sort((left, right) => Number(left.x) - Number(right.x)),
  }));
};

const findSectionHeaderColumns = (lines = []) => {
  const headerPatterns = [
    { key: 'delomrade', pattern: /^delomrade\b/ },
    { key: 'signal', pattern: /^signal(?:er)?\b/ },
    { key: 'granspunkter', pattern: /^granspunkter?\b/ },
    { key: 'spar', pattern: /^spar\b/ },
  ];

  const rowGroups = groupLinesByApproximateRow(lines);
  const bestGroup = rowGroups
    .map((group) => {
      const matches = headerPatterns.reduce((accumulator, item) => {
        const line = group.lines.find((candidate) => item.pattern.test(candidate.normalized || ''));
        if (line) {
          accumulator[item.key] = line;
        }
        return accumulator;
      }, {});

      return {
        group,
        matches,
        score: Object.keys(matches).length,
      };
    })
    .filter((candidate) => candidate.score >= 2)
    .sort((left, right) => right.score - left.score || Number(right.group.y) - Number(left.group.y))[0];

  if (!bestGroup) {
    return null;
  }

  const delomradeX = Number(bestGroup.matches.delomrade?.x ?? 0.04);
  const signalX = Number(bestGroup.matches.signal?.x ?? (delomradeX + 0.18));
  const granspunkterX = Number(bestGroup.matches.granspunkter?.x ?? (signalX + 0.18));
  const sparX = Number(bestGroup.matches.spar?.x ?? (granspunkterX + 0.22));

  return {
    delomrade: delomradeX,
    signal: signalX,
    granspunkter: granspunkterX,
    spar: sparX,
  };
};

const extractColumnText = (lines = [], startX = 0, endX = 1) =>
  [...new Set(
    lines
      .filter((line) => Number(line.x) >= startX - 0.02 && Number(line.x) < endX - 0.01)
      .map((line) => normalizeSectionField(line.text || ''))
      .filter(Boolean)
  )].join(' ');

const extractDispSectionsFromColumns = (pages = []) =>
  mergeDispSections(
    getDispTablePages(pages).flatMap((page) => {
      const normalizedLines = (Array.isArray(page?.lines) ? page.lines : []).map((line) => ({
        ...line,
        text: cleanBoundaryToken(line.text || ''),
        normalized: normalizeForMatching(cleanBoundaryToken(line.text || '')),
      }));
      const columns = findSectionHeaderColumns(normalizedLines);
      if (!columns) {
        return [];
      }

      const sectionRows = normalizedLines
        .filter((line) => /^delomrade\s+\d+/.test(line.normalized))
        .sort((a, b) => Number(b.y) - Number(a.y));

      return sectionRows.map((row, index) => {
        const displayIndex = Number(String(row.normalized).match(/^delomrade\s+(\d+)/)?.[1] || index + 1);
        const sameRow = normalizedLines.filter((line) => Math.abs(Number(line.y) - Number(row.y)) < 0.02);

        return buildDispSection({
          displayIndex,
          signal: extractColumnText(sameRow, columns.signal, columns.granspunkter),
          granspunkter: extractColumnText(sameRow, columns.granspunkter, columns.spar),
          spar: extractColumnText(sameRow, columns.spar, 1.01),
        });
      });
    })
  );

const extractDispSectionsFromText = (pages = []) =>
  mergeDispSections(
    getDispTablePages(pages).flatMap((page) => {
      const lines = getPageLines(page);
      const sections = [];

      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        const inlineSection = parseInlineDispSectionText(line);
        if (inlineSection) {
          sections.push(inlineSection);
          continue;
        }

        const normalizedLine = normalizeForMatching(line);
        const match = normalizedLine.match(/^delomrade\s+(\d+)/i);
        if (!match) {
          continue;
        }

        const blockLines = [line];
        for (let lookahead = index + 1; lookahead < Math.min(lines.length, index + 5); lookahead += 1) {
          if (/^delomrade\s+\d+/i.test(normalizeForMatching(lines[lookahead]))) {
            break;
          }

          blockLines.push(lines[lookahead]);
        }

        const blockText = blockLines.join(' ');
        if (!/(signal|gr[aä]nspunkter?|sp[aå]r)/i.test(blockText)) {
          continue;
        }
        const signal = blockText.match(/signal(?:er)?\s*[:\-]?\s*(.+?)(?=\s+gr[aä]nspunkter?\b|\s+sp[aå]r\b|$)/i)?.[1] || '';
        const granspunkter = blockText.match(/gr[aä]nspunkter?\s*[:\-]?\s*(.+?)(?=\s+sp[aå]r\b|$)/i)?.[1] || '';
        const spar = blockText.match(/sp[aå]r\s*[:\-]?\s*(.+)$/i)?.[1] || '';

        sections.push(buildDispSection({
          displayIndex: Number(match[1] || sections.length + 1),
          signal,
          granspunkter,
          spar,
        }));
      }

      return sections;
    })
  );

const extractDispSectionsFromRows = (pages = []) =>
  mergeDispSections(
    getDispTablePages(pages).flatMap((page) => {
      const normalizedLines = (Array.isArray(page?.lines) ? page.lines : []).map((line) => ({
        ...line,
        text: normalizeSectionRowText(line.text || ''),
        normalized: normalizeForMatching(normalizeSectionRowText(line.text || '')),
      }));

      const sectionRows = normalizedLines
        .filter((line) => /^delomrade\s+\d+/.test(line.normalized))
        .sort((a, b) => Number(b.y) - Number(a.y));

      return sectionRows
        .map((row) => {
          const sameRowText = normalizedLines
            .filter((line) => Math.abs(Number(line.y) - Number(row.y)) < 0.02)
            .sort((a, b) => Number(a.x) - Number(b.x))
            .map((line) => line.text)
            .filter(Boolean)
            .join(' ');

          return parseInlineDispSectionText(sameRowText);
        })
        .filter(Boolean);
    })
  );

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

const extractAllDispSections = (pages = []) =>
  dedupeDispSections(
    getDispTablePages(pages).flatMap((page) => {
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
    })
  );

const extractMergedDispSections = (textPages = [], ocrPages = []) => {
  const primarySections = mergeDispSections([
    ...extractDispSectionsFromText(textPages),
    ...extractDispSectionsFromRows(ocrPages),
    ...extractDispSectionsFromColumns(ocrPages),
  ]);

  if (primarySections.length) {
    return primarySections;
  }

  return mergeDispSections(extractAllDispSections(ocrPages));
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
  const hasUsefulText = hasUsefulTextPages(textPages);
  const preferredPages = hasUsefulText ? textPages : ocrPages;
  const entries = extractDispEntries(textPages, ocrPages);
  const phones = mergeParsedPhones(
    extractPhoneNumbers(extractPhoneSection(textPages)),
    extractPhoneNumbers(extractPhoneSection(ocrPages))
  );
  const sections = extractMergedDispSections(textPages, ocrPages);
  const textOverview = hasUsefulText ? extractOverviewMeta(textPages) : {};
  const ocrOverview = extractOverviewMeta(ocrPages);
  const preferredOverview = extractOverviewMeta(preferredPages);
  const overview = {
    banName: pickParsedValue(
      textOverview.banName,
      ocrOverview.banName,
      preferredOverview.banName
    ),
    stracka: pickParsedValue(
      textOverview.stracka,
      ocrOverview.stracka,
      preferredOverview.stracka
    ),
    weekLine: pickParsedValue(
      textOverview.weekLine,
      ocrOverview.weekLine,
      preferredOverview.weekLine
    ),
    banobjektVnr: pickParsedValue(
      textOverview.banobjektVnr,
      ocrOverview.banobjektVnr,
      preferredOverview.banobjektVnr
    ),
    forplaneraCa: pickParsedValue(
      textOverview.forplaneraCa,
      ocrOverview.forplaneraCa,
      preferredOverview.forplaneraCa
    ),
    outerGranspunkter: pickParsedValue(
      textOverview.outerGranspunkter,
      ocrOverview.outerGranspunkter,
      preferredOverview.outerGranspunkter
    ),
  };

  return {
    projectName: pickParsedValue(
      hasUsefulText ? extractProjectName(textPages) : '',
      extractProjectName(ocrPages),
      extractProjectName(preferredPages)
    ),
    plats: pickParsedValue(
      hasUsefulText ? extractPlats(textPages) : '',
      extractPlats(ocrPages),
      extractPlats(preferredPages)
    ),
    namn: phones.namn,
    telefonnummer: phones.telefonnummer,
    nodnummer: phones.nodnummer,
    htsmTelefon: phones.htsmTelefon,
    overview,
    entries,
    sections,
    match: compareDispWithBlankett31(entries, blankett31Entries),
  };
};

module.exports = {
  parseDispPdf,
};
