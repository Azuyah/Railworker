const {
  normalizeText,
  normalizeForMatching,
  parsePdfText,
  parsePdfWithOcr,
} = require('./ocrPdf');
const { loadCachedDriftplatser } = require('./njdbDriftplatsService');

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

const looksLikeHeaderMetadata = (text = '') => {
  const normalized = normalizeForMatching(text);
  return (
    normalized.startsWith('giltig') ||
    normalized.includes('versionsnummer') ||
    normalized.includes('antal sidor') ||
    normalized.startsWith('vallakra rail ab') ||
    normalized === 'dispositionsarbetsplan'
  );
};

const sanitizeWeekLine = (text = '') =>
  normalizeProjectTitle(text)
    .replace(/\s+\d+\/MA\d+\s+\d+$/i, '')
    .trim();

const isUsablePlatsValue = (text = '') => {
  const value = normalizeProjectTitle(text);
  const normalized = normalizeForMatching(value);
  if (!value) return false;
  if (looksLikeHeaderMetadata(value)) return false;
  if (/\b\d+\/ma\d+\b/i.test(value)) return false;
  if (/^v\d+\b/i.test(value)) return false;
  if (/^[a-z]{1,4}\d+\s+\d+\/ma\d+\s+\d+$/i.test(normalized)) return false;
  return true;
};

const pickUsablePlats = (...values) =>
  values
    .map((value) => normalizeProjectTitle(value))
    .find((value) => isUsablePlatsValue(value)) || '';

let cachedKnownDriftplatsNames = null;

const normalizeStationLookup = (value = '') =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();

const getKnownDriftplatsNames = () => {
  if (cachedKnownDriftplatsNames) {
    return cachedKnownDriftplatsNames;
  }

  cachedKnownDriftplatsNames = loadCachedDriftplatser()
    .map((item) => cleanMatchedValue(item?.name || ''))
    .filter(Boolean);

  return cachedKnownDriftplatsNames;
};

const splitReferenceNames = (value = '') =>
  normalizeText(value)
    .split(/\s*,\s*|\s+-\s+/)
    .map((part) => cleanMatchedValue(part))
    .filter(Boolean);

const collectSectionReferenceNames = (sections = []) => {
  const names = new Set();

  sections.forEach((section) => {
    const endpoints = splitSectionNameEndpoints(section?.name || section?.signal || '');
    [endpoints.left, endpoints.right].forEach((value) => {
      const cleaned = cleanMatchedValue(value);
      if (cleaned) {
        names.add(cleaned);
      }
    });
  });

  return [...names];
};

const scoreStationCandidate = (inputKey = '', candidateKey = '') => {
  if (!inputKey || !candidateKey) {
    return Number.NEGATIVE_INFINITY;
  }

  if (inputKey === candidateKey) {
    return 1000;
  }

  let score = 0;
  if (candidateKey.startsWith(inputKey)) {
    score += 500;
  }
  if (inputKey.startsWith(candidateKey)) {
    score += 400;
  }

  let prefixLength = 0;
  while (
    prefixLength < inputKey.length &&
    prefixLength < candidateKey.length &&
    inputKey[prefixLength] === candidateKey[prefixLength]
  ) {
    prefixLength += 1;
  }

  score += prefixLength * 10;
  score -= Math.abs(candidateKey.length - inputKey.length) * 15;
  return score;
};

const resolveStationName = (value = '', projectNames = [], globalNames = []) => {
  const cleaned = cleanMatchedValue(value);
  const inputKey = normalizeStationLookup(cleaned);
  if (!cleaned || !inputKey || inputKey.length < 3) {
    return cleaned;
  }

  const localCandidates = [...new Set(projectNames.map((name) => cleanMatchedValue(name)).filter(Boolean))];
  const exactLocal = localCandidates.find((name) => normalizeStationLookup(name) === inputKey);
  if (exactLocal) {
    return exactLocal;
  }

  const localMatches = localCandidates
    .map((name) => ({ name, key: normalizeStationLookup(name) }))
    .filter(({ key }) =>
      key &&
      (key.startsWith(inputKey) || inputKey.startsWith(key)) &&
      Math.abs(key.length - inputKey.length) <= 2
    )
    .sort((left, right) => scoreStationCandidate(inputKey, right.key) - scoreStationCandidate(inputKey, left.key));

  if (localMatches.length === 1) {
    return localMatches[0].name;
  }

  if (localMatches.length > 1) {
    const [best, second] = localMatches;
    if (scoreStationCandidate(inputKey, best.key) > scoreStationCandidate(inputKey, second.key)) {
      return best.name;
    }
    return cleaned;
  }

  const globalMatches = globalNames
    .map((name) => ({ name, key: normalizeStationLookup(name) }))
    .filter(({ key }) =>
      key &&
      key.startsWith(inputKey) &&
      Math.abs(key.length - inputKey.length) <= 1
    )
    .sort((left, right) => scoreStationCandidate(inputKey, right.key) - scoreStationCandidate(inputKey, left.key));

  if (globalMatches.length === 1) {
    return globalMatches[0].name;
  }

  return cleaned;
};

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
  const weekAndDays = firstPageLines.find((line) => (
    /^V\d+\s+/i.test(line) &&
    !/\b\d+\/[A-Za-z]+\d*\b/.test(line)
  ));
  const objectNumber = getLabelValue(firstPageLines, /^banobjekt-vnr\b/i, /^.*Banobjekt-Vnr\s*/i);

  const projectBase = lineName ? lineName.replace(/^Dispositionsarbetsplan\s+/i, '') : '';
  const projectWeek = normalizeProjectTitle(weekAndDays || '');
  const objectValue = cleanMatchedValue(objectNumber).match(/(\d+(?:-\d+)?)/)?.[1] || '';

  return normalizeProjectTitle([projectBase, projectWeek, objectValue].filter(Boolean).join(' '));
};

