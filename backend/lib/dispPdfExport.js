const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const LEGACY_LOGO_PATH = path.join(__dirname, '..', 'assets', 'vallakra-logo-cropped.png');
const LEGACY_VERSION_NUMBER = '1/MA11';
const FONT_PATHS = {
  verdana: '/System/Library/Fonts/Supplemental/Verdana.ttf',
  verdanaBold: '/System/Library/Fonts/Supplemental/Verdana Bold.ttf',
  verdanaItalic: '/System/Library/Fonts/Supplemental/Verdana Italic.ttf',
  verdanaBoldItalic: '/System/Library/Fonts/Supplemental/Verdana Bold Italic.ttf',
  times: '/System/Library/Fonts/Supplemental/Times New Roman.ttf',
  timesBold: '/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf',
  timesItalic: '/System/Library/Fonts/Supplemental/Times New Roman Italic.ttf',
  timesBoldItalic: '/System/Library/Fonts/Supplemental/Times New Roman Bold Italic.ttf',
};
const CUSTOM_PDF_FONTS = {
  header: 'LegacyVerdana',
  headerBold: 'LegacyVerdanaBold',
  headerItalic: 'LegacyVerdanaItalic',
  headerBoldItalic: 'LegacyVerdanaBoldItalic',
  body: 'LegacyTimes',
  bodyBold: 'LegacyTimesBold',
  bodyItalic: 'LegacyTimesItalic',
  bodyBoldItalic: 'LegacyTimesBoldItalic',
};
const PDF_FONTS = {
  header: 'Helvetica',
  headerBold: 'Helvetica-Bold',
  headerItalic: 'Helvetica-Oblique',
  headerBoldItalic: 'Helvetica-BoldOblique',
  body: 'Times-Roman',
  bodyBold: 'Times-Bold',
  bodyItalic: 'Times-Italic',
  bodyBoldItalic: 'Times-BoldItalic',
};

const DRIFTPLATS_REGISTRY_PATH = path.join(__dirname, '..', 'data', 'njdb-driftplatser.json');
let driftplatsCodeNameMap = null;
let driftplatsNameCodeMap = null;
const LEGACY_DISPLAY_CODE_NAME_OVERRIDES = {
  Blb: 'Billeberga',
};

const getDriftplatsCodeNameMap = () => {
  if (driftplatsCodeNameMap) {
    return driftplatsCodeNameMap;
  }

  try {
    const raw = fs.readFileSync(DRIFTPLATS_REGISTRY_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed?.items) ? parsed.items : [];
    driftplatsCodeNameMap = new Map(
      items
        .filter((item) => item?.code && item?.name)
        .map((item) => [String(item.code).trim(), String(item.name).trim()])
    );
    Object.entries(LEGACY_DISPLAY_CODE_NAME_OVERRIDES).forEach(([code, name]) => {
      if (code && name) {
        driftplatsCodeNameMap.set(String(code).trim(), String(name).trim());
      }
    });
  } catch (error) {
    driftplatsCodeNameMap = new Map();
    Object.entries(LEGACY_DISPLAY_CODE_NAME_OVERRIDES).forEach(([code, name]) => {
      if (code && name) {
        driftplatsCodeNameMap.set(String(code).trim(), String(name).trim());
      }
    });
  }

  return driftplatsCodeNameMap;
};

const getDriftplatsNameCodeMap = () => {
  if (driftplatsNameCodeMap) {
    return driftplatsNameCodeMap;
  }

  const codeNameMap = getDriftplatsCodeNameMap();
  driftplatsNameCodeMap = new Map(
    [...codeNameMap.entries()]
      .filter(([code, name]) => code && name)
      .map(([code, name]) => [String(name).trim(), String(code).trim()])
  );

  return driftplatsNameCodeMap;
};