const findLineIndex = (lines = [], predicate) =>
  lines.findIndex((line) => predicate(normalizeForMatching(line), line));

const getLabelValue = (lines = [], labelPattern, stripPattern) => {
  const labelIndex = findLineIndex(lines, (normalized) => labelPattern.test(normalized));
  if (labelIndex === -1) {
    return '';
  }

  const currentLine = lines[labelIndex] || '';
  const inlineValue = cleanMatchedValue(stripPattern ? currentLine.replace(stripPattern, '') : currentLine);
  if (inlineValue) {
    return inlineValue;
  }

  return cleanMatchedValue(lines.slice(labelIndex + 1).find(Boolean) || '');
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
  const topTitleIndex = normalizedLines.findIndex((line) => line.normalized.startsWith('dispositionsarbetsplan '));
  const standaloneTitleIndex = normalizedLines.findIndex((line) => line.normalized === 'dispositionsarbetsplan');
  const mainWeekLine =
    topTitleIndex >= 0 &&
    /^v\d+/i.test(firstPageLines[topTitleIndex + 2] || '')
      ? firstPageLines[topTitleIndex + 2]
      : (
        standaloneTitleIndex >= 0 &&
        /^v\d+/i.test(firstPageLines[standaloneTitleIndex + 2] || '')
          ? firstPageLines[standaloneTitleIndex + 2]
          : ''
      );
  const weekLine = sanitizeWeekLine(
    mainWeekLine ||
    normalizedLines.find(
      (line) =>
        /^v\d+/i.test(line.raw) &&
        !line.normalized.includes('versionsnummer') &&
        !line.normalized.includes('antal sidor')
    )?.raw || ''
  );
  const routeLineCandidate = normalizeProjectTitle(
    firstPageLines
      .slice((topTitleIndex >= 0 ? topTitleIndex + 1 : standaloneTitleIndex + 1))
      .find((line) => {
        const normalized = normalizeForMatching(line);
        return (
          line &&
          !/^v\d+\b/i.test(line) &&
          !normalized.startsWith('banobjekt-vnr') &&
          !normalized.startsWith('forplanera ca') &&
          !normalized.startsWith('berorda driftplatser') &&
          !normalized.startsWith('htsm telefonnr') &&
          !normalized.startsWith('granspunkter som ej far passeras')
        );
      }) || ''
  );
  const banobjektValue = getLabelValue(firstPageLines, /^banobjekt-vnr\b/i, /^.*Banobjekt-Vnr\s*/i);
  const forplaneraValue = getLabelValue(firstPageLines, /^forplanera ca\b/i, /^.*Förplanera ca\s*:?\s*/i);
  const berordaDriftplatser = getLabelValue(
    firstPageLines,
    /^berorda driftplatser\b/i,
    /^.*Berörda driftplatser\s*/i
  );
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
      routeLineCandidate &&
      !looksLikeHeaderMetadata(routeLineCandidate) &&
      !/^dispositionsarbetsplan\b/i.test(routeLineCandidate) &&
      !/^v\d+\b/i.test(routeLineCandidate)
        ? routeLineCandidate
        : '',
    weekLine: sanitizeWeekLine(weekLine),
    banobjektVnr: banobjektValue,
    forplaneraCa: forplaneraValue,
    berordaDriftplatser: normalizeProjectTitle(berordaDriftplatser),
    outerGranspunkter: normalizeProjectTitle(outerGranspunkter),
  };
};