const SWEDISH_SHORT_DAYS = ['Sön', 'Mån', 'Tis', 'Ons', 'Tors', 'Fre', 'Lör'];
const cleanText = (value = '') =>
  String(value || '')
    .replace(/\r/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const sanitizeSectionText = (value = '') =>
  cleanText(value)
    .replace(/yttre\s+gr[aä]nspunkter.*$/i, '')
    .replace(/gr[aä]nspunkter\s+som\s+ej\s+f[aå]r\s+passeras.*$/i, '')
    .replace(/som\s+ej\s+f[aå]r\s+passeras.*$/i, '')
    .replace(/medgivande\s+fr[aå]n\s+tkl.*$/i, '')
    .replace(/r[oö]dmarkerade.*$/i, '')
    .trim();

const normalizeSectionAreaName = (value = '') =>
  sanitizeSectionText(value)
    .replace(/\s+Driftplats(?:er)?$/i, '');

const normalizeTrackValue = (value = '') => {
  const normalized = sanitizeSectionText(value).replace(/^sp[aå]r\s*/i, '');
  if (!normalized) return '';

  return cleanText(
    normalized
      .replace(/\s*-\s*/g, '-')
      .replace(/\s*\/\s*/g, '/')
      .replace(/\s*,\s*/g, ', ')
  );
};

const formatDate = (value = '') => {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return cleanText(value);
  return `${match[1]}-${match[2]}-${match[3]}`;
};

const formatTime = (value = '') => cleanText(value);

const buildPlanJobEntryKey = (entry = {}, index = 0) =>
  `${entry.beteckning || 'entry'}|${entry.startDate || ''}|${index}`;

const getDispSelectedEntries = (entries = [], project = {}) => {
  const storedJobs = Array.isArray(project.formState?.planJobs)
    ? project.formState.planJobs.filter((job) => job && Array.isArray(job.selectedEntryKeys) && job.selectedEntryKeys.length)
    : [];

  if (!storedJobs.length) {
    return entries;
  }

  const entryMap = new Map(entries.map((entry, index) => [buildPlanJobEntryKey(entry, index), entry]));
  const dispEntries = storedJobs
    .map((job) => {
      const selectedKeys = Array.isArray(job.selectedEntryKeys) ? job.selectedEntryKeys : [];
      const preferredKey = selectedKeys.includes(job.primaryDispEntryKey)
        ? job.primaryDispEntryKey
        : selectedKeys[0] || '';
      return entryMap.get(preferredKey) || null;
    })
    .filter(Boolean);

  return dispEntries.length ? dispEntries : entries;
};

const buildEntries = (project = {}) => {
  const rawEntries = Array.isArray(project.formState?.blankett31Entries)
    ? project.formState.blankett31Entries
    : [];

  const normalizedEntries = rawEntries
    .map((entry) => ({
      beteckning: cleanText(entry?.beteckning),
      startDate: cleanText(entry?.startDate),
      startTime: cleanText(entry?.startTime),
      endDate: cleanText(entry?.endDate),
      endTime: cleanText(entry?.endTime),
      telefonnummer: cleanText(entry?.telefonnummer),
      namn: cleanText(entry?.namn),
    }))
    .filter((entry) => entry.beteckning || entry.startDate || entry.endDate);

  normalizedEntries.sort((left, right) => {
    const leftKey = `${left.startDate || '9999-99-99'} ${left.startTime || '99:99'} ${left.beteckning || ''}`;
    const rightKey = `${right.startDate || '9999-99-99'} ${right.startTime || '99:99'} ${right.beteckning || ''}`;
    return leftKey.localeCompare(rightKey, 'sv');
  });

  return normalizedEntries.filter((entry, index, collection) => {
    const key = `${entry.beteckning}|${entry.startDate}|${entry.startTime}|${entry.endDate}|${entry.endTime}`;
    return collection.findIndex((candidate) =>
      `${candidate.beteckning}|${candidate.startDate}|${candidate.startTime}|${candidate.endDate}|${candidate.endTime}` === key
    ) === index;
  });
};

const buildSections = (project = {}) => {
  const sections = Array.isArray(project.sections) ? project.sections : [];
  const sectionDetails = Array.isArray(project.formState?.sectionDetails)
    ? project.formState.sectionDetails
    : [];
  const sortByStoredOrder = (items = [], getOrder) =>
    items
      .map((item, index) => {
        const parsedOrder = Number(getOrder(item));
        return {
          item,
          index,
          order: Number.isFinite(parsedOrder) ? parsedOrder : index,
        };
      })
      .sort((left, right) => (
        left.order - right.order
        || left.index - right.index
      ))
      .map(({ item }) => item);
  const orderedSections = sortByStoredOrder(sections, (section) => section?.sortOrder);
  const orderedDetails = sortByStoredOrder(sectionDetails, (details) => details?.sortOrder);
  const baseSections = sections.length
    ? orderedSections
    : orderedDetails.map((details = {}, index) => ({
        name: details.signal || details.customLabel || `Delområde ${index + 1}`,
        displayIndex: details.displayIndex ?? index + 1,
        customLabel: details.customLabel || '',
        sortOrder: details.sortOrder ?? index,
      }));
  const fallbackBoundary = sanitizeSectionText(project.granspunkter || '');
  const singleSectionFallbackName =
    baseSections.length === 1
      ? normalizeSectionAreaName(project.plats || project.formState?.dispSettings?.banNamn || '')
      : '';

  return baseSections
    .map((section, index) => {
      const details = orderedDetails[index] || {};
      const parsedDisplayIndex = Number(details.displayIndex ?? section?.displayIndex ?? index + 1);
      const displayIndex = Number.isFinite(parsedDisplayIndex) && parsedDisplayIndex > 0
        ? parsedDisplayIndex
        : index + 1;
      const customLabel = cleanText(details.customLabel || section?.customLabel || '');
      const parsedSortOrder = Number(details.sortOrder ?? section?.sortOrder);
      const sortOrder = Number.isFinite(parsedSortOrder) ? parsedSortOrder : index;
      const granspunktStart = sanitizeSectionText(details.granspunktStart);
      const granspunktSlut = sanitizeSectionText(details.granspunktSlut);
      const computedBoundary = sanitizeSectionText(
        details.granspunkter || [granspunktStart, granspunktSlut].filter(Boolean).join(' - ')
      );
      const granspunkter = computedBoundary || fallbackBoundary;
      const areaName = normalizeSectionAreaName(section?.name || details.signal || singleSectionFallbackName);

      return {
        displayIndex,
        sortOrder,
        label: `Delområde ${customLabel || displayIndex}`,
        name: areaName,
        signal: areaName,
        granspunkter,
        spar: normalizeTrackValue(details.spar),
        granspunktStart,
        granspunktSlut,
        highlightStart: Boolean(details.highlightStart),
        highlightEnd: Boolean(details.highlightEnd),
        highlightStartPart: cleanText(details.highlightStartPart),
        highlightEndPart: cleanText(details.highlightEndPart),
      };
    })
    .sort((left, right) => left.sortOrder - right.sortOrder);
};

const sectionHasVisibleContent = (section = {}) =>
  [
    section?.signal,
    section?.name,
    section?.granspunktStart,
    section?.granspunktSlut,
    section?.granspunkter,
    section?.spar,
    section?.customLabel,
  ].some((value) => cleanText(value));

const buildChapterOneGroups = (project = {}, entries = []) => {
  const entryMap = new Map(entries.map((entry, index) => [buildPlanJobEntryKey(entry, index), entry]));
  const allSections = buildSections(project).filter(sectionHasVisibleContent);
  const explicitPrimaryKeys = Array.isArray(project.formState?.primaryDispSectionEntryKeys)
    ? project.formState.primaryDispSectionEntryKeys.filter((key) => entryMap.has(key))
    : [];
  const fallbackEntries = getDispSelectedEntries(entries, project);
  const primaryEntries = explicitPrimaryKeys.length
    ? explicitPrimaryKeys.map((key) => entryMap.get(key)).filter(Boolean)
    : fallbackEntries;

  const groups = [{
    id: 'primary',
    title: 'Delområdesruta 1',
    entries: primaryEntries,
    sections: allSections,
  }];

  const storedGroups = Array.isArray(project.formState?.dispSectionGroups)
    ? project.formState.dispSectionGroups
    : [];

  storedGroups.forEach((group, index) => {
    const groupEntries = Array.isArray(group?.selectedEntryKeys)
      ? group.selectedEntryKeys.map((key) => entryMap.get(key)).filter(Boolean)
      : [];
    const groupSections = Array.isArray(group?.sections)
      ? group.sections
        .map((section, sectionIndex) => ({
          displayIndex: Number.isFinite(Number(section?.displayIndex))
            ? Number(section.displayIndex)
            : sectionIndex + 1,
          sortOrder: Number.isFinite(Number(section?.sortOrder))
            ? Number(section.sortOrder)
            : sectionIndex,
          label: `Delområde ${cleanText(section?.customLabel || section?.displayIndex || sectionIndex + 1)}`,
          name: normalizeSectionAreaName(section?.name || section?.signal || ''),
          signal: normalizeSectionAreaName(section?.signal || section?.name || ''),
          granspunkter: sanitizeSectionText(
            section?.granspunkter ||
            [section?.granspunktStart, section?.granspunktSlut].filter(Boolean).join(' - ')
          ),
          spar: normalizeTrackValue(section?.spar),
          granspunktStart: sanitizeSectionText(section?.granspunktStart),
          granspunktSlut: sanitizeSectionText(section?.granspunktSlut),
          highlightStart: Boolean(section?.highlightStart),
          highlightEnd: Boolean(section?.highlightEnd),
          highlightStartPart: cleanText(section?.highlightStartPart),
          highlightEndPart: cleanText(section?.highlightEndPart),
          customLabel: cleanText(section?.customLabel),
        }))
        .filter(sectionHasVisibleContent)
      : [];

    if (groupEntries.length || groupSections.length) {
      groups.push({
        id: cleanText(group?.id || `group-${index + 2}`),
        title: cleanText(group?.title || `Delområdesruta ${index + 2}`) || `Delområdesruta ${index + 2}`,
        entries: groupEntries,
        sections: groupSections,
      });
    }
  });

  return groups.filter((group) => (group.entries || []).length || (group.sections || []).length);
};

const getIsoWeek = (dateValue = '') => {
  const match = String(dateValue || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';

  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `V${String(weekNo).padStart(2, '0')}`;
};

const getSummaryDateForEntry = (entry = {}) => {
  const startDate = cleanText(entry?.startDate);
  const endDate = cleanText(entry?.endDate);
  return endDate && endDate !== startDate ? endDate : startDate;
};

const buildDayRangeLabel = (entries = []) => {
  const uniqueDates = [...new Set(entries.map((entry) => getSummaryDateForEntry(entry)).filter(Boolean))].sort();
  if (!uniqueDates.length) return '';

  const labels = uniqueDates.map((dateValue) => {
    const date = new Date(`${dateValue}T00:00:00Z`);
    return Number.isNaN(date.getTime()) ? dateValue : SWEDISH_SHORT_DAYS[date.getUTCDay()];
  });

  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]}, ${labels[1]}`;
  return `${labels.slice(0, -1).join(', ')} och ${labels[labels.length - 1]}`;
};

const formatLegacyWeekLine = (value = '') =>
  cleanText(value)
    .replace(/\bTor\b/gi, 'Tors')
    .replace(/Lör,\s*Sön/gi, 'Lör-Sön')
    .replace(/Fre,\s*Lör/gi, 'Fre-Lör');

const buildLegacyCoverRoute = (project = {}, dispSettings = {}) => {
  const explicit = cleanText(dispSettings.rubrik || project.name || '');
  const parts = cleanText(project.plats || '')
    .split(',')
    .map((part) => cleanText(part))
    .filter(Boolean);

  return explicit || [parts[0], parts[parts.length - 1]].filter(Boolean).join(' - ');
};

const extractBlankettMeta = (project = {}) => project.formState?.blankett31Meta || {};

const getPublicDispName = (project = {}, dispSettings = {}) =>
  cleanText(
    dispSettings.publiktDispnamn ||
    project.name ||
    dispSettings.banNamn ||
    dispSettings.rubrik
  );

const buildDispSettings = (project = {}, entries = []) => {
  const meta = extractBlankettMeta(project);
  const settings = project.formState?.dispSettings || {};
  const weekLabel = cleanText(settings.weekLine || settings.veckaOchDagar);
  const derivedWeek = meta.referenceWeek || getIsoWeek(entries[0]?.startDate || project.startDate || '');
  const derivedDayRange = buildDayRangeLabel(entries);

  return {
    publiktDispnamn: cleanText(settings.publiktDispnamn || settings.publicName || ''),
    rubrik: cleanText(settings.rubrik || settings.projectLabel || meta.projectLabel || project.name),
    banNamn: cleanText(settings.banNamn || settings.banName),
    veckaOchDagar: weekLabel || [derivedWeek, derivedDayRange].filter(Boolean).join(' '),
    giltigTillagg: cleanText(settings.giltigTillagg || settings.validityExtra || ''),
    versionsnummer: cleanText(settings.versionsnummer || LEGACY_VERSION_NUMBER),
    banobjektVnr: cleanText(
      settings.banobjektVnr ||
        (meta.banarbetsobjektsId ? `${meta.banarbetsobjektsId}-1` : '')
    ),
    forplaneraCa: cleanText(settings.forplaneraCa || '1 tim innan start'),
    rodmarkeradeGranspunkter: cleanText(settings.rodmarkeradeGranspunkter || settings.highlightedBoundaries || ''),
    visaBeteckningarKapitel1: settings.visaBeteckningarKapitel1 !== false,
    visaFullaGranspunkterKapitel1: settings.visaFullaGranspunkterKapitel1 !== false,
    komprimeraLikaTiderKapitel1: settings.komprimeraLikaTiderKapitel1 !== false,
  };
};

const escapeRegExp = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeLegacyBoundaryCodeSpacing = (value = '') => {
  let text = cleanText(value);
  const codePattern = [...getDriftplatsCodeNameMap().keys()]
    .sort((left, right) => right.length - left.length)
    .map((code) => escapeRegExp(code))
    .join('|');

  if (codePattern) {
    text = text.replace(
      new RegExp(`(^|[\\s\\-–,(/])(${codePattern})\\s*([A-Za-z0-9]+)`, 'gu'),
      (_, prefix = '', code = '', suffix = '') => `${prefix}${code} ${suffix}`
    );
  }

  return text;
};

const normalizeLegacyBoundaryNameSpacing = (value = '') => {
  let text = cleanText(value);
  const names = [...getDriftplatsNameCodeMap().keys()].sort((left, right) => right.length - left.length);

  names.forEach((name) => {
    text = text.replace(
      new RegExp(`(${escapeRegExp(name)})\\s*([A-Za-z0-9]+)`, 'gu'),
      (_, placeName = '', suffix = '') => `${placeName} ${suffix}`
    );
  });

  return text;
};

const expandLegacyBoundaryText = (value = '') => {
  const registry = getDriftplatsCodeNameMap();
  const normalized = normalizeLegacyBoundaryCodeSpacing(value);
  const codePattern = [...registry.keys()]
    .sort((left, right) => right.length - left.length)
    .map((code) => escapeRegExp(code))
    .join('|');

  const expanded = codePattern
    ? normalized.replace(
        new RegExp(`(^|[\\s\\-–,(/])(${codePattern})(?=\\s+[A-Za-z0-9])`, 'gu'),
        (_, prefix = '', code = '') => `${prefix}${registry.get(code) || code}`
      )
    : normalized;

  return normalizeLegacyBoundaryNameSpacing(expanded);
};

const abbreviateLegacyBoundaryText = (value = '') => {
  const registry = getDriftplatsNameCodeMap();
  let text = cleanText(value);
  const names = [...registry.keys()].sort((left, right) => right.length - left.length);

  names.forEach((name) => {
    const code = registry.get(name);
    if (!code) return;

    const regex = new RegExp(
      `(^|[\\s\\-–,(/])(${escapeRegExp(name)})(?=(?:\\s*[A-Za-z0-9]+|\\s*[\\-–,/)])|$)`,
      'gu'
    );
    text = text.replace(regex, (_, prefix = '') => `${prefix}${code}`);
  });

  return normalizeLegacyBoundaryCodeSpacing(text);
};

const formatLegacyBoundaryText = (value = '', options = {}) => {
  const { expandNames = true } = options;
  const normalized = expandNames ? expandLegacyBoundaryText(value) : abbreviateLegacyBoundaryText(value);

  return normalized
    .replace(/\s*-\s*/g, ' – ')
    .replace(/\bHb\b/g, 'HB')
    .replace(/\bTp\b/g, 'TP')
    .replace(/\bBlb\b/g, 'Blb')
    .replace(/\bGan\b/g, 'Gan')
    .replace(/\bVåk\b/g, 'Våk')
    .replace(/\bTgp\b/g, 'Tgp');
};

const extractPrimaryPhone = (value = '') => {
  const match = cleanText(value).match(/010[- ]?\s*\d{3}\s*\d{2}\s*\d{2}/);
  return match ? cleanText(match[0]) : cleanText(value);
};

const extractPhoneContext = (value = '') => {
  const cleaned = cleanText(value);
  if (!cleaned) return '';

  const primaryPhone = extractPrimaryPhone(cleaned);
  if (!primaryPhone) return cleaned;

  return cleanText(cleaned.replace(primaryPhone, ''));
};

const KNOWN_FJTKL_PHONE_LABELS = {
  '010-127 12 32': 'Hässleholm',
  '010-127 12 62': 'Helsingborg',
  '010-127 12 80': 'Pebberholmen',
  '010-127 42 35': 'Borlänge',
};

const formatFjtklName = (value = '') => {
  const rawName = cleanText(value);
  if (!rawName) return 'Fjtkl';
  return /^TKL\b/i.test(rawName) ? rawName.replace(/^TKL\b/i, 'Fjtkl') : `Fjtkl ${rawName}`;
};

const formatManualFjtklContactLine = (value = '') => {
  const cleaned = cleanText(value);
  if (!cleaned) return '';
  const phone = extractPrimaryPhone(cleaned);
  if (!phone) {
    return formatFjtklName(cleaned);
  }
  const namePart = cleanText(cleaned.replace(phone, ''));
  return `${formatFjtklName(namePart)}  ${phone}`;
};

const buildFjtklContactLines = (project = {}, chapterOneGroups = []) => {
  const contacts = [];
  const seenPhones = new Set();
  const addContact = (nameValue, phoneValue) => {
    const phone = extractPrimaryPhone(phoneValue || '');
    if (!phone || seenPhones.has(phone)) {
      return;
    }
    seenPhones.add(phone);
    contacts.push(`${formatFjtklName(nameValue)}  ${phone}`);
  };

  addContact(project.namn || '', project.telefonnummer || '');

  const manualLines = Array.isArray(project.formState?.customDispPhoneLines)
    ? project.formState.customDispPhoneLines
        .map((line) => formatManualFjtklContactLine(line?.value || ''))
        .filter(Boolean)
    : [];
  manualLines.forEach((line) => {
    contacts.push(line);
  });

  const groupedEntries = Array.isArray(chapterOneGroups)
    ? chapterOneGroups.flatMap((group) => group?.entries || [])
    : [];
  const entries = groupedEntries.length ? groupedEntries : buildEntries(project);
  entries.forEach((entry) => {
    const inferredName = cleanText(
      entry?.namn ||
      extractPhoneContext(entry?.telefonnummer || '') ||
      KNOWN_FJTKL_PHONE_LABELS[extractPrimaryPhone(entry?.telefonnummer || '')] ||
      project.namn ||
      ''
    );
    addContact(inferredName || project.namn || '', entry?.telefonnummer || '');
  });

  if (!contacts.length) {
    const fallbackPhone = extractPrimaryPhone(project.telefonnummer || '') || 'Ej angivet';
    return [`${formatFjtklName(project.namn || '')}  ${fallbackPhone}`];
  }

  return contacts;
};

const extractValidityLabel = (weekLine = '') => {
  const match = cleanText(weekLine).match(/\bV\d{1,2}\b/i);
  return match ? match[0].toUpperCase() : 'V00';
};

const getShortDayName = (dateValue = '') => {
  const match = String(dateValue || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';
  const date = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? '' : SWEDISH_SHORT_DAYS[date.getUTCDay()];
};

const withDayDot = (label = '') => {
  const cleanLabel = cleanText(label);
  if (!cleanLabel) return '';
  return cleanLabel.endsWith('.') ? cleanLabel : `${cleanLabel}.`;
};

const buildEntryDayLabel = (entry = {}) => withDayDot(getShortDayName(entry.startDate));

const buildCompactEntryDayRangeLabel = (entries = []) => {
  const datedEntries = entries.filter((entry) => entry?.startDate);
  if (!datedEntries.length) return '';

  const sortedDates = [...new Set(datedEntries.map((entry) => entry.startDate))].sort();
  const firstEntry = datedEntries.find((entry) => entry.startDate === sortedDates[0]) || datedEntries[0];
  const lastEntry = datedEntries.find((entry) => entry.startDate === sortedDates[sortedDates.length - 1]) || datedEntries[datedEntries.length - 1];
  const firstLabel = buildEntryDayLabel(firstEntry);
  const lastLabel = buildEntryDayLabel(lastEntry);

  if (!firstLabel) return '';
  if (!lastLabel || firstLabel === lastLabel) return firstLabel;
  return `${firstLabel} - ${lastLabel}`;
};

const buildCompactEntryEndDayRangeLabel = (entries = []) => {
  const datedEntries = entries
    .filter((entry) => entry?.endDate)
    .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

  if (datedEntries.length === 0) return '';

  const firstLabel = withDayDot(getShortDayName(datedEntries[0]?.endDate));
  const lastLabel = withDayDot(getShortDayName(datedEntries[datedEntries.length - 1]?.endDate));

  if (!firstLabel) return '';
  if (!lastLabel || firstLabel === lastLabel) return firstLabel;
  return `${firstLabel} - ${lastLabel}`;
};

const shouldCompactChapterOneEntries = (entries = [], dispSettings = {}) => {
  if (!Boolean(dispSettings?.komprimeraLikaTiderKapitel1) || entries.length < 2) {
    return false;
  }

  const first = entries[0] || {};
  const hasUniformTimes = entries.every((entry) =>
    cleanText(entry?.startTime) === cleanText(first.startTime) &&
    cleanText(entry?.endTime) === cleanText(first.endTime)
  );

  if (!hasUniformTimes) {
    return false;
  }

  const crossesMidnight = entries.some((entry) => {
    const startTime = cleanText(entry?.startTime);
    const endTime = cleanText(entry?.endTime);
    if (!startTime || !endTime) {
      return false;
    }
    return startTime > endTime;
  });

  if (crossesMidnight) {
    return false;
  }

  return true;
};

const buildChapterOneEntryRows = (entries = [], dispSettings = {}, weekLine = '') => {
  if (shouldCompactChapterOneEntries(entries, dispSettings)) {
    return [{
      kind: 'entry',
      isCompactSummary: true,
      beteckning: Boolean(dispSettings?.visaBeteckningarKapitel1) ? 'Samtliga' : '',
      dayLabel: buildCompactEntryDayRangeLabel(entries),
      startTimeLabel: formatTime(entries[0]?.startTime),
      endDayLabel: buildCompactEntryEndDayRangeLabel(entries),
      endTimeLabel: formatTime(entries[0]?.endTime),
    }];
  }

  return entries.map((entry) => ({
    kind: 'entry',
    beteckning: entry.beteckning,
    dayLabel: buildEntryDayLabel(entry),
    startDateLabel: formatDate(entry.startDate),
    startTimeLabel: formatTime(entry.startTime),
    endDayLabel: withDayDot(getShortDayName(entry.endDate)),
    endDateLabel: formatDate(entry.endDate),
    endTimeLabel: formatTime(entry.endTime),
  }));
};

const getBoundaryHighlightTokens = (boundaryText = '') => {
  const normalized = cleanText(boundaryText);
  if (!normalized) return [];

  const parts = normalized
    .split(/\s*[-–]\s*|,\s*/)
    .map((token) => cleanText(token))
    .filter(Boolean);

  return [...new Set([
    normalized,
    ...parts,
  ])];
};

const normalizeBoundaryToken = (value = '') => cleanText(value).replace(/\s+/g, '').toLowerCase();

const getBoundaryNumericCore = (value = '') =>
  normalizeBoundaryToken(value).replace(/[a-zåäö]+/gi, '');

const shouldHighlightBoundaryText = (text = '', highlightTokens = []) => {
  const normalizedText = normalizeBoundaryToken(text);
  if (!normalizedText) return false;

  const textParts = cleanText(text)
    .split(/\s*,\s*/)
    .map((part) => cleanText(part))
    .filter(Boolean);
  const normalizedParts = textParts.map(normalizeBoundaryToken);

  return highlightTokens.some((token) => {
    const normalizedToken = normalizeBoundaryToken(token);

    if (normalizedToken && (normalizedToken === normalizedText || normalizedText.includes(normalizedToken))) {
      return true;
    }

    if (normalizedToken && normalizedParts.some((part) => part === normalizedToken || part.includes(normalizedToken))) {
      return true;
    }

    return false;
  });
};

const splitTokenByHighlightPart = (token = '', highlightPart = '') => {
  const cleanToken = cleanText(token);
  const cleanPart = cleanText(highlightPart);
  if (!cleanToken || !cleanPart) {
    return null;
  }

  const lowerToken = cleanToken.toLowerCase();
  const lowerPart = cleanPart.toLowerCase();
  const startIndex = lowerToken.indexOf(lowerPart);
  if (startIndex === -1) {
    return null;
  }

  return {
    before: cleanToken.slice(0, startIndex),
    highlight: cleanToken.slice(startIndex, startIndex + cleanPart.length),
    after: cleanToken.slice(startIndex + cleanPart.length),
  };
};

const drawBoundaryToken = (doc, token, options = {}) => {
  const {
    x,
    y,
    highlightWhole = false,
    highlightPart = '',
    continued = false,
    width,
    lineGap = 1,
  } = options;
  let isFirstChunk = true;
  const buildOptions = (chunkContinued) => {
    const textOptions = {
      width,
      continued: chunkContinued,
      lineGap,
    };
    if (isFirstChunk && typeof x === 'number' && typeof y === 'number') {
      textOptions.lineBreak = false;
    }
    return textOptions;
  };
  const writeChunk = (value, color, chunkContinued) => {
    if (!value) return;
    const textOptions = buildOptions(chunkContinued);
    if (isFirstChunk && typeof x === 'number' && typeof y === 'number') {
      doc.fillColor(color).text(value, x, y, textOptions);
    } else {
      doc.fillColor(color).text(value, textOptions);
    }
    isFirstChunk = false;
  };

  if (highlightWhole) {
    writeChunk(token, '#c1121f', continued);
    return;
  }

  const split = splitTokenByHighlightPart(token, highlightPart);
  if (!split) {
    writeChunk(token, '#000000', continued);
    return;
  }

  writeChunk(split.before, '#000000', true);
  writeChunk(split.highlight, '#c1121f', Boolean(split.after) || continued);
  writeChunk(split.after, '#000000', continued);
};

const createDocument = (title = 'Dispositionsarbetsplan') => {
  const doc = new PDFDocument({
    size: 'A4',
    margins: {
      top: 118,
      right: 48,
      bottom: 48,
      left: 46,
    },
    bufferPages: true,
    info: {
      Title: title,
      Author: 'Railworker',
      Subject: 'Dispositionsarbetsplan',
    },
  });

  const buffers = [];
  doc.on('data', (chunk) => buffers.push(chunk));

  Object.assign(PDF_FONTS, {
    header: 'Helvetica',
    headerBold: 'Helvetica-Bold',
    headerItalic: 'Helvetica-Oblique',
    headerBoldItalic: 'Helvetica-BoldOblique',
    body: 'Times-Roman',
    bodyBold: 'Times-Bold',
    bodyItalic: 'Times-Italic',
    bodyBoldItalic: 'Times-BoldItalic',
  });

  const registerFontIfPresent = (fontKey, fontName, fontPath) => {
    if (fs.existsSync(fontPath)) {
      doc.registerFont(fontName, fontPath);
      PDF_FONTS[fontKey] = fontName;
      return true;
    }
    return false;
  };

  registerFontIfPresent('header', CUSTOM_PDF_FONTS.header, FONT_PATHS.verdana);
  registerFontIfPresent('headerBold', CUSTOM_PDF_FONTS.headerBold, FONT_PATHS.verdanaBold);
  registerFontIfPresent('headerItalic', CUSTOM_PDF_FONTS.headerItalic, FONT_PATHS.verdanaItalic);
  registerFontIfPresent('headerBoldItalic', CUSTOM_PDF_FONTS.headerBoldItalic, FONT_PATHS.verdanaBoldItalic);
  registerFontIfPresent('body', CUSTOM_PDF_FONTS.body, FONT_PATHS.times);
  registerFontIfPresent('bodyBold', CUSTOM_PDF_FONTS.bodyBold, FONT_PATHS.timesBold);
  registerFontIfPresent('bodyItalic', CUSTOM_PDF_FONTS.bodyItalic, FONT_PATHS.timesItalic);
  registerFontIfPresent('bodyBoldItalic', CUSTOM_PDF_FONTS.bodyBoldItalic, FONT_PATHS.timesBoldItalic);

  return {
    doc,
    toBuffer: () =>
      new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);
      }),
  };
};

const getContentBottomY = (doc) => doc.page.height - doc.page.margins.bottom;

const getTextHeight = (doc, text, width, { font = PDF_FONTS.body, fontSize = 11, lineGap = 2 } = {}) => {
  doc.font(font).fontSize(fontSize);
  return doc.heightOfString(text || '—', {
    width,
    lineGap,
  });
};

const drawLegacyHeader = (doc, dispSettings, totalPages, pageNumber) => {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const title = `Dispositionsarbetsplan ${cleanText(dispSettings.banNamn || '')}`.trim();
  const validityBase = extractValidityLabel(dispSettings.veckaOchDagar || '');
  const validityExtra = cleanText(dispSettings.giltigTillagg || '');

  doc.save();
  doc.fillColor('#000000').font(PDF_FONTS.header).fontSize(8).text(title, left, 28, {
    width: 280,
    lineBreak: false,
  });

  if (fs.existsSync(LEGACY_LOGO_PATH)) {
    doc.image(LEGACY_LOGO_PATH, right - 182, 16, {
      fit: [182, 57],
      align: 'right',
      valign: 'top',
    });
  }

  const labelY = 44;
  const valueY = 59;
  doc.font(PDF_FONTS.header).fontSize(8).text('Giltig', left, labelY, { lineBreak: false });
  doc.text('Versionsnummer', left + 92, labelY, { lineBreak: false });
  doc.text('Antal sidor', left + 204, labelY, { lineBreak: false });

  doc.text(validityBase, left, valueY, { lineBreak: false });
  if (validityExtra) {
    doc.font(PDF_FONTS.header).fontSize(7.5).text(validityExtra, left, valueY + 9, {
      width: 88,
      lineBreak: false,
    });
    doc.font(PDF_FONTS.header).fontSize(8);
  }
  doc.text(cleanText(dispSettings.versionsnummer || LEGACY_VERSION_NUMBER), left + 92, valueY, { lineBreak: false });
  doc.text(String(totalPages), left + 204, valueY, { lineBreak: false });
  doc.text('Vallåkra Rail AB', left, validityExtra ? 82 : 74, { lineBreak: false });
  doc.restore();
};

const getLegacyEntryRowHeight = (doc, row, entryColumns, fontSize = 12) =>
  Math.max(
    21,
    getLegacyRowHeight(
      doc,
      row.isCompactSummary
        ? {
            beteckning: row.beteckning,
            dayLabel: row.dayLabel,
            startTimeLabel: row.startTimeLabel,
            endDayLabel: row.endDayLabel,
            endTimeLabel: row.endTimeLabel,
          }
        : {
            beteckning: row.beteckning,
            dayLabel: row.dayLabel,
            startDateLabel: row.startDateLabel,
            startTimeLabel: row.startTimeLabel,
            endDayLabel: row.endDayLabel,
            endDateLabel: row.endDateLabel,
            endTimeLabel: row.endTimeLabel,
          },
      row.isCompactSummary
        ? [
            { key: 'beteckning', width: entryColumns.beteckning.width },
            { key: 'dayLabel', width: 98 },
            { key: 'startTimeLabel', width: 50 },
            { key: 'endDayLabel', width: 74 },
            { key: 'endTimeLabel', width: 48 },
          ]
        : [
            { key: 'beteckning', width: entryColumns.beteckning.width },
            { key: 'dayLabel', width: entryColumns.startDay.width },
            { key: 'startDateLabel', width: entryColumns.startDate.width },
            { key: 'startTimeLabel', width: entryColumns.startTime.width },
            { key: 'endDayLabel', width: entryColumns.endDay.width },
            { key: 'endDateLabel', width: entryColumns.endDate.width },
            { key: 'endTimeLabel', width: entryColumns.endTime.width },
          ],
      fontSize
    ) + 2
  );

const getLegacySectionRowHeight = (doc, row, sectionColumns, fontSize = 12) =>
  Math.max(
    21,
    Math.ceil(
      Math.max(
        getTextHeight(doc, row.label, sectionColumns.label.width, {
          font: PDF_FONTS.bodyBold,
          fontSize,
          lineGap: 1,
        }),
        getLegacyBoundarySegmentHeight(doc, row.granspunkter, sectionColumns.granspunkter.width, fontSize),
        getTextHeight(doc, row.spar, sectionColumns.spar.width, {
          font: PDF_FONTS.bodyBold,
          fontSize,
          lineGap: 1,
        })
      )
    ) + 4
  );

const getLegacyChapterOneRowHeight = (doc, row, entryColumns, sectionColumns) => {
  if (row.kind === 'spacer') return 28;
  if (row.kind === 'entry') return getLegacyEntryRowHeight(doc, row, entryColumns);
  if (row.kind === 'section') return getLegacySectionRowHeight(doc, row, sectionColumns);
  return 21;
};

const paginateLegacyChapterOneRows = (doc, rows, availableHeight, entryColumns, sectionColumns) => {
  const pages = [];
  let currentPage = [];
  let usedHeight = 0;

  rows.forEach((row) => {
    const rowHeight = getLegacyChapterOneRowHeight(doc, row, entryColumns, sectionColumns);
    const preparedRow = { ...row, rowHeight };
    if (currentPage.length > 0 && usedHeight + rowHeight > availableHeight) {
      pages.push(currentPage);
      currentPage = [preparedRow];
      usedHeight = rowHeight;
      return;
    }
    currentPage.push(preparedRow);
    usedHeight += rowHeight;
  });

  if (currentPage.length > 0) pages.push(currentPage);
  return pages;
};

const estimateChapterOnePageCountForGroup = (doc, entries, sections, dispSettings = {}, showGroupTitle = false) => {
  const entryColumns = getLegacyEntryColumns(Boolean(dispSettings?.visaBeteckningarKapitel1));
  const sectionColumns = {
    label: { x: 10, width: 74 },
    granspunkter: { x: 86, width: 236 },
    spar: { x: 336, width: 78 },
  };
  const entryRows = buildChapterOneEntryRows(entries, dispSettings, '');
  const sectionRows = sections.map((section) => ({
    kind: 'section',
    label: cleanText(section.customLabel || section.displayIndex || '') ? `${cleanText(section.customLabel || section.displayIndex || '')}.` : '',
    granspunkter: formatLegacyBoundaryText(section.granspunkter, {
      expandNames: dispSettings?.visaFullaGranspunkterKapitel1 !== false,
    }),
    spar: section.spar || '—',
  }));
  const firstPageRows = [...entryRows, { kind: 'spacer' }, ...sectionRows];
  const firstPageAvailableHeight = (showGroupTitle ? 546 : 560) - 31 - 12;
  const continuedPageAvailableHeight = (showGroupTitle ? 606 : 620) - 31 - 12;
  const firstPageChunks = paginateLegacyChapterOneRows(doc, firstPageRows, firstPageAvailableHeight, entryColumns, sectionColumns);
  if (firstPageChunks.length <= 1) return 1;

  const remainingSectionRows = [];
  firstPageChunks.slice(1).forEach((chunk) => {
    chunk.forEach((row) => {
      if (row.kind === 'section') remainingSectionRows.push(row);
    });
  });

  const continuedChunks = paginateLegacyChapterOneRows(
    doc,
    remainingSectionRows,
    continuedPageAvailableHeight,
    entryColumns,
    sectionColumns
  );
  return 1 + continuedChunks.length;
};

const estimateChapterOnePageCount = (doc, chapterOneGroups = [], dispSettings = {}) => {
  const groups = Array.isArray(chapterOneGroups) && chapterOneGroups.length
    ? chapterOneGroups
    : [{ entries: [], sections: [] }];
  const showGroupTitle = groups.length > 1;

  return groups.reduce((sum, group) => (
    sum + estimateChapterOnePageCountForGroup(doc, group.entries || [], group.sections || [], dispSettings, showGroupTitle)
  ), 0);
};

const getStaticChapterLayoutMetrics = (doc) => {
  const pageLeft = doc.page.margins.left;
  const bodyX = pageLeft + 48;
  const bodyWidth = doc.page.width - bodyX - doc.page.margins.right;
  const titleX = pageLeft + 42;
  const titleWidth = doc.page.width - titleX - doc.page.margins.right;
  const startY = 122;
  const bottomY = getContentBottomY(doc) - 18;

  return {
    bodyX,
    bodyWidth,
    titleX,
    titleWidth,
    startY,
    bottomY,
  };
};

const getStaticChapterBlockHeight = (doc, chapter, metrics) => {
  const headingHeight = getTextHeight(doc, `${chapter.title}.`, metrics.titleWidth, {
    font: PDF_FONTS.headerBold,
    fontSize: 15,
    lineGap: 1,
  });
  const lines = Array.isArray(chapter.lines) ? chapter.lines : chapter.paragraphs;
  const linesHeight = lines.reduce((sum, line) => (
    sum + getTextHeight(doc, line, metrics.bodyWidth, {
      font: PDF_FONTS.body,
      fontSize: 12,
      lineGap: 2,
    }) + 3
  ), 0);

  return headingHeight + 8 + linesHeight + 18;
};

const estimateStaticTextPageCount = (doc, project, dispSettings) => {
  const chapters = getLegacyChapters(project, dispSettings);
  const metrics = getStaticChapterLayoutMetrics(doc);
  let pageCount = 1;
  let y = metrics.startY;

  chapters.forEach((chapter) => {
    const blockHeight = getStaticChapterBlockHeight(doc, chapter, metrics);
    if (y > metrics.startY && y + blockHeight > metrics.bottomY) {
      pageCount += 1;
      y = metrics.startY;
    }
    y += blockHeight;
  });

  return pageCount;
};

const estimateLegacyTotalPages = (doc, chapterOneGroups, dispSettings = {}, project = {}) =>
  2 + estimateChapterOnePageCount(doc, chapterOneGroups, dispSettings) + estimateStaticTextPageCount(doc, project, dispSettings);

const addCoverPage = (doc, project, dispSettings) => {
  const left = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const routeLine = cleanText(project.plats || '');
  const displayRouteLine = routeLine && !/[.!?]$/.test(routeLine) ? `${routeLine}.` : routeLine;
  const weekLine = formatLegacyWeekLine(dispSettings.veckaOchDagar || '');
  const coverBoundarySource = cleanText(
    dispSettings.rodmarkeradeGranspunkter ||
    project.granspunkter ||
    ''
  );
  const boundary = formatLegacyBoundaryText(coverBoundarySource, { expandNames: false });

  const coverRoute = buildLegacyCoverRoute(project, dispSettings);

  doc.fillColor('#000000').font(PDF_FONTS.headerBoldItalic).fontSize(30).text('Dispositionsarbetsplan', left, 206, {
    width,
    align: 'center',
  });
  doc.font(PDF_FONTS.headerBoldItalic).fontSize(24).text(coverRoute, left, 274, {
    width,
    align: 'center',
    underline: true,
  });
  doc.font(PDF_FONTS.headerBoldItalic).fontSize(24).text(weekLine, left, 326, {
    width,
    align: 'center',
  });

  const banobjektY = 390;
  const banLabel = 'Banobjekt-Vnr';
  const banValue = cleanText(dispSettings.banobjektVnr || 'Ej angivet');
  const htsmTelefon = cleanText(project.formState?.htsmTelefon || '');
  const banLabelWidth = doc.font(PDF_FONTS.headerBoldItalic).fontSize(16).widthOfString(`${banLabel} `);
  const banValueWidth = doc.font(PDF_FONTS.headerBoldItalic).fontSize(16).widthOfString(banValue);
  const banLineX = left + (width - banLabelWidth - banValueWidth) / 2;

  doc.fillColor('#000000').font(PDF_FONTS.headerBoldItalic).fontSize(16).text(banLabel, banLineX, banobjektY, {
    lineBreak: false,
  });
  doc.fillColor('#b91c1c').text(banValue, banLineX + banLabelWidth, banobjektY, {
    lineBreak: false,
  });
  doc.fillColor('#000000').font(PDF_FONTS.headerBoldItalic).fontSize(16).text('(uppges vid förplanering)', left, 420, {
    width,
    align: 'center',
  });
  const forplaneraY = htsmTelefon ? 482 : 452;
  if (htsmTelefon) {
    doc.fillColor('#000000').font(PDF_FONTS.headerBold).fontSize(20).text(`HTSM: ${htsmTelefon}`, left, 448, {
      width,
      align: 'center',
    });
  }
  doc.fillColor('#ff0000').font(PDF_FONTS.headerBold).fontSize(16).text(
    `Förplanera ca:${cleanText(dispSettings.forplaneraCa || '1 tim innan start')}`,
    left,
    forplaneraY,
    {
      width,
      align: 'center',
    }
  );

  doc.font(PDF_FONTS.header).fontSize(18).fillColor('#000000').text(displayRouteLine || 'Ej angivet', left + 122, 560, {
    width: width - 244,
    align: 'left',
    lineGap: 4,
  });
  doc.fillColor('#000000').font(PDF_FONTS.body).fontSize(12).text(
    'Gränspunkter som ej får passeras utan TKL:s medgivande är:',
    left + 58,
    712,
    {
      width: width - 116,
      align: 'left',
    }
  );
  doc.fillColor('#ff0000').font(PDF_FONTS.body).fontSize(12).text(boundary || 'Ej angivet', left + 58, 760, {
    width: width - 116,
    align: 'left',
  });
};

const addContentsPage = (doc, chapterPages = null, pageIndex = null) => {
  if (pageIndex === null) {
    doc.addPage();
    return doc.bufferedPageRange().count - 1;
  }

  doc.switchToPage(pageIndex);
  const left = doc.page.margins.left + 36;
  const numberX = left;
  const titleX = left + 26;
  const pageX = doc.page.width - doc.page.margins.right - 70;
  doc.x = left;
  doc.y = 176;
  doc.fillColor('#000000').font(PDF_FONTS.bodyBold).fontSize(14).text('Innehållsförteckning');
  doc.moveDown(0.9);

  const items = [
    ['1', 'Gränspunkter och delområde', String(chapterPages?.[1] || 3)],
    ['2', 'Allmänt', String(chapterPages?.[2] || 4)],
    ['3', 'Ansvarsfrågor', String(chapterPages?.[3] || 4)],
    ['4', 'Skyddsåtgärder', String(chapterPages?.[4] || 4)],
    ['5', 'Säkerhetssamtal', String(chapterPages?.[5] || 5)],
    ['6', 'Huvudtillsyningsman (HTSM)', String(chapterPages?.[6] || 5)],
    ['7', 'Arbeten och trafikverksamheter', String(chapterPages?.[7] || 5)],
    ['8', 'Uppställning eller kvarlämnande av arbetsredskap/fordon', String(chapterPages?.[8] || 6)],
    ['9', 'Förändringar i Spåranläggningen', String(chapterPages?.[9] || 6)],
    ['10', 'Åtgärder vid Plankorsningar', String(chapterPages?.[10] || 6)],
    ['11', 'Växlar', String(chapterPages?.[11] || 6)],
    ['12', 'Sidospår', String(chapterPages?.[12] || 7)],
    ['13', 'Telefonnummer', String(chapterPages?.[13] || 7)],
  ];

  items.forEach(([index, title, page]) => {
    const y = doc.y + 2;
    doc.fillColor('#000000').font(PDF_FONTS.bodyBold).fontSize(10.2).text(index, numberX, y, {
      width: 18,
      lineBreak: false,
    });
    doc.text(title, titleX, y, {
      width: 330,
      lineGap: 1,
    });
    doc.text(page, pageX, y, {
      width: 14,
      align: 'right',
      lineBreak: false,
    });
    doc.y = y + 20;
  });

  const lineY = doc.y + 4;
  doc.moveTo(left, lineY)
    .lineTo(doc.page.width - doc.page.margins.right - 8, lineY)
    .lineWidth(0.8)
    .strokeColor('#777777')
    .stroke();
  doc.font(PDF_FONTS.bodyBold).fontSize(11).fillColor('#000000').text('Bilagor:', left, lineY + 8);
};

const drawLegacyChapterHeading = (doc, text) => {
  doc.fillColor('#000000').font(PDF_FONTS.headerBold).fontSize(15).text(text, doc.page.margins.left, 116, {
    lineBreak: false,
  });
  doc.y = 144;
};

const drawLegacySplitChapterHeading = (doc, chapterNumber, title, y) => {
  const left = doc.page.margins.left;
  const numberText = String(chapterNumber);
  const numberX = left - 10;
  const numberWidth = Math.max(24, Math.ceil(doc.font(PDF_FONTS.headerBold).fontSize(15).widthOfString(numberText)) + 6);
  const titleX = numberX + numberWidth + 22;

  doc.fillColor('#000000').font(PDF_FONTS.headerBold).fontSize(15).text(numberText, numberX, y, {
    width: numberWidth,
    align: 'left',
    lineBreak: false,
  });
  doc.text(`${title}.`, titleX, y, {
    width: doc.page.width - titleX - doc.page.margins.right,
  });
  return doc.y;
};

const getLegacyRowHeight = (doc, row, columns, fontSize = 11) =>
  Math.ceil(columns.reduce((maxHeight, column) => {
    const cellHeight = getTextHeight(doc, row[column.key] || '', column.width, {
      font: PDF_FONTS.body,
      fontSize,
      lineGap: 1,
    });
    return Math.max(maxHeight, cellHeight);
  }, fontSize + 2)) + 2;

const getLegacyBoundarySegmentFontSize = (doc, text, maxWidth, defaultFontSize = 12) => {
  void doc;
  void text;
  void maxWidth;
  return defaultFontSize;
};

const getLegacyBoundarySegmentHeight = (doc, text, maxWidth, defaultFontSize = 12) => {
  const fittedFontSize = getLegacyBoundarySegmentFontSize(doc, text, maxWidth, defaultFontSize);
  return getTextHeight(doc, cleanText(text), maxWidth, {
    font: PDF_FONTS.bodyBold,
    fontSize: fittedFontSize,
    lineGap: 1,
  });
};

const drawLegacyBoundarySegment = (doc, text, x, y, maxWidth, highlightTokens = [], options = {}) => {
  const normalizedText = cleanText(text);
  const dashMatch = normalizedText.match(/^(.+?)\s*[–-]\s*(.+)$/);
  const fontSize = getLegacyBoundarySegmentFontSize(doc, normalizedText, maxWidth, 12);
  doc.font(PDF_FONTS.bodyBold).fontSize(fontSize);

  if (!dashMatch) {
    const color = shouldHighlightBoundaryText(normalizedText, highlightTokens) ? '#c1121f' : '#000000';
    doc.fillColor(color).text(normalizedText, x, y, { width: maxWidth, lineGap: 1 });
    return;
  }

  const leftToken = cleanText(dashMatch[1]);
  const rightToken = cleanText(dashMatch[2]);
  const separator = ' – ';
  const highlightLeftWhole = options.highlightLeft && !cleanText(options.highlightLeftPart);
  const highlightRightWhole = options.highlightRight && !cleanText(options.highlightRightPart);

  drawBoundaryToken(doc, leftToken, {
    x,
    y,
    width: maxWidth,
    continued: true,
    lineGap: 1,
    highlightWhole: highlightLeftWhole || (!options.highlightLeft && shouldHighlightBoundaryText(leftToken, highlightTokens)),
    highlightPart: options.highlightLeft ? cleanText(options.highlightLeftPart) : '',
  });
  doc.fillColor('#000000').text(separator, {
    continued: true,
    lineGap: 1,
  });
  drawBoundaryToken(doc, rightToken, {
    width: maxWidth,
    continued: false,
    lineGap: 1,
    highlightWhole: highlightRightWhole || (!options.highlightRight && shouldHighlightBoundaryText(rightToken, highlightTokens)),
    highlightPart: options.highlightRight ? cleanText(options.highlightRightPart) : '',
  });
};

const getLegacyEntryColumns = (showBeteckning = true) => (
  showBeteckning
    ? {
        beteckning: { x: 6, width: 72 },
        start: { x: 92 },
        startDay: { x: 104, width: 30 },
        startDate: { x: 140, width: 62 },
        startTime: { x: 208, width: 28 },
        end: { x: 252, width: 170 },
        endDash: { x: 244, width: 8 },
        endDay: { x: 262, width: 30 },
        endDate: { x: 304, width: 62 },
        endTime: { x: 376, width: 34 },
      }
    : {
        beteckning: { x: 0, width: 0 },
        start: { x: 12 },
        startDay: { x: 16, width: 32 },
        startDate: { x: 56, width: 68 },
        startTime: { x: 132, width: 30 },
        end: { x: 188, width: 198 },
        endDash: { x: 174, width: 10 },
        endDay: { x: 192, width: 34 },
        endDate: { x: 238, width: 70 },
        endTime: { x: 330, width: 44 },
      }
);

const drawLegacyChapterOneTable = (doc, rows, config) => {
  const {
    left,
    top,
    width,
    rowHeight,
    headerHeight,
    entryColumns,
    sectionColumns,
    noteText,
    highlightTokens,
    mode = 'full',
    showNote = true,
  } = config;
  const totalHeight = headerHeight + rows.reduce((sum, row) => sum + (row.rowHeight || rowHeight), 0) + 12;
  const bottom = top + totalHeight;
  const headerFontSize = 12.8;
  const rowFontSize = entryColumns.beteckning.width > 0 ? 11 : 12;
  const hasCompactSummary = mode === 'full' && entryColumns.beteckning.width === 0 && rows.some((row) => row.kind === 'entry' && row.isCompactSummary);
  const compactStartHeaderX = left + 112;
  const compactDayX = compactStartHeaderX;
  const compactDayWidth = 98;
  const compactTimeX = compactDayX + compactDayWidth + 14;
  const compactTimeWidth = 50;
  const compactDashWidth = 14;
  const compactDashCenterX = compactTimeX + compactTimeWidth + 26;
  const compactDashX = compactDashCenterX - (compactDashWidth / 2);
  const compactEndDayX = compactDashCenterX + 18;
  const compactEndDayWidth = 74;
  const compactEndTimeX = compactEndDayX + compactEndDayWidth + 12;
  const compactEndTimeWidth = 48;
  const compactEndHeaderX = compactEndDayX;
  const sectionHeaderOffsetY = 8;
  const underlineWidth = (text) => doc.widthOfString(text);
  const drawEntryTimeline = (row, startX, y, availableWidth) => {
    const parts = [
      row.dayLabel,
      row.startDateLabel,
      row.startTimeLabel,
      '–',
      row.endDayLabel,
      row.endDateLabel,
      row.endTimeLabel,
    ];
    const partWidths = parts.map((part) => doc.widthOfString(part));
    const defaultGaps = [12, 16, 20, 20, 12, 16];
    const minimumGaps = [8, 10, 14, 14, 8, 10];
    const totalTextWidth = partWidths.reduce((sum, width) => sum + width, 0);
    const totalDefaultGap = defaultGaps.reduce((sum, gap) => sum + gap, 0);
    const overflow = totalTextWidth + totalDefaultGap - availableWidth;
    const gaps = [...defaultGaps];

    if (overflow > 0) {
      let remainingOverflow = overflow;
      const shrinkOrder = [2, 3, 1, 5, 0, 4];
      shrinkOrder.forEach((index) => {
        if (remainingOverflow <= 0) return;
        const maxShrink = gaps[index] - minimumGaps[index];
        if (maxShrink <= 0) return;
        const appliedShrink = Math.min(maxShrink, remainingOverflow);
        gaps[index] -= appliedShrink;
        remainingOverflow -= appliedShrink;
      });
    }

    let cursorX = startX;
    parts.forEach((part, index) => {
      doc.text(part, cursorX, y, { lineBreak: false });
      cursorX += partWidths[index];
      if (index < gaps.length) {
        cursorX += gaps[index];
      }
    });
  };
  const drawFixedEntryTimeline = (row, y) => {
    const drawCell = (text, column, align = 'left') => {
      if (!column || !text) {
        return;
      }

      doc.text(text, left + column.x, y, {
        width: column.width,
        align,
        lineBreak: false,
      });
    };

    drawCell(row.dayLabel, entryColumns.startDay, 'left');
    drawCell(row.startDateLabel, entryColumns.startDate, 'left');
    drawCell(row.startTimeLabel, entryColumns.startTime, 'right');
    drawCell('–', entryColumns.endDash, 'center');
    drawCell(row.endDayLabel, entryColumns.endDay, 'left');
    drawCell(row.endDateLabel, entryColumns.endDate, 'left');
    drawCell(row.endTimeLabel, entryColumns.endTime, 'right');
  };
  let sectionRowIndex = 0;

  doc.save();
  doc.lineWidth(0.7).strokeColor('#666666').rect(left, top, width, totalHeight).stroke();

  const entryHeaderY = top + 7;
  doc.font(PDF_FONTS.bodyBold).fontSize(headerFontSize).fillColor('#000000');
  if (mode === 'full') {
    if (hasCompactSummary) {
      doc.text('Startdag och tid', compactStartHeaderX, entryHeaderY, { lineBreak: false });
      doc.text('Slutdag och tid', compactEndHeaderX, entryHeaderY, { lineBreak: false });
      const entryUnderlineY = entryHeaderY + 13;
      doc
        .save()
        .lineWidth(0.35)
        .strokeColor('#777777')
        .moveTo(compactStartHeaderX, entryUnderlineY)
        .lineTo(compactStartHeaderX + underlineWidth('Startdag och tid'), entryUnderlineY)
        .moveTo(compactEndHeaderX, entryUnderlineY)
        .lineTo(compactEndHeaderX + underlineWidth('Slutdag och tid'), entryUnderlineY)
        .stroke()
        .restore();
    } else {
      if (entryColumns.beteckning.width > 0) {
        doc.text('Beteckning', left + entryColumns.beteckning.x, entryHeaderY, { lineBreak: false });
      }
      const startHeaderX = left + entryColumns.startDay.x;
      const endHeaderX = left + entryColumns.endDay.x;
      doc.text('Startdag och tid', startHeaderX, entryHeaderY, { lineBreak: false });
      doc.text('Slutdag och tid', endHeaderX, entryHeaderY, { lineBreak: false });
      const entryUnderlineY = entryHeaderY + 13;
      doc
        .save()
        .lineWidth(0.35)
        .strokeColor('#777777')
        .moveTo(startHeaderX, entryUnderlineY)
        .lineTo(startHeaderX + underlineWidth('Startdag och tid'), entryUnderlineY)
        .moveTo(endHeaderX, entryUnderlineY)
        .lineTo(endHeaderX + underlineWidth('Slutdag och tid'), entryUnderlineY)
        .stroke()
        .restore();
    }
  } else {
    doc.text('Delområde', left + sectionColumns.label.x, entryHeaderY, { lineBreak: false });
    doc.text('Gränspunkter', left + sectionColumns.granspunkter.x, entryHeaderY, { lineBreak: false });
    doc.text('Spår', left + sectionColumns.spar.x, entryHeaderY, { lineBreak: false });
  }

  let y = top + headerHeight;

  rows.forEach((row) => {
    const currentRowHeight = row.rowHeight || rowHeight;

    if (row.kind === 'entry') {
      doc.font(PDF_FONTS.bodyBold).fontSize(rowFontSize).fillColor('#000000');
      if (row.isCompactSummary && entryColumns.beteckning.width === 0) {
        drawEntryTimeline(
          row,
          compactDayX,
          y,
          (compactEndTimeX + compactEndTimeWidth) - compactDayX
        );
      } else {
        if (entryColumns.beteckning.width > 0) {
          doc.text(row.beteckning, left + entryColumns.beteckning.x, y, {
            width: entryColumns.beteckning.width,
            lineBreak: false,
          });
        }
        drawFixedEntryTimeline(row, y);
      }
    } else if (row.kind === 'spacer') {
      doc.font(PDF_FONTS.bodyBold).fontSize(12.2).fillColor('#000000');
      const labelHeaderX = left + sectionColumns.label.x;
      const boundaryHeaderX = left + sectionColumns.granspunkter.x;
      const trackHeaderX = left + sectionColumns.spar.x;
      const sectionHeaderY = y + sectionHeaderOffsetY;
      doc.text('Delområde', labelHeaderX, sectionHeaderY, {
        width: sectionColumns.label.width,
        lineBreak: false,
      });
      doc.text('Gränspunkter', boundaryHeaderX, sectionHeaderY, {
        width: sectionColumns.granspunkter.width,
        lineBreak: false,
      });
      doc.text('Spår', trackHeaderX, sectionHeaderY, {
        width: sectionColumns.spar.width,
        lineBreak: false,
      });
      const underlineY = sectionHeaderY + 13;
      doc
        .save()
        .lineWidth(0.35)
        .strokeColor('#777777')
        .moveTo(labelHeaderX, underlineY)
        .lineTo(labelHeaderX + underlineWidth('Delområde'), underlineY)
        .moveTo(boundaryHeaderX, underlineY)
        .lineTo(boundaryHeaderX + underlineWidth('Gränspunkter'), underlineY)
        .moveTo(trackHeaderX, underlineY)
        .lineTo(trackHeaderX + underlineWidth('Spår'), underlineY)
        .stroke()
        .restore();
    } else if (row.kind === 'section') {
      if (sectionRowIndex % 2 === 0) {
        doc
          .save()
          .fillColor('#e9ecef')
          .rect(left + 10, y - 1, width - 20, currentRowHeight - 2)
          .fill()
          .restore();
      }

      doc.font(PDF_FONTS.bodyBold).fontSize(rowFontSize).fillColor('#000000');
      doc.text(row.label, left + sectionColumns.label.x, y, {
        width: sectionColumns.label.width,
        lineBreak: false,
      });
      drawLegacyBoundarySegment(
        doc,
        row.granspunkter,
        left + sectionColumns.granspunkter.x,
        y,
        sectionColumns.granspunkter.width,
        highlightTokens,
        {
          highlightLeft: Boolean(row.highlightStart),
          highlightRight: Boolean(row.highlightEnd),
          highlightLeftPart: row.highlightStartPart,
          highlightRightPart: row.highlightEndPart,
        }
      );
      doc.fillColor('#000000').font(PDF_FONTS.bodyBold).fontSize(12).text(row.spar, left + sectionColumns.spar.x, y, {
        width: sectionColumns.spar.width,
        align: 'left',
        lineBreak: false,
      });
      sectionRowIndex += 1;
    }

    y += currentRowHeight;
  });

  if (showNote) {
    const redNoteWord = 'rödmarkerade.';
    const notePrefix = noteText.endsWith(redNoteWord)
      ? noteText.slice(0, -redNoteWord.length)
      : noteText;
    doc.font(PDF_FONTS.bodyBold).fontSize(10.5).fillColor('#000000').text(notePrefix, left + 8, bottom + 10, {
      width: width - 16,
      lineBreak: false,
    });
    const prefixWidth = doc.widthOfString(notePrefix);
    doc.fillColor('#c1121f').text(redNoteWord, left + 8 + prefixWidth, bottom + 10, {
      lineBreak: false,
    });
  }
  doc.restore();

  return bottom + (showNote ? 26 : 0);
};

const addEntriesAndSectionsPageForGroup = (
  doc,
  project,
  entries,
  sections,
  dispSettings,
  totalPages,
  groupTitle = '',
  showGroupTitle = false
) => {
  doc.addPage();
  const firstPageNumber = doc.bufferedPageRange().count;
  drawLegacyHeader(doc, dispSettings, totalPages, firstPageNumber);
  const pageWidth = doc.page.width;
  const tableLeft = 68;
  const tableWidth = pageWidth - 2 * tableLeft;
  const headerHeight = 31;
  const noteText = 'Yttre gränspunkter som ej får passeras utan medgivande från TKL är rödmarkerade.';
  const weekLine = cleanText(dispSettings.veckaOchDagar || '');
  const explicitHighlightValue = cleanText(dispSettings.rodmarkeradeGranspunkter || '');
  const entryBoundaries = entries
    .map((entry) => sanitizeSectionText(entry?.granspunkt || ''))
    .filter(Boolean)
    .join(' - ');
  const highlightSource = explicitHighlightValue || entryBoundaries || project.granspunkter || '';
  const highlightTokens = getBoundaryHighlightTokens(highlightSource).map(normalizeBoundaryToken);

  const entryColumns = getLegacyEntryColumns(Boolean(dispSettings.visaBeteckningarKapitel1));
  const sectionColumns = {
    label: { x: 10, width: 74 },
    granspunkter: { x: 86, width: 236 },
    spar: { x: 336, width: 78 },
  };

  const entryRows = buildChapterOneEntryRows(entries, dispSettings, weekLine);
  const sectionRows = sections.map((section) => ({
    kind: 'section',
    label: cleanText(section.customLabel || section.displayIndex || '') ? `${cleanText(section.customLabel || section.displayIndex || '')}.` : '',
    granspunkter: formatLegacyBoundaryText(section.granspunkter, {
      expandNames: dispSettings?.visaFullaGranspunkterKapitel1 !== false,
    }),
    spar: section.spar || '—',
    highlightStart: Boolean(section.highlightStart),
    highlightEnd: Boolean(section.highlightEnd),
    highlightStartPart: cleanText(section.highlightStartPart),
    highlightEndPart: cleanText(section.highlightEndPart),
  }));
  const rows = [
    ...entryRows,
    { kind: 'spacer' },
    ...sectionRows,
  ];
  const firstPageAvailableHeight = 560 - headerHeight - 12;
  const continuedPageAvailableHeight = 620 - headerHeight - 12;
  const firstPageChunks = paginateLegacyChapterOneRows(doc, rows, firstPageAvailableHeight, entryColumns, sectionColumns);
  const firstPageRows = firstPageChunks[0] || rows.map((row) => ({
    ...row,
    rowHeight: getLegacyChapterOneRowHeight(doc, row, entryColumns, sectionColumns),
  }));
  const remainingSectionRows = [];
  firstPageChunks.slice(1).forEach((chunk) => {
    chunk.forEach((row) => {
      if (row.kind === 'section') remainingSectionRows.push({ ...row, rowHeight: undefined });
    });
  });
  const continuationChunks = paginateLegacyChapterOneRows(
    doc,
    remainingSectionRows,
    continuedPageAvailableHeight,
    entryColumns,
    sectionColumns
  );

  drawLegacyChapterHeading(doc, '1 Gränspunkter och delområde.');
  if (showGroupTitle && cleanText(groupTitle)) {
    doc.font(PDF_FONTS.headerBold)
      .fontSize(11)
      .fillColor('#374151')
      .text(cleanText(groupTitle), tableLeft, 226, {
        width: tableWidth,
        align: 'left',
      });
  }
  drawLegacyChapterOneTable(doc, firstPageRows, {
    left: tableLeft,
    top: showGroupTitle ? 262 : 248,
    width: tableWidth,
    rowHeight: 21,
    headerHeight,
    entryColumns,
    sectionColumns,
    noteText,
    highlightTokens,
    mode: 'full',
    showNote: continuationChunks.length === 0,
  });

  continuationChunks.forEach((chunk, chunkIndex) => {
    doc.addPage();
    const pageNumber = doc.bufferedPageRange().count;
    drawLegacyHeader(doc, dispSettings, totalPages, pageNumber);
    drawLegacyChapterHeading(doc, '1 Gränspunkter och delområde.');
    if (showGroupTitle && cleanText(groupTitle)) {
      doc.font(PDF_FONTS.headerBold)
        .fontSize(11)
        .fillColor('#374151')
        .text(`${cleanText(groupTitle)} (forts.)`, tableLeft, 166, {
          width: tableWidth,
          align: 'left',
        });
    }
    drawLegacyChapterOneTable(doc, chunk, {
      left: tableLeft,
      top: showGroupTitle ? 202 : 188,
      width: tableWidth,
      rowHeight: 21,
      headerHeight,
      entryColumns,
      sectionColumns,
      noteText,
      highlightTokens,
      mode: 'sections-only',
      showNote: chunkIndex === continuationChunks.length - 1,
    });
  });

  return { 1: firstPageNumber };
};

const addEntriesAndSectionsPage = (doc, project, chapterOneGroups, dispSettings, totalPages) => {
  const groups = Array.isArray(chapterOneGroups) && chapterOneGroups.length
    ? chapterOneGroups
    : [{ title: 'Delområdesruta 1', entries: [], sections: [] }];
  const showGroupTitle = groups.length > 1;
  let firstChapterPageNumber = null;

  groups.forEach((group) => {
    const pageMap = addEntriesAndSectionsPageForGroup(
      doc,
      project,
      group.entries || [],
      group.sections || [],
      dispSettings,
      totalPages,
      group.title || '',
      showGroupTitle
    );

    if (firstChapterPageNumber === null) {
      firstChapterPageNumber = pageMap[1];
    }
  });

  return { 1: firstChapterPageNumber || 3 };
};

const getLegacyChapters = (project = {}, dispSettings = {}, chapterOneGroups = []) => {
  const htsmTelefon = cleanText(project.formState?.htsmTelefon || '');
  const reservnr = cleanText(project.formState?.reservnr || '');
  const bandriftnummer = cleanText(project.formState?.bandriftnummer || '');
  const eldriftnummer = cleanText(project.formState?.eldriftnummer || '');
  const larmTlc = extractPrimaryPhone(project.formState?.nodnummer || '') || 'Ej angivet';
  const fjtklContactLines = buildFjtklContactLines(project, chapterOneGroups);

  return [
    {
      number: 2,
      title: 'Allmänt',
      paragraphs: [
        'Dispositionsarbetsplanen gäller varje dag enligt beviljad Dispositionsarbetsplan och skall alltid medföras av säkerhetspersonal digitalt eller pappersform (TSM/Förare).',
        'Dispositionen gäller enligt TTJ Modul 16 och med nedanstående tillägg. Alla aktiviteter i spårområdet skall ha en riskbedömning.',
        'All personal och besökare inom spårområde skall förutom avtalad personlig skyddsutrustning bära varselkläder enligt TDOK 2016:0289.',
        'Vid förändringar i Dispositionsarbetsplanen meddelar HTSM det till behörig personal.',
      ],
    },
    {
      number: 3,
      title: 'Ansvarsfrågor',
      paragraphs: [
        'Det dagliga trafiksäkerhetsarbetet inom D-skyddsområdet leds av en tjänstgörande Huvudtillsyningsman (HTSM).',
        'Innan arbeten får påbörjas skall en genomgång av Dispositionsarbetsplanen ske.',
        'Arbetsledning, säkerhetspersonal kan beställa Dispositionsarbetsplanen hos tjänstgörande (HTSM).',
      ],
    },
    {
      number: 4,
      title: 'Skyddsåtgärder',
      paragraphs: [
        'Respektive Tillsyningsman (TSM) ansvarar för att skyddsåtgärder enligt TTJ moduler utförs.',
      ],
    },
    {
      number: 5,
      title: 'Säkerhetssamtal',
      paragraphs: [
        `Säkerhetssamtal till HTSM ska ske via Telefon ${htsmTelefon || 'Ej angivet'}`,
        `Reservnr: ${reservnr || 'Ej angivet'}`,
        `Telvxl öppnar ca: ${cleanText(dispSettings.forplaneraCa || '1 tim innan start')}.`,
        'Tänk på samtalsdisciplinen, Alla samtal spelas in.',
      ],
    },
    {
      number: 6,
      title: 'Huvudtillsyningsman (HTSM)',
      paragraphs: [
        'HTSM för anteckningar över, och beviljar A, E, L-Skydd, Spärrfärder och Växling.',
      ],
    },
    {
      number: 7,
      title: 'Arbeten och trafikverksamheter',
      paragraphs: [
        'Alla skydd och fordonsrörelser inom D-Skyddsområdet skall ske enligt TTJ modul 16 D-skydd.',
        'För Spärrfärd o Växling gäller halv siktfart. För TSA med spårföljare gäller Sth 20 km/h och att de är besiktigade och godkända.',
      ],
    },
    {
      number: 8,
      title: 'Uppställning eller kvarlämnande av fordon/arbetsredskap',
      paragraphs: [
        'Uppställning av fordon och arbetsredskap inom D-skyddsområdet kräver medgivande från HTSM. Uppställning får ej ske under spänningssatt kontaktledning.',
        'TSM skall se till att Fordon/arbetsredskap som lämnas utan tillsyn skall låsas med vagnförstängare, handbroms eller på annat sätt för att förhindras mot rullning eller att fordonen obehörigt används.',
      ],
    },
    {
      number: 9,
      title: 'Förändringar i spåranläggningen',
      paragraphs: [
        'Skall alltid informeras HTSM.',
        'Om detta sker skall ibruktagandebesiktning ske enligt gällande regler.',
      ],
    },
    {
      number: 10,
      title: 'Åtgärder vid plankorsningar',
      paragraphs: [
        'Vägvakt enligt TTJ modul 7 samt spärrfärd och växling i enlighet med TTJ modul 9H pt 3.4 och TTJ modul 10 pt 3.4',
      ],
    },
    {
      number: 11,
      title: 'Växlar',
      paragraphs: [
        'Skyddsåtgärder för att förhindra felaktig omläggning av en växel eller oavsiktligt signalbesked skall följande åtgärder vidtagas:',
        'Vid passage av växlar/spårspärrar skall trafikverksamheter framföras så att rörelsen alltid kan stanna framför växel eller spårspärr i fel läge.',
        'Oavsiktligt signalbesked förhindras genom att Tkl avspärrar sträckan.',
      ],
    },
    {
      number: 12,
      title: 'Sidospår',
      paragraphs: [
        'Om D-Skyddet gränsar mot Sidospår får passage först ske efter godkännande av HTSM och Infrastrukturförvaltaren för det berörda sidospåret.',
      ],
    },
    {
      number: 13,
      title: 'Telefonnummer',
      lines: [
        'Vid händelse eller olycka skall personal rapportera till:',
        '1. SOS Alarm 112 eller',
        `2. Larm TLC  ${larmTlc}`,
        `2. HTSM ${htsmTelefon || 'Ej angivet'}${reservnr ? `  (${reservnr})` : ''}`,
        '3. Ansvarig Arbetsledare',
        'Vid behov',
        ...(bandriftnummer ? [`Bandriften ${bandriftnummer}`] : []),
        ...(eldriftnummer ? [`Eldriften ${eldriftnummer}`] : []),
        ...fjtklContactLines,
      ].filter(Boolean),
    },
  ];
};

const addStaticTextPages = (doc, project, dispSettings, totalPages, chapterOneGroups = []) => {
  const chapters = getLegacyChapters(project, dispSettings, chapterOneGroups);
  const chapterPages = {};
  const metrics = getStaticChapterLayoutMetrics(doc);
  let pageNumber = null;
  let y = metrics.startY;

  chapters.forEach((chapter, index) => {
    const blockHeight = getStaticChapterBlockHeight(doc, chapter, metrics);
    if (pageNumber === null || (y > metrics.startY && y + blockHeight > metrics.bottomY)) {
      doc.addPage();
      pageNumber = doc.bufferedPageRange().count;
      drawLegacyHeader(doc, dispSettings, totalPages, pageNumber);
      y = metrics.startY;
    }

    chapterPages[chapter.number] = pageNumber;
    y = drawLegacySplitChapterHeading(doc, chapter.number, chapter.title, y) + 8;

    const lines = Array.isArray(chapter.lines) ? chapter.lines : chapter.paragraphs;
    lines.forEach((line) => {
      doc.font(PDF_FONTS.body).fontSize(12).fillColor('#000000').text(line, metrics.bodyX, y, {
        width: metrics.bodyWidth,
        lineGap: 2,
      });
      y = doc.y + 3;
    });

    y += 18;
    if (index === chapters.length - 1) return;
    if (y > metrics.bottomY) {
      y = metrics.startY;
      pageNumber = null;
    }
  });

  return chapterPages;
};

const createDispPdfBuffer = async (project = {}) => {
  const entries = buildEntries(project);
  const dispSettings = buildDispSettings(project, entries);
  const chapterOneGroups = buildChapterOneGroups(project, entries);
  const title = ['Dispositionsarbetsplan', getPublicDispName(project, dispSettings) || dispSettings.rubrik || project.name].filter(Boolean).join(' ');
  const { doc, toBuffer } = createDocument(title);
  const totalPages = estimateLegacyTotalPages(doc, chapterOneGroups, dispSettings, project);

  drawLegacyHeader(doc, dispSettings, totalPages, 1);
  addCoverPage(doc, project, dispSettings);
  const contentsPageIndex = addContentsPage(doc);
  doc.switchToPage(contentsPageIndex);
  drawLegacyHeader(doc, dispSettings, totalPages, 2);
  const chapterPages = {
    ...addEntriesAndSectionsPage(doc, project, chapterOneGroups, dispSettings, totalPages),
    ...addStaticTextPages(doc, project, dispSettings, totalPages, chapterOneGroups),
  };
  addContentsPage(doc, chapterPages, contentsPageIndex);

  doc.end();
  return toBuffer();
};

module.exports = {
  createDispPdfBuffer,
  getPublicDispName,
};