const extractPlats = (pages) => {
  const firstPageLines = getPageLines(findOverviewPage(pages));
  const titleIndex = firstPageLines.findIndex((line) => /^Dispositionsarbetsplan\s+/i.test(line));
  if (titleIndex === -1) {
    return '';
  }

  const routeLines = [];
  for (let index = titleIndex + 1; index < firstPageLines.length; index += 1) {
    const line = firstPageLines[index];
    const normalizedLine = normalizeForMatching(line);
    if (!line || /^\(.*\)$/.test(line)) {
      continue;
    }
    if (
      /^v\d+\b/i.test(line) ||
      looksLikeHeaderMetadata(line) ||
      normalizedLine.startsWith('banobjekt-vnr') ||
      normalizedLine.startsWith('forplanera ca') ||
      normalizedLine.startsWith('berorda driftplatser') ||
      normalizedLine.startsWith('htsm telefonnr') ||
      normalizedLine.startsWith('granspunkter')
    ) {
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

const isDispBeteckning = (value = '') => /^26(?:[_\s-]?\d{4,})$/i.test(normalizeText(value));
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
        /26(?:[_\s-]?\d{4,})/.test(text) ||
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
  const beteckningMatches = text.match(/26(?:[_\s-]?\d{4,})/gi)?.length || 0;
  const dateTimeMatches = text.match(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/g)?.length || 0;
  const compactSectionRows = text.match(/^\d+\.\s+/gim)?.length || 0;
  const hasCompactSectionHeader = normalized.includes('delomrade granspunkter spar');
  const hasSectionChapterTitle = normalized.includes('granspunkter och delomrade');

  return (
    beteckningMatches > 0 ||
    dateTimeMatches >= 2 ||
    /delomrade\s+\d+/.test(normalized) ||
    hasCompactSectionHeader ||
    (compactSectionRows > 0 && hasSectionChapterTitle)
  );
};
const getDispTablePageScore = (page = {}) => {
  const text = String(page?.text || '');
  const normalized = normalizeForMatching(text);
  const beteckningMatches = text.match(/26(?:[_\s-]?\d{4,})/gi)?.length || 0;
  const dateTimeMatches = text.match(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/g)?.length || 0;
  const compactSectionRows = text.match(/^\d+\.\s+/gim)?.length || 0;
  const hasCompactSectionHeader = normalized.includes('delomrade granspunkter spar');
  const hasSectionChapterTitle = normalized.includes('granspunkter och delomrade');

  let score = 0;
  if (/delomrade\s+\d+/.test(normalized)) {
    score += 5;
  }
  if (compactSectionRows && hasSectionChapterTitle) {
    score += Math.min(compactSectionRows, 6);
  }
  if (hasCompactSectionHeader) {
    score += 4;
  }
  if (hasSectionChapterTitle) {
    score += 4;
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
    const scopedLines = normalizedLines.filter((line) => (
      line.y >= (phoneHeader?.y ?? 0) - 0.002 &&
      line.y <= (phoneHeader?.y ?? 0) + 0.25
    ));
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

    const fjtklLine = scopedLines.find((line) => /^(4\.\s*)?tkl\b/.test(line.normalized) || /^fjtkl\b/.test(line.normalized));

    return {
      namn: fjtklLine ? normalizeText(fjtklLine.text.replace(/^(4\.\s*)?(Fjtkl|Tkl)\s+/i, '')) : '',
      nodnummer: pickNearestPhone(/^2\.\s*larm\s+tlc\b/),
      htsmTelefon: pickNearestPhone(/^3\.\s*htsm\b/),
      reservnr: pickNearestPhone(/^reservnr\b/),
      telefonnummer: pickNearestPhone(/^(4\.\s*)?tkl\b|^fjtkl\b/),
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
      { key: 'htsm', pattern: /^3\.\s*htsm\b/ },
      { key: 'reserv', pattern: /^reservnr\b/ },
      { key: 'arbetsledare', pattern: /^3\.\s*ansvarig\s+arbetsledare\b/ },
      { key: 'fjtkl', pattern: /^(4\.\s*)?tkl\b|^fjtkl\b/ },
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
          /^(4\.\s*)?tkl\b/i.test(line) ||
          /^2\.\s*larm\s+tlc\b/i.test(line) ||
          /^3\.\s*htsm\b/i.test(line) ||
          /^reservnr\b/i.test(line) ||
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
        reservnr: '',
      };
  }

  const coordinatePhones = extractPhonesByCoordinates(pages);
  const orderedPhones = extractOrderedLabelPhones(scope);
  const numbers = scope
    .filter((line) => /^010[- ]\s*\d{3}\s*\d{2}\s*\d{2}/.test(line))
    .map(formatPhone);
  const fjtklLine = scope.find((line) => /^(4\.\s*)?(Fjtkl|Tkl)\s+/i.test(line));
  const directLarmPhone = extractPhoneNearLabel(scope, /^2\.\s*larm\s+tlc\b/);
  const directHtsmPhone = extractPhoneNearLabel(scope, /^3\.\s*htsm\b/);
  const directReservPhone = extractPhoneNearLabel(scope, /^reservnr\b/);
  const directTklPhone = extractPhoneNearLabel(scope, /^(4\.\s*)?tkl\b|^fjtkl\b/);

  return {
    namn:
      coordinatePhones.namn ||
      (fjtklLine ? normalizeText(fjtklLine.replace(/^(4\.\s*)?(Fjtkl|Tkl)\s+/i, '')) : ''),
    nodnummer:
      directLarmPhone ||
      coordinatePhones.nodnummer ||
      orderedPhones.larmTlc ||
      numbers[0] ||
      '',
    htsmTelefon:
      directHtsmPhone ||
      coordinatePhones.htsmTelefon ||
      orderedPhones.htsm ||
      '',
    reservnr:
      directReservPhone ||
      coordinatePhones.reservnr ||
      orderedPhones.reserv ||
      '',
    telefonnummer:
      directTklPhone ||
      coordinatePhones.telefonnummer ||
      orderedPhones.fjtkl ||
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
  reservnr: pickParsedValue(...sources.map((source) => source?.reservnr)),
});

const extractDispEntriesFromText = (pages = []) => {
  const entries = [];
  const pagesWithTables = getDispTablePages(pages);

  pagesWithTables.forEach((page) => {
    const lines = getPageLines(page);

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const labels = Array.from(line.matchAll(/(26(?:[_\s-]?\d{4,}))/gi), (match) => match[1]);

      if (!labels.length) {
        continue;
      }

      const blockLines = [line];
      for (let lookahead = index + 1; lookahead < Math.min(lines.length, index + 6); lookahead += 1) {
        const nextLine = lines[lookahead];
        const normalizedNextLine = normalizeForMatching(nextLine);
        if (
          /(26(?:[_\s-]?\d{4,}))/i.test(nextLine) ||
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
    .replace(/\b([A-Za-zÅÄÖåäö]{1,4})\s+(\d)/g, '$1$2')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/[\s\-–—]+$/, '')
    .trim();

const isSignalPointToken = (value = '') => /\d/.test(cleanBoundaryToken(value));
const extractSignalTokens = (value = '') =>
  cleanBoundaryToken(value)
    .match(/[A-Za-zÅÄÖåäö]{1,4}\d+(?:\/\d+)?(?:,\s*(?:[A-Za-zÅÄÖåäö]{1,4}\d+(?:\/\d+)?|\d+(?:\/\d+)?))*/g) || [];

const DISP_SECTION_POINT_TOKEN_PATTERN =
  '[A-Za-z\\u00C5\\u00C4\\u00D6\\u00E5\\u00E4\\u00F6]{1,4}\\s*\\d+(?:\\/\\d+)?(?:,\\s*(?:[A-Za-z\\u00C5\\u00C4\\u00D6\\u00E5\\u00E4\\u00F6]{1,4}\\s*\\d+(?:\\/\\d+)?|\\d+(?:\\/\\d+)?))*';
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
        name: pickParsedValue(current.name, section.name),
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

const splitSectionNameEndpoints = (value = '') => {
  const parts = normalizeSectionName(value)
    .split(/\s+-\s+/)
    .map((part) => cleanMatchedValue(part))
    .filter(Boolean);

  if (parts.length < 2) {
    return {
      left: parts[0] || '',
      right: parts[0] || '',
      isRange: false,
    };
  }

  return {
    left: parts[0] || '',
    right: parts[parts.length - 1] || '',
    isRange: true,
  };
};

const areCloseSectionNames = (left = '', right = '') => {
  const a = cleanMatchedValue(left).toLowerCase();
  const b = cleanMatchedValue(right).toLowerCase();
  if (!a || !b) return false;
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  return a.startsWith(b) || b.startsWith(a);
};

const pickPreferredSectionName = (...values) =>
  values
    .map((value) => cleanMatchedValue(value))
    .filter(Boolean)
    .sort((left, right) => right.length - left.length)[0] || '';

const reconcileSingleSectionNames = (sections = []) =>
  sections.map((section, index, collection) => {
    const currentName = normalizeSectionName(section.name || section.signal || '');
    if (!currentName || currentName.includes(' - ')) {
      return section;
    }

    const prev = collection[index - 1];
    const next = collection[index + 1];
    const prevEndpoints = splitSectionNameEndpoints(prev?.name || prev?.signal || '');
    const nextEndpoints = splitSectionNameEndpoints(next?.name || next?.signal || '');
    const candidate = pickPreferredSectionName(
      areCloseSectionNames(currentName, prevEndpoints.right) ? prevEndpoints.right : '',
      areCloseSectionNames(currentName, nextEndpoints.left) ? nextEndpoints.left : '',
      currentName
    );

    return candidate && candidate !== currentName
      ? { ...section, name: candidate }
      : section;
  });

const reconcileRangeSectionNames = (sections = []) =>
  sections.map((section, index, collection) => {
    const currentName = normalizeSectionName(section.name || section.signal || '');
    if (!currentName || !currentName.includes(' - ')) {
      return section;
    }

    const prev = collection[index - 1];
    const next = collection[index + 1];
    const prevEndpoints = splitSectionNameEndpoints(prev?.name || prev?.signal || '');
    const nextEndpoints = splitSectionNameEndpoints(next?.name || next?.signal || '');
    const currentEndpoints = splitSectionNameEndpoints(currentName);
    const resolvedLeft = pickPreferredSectionName(
      areCloseSectionNames(currentEndpoints.left, prevEndpoints.right) ? prevEndpoints.right : '',
      currentEndpoints.left
    );
    const resolvedRight = pickPreferredSectionName(
      areCloseSectionNames(currentEndpoints.right, nextEndpoints.left) ? nextEndpoints.left : '',
      currentEndpoints.right
    );
    const candidate = [resolvedLeft, resolvedRight].filter(Boolean).join(' - ');

    return candidate && candidate !== currentName
      ? { ...section, name: candidate }
      : section;
  });

const reconcileAdjacentSectionNames = (sections = []) =>
  reconcileRangeSectionNames(reconcileSingleSectionNames(sections));

const refineSectionNamesWithReferences = (sections = [], overview = {}) => {
  const projectNames = [
    ...splitReferenceNames(overview?.berordaDriftplatser || ''),
    ...splitReferenceNames(overview?.stracka || ''),
    ...collectSectionReferenceNames(sections),
  ];
  const globalNames = getKnownDriftplatsNames();

  const refined = sections.map((section) => {
    const currentName = normalizeSectionName(section.name || section.signal || '');
    if (!currentName) {
      return section;
    }

    const endpoints = splitSectionNameEndpoints(currentName);
    const resolvedLeft = resolveStationName(endpoints.left, projectNames, globalNames);
    const resolvedRight = resolveStationName(endpoints.right, projectNames, globalNames);
    const nextName = endpoints.isRange
      ? [resolvedLeft, resolvedRight].filter(Boolean).join(' - ')
      : resolvedLeft;

    if (!nextName || nextName === currentName) {
      return section;
    }

    return {
      ...section,
      name: nextName,
    };
  });

  return reconcileAdjacentSectionNames(refined);
};

const normalizeSectionField = (value = '') =>
  cleanBoundaryToken(value)
    .replace(/^(signaler?|granspunkter?|spar)\s*[:\-]?\s*/i, '')
    .trim();

const sanitizeSectionValue = (value = '', { allowTrackNumbers = false } = {}) => {
  const normalized = normalizeSectionField(value)
    .replace(/yttre\s+gr[aä]nspunkter.*$/i, '')
    .replace(/gr[aä]nspunkter\s+som\s+ej\s+f[aå]r\s+passeras.*$/i, '')
    .replace(/som\s+ej\s+f[aå]r\s+passeras.*$/i, '')
    .replace(/medgivande\s+fr[aå]n\s+tkl.*$/i, '')
    .replace(/r[oö]dmarkerade.*$/i, '')
    .trim();

  if (!normalized) {
    return '';
  }

  if (allowTrackNumbers && /^[\d,\s]+$/.test(normalized)) {
    return normalized.replace(/\s*,\s*/g, ', ');
  }

  return normalized;
};

const normalizeSectionName = (value = '') => {
  const cleaned = sanitizeSectionValue(value);
  if (!cleaned || /\d{2,}/.test(cleaned) || /\bsp[aå]r\b/i.test(cleaned)) {
    return '';
  }

  const duplicatePrefix = cleaned.match(/^(.+?)\s+\1\s*-\s*(.+)$/i);
  if (duplicatePrefix) {
    return `${duplicatePrefix[1]} - ${duplicatePrefix[2]}`.trim();
  }

  return cleaned;
};

const buildDispSection = ({
  displayIndex,
  signal = '',
  granspunkter = '',
  spar = '',
  type = 'Delområde',
  namingMode = 'NUMBERS',
} = {}) => {
  const normalizedSignal = sanitizeSectionValue(signal);
  const normalizedBoundaries = sanitizeSectionValue(granspunkter);
  const normalizedTrack = sanitizeSectionValue(spar, { allowTrackNumbers: true });
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
    const compactRowMatch = normalizedRow.match(/^(\d+)\.\s+(.+?)\s+([A-Za-z\u00C5\u00C4\u00D6\u00E5\u00E4\u00F60-9]+(?:,\s*[A-Za-z\u00C5\u00C4\u00D6\u00E5\u00E4\u00F60-9]+)*)$/i);
    if (!compactRowMatch) {
      return null;
    }

    const displayIndex = Number(compactRowMatch[1] || 0);
    const granspunkter = normalizeSectionRowText(compactRowMatch[2] || '');
    const spar = normalizeSectionRowText(compactRowMatch[3] || '');
    if (!displayIndex || !granspunkter || !spar) {
      return null;
    }

    return {
      ...buildDispSection({
        displayIndex,
        signal: granspunkter,
        granspunkter,
        spar,
      }),
      displayIndex,
      name: '',
    };
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

  const sectionName = normalizeSectionName(normalizeSectionRowText(body.slice(0, boundaryMatch.index)));
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

const parseSectionDisplayIndex = (value = '') => {
  const normalizedRow = normalizeSectionRowText(value);
  if (!normalizedRow) {
    return null;
  }

  const legacyMatch = normalizedRow.match(/^Delomr(?:\u00E5de|ade)\s+(\d+)\b/i);
  if (legacyMatch) {
    return Number(legacyMatch[1] || 0) || null;
  }

  const compactMatch = normalizedRow.match(/^(\d+)\.\s*(?:$|\S+)/);
  if (compactMatch) {
    return Number(compactMatch[1] || 0) || null;
  }

  return null;
};

const COMPACT_TRACK_ONLY_PATTERN = /^(?:[A-Za-zÅÄÖåäö0-9]+(?:\s*-\s*[A-Za-zÅÄÖåäö0-9]+)?)(?:,\s*[A-Za-zÅÄÖåäö0-9]+(?:\s*-\s*[A-Za-zÅÄÖåäö0-9]+)?)*$/;

const isCompactTrackOnlyLine = (value = '') =>
  COMPACT_TRACK_ONLY_PATTERN.test(
    normalizeSectionRowText(value)
      .replace(/^sp[aå]r\s*/i, '')
      .trim()
  );

const parseCompactDispSectionBlock = (lines = []) => {
  if (!lines.length) {
    return null;
  }

  const normalizedLines = lines
    .map((line) => normalizeSectionRowText(line))
    .filter(Boolean);

  if (!normalizedLines.length) {
    return null;
  }

  const displayIndex = parseSectionDisplayIndex(normalizedLines[0]);
  if (!displayIndex) {
    return null;
  }

  const bodyLines = [
    normalizedLines[0].replace(/^(\d+)[\.,]\s*/, ''),
    ...normalizedLines.slice(1),
  ].filter(Boolean);

  let spar = '';
  if (bodyLines.length > 1 && isCompactTrackOnlyLine(bodyLines[bodyLines.length - 1])) {
    spar = bodyLines.pop();
  }

  const body = bodyLines.join(' ').trim();
  const inlineSection = !spar
    ? parseInlineDispSectionText(`${displayIndex}. ${body}`)
    : null;
  if (inlineSection && inlineSection.granspunkter && inlineSection.spar) {
    return inlineSection;
  }

  if (spar && body.includes(' - ')) {
    return {
      ...buildDispSection({
        displayIndex,
        signal: body,
        granspunkter: body,
        spar,
      }),
      displayIndex,
      name: '',
    };
  }

  const boundaryMatch = body.match(DISP_SECTION_BOUNDARY_RANGE_REGEX);
  if (!boundaryMatch || !spar) {
    return inlineSection;
  }

  const granspunkter = `${cleanBoundaryToken(boundaryMatch[1] || '')} - ${cleanBoundaryToken(boundaryMatch[2] || '')}`;

  return {
    ...buildDispSection({
      displayIndex,
      signal: granspunkter,
      granspunkter,
      spar,
    }),
    displayIndex,
    name: '',
  };
};

const parseLegacyDispSectionBlock = (lines = []) => {
  const normalizedLines = lines
    .map((line) => normalizeSectionRowText(line))
    .filter(Boolean);

  if (!normalizedLines.length) {
    return null;
  }

  const firstLine = normalizedLines[0];
  const headerMatch = firstLine.match(/^Delomr(?:\u00E5de|ade)\s+(\d+)\s+(.+)$/i);
  if (!headerMatch) {
    return null;
  }

  const displayIndex = Number(headerMatch[1] || 0);
  if (!displayIndex) {
    return null;
  }

  let namePart = normalizeSectionName(headerMatch[2] || '');
  let granspunkter = '';
  let spar = '';

  const extractTrackValue = (value = '') => {
    const normalized = normalizeSectionRowText(value);
    const explicit = normalized.match(/^Sp(?:\u00E5|a)r\s+(.+)$/i);
    if (explicit?.[1]) {
      return sanitizeSectionValue(explicit[1], { allowTrackNumbers: true });
    }
    if (/^[A-Za-zÅÄÖåäö0-9,\s/]+$/.test(normalized)) {
      return sanitizeSectionValue(normalized, { allowTrackNumbers: true });
    }
    return '';
  };

  const extractBoundaryFromText = (value = '') => {
    const normalized = normalizeSectionRowText(value);
    const boundaryMatch = normalized.match(DISP_SECTION_BOUNDARY_RANGE_REGEX);
    if (!boundaryMatch) {
      return '';
    }
    return `${cleanBoundaryToken(boundaryMatch[1] || '')} - ${cleanBoundaryToken(boundaryMatch[2] || '')}`;
  };

  const firstLineBoundary = extractBoundaryFromText(headerMatch[2] || '');
  if (firstLineBoundary) {
    granspunkter = firstLineBoundary;
    namePart = normalizeSectionName(
      normalizeSectionRowText(headerMatch[2] || '').slice(0, normalizeSectionRowText(headerMatch[2] || '').indexOf(firstLineBoundary))
    ) || namePart;
  }

  for (const line of normalizedLines.slice(1)) {
    if (!granspunkter) {
      const boundaryValue = extractBoundaryFromText(line);
      if (boundaryValue) {
        granspunkter = boundaryValue;
        continue;
      }
    }

    if (!spar) {
      const trackValue = extractTrackValue(line);
      if (trackValue) {
        spar = trackValue;
        continue;
      }
    }

    if (!namePart) {
      namePart = normalizeSectionName(line) || namePart;
    }
  }

  if (!granspunkter) {
    return null;
  }

  return {
    ...buildDispSection({
      displayIndex,
      signal: granspunkter,
      granspunkter,
      spar,
    }),
    displayIndex,
    name: namePart,
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

const isDispSectionFooterText = (value = '') => {
  const normalized = normalizeForMatching(value);
  return (
    normalized.startsWith('yttre granspunkter') ||
    normalized.startsWith('granspunkter som ej far passeras') ||
    normalized.startsWith('granspunkter som ej får passeras')
  );
};

const isDispChapterHeadingText = (value = '') =>
  /^\d+\s+[A-Za-zÅÄÖåäö].+\.$/.test(normalizeText(value));

const findDispSectionHeaderRow = (lines = []) => {
  const rowGroups = groupLinesByApproximateRow(lines);

  return rowGroups
    .map((group) => {
      const groupText = group.lines
        .map((line) => String(line.normalized || normalizeForMatching(line.text || '')))
        .join(' ');
      let score = 0;

      if (groupText.includes('delomrade')) {
        score += 2;
      }
      if (groupText.includes('spar')) {
        score += 2;
      }
      if (groupText.includes('granspunkter') || groupText.includes('punkter')) {
        score += 2;
      }

      return {
        group,
        score,
      };
    })
    .filter((candidate) => candidate.score >= 4)
    .sort((left, right) => right.score - left.score || Number(right.group.y) - Number(left.group.y))[0] || null;
};

const getDispSectionOcrLines = (page = {}) => {
  const normalizedLines = (Array.isArray(page?.lines) ? page.lines : []).map((line) => ({
    ...line,
    text: cleanBoundaryToken(line.text || ''),
    normalized: normalizeForMatching(cleanBoundaryToken(line.text || '')),
  }));
  const headerRow = findDispSectionHeaderRow(normalizedLines);

  if (!headerRow) {
    return normalizedLines;
  }

  const headerY = Number(headerRow.group.y);
  const footerLine = normalizedLines
    .filter((line) => Number(line.y) < headerY - 0.015)
    .find((line) => (
      isDispSectionFooterText(line.text || line.normalized || '') ||
      isDispChapterHeadingText(line.text || line.normalized || '')
    ));
  const footerY = Number(footerLine?.y ?? 0);

  return normalizedLines.filter((line) => (
    Number(line.y) < headerY - 0.01 &&
    Number(line.y) > footerY + 0.005
  ));
};

const getDispSectionTextLines = (page = {}) => {
  const lines = getPageLines(page);
  const headerIndex = lines.findIndex((line) => {
    const normalized = normalizeForMatching(line);
    return normalized.includes('delomrade') && normalized.includes('spar') && normalized.includes('punkter');
  });

  if (headerIndex === -1) {
    return lines;
  }

  const footerIndex = lines.findIndex((line, index) => (
    index > headerIndex && (
      isDispSectionFooterText(line) ||
      isDispChapterHeadingText(line)
    )
  ));

  return lines.slice(headerIndex + 1, footerIndex === -1 ? undefined : footerIndex);
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
      const normalizedLines = getDispSectionOcrLines(page);
      const columns = findSectionHeaderColumns(normalizedLines);
      if (!columns) {
        return [];
      }

      const sectionRows = normalizedLines
        .filter((line) => {
          const displayIndex = parseSectionDisplayIndex(line.text || line.normalized || '');
          if (!displayIndex) {
            return false;
          }

          return Number(line.x) >= columns.delomrade - 0.03 && Number(line.x) < columns.granspunkter - 0.02;
        })
        .sort((a, b) => Number(b.y) - Number(a.y));

      return sectionRows.map((row, index) => {
        const displayIndex = parseSectionDisplayIndex(row.text || row.normalized || '') || index + 1;
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
      const lines = getDispSectionTextLines(page);
      const sections = [];

      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        const displayIndex = parseSectionDisplayIndex(line);
        const isCompactRow = /^\d+\.\s*/.test(normalizeSectionRowText(line));

        if (displayIndex && isCompactRow) {
          const blockLines = [line];

          for (let lookahead = index + 1; lookahead < lines.length; lookahead += 1) {
            const nextLine = lines[lookahead];
            if (
              parseSectionDisplayIndex(nextLine) ||
              isDispSectionFooterText(nextLine) ||
              isDispChapterHeadingText(nextLine)
            ) {
              break;
            }

            blockLines.push(nextLine);
          }

          const compactBlockSection = parseCompactDispSectionBlock(blockLines);
          if (compactBlockSection) {
            sections.push(compactBlockSection);
            index += blockLines.length - 1;
            continue;
          }
        }

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
        const wrappedInlineSection = parseInlineDispSectionText(blockText);
        if (wrappedInlineSection) {
          sections.push(wrappedInlineSection);
          continue;
        }

        const legacyBlockSection = parseLegacyDispSectionBlock(blockLines);
        if (legacyBlockSection) {
          sections.push(legacyBlockSection);
          index += blockLines.length - 1;
          continue;
        }

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
      const normalizedLines = getDispSectionOcrLines(page).map((line) => ({
        ...line,
        text: normalizeSectionRowText(line.text || ''),
        normalized: normalizeForMatching(normalizeSectionRowText(line.text || '')),
      }));

      const sectionRows = normalizedLines
        .filter((line) => parseSectionDisplayIndex(line.text || line.normalized || ''))
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
  const normalizedLines = getDispSectionOcrLines(page);

  const sectionRows = normalizedLines
    .filter((line) => parseSectionDisplayIndex(line.text || line.normalized || ''))
    .sort((a, b) => b.y - a.y);

  return sectionRows.map((row, index) => {
    const displayIndex = parseSectionDisplayIndex(row.text || row.normalized || '') || index + 1;
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
      const normalizedLines = getDispSectionOcrLines(page);

      const sectionRows = normalizedLines
        .filter((line) => parseSectionDisplayIndex(line.text || line.normalized || ''))
        .sort((a, b) => b.y - a.y);

      return sectionRows.map((row, index) => {
        const displayIndex = parseSectionDisplayIndex(row.text || row.normalized || '') || index + 1;
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
  const textSections = mergeDispSections(extractDispSectionsFromText(textPages));
  if (textSections.length) {
    return textSections;
  }

  const primarySections = mergeDispSections([
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
  const rawSections = reconcileAdjacentSectionNames(extractMergedDispSections(textPages, ocrPages));
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
    berordaDriftplatser: pickParsedValue(
      textOverview.berordaDriftplatser,
      ocrOverview.berordaDriftplatser,
      preferredOverview.berordaDriftplatser
    ),
    outerGranspunkter: pickParsedValue(
      textOverview.outerGranspunkter,
      ocrOverview.outerGranspunkter,
      preferredOverview.outerGranspunkter
    ),
  };
  const sections = refineSectionNamesWithReferences(rawSections, overview);

  return {
    projectName: pickParsedValue(
      hasUsefulText ? extractProjectName(textPages) : '',
      extractProjectName(ocrPages),
      extractProjectName(preferredPages)
    ),
    plats: pickUsablePlats(
      overview.berordaDriftplatser,
      overview.stracka,
      overview.banName,
      hasUsefulText ? extractPlats(textPages) : '',
      extractPlats(ocrPages),
      extractPlats(preferredPages)
    ),
    namn: phones.namn,
    telefonnummer: phones.telefonnummer,
    nodnummer: phones.nodnummer,
    htsmTelefon: phones.htsmTelefon,
    reservnr: phones.reservnr,
    overview,
    entries,
    sections,
    match: compareDispWithBlankett31(entries, blankett31Entries),
  };
};

module.exports = {
  parseDispPdf,
};
