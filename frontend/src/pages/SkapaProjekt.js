import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import Header from '../components/Header';
import { getSectionLabel } from '../utils/sectionLabels';
import { apiUrl } from '../lib/api';
import {
  fjtklPhoneOptions,
  emergencyPhoneOptions,
  bandriftPhoneOptions,
  eldriftPhoneOptions,
  getDistrictContactDefaults,
  getCatalogPhoneOptions,
  matchFjtklPhoneFromCatalog,
} from '../data/fjtklCatalog';

const fjtklNameOptions = [
  'Malmö',
  'Gävle',
  'Göteborg',
  'Stockholm',
  'Hallsberg',
  'Norrköping',
  'Boden',
  'Ånge',
];

const TELEFONKATALOG_URL = apiUrl('/api/telefonkatalog');
const NJDB_URL = 'https://njdbwebb.trafikverket.se/map';
const TRAFIKVERKET_BLANKETTER_URL = 'https://bransch.trafikverket.se/tjanster/publikationer-och-styrande-dokument/trafikverkets-styrande-dokument/blanketter-och-mallar-tillhorande-styrande-dokument/';

const htsmPhoneOptions = [
  '010-149 01 64',
  '010-149 01 65',
  '010-149 01 66',
  '010-149 01 74',
  '010-149 01 75',
  '010-149 01 76',
  '010-149 01 77',
  '010-149 01 78',
];

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Kunde inte läsa PDF-filen.'));
    reader.readAsDataURL(file);
  });

const createStoredPdfFile = ({ name = '', size = 0, fileData = '' } = {}) => ({
  name: String(name || '').trim(),
  size: Number(size) || 0,
  fileData: String(fileData || ''),
});

const openPdfInAvailableTarget = (url = '', previewWindow = null) => {
  if (!url) {
    return false;
  }

  if (previewWindow) {
    try {
      previewWindow.location.replace(url);
      return true;
    } catch (error) {
      if (!previewWindow.closed) {
        previewWindow.close();
      }
    }
  }

  try {
    window.location.assign(url);
    return true;
  } catch (error) {
    return false;
  }
};

const openStoredPdfFile = (file = {}, previewWindow = null) => {
  if (!file?.fileData) {
    if (previewWindow && !previewWindow.closed) {
      previewWindow.close();
    }
    return false;
  }

  return openPdfInAvailableTarget(file.fileData, previewWindow);
};

const hasStoredPdfContent = (file = {}) => Boolean(String(file?.fileData || '').trim());

const openPendingPdfWindow = () => {
  const previewWindow = window.open('', '_blank', 'noopener,noreferrer');
  if (!previewWindow) {
    return null;
  }

  try {
    previewWindow.document.title = 'Öppnar PDF…';
    previewWindow.document.body.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #0f172a;">
        <p style="margin: 0; font-size: 14px;">Öppnar PDF…</p>
      </div>
    `;
  } catch (error) {
    // Ignore cross-browser write failures and use the window as-is.
  }

  return previewWindow;
};

const openArchivePdfFile = async ({ filePath = '', token = '', previewWindow = null } = {}) => {
  if (!filePath || !token) {
    if (previewWindow && !previewWindow.closed) {
      previewWindow.close();
    }
    return false;
  }

  const response = await fetch(apiUrl('/api/blankett31-registry/open-archive-file'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ filePath }),
  });

  if (!response.ok) {
    if (previewWindow && !previewWindow.closed) {
      previewWindow.close();
    }
    throw new Error(await getApiErrorMessage(response, 'Kunde inte öppna arkivfilen.'));
  }

  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  if (!openPdfInAvailableTarget(objectUrl, previewWindow)) {
    window.URL.revokeObjectURL(objectUrl);
    throw new Error('Webbläsaren blockerade öppningen av PDF-filen.');
  }

  window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60_000);
  return true;
};

const pickBestBlankett31Suggestion = (suggestions = []) =>
  [...suggestions]
    .sort((left, right) => {
      const scoreDelta = Number(right.score || 0) - Number(left.score || 0);
      if (scoreDelta !== 0) return scoreDelta;
      const rightDate = `${right.referenceStartDate || '0000-00-00'}|${right.referenceEndDate || '0000-00-00'}`;
      const leftDate = `${left.referenceStartDate || '0000-00-00'}|${left.referenceEndDate || '0000-00-00'}`;
      return rightDate.localeCompare(leftDate, 'sv');
    })[0] || null;

const getApiErrorMessage = async (response, fallbackMessage) => {
  try {
    const data = await response.json();
    if (typeof data?.error === 'string' && data.error.trim()) {
      return data.error.trim();
    }
  } catch (error) {
    void error;
  }

  return fallbackMessage;
};

const defaultBlankett31Entry = () => ({
  beteckning: '',
  granspunkt: '',
  telefonnummer: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  uttagningstid: '',
  signatur: '',
  avslutningstid: '',
  avslutningssignatur: '',
});

const defaultFjtklBlock = () => ({
  namn: '',
  telefonnummer: '',
  nodnummer: '',
  bandriftnummer: '',
  eldriftnummer: '',
  uttagningstid: '',
  avslutningstid: '',
  signatur: '',
  avslutningssignatur: '',
  avstamt: false,
});

const defaultCustomDispPhoneLine = () => ({
  value: '',
});

const normalizeBlankett31Entry = (entry = {}) => ({
  ...defaultBlankett31Entry(),
  ...entry,
});

const buildPlanJobEntryKey = (entry = {}, index = 0) =>
  `${entry.beteckning || 'entry'}|${entry.startDate || ''}|${index}`;

const getEntryDisplayLabel = (entry = {}) => {
  const shortDate = /^\d{4}-\d{2}-\d{2}$/.test(entry.startDate || '')
    ? entry.startDate.slice(5)
    : entry.startDate || '';
  return [entry.beteckning || '', shortDate, entry.startTime || '']
    .filter(Boolean)
    .join(' ');
};

const buildEntryIdentityKey = (entry = {}) =>
  `${entry.beteckning || ''}|${entry.startDate || ''}|${entry.startTime || ''}|${entry.endDate || ''}|${entry.endTime || ''}`;

const mergeBlankett31EntryPhones = (entries = [], existingEntries = [], fallbackPhone = '') => {
  const phoneByKey = new Map(
    existingEntries.map((entry) => [buildEntryIdentityKey(entry), entry?.telefonnummer || ''])
  );

  return entries.map((entry) => ({
    ...entry,
    telefonnummer: phoneByKey.get(buildEntryIdentityKey(entry)) || entry?.telefonnummer || fallbackPhone || '',
  }));
};

const generatePlanJobId = () =>
  `job-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const buildSuggestedPlanJobName = (entries = [], index = 0) => {
  const datedEntries = entries.filter((entry) => entry?.startDate);
  if (datedEntries.length !== 1) {
    return `Dag/Natt ${index + 1}`;
  }

  const entry = datedEntries[0];
  const startDate = new Date(`${entry.startDate}T00:00:00`);
  const dayLabel = Number.isNaN(startDate.getTime()) ? '' : swedishShortDays[startDate.getDay()];
  const rawStartHour = Number(String(entry.startTime || '').split(':')[0]);
  const spansNight = Boolean(
    entry.startDate
    && entry.endDate
    && entry.endDate !== entry.startDate
  );
  void rawStartHour;
  void spansNight;
  void dayLabel;
  return `Dag/Natt ${index + 1}`;
};

const compareBlankett31Entries = (left = {}, right = {}) => {
  const leftKey = `${left.startDate || '9999-99-99'} ${left.startTime || '99:99'} ${left.endDate || '9999-99-99'} ${left.endTime || '99:99'} ${left.beteckning || ''}`;
  const rightKey = `${right.startDate || '9999-99-99'} ${right.startTime || '99:99'} ${right.endDate || '9999-99-99'} ${right.endTime || '99:99'} ${right.beteckning || ''}`;
  return leftKey.localeCompare(rightKey, 'sv');
};

const sortPlanJobEntryKeys = (selectedEntryKeys = [], entries = []) => {
  const entryMap = new Map(entries.map((entry, index) => [buildPlanJobEntryKey(entry, index), entry]));
  return [...selectedEntryKeys].sort((leftKey, rightKey) => {
    const leftEntry = entryMap.get(leftKey) || {};
    const rightEntry = entryMap.get(rightKey) || {};
    return compareBlankett31Entries(leftEntry, rightEntry);
  });
};

const defaultPlanJob = (entries = [], index = 0) => {
  const selectedEntryKeys = sortPlanJobEntryKeys(
    entries.map((entry, entryIndex) => buildPlanJobEntryKey(entry, entryIndex)),
    entries
  );
  const primaryKey = selectedEntryKeys[0] || '';

  return {
    id: generatePlanJobId(),
    name: buildSuggestedPlanJobName(entries, index),
    selectedEntryKeys,
    primaryPlanEntryKey: primaryKey,
    primaryDispEntryKey: primaryKey,
    sortOrder: index,
  };
};

const normalizePlanJobs = (jobs = [], entries = []) => {
  const availableKeys = new Set(entries.map((entry, index) => buildPlanJobEntryKey(entry, index)));
  const meaningfulJobs = Array.isArray(jobs)
    ? jobs.filter((job) => job && (job.name || (job.selectedEntryKeys || []).length))
    : [];

  if (!meaningfulJobs.length) {
    return [defaultPlanJob(entries, 0)];
  }

  return meaningfulJobs.map((job, index) => ({
    selectedEntryKeys: sortPlanJobEntryKeys(
      Array.isArray(job.selectedEntryKeys)
        ? job.selectedEntryKeys.filter((key) => availableKeys.has(key))
        : [],
      entries
    ),
    id: String(job.id || generatePlanJobId()),
    name: String(job.name || buildSuggestedPlanJobName(entries, index)).trim(),
    primaryPlanEntryKey: String(job.primaryPlanEntryKey || ''),
    primaryDispEntryKey: String(job.primaryDispEntryKey || ''),
    sortOrder: index,
  })).map((job) => {
    const fallbackKey = job.selectedEntryKeys[0] || '';
    return {
      ...job,
      primaryPlanEntryKey: job.selectedEntryKeys.includes(job.primaryPlanEntryKey)
        ? job.primaryPlanEntryKey
        : availableKeys.has(job.primaryPlanEntryKey)
          ? job.primaryPlanEntryKey
          : fallbackKey,
      primaryDispEntryKey: job.selectedEntryKeys.includes(job.primaryDispEntryKey)
        ? job.primaryDispEntryKey
        : availableKeys.has(job.primaryDispEntryKey)
          ? job.primaryDispEntryKey
          : fallbackKey,
    };
  });
};

const sortBlankett31Entries = (entries = []) =>
  [...entries].sort((left, right) => {
    const leftKey = `${left.startDate || '9999-99-99'} ${left.startTime || '99:99'} ${left.beteckning || ''}`;
    const rightKey = `${right.startDate || '9999-99-99'} ${right.startTime || '99:99'} ${right.beteckning || ''}`;
    return leftKey.localeCompare(rightKey, 'sv');
  });

const dedupeBlankett31Entries = (entries = []) =>
  entries.filter((entry, index, array) => {
    const key = `${entry.beteckning || ''}|${entry.startDate || ''}|${entry.startTime || ''}|${entry.endDate || ''}|${entry.endTime || ''}`;
    return index === array.findIndex((candidate) => (
      `${candidate.beteckning || ''}|${candidate.startDate || ''}|${candidate.startTime || ''}|${candidate.endDate || ''}|${candidate.endTime || ''}` === key
    ));
  });

const defaultSection = () => ({
  type: 'Delområde',
  name: '',
  signal: '',
  namingMode: 'NUMBERS',
  displayIndex: null,
  customLabel: '',
  sortOrder: null,
  granspunktStart: '',
  granspunktSlut: '',
  granspunkter: '',
  spar: '',
  highlightStart: false,
  highlightEnd: false,
  highlightStartPart: '',
  highlightEndPart: '',
});

const createDefaultSections = (count = 10) =>
  Array.from({ length: count }, (_, index) => ({
    ...defaultSection(),
    displayIndex: index + 1,
    sortOrder: index,
  }));

const normalizeSectionSortOrder = (items = []) =>
  items.map((section, index) => ({
    ...defaultSection(),
    ...section,
    sortOrder: index,
  }));

const sortSectionLikeStoredOrder = (items = [], getOrder) =>
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

const generateDispSectionGroupId = () =>
  `disp-group-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const defaultDispSectionGroup = (index = 0) => ({
  id: generateDispSectionGroupId(),
  title: `Delområdesruta ${index + 2}`,
  selectedEntryKeys: [],
  sections: createDefaultSections(),
});

const normalizeDispSectionGroups = (groups = [], entries = []) => {
  const availableKeys = new Set(entries.map((entry, index) => buildPlanJobEntryKey(entry, index)));

  return (Array.isArray(groups) ? groups : []).map((group, index) => ({
    id: String(group?.id || generateDispSectionGroupId()),
    title: String(group?.title || `Delområdesruta ${index + 2}`).trim(),
    selectedEntryKeys: Array.isArray(group?.selectedEntryKeys)
      ? group.selectedEntryKeys.filter((key) => availableKeys.has(key))
      : [],
    sections: normalizeSectionSortOrder(
      Array.isArray(group?.sections) && group.sections.length
        ? group.sections.map((section) => ({
            ...defaultSection(),
            ...section,
          }))
        : createDefaultSections()
    ),
  }));
};

const getHighestSectionDisplayIndex = (sectionList = []) =>
  sectionList.reduce((maxValue, section) => {
    const parsed = Number(section?.displayIndex);
    return Number.isFinite(parsed) ? Math.max(maxValue, parsed) : maxValue;
  }, 0);

const addSectionToList = (sectionList = []) =>
  normalizeSectionSortOrder([
    ...sectionList,
    {
      ...defaultSection(),
      displayIndex: getHighestSectionDisplayIndex(sectionList) + 1,
    },
  ]);

const insertSectionAfterInList = (sectionList = [], index = 0) =>
  normalizeSectionSortOrder([
    ...sectionList.slice(0, index + 1),
    {
      ...defaultSection(),
      displayIndex: getHighestSectionDisplayIndex(sectionList) + 1,
    },
    ...sectionList.slice(index + 1),
  ]);

const moveSectionInList = (sectionList = [], index = 0, direction = 0) => {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= sectionList.length) {
    return sectionList;
  }

  const updated = [...sectionList];
  [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
  return normalizeSectionSortOrder(updated);
};

const updateSectionTypeInList = (sectionList = [], index = 0, type = 'Delområde') =>
  normalizeSectionSortOrder(sectionList.map((section, sectionIndex) => (
    sectionIndex === index ? { ...section, type } : section
  )));

const updateSectionNamingModeInList = (sectionList = [], index = 0, namingMode = 'LETTERS') =>
  normalizeSectionSortOrder(sectionList.map((section, sectionIndex) => {
    if (sectionIndex !== index) {
      return section;
    }

    const updated = { ...section, namingMode };
    if (namingMode === 'NUMBERS' && !updated.displayIndex) {
      updated.displayIndex = index + 1;
    }
    return updated;
  }));

const updateSectionFieldInList = (sectionList = [], index = 0, field = '', value = '') =>
  normalizeSectionSortOrder(sectionList.map((section, sectionIndex) => {
    if (sectionIndex !== index) {
      return section;
    }

    const updatedSection = {
      ...section,
      [field]: value,
    };

    if (field === 'signal' || field === 'name') {
      updatedSection.name = value;
      updatedSection.signal = value;
    }

    if (field === 'displayIndex') {
      updatedSection.displayIndex = value === '' ? null : Number(value);
    }

    if (field === 'granspunktStart' || field === 'granspunktSlut') {
      updatedSection.granspunkter = [updatedSection.granspunktStart, updatedSection.granspunktSlut]
        .filter(Boolean)
        .join(' - ');
    }

    return updatedSection;
  }));

const removeSectionFromList = (sectionList = [], index = 0) =>
  normalizeSectionSortOrder(sectionList.filter((_, sectionIndex) => sectionIndex !== index));

const buildDefaultDispEntrySelection = (entries = [], jobs = []) => {
  const normalizedJobs = normalizePlanJobs(jobs, entries);
  const explicitDispKeys = normalizedJobs
    .map((job) => String(job.primaryDispEntryKey || '').trim())
    .filter(Boolean);

  if (explicitDispKeys.length) {
    return [...new Set(explicitDispKeys)];
  }

  return entries.map((entry, index) => buildPlanJobEntryKey(entry, index));
};

const defaultDispSettings = () => ({
  publiktDispnamn: 'Disp',
  rubrik: '',
  banNamn: '',
  veckaOchDagar: '',
  giltigTillagg: '',
  versionsnummer: '1/MA11',
  banobjektVnr: '',
  forplaneraCa: 'ca 1 tim innan start',
  rodmarkeradeGranspunkter: '',
  visaBeteckningarKapitel1: true,
  visaFullaGranspunkterKapitel1: true,
  komprimeraLikaTiderKapitel1: true,
});

const buildSuggestedDispFileName = ({
  banNamn = '',
  veckaOchDagar = '',
  banobjektVnr = '',
} = {}) =>
  ['Disp', String(banNamn || '').trim(), String(veckaOchDagar || '').trim(), String(banobjektVnr || '').trim()]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

const extractOrderedPlaceNamesFromSections = (sections = []) => {
  const orderedNames = [];

  sections.forEach((section) => {
    const rawName = normalizeSectionAreaName(section?.name || section?.signal || '');
    if (!rawName) {
      return;
    }

    rawName
      .split(/\s+[–-]\s+/)
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => {
        if (!orderedNames.includes(part)) {
          orderedNames.push(part);
        }
      });
  });

  return orderedNames;
};

const buildRouteTitleFromPlaces = (placeNames = []) => {
  const uniquePlaces = placeNames.filter(Boolean);
  if (!uniquePlaces.length) {
    return '';
  }
  if (uniquePlaces.length === 1) {
    return uniquePlaces[0];
  }
  return `${uniquePlaces[0]} - ${uniquePlaces[uniquePlaces.length - 1]}`;
};

const looksLikeFilenameStyleProject = (value = '') =>
  /\bV\d+\b/i.test(String(value || '')) || /\b\d{4,}(?:-\d+)?\b/.test(String(value || ''));

const looksLikeCodeOnlyLabel = (value = '') => {
  const normalized = String(value || '')
    .replace(/[–-]/g, ' ')
    .replace(/,/g, ' ')
    .trim();

  if (!normalized) {
    return false;
  }

  const tokens = normalized
    .split(/\s+/)
    .map((token) => token.replace(/[^A-Za-zÅÄÖåäö0-9/]/g, ''))
    .filter(Boolean);

  if (!tokens.length) {
    return false;
  }

  const alphaTokens = tokens.filter((token) => /[A-Za-zÅÄÖåäö]/.test(token));
  if (!alphaTokens.length) {
    return false;
  }

  return alphaTokens.every((token) => {
    const lettersOnly = token.replace(/[^A-Za-zÅÄÖåäö]/g, '');
    return lettersOnly && lettersOnly.length <= 4;
  });
};

const getTemplateOverviewFields = (template = {}) => {
  const templateDispSettings = template?.dispSettings || {};
  const overview = template?.overview || {};
  const sectionPlaceNames = extractOrderedPlaceNamesFromSections(template?.sections || []);
  const derivedRouteTitle = buildRouteTitleFromPlaces(sectionPlaceNames);
  const derivedPlacesList = sectionPlaceNames.join(', ');

  const rawProjectName = String(
    template?.projectName ||
    templateDispSettings.rubrik ||
    overview.stracka ||
    ''
  ).trim();
  const rawPlats = String(
    template?.plats ||
    overview.berordaDriftplatser ||
    ''
  ).trim();
  const rawRubrik = String(
    templateDispSettings.rubrik ||
    overview.stracka ||
    template?.projectName ||
    ''
  ).trim();

  const shouldUseDerivedTitle =
    Boolean(derivedRouteTitle) &&
    (!rawProjectName || looksLikeFilenameStyleProject(rawProjectName) || looksLikeCodeOnlyLabel(rawProjectName));
  const shouldUseDerivedRubrik =
    Boolean(derivedRouteTitle) &&
    (!rawRubrik || looksLikeFilenameStyleProject(rawRubrik) || looksLikeCodeOnlyLabel(rawRubrik));
  const shouldUseDerivedPlaces =
    Boolean(derivedPlacesList) &&
    (!rawPlats || looksLikeCodeOnlyLabel(rawPlats));

  return {
    projectName: shouldUseDerivedTitle ? derivedRouteTitle : rawProjectName,
    plats: shouldUseDerivedPlaces ? derivedPlacesList : rawPlats,
    rubrik: shouldUseDerivedRubrik ? derivedRouteTitle : rawRubrik,
    banNamn: String(
      templateDispSettings.banNamn ||
      overview.banName ||
      ''
    ).trim(),
    veckaOchDagar: String(
      templateDispSettings.veckaOchDagar ||
      overview.weekLine ||
      ''
    ).trim(),
    banobjektVnr: String(
      templateDispSettings.banobjektVnr ||
      overview.banobjektVnr ||
      ''
    ).trim(),
    forplaneraCa: String(
      templateDispSettings.forplaneraCa ||
      overview.forplaneraCa ||
      ''
    ).trim(),
    rodmarkeradeGranspunkter: String(
      templateDispSettings.rodmarkeradeGranspunkter ||
      overview.outerGranspunkter ||
      ''
    ).trim(),
    publiktDispnamn: String(templateDispSettings.publiktDispnamn || '').trim(),
  };
};

const shouldReplaceDistrictDefault = (currentValue = '', previousDefault = '', nextDefault = '') => {
  const current = String(currentValue || '').trim();
  if (!nextDefault) {
    return false;
  }
  if (!current) {
    return true;
  }
  return Boolean(previousDefault) && current === previousDefault;
};

const getIsoWeek = (dateValue = '') => {
  const match = String(dateValue || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return '';
  }

  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `V${String(weekNo).padStart(2, '0')}`;
};

const swedishShortDays = ['Sön', 'Mån', 'Tis', 'Ons', 'Tors', 'Fre', 'Lör'];

const getSummaryDateForEntry = (entry = {}) => {
  const startDate = entry?.startDate || '';
  const endDate = entry?.endDate || '';
  return endDate && endDate !== startDate ? endDate : startDate;
};

const buildSuggestedWeekLine = (entries = [], explicitWeek = '') => {
  const weekValue = explicitWeek || getIsoWeek(entries[0]?.startDate || '');
  const uniqueDates = [...new Set(entries.map((entry) => getSummaryDateForEntry(entry)).filter(Boolean))].sort();
  const dayLabels = uniqueDates
    .map((dateValue) => {
      const date = new Date(`${dateValue}T00:00:00Z`);
      return Number.isNaN(date.getTime()) ? '' : swedishShortDays[date.getUTCDay()];
    })
    .filter(Boolean);

  const dayValue = dayLabels.length ? dayLabels.join(', ') : '';
  return [weekValue, dayValue].filter(Boolean).join(' ');
};

const sanitizeSectionText = (value = '') =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/yttre\s+gr[aä]nspunkter.*$/i, '')
    .replace(/gr[aä]nspunkter\s+som\s+ej\s+f[aå]r\s+passeras.*$/i, '')
    .replace(/som\s+ej\s+f[aå]r\s+passeras.*$/i, '')
    .replace(/medgivande\s+fr[aå]n\s+tkl.*$/i, '')
    .replace(/r[oö]dmarkerade.*$/i, '')
    .trim();

const normalizeTrackValue = (value = '') => {
  const normalized = sanitizeSectionText(value).replace(/^sp[aå]r\s*/i, '');
  if (!normalized) {
    return '';
  }

  return normalized
    .replace(/\s*-\s*/g, '-')
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
};

const normalizeSectionAreaName = (value = '') =>
  sanitizeSectionText(value)
    .replace(/\s+Driftplats(?:er)?$/i, '');

const hasValue = (value) => String(value || '').trim().length > 0;

const sectionHasContent = (section = {}) =>
  [
    section?.signal,
    section?.name,
    section?.granspunktStart,
    section?.granspunktSlut,
    section?.spar,
    section?.customLabel,
  ].some(hasValue);

const buildProjectPreflightSummary = ({
  projektNamn,
  namn,
  telefonnummer,
  dispSettings,
  sections,
  blankett31Entries,
  planJobs,
  primaryDispEntryKeys,
  dispSectionGroups,
}) => {
  const errors = [];
  const warnings = [];

  const activeSections = sections.filter(sectionHasContent);
  const activeEntries = blankett31Entries.filter((entry) =>
    Object.values(entry || {}).some((value) => hasValue(value))
  );
  const normalizedJobs = normalizePlanJobs(planJobs, activeEntries);

  if (!hasValue(projektNamn)) {
    errors.push('Projektnamn saknas.');
  }

  if (!hasValue(namn)) {
    errors.push('FJTKL-namn saknas.');
  }

  if (!hasValue(telefonnummer)) {
    errors.push('FJTKL-telefon saknas.');
  }

  if (!activeSections.length) {
    errors.push('Minst ett delområde måste vara ifyllt.');
  }

  activeSections.forEach((section, index) => {
    const label = getSectionLabel(section, index);
    const signal = String(section.signal || section.name || '').trim();
    const startBoundary = String(section.granspunktStart || '').trim();
    const endBoundary = String(section.granspunktSlut || '').trim();
    const track = String(section.spar || '').trim();

    if (!signal) {
      errors.push(`${label}: delområde/sträcka saknas.`);
    }

    if (!startBoundary || !endBoundary) {
      errors.push(`${label}: både gränspunkt start och gränspunkt slut måste vara ifyllda.`);
    }

    if (!track) {
      errors.push(`${label}: spår saknas.`);
    }

    if (hasValue(section.highlightStartPart) && !section.highlightStart) {
      warnings.push(`${label}: röd del för startpunkt är ifylld men rutan "Rödmarkera startpunkt" är inte ikryssad.`);
    }

    if (hasValue(section.highlightEndPart) && !section.highlightEnd) {
      warnings.push(`${label}: röd del för slutpunkt är ifylld men rutan "Rödmarkera slutpunkt" är inte ikryssad.`);
    }
  });

  if (!activeEntries.length) {
    warnings.push('Ingen Blankett 31-post är ifylld ännu. Projektet kan sparas, men tider och beteckningar behöver då läggas in senare.');
  }

  activeEntries.forEach((entry, index) => {
    const label = entry.beteckning || `Blankett 31-post ${index + 1}`;
    const requiredFields = [
      ['beteckning', 'beteckning'],
      ['startDate', 'startdatum'],
      ['startTime', 'starttid'],
      ['endDate', 'slutdatum'],
      ['endTime', 'sluttid'],
    ];

    requiredFields.forEach(([field, description]) => {
      if (!hasValue(entry[field])) {
        errors.push(`${label}: ${description} saknas.`);
      }
    });

    if (!hasValue(entry.telefonnummer) && !hasValue(telefonnummer)) {
      warnings.push(`${label}: telefonnummer saknas både på posten och som projektets FJTKL-telefon.`);
    }
  });

  if (activeEntries.length && !normalizedJobs.some((job) => (job.selectedEntryKeys || []).length > 0)) {
    errors.push('Minst ett jobb i plankan måste vara kopplat till en Blankett 31-post.');
  }

  const multipleDispBoxes = Array.isArray(dispSectionGroups) && dispSectionGroups.length > 0;
  if (multipleDispBoxes) {
    if (!primaryDispEntryKeys.length) {
      errors.push('Delområdesruta 1 i DISP saknar valda Blankett 31-poster.');
    }

    dispSectionGroups.forEach((group, index) => {
      const label = group?.title || `Delområdesruta ${index + 2}`;
      const groupSections = Array.isArray(group?.sections) ? group.sections.filter(sectionHasContent) : [];
      const groupEntryKeys = Array.isArray(group?.selectedEntryKeys) ? group.selectedEntryKeys : [];

      if (!groupEntryKeys.length) {
        errors.push(`${label}: välj minst en Blankett 31-post som ska höra till rutan.`);
      }

      if (!groupSections.length) {
        errors.push(`${label}: minst ett delområde måste vara ifyllt.`);
      }
    });
  }

  normalizedJobs.forEach((job) => {
    if (!hasValue(job.name)) {
      warnings.push('Ett jobb i plankan saknar namn.');
    }

    if ((job.selectedEntryKeys || []).length && !hasValue(job.primaryDispEntryKey)) {
      errors.push(`Jobbet "${job.name || 'Utan namn'}" saknar vald "Visas i DISP".`);
    }

    if ((job.selectedEntryKeys || []).length && !hasValue(job.primaryPlanEntryKey)) {
      errors.push(`Jobbet "${job.name || 'Utan namn'}" saknar vald "Visas i planka".`);
    }
  });

  if (!hasValue(dispSettings.versionsnummer)) {
    errors.push('Versionsnummer saknas i disp-inställningar.');
  }

  if (!hasValue(dispSettings.banobjektVnr)) {
    warnings.push('Banobjekt-Vnr saknas.');
  }

  if (!hasValue(dispSettings.rubrik)) {
    warnings.push('Rubrik efter "Dispositionsarbetsplan" är tom.');
  }

  if (!hasValue(dispSettings.publiktDispnamn)) {
    warnings.push('PDF-filnamn är tomt.');
  }

  const duplicateDisplayIndexes = activeSections
    .map((section) => Number(section.displayIndex))
    .filter((value) => Number.isFinite(value))
    .filter((value, index, values) => values.indexOf(value) !== index);

  if (duplicateDisplayIndexes.length) {
    warnings.push(`Det finns dubbla delområdesnummer: ${[...new Set(duplicateDisplayIndexes)].join(', ')}.`);
  }

  return { errors, warnings };
};

const getDefaultHighlightedBoundaries = (entries = []) =>
  String(
    entries.find((entry) => String(entry?.granspunkt || '').trim())?.granspunkt || ''
  ).trim();

const parseDriftplatsEndpoints = (value = '') => {
  const parts = String(value || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    from: parts[0] || '',
    to: parts.length > 1 ? parts[parts.length - 1] : '',
  };
};

const normalizeBoundaryCode = (value = '') =>
  String(value || '')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, '')
    .trim();

const extractBoundaryCodeFamily = (value = '') => {
  const normalized = normalizeBoundaryCode(value);
  if (!normalized) {
    return '';
  }

  const match = normalized.match(/^([A-Za-zÅÄÖåäö]+)(?=\d)/);
  return match?.[1] || '';
};

const splitBoundaryEndpointTokens = (value = '') =>
  String(value || '')
    .split(/\s*,\s*/)
    .map((part) => part.trim())
    .filter(Boolean);

const extractBoundaryEndpoints = (value = '') => {
  const parts = String(value || '')
    .replace(/[–—]/g, '-')
    .split(/\s*-\s*/)
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    start: parts[0] || '',
    end: parts.slice(1).join(' - ') || '',
  };
};

const MALMO_ADJACENT_DRIFTPLATS_PAIRS = [
  {
    codes: ['Åp', 'Käb'],
    source: 'Malmö linjebok',
    note: 'Åstorp och Kärreberga behandlas som intilliggande driftplatser.',
    sourceRef: {
      label: 'Malmö linjebok, se D331 Hässleholm till Helsingborg',
      url: 'https://bransch.trafikverket.se/for-dig-i-branschen/jarnvag/Underlag-till-linjebok/Malmos-linjebok/',
    },
  },
  {
    codes: ['Åp', 'Tp'],
    source: 'Malmö linjebok',
    note: 'Åstorp och Teckomatorp gränsar till varandra utan mellanliggande linje.',
    sourceRef: {
      label: 'Malmö linjebok, se D221 Teckomatorp-Åstorp',
      url: 'https://bransch.trafikverket.se/for-dig-i-branschen/jarnvag/Underlag-till-linjebok/Malmos-linjebok/',
    },
  },
];

const normalizeBoundaryCodePairKey = (left = '', right = '') =>
  [String(left || '').trim(), String(right || '').trim()]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'sv'))
    .join('|');

const MALMO_ADJACENT_DRIFTPLATS_MAP = new Map(
  MALMO_ADJACENT_DRIFTPLATS_PAIRS.map((pair) => [
    normalizeBoundaryCodePairKey(pair.codes[0], pair.codes[1]),
    pair,
  ])
);

const analyzeBoundaryAttention = (entries = [], sectionLists = []) => {
  const allBoundaries = entries
    .map((entry) => String(entry?.granspunkt || '').trim())
    .filter(Boolean);

  const combinedSections = sectionLists
    .flat()
    .filter((section) => section && sectionHasContent(section));

  if (!allBoundaries.length) {
    return { key: '', checks: [] };
  }

  let hasSameFamilyBoundary = false;
  let hasDriftplatsdelToken = false;
  let adjacentPairMatch = null;

  allBoundaries.forEach((boundary) => {
    const { start, end } = extractBoundaryEndpoints(boundary);
    const startTokens = splitBoundaryEndpointTokens(start);
    const endTokens = splitBoundaryEndpointTokens(end);

    if ([...startTokens, ...endTokens].some((token) => /\d+\/\d+/.test(normalizeBoundaryCode(token)))) {
      hasDriftplatsdelToken = true;
    }

    const startFamilies = [...new Set(startTokens.map(extractBoundaryCodeFamily).filter(Boolean))];
    const endFamilies = [...new Set(endTokens.map(extractBoundaryCodeFamily).filter(Boolean))];

    if (startFamilies.length && endFamilies.length && startFamilies.some((family) => endFamilies.includes(family))) {
      hasSameFamilyBoundary = true;
    }

    if (!adjacentPairMatch) {
      for (const startFamily of startFamilies) {
        for (const endFamily of endFamilies) {
          const pair = MALMO_ADJACENT_DRIFTPLATS_MAP.get(
            normalizeBoundaryCodePairKey(startFamily, endFamily)
          );
          if (pair) {
            adjacentPairMatch = pair;
            break;
          }
        }
        if (adjacentPairMatch) {
          break;
        }
      }
    }
  });

  const suspiciousLayout = hasDriftplatsdelToken || hasSameFamilyBoundary || Boolean(adjacentPairMatch);
  if (!suspiciousLayout) {
    return { key: '', checks: [] };
  }

  const hasSingleTrackESection = combinedSections.some((section) => {
    const normalizedTrack = String(section?.spar || '')
      .replace(/^sp[aå]r\s*/i, '')
      .trim()
      .toUpperCase();
    return normalizedTrack === 'E';
  });

  const checks = [
    {
      code: 'track',
      title: 'Kontrollera spårangivelse',
      text: adjacentPairMatch
        ? hasSingleTrackESection
          ? `${adjacentPairMatch.note} Undvik E här och ange riktiga spårnummer eller lokal spårbeteckning.`
          : `${adjacentPairMatch.note} Kontrollera att spårfältet anges med riktiga spårnummer eller lokal spårbeteckning.`
        : hasSingleTrackESection
          ? 'Den här Blankett 31 ser ut att gälla driftplatsdelar eller ett avvikande driftplatsläge. Undvik E här och ange riktiga spårnummer eller lokal spårbeteckning.'
          : 'Den här Blankett 31 ser ut att gälla driftplatsdelar eller ett avvikande driftplatsläge. Kontrollera att spårfältet anges med riktiga spårnummer eller lokal spårbeteckning.',
    },
    {
      code: 'dp-line',
      title: 'Kontrollera DP/Linje',
      text: adjacentPairMatch
        ? `Gränspunkterna matchar ett känt avvikande par i ${adjacentPairMatch.source}. Kontrollera om delområdet ska vara DP eller Linje innan du sparar projektet.`
        : 'Gränspunkterna ser inte ut som ett vanligt driftplats - linje - driftplats-fall. Kontrollera om delområdet ska vara DP eller Linje innan du sparar projektet.',
    },
  ];

  return {
    key: JSON.stringify({
      boundaries: allBoundaries,
      sameFamily: hasSameFamilyBoundary,
      driftplatsdel: hasDriftplatsdelToken,
      adjacentPair: adjacentPairMatch?.codes || '',
      trackE: hasSingleTrackESection,
    }),
    checks,
    sourceRef: adjacentPairMatch?.sourceRef || null,
  };
};

const mergeSectionDetails = (sections = [], sectionDetails = [], fallbackAreaName = '') => {
  const orderedSections = sortSectionLikeStoredOrder(sections, (section) => section?.sortOrder);
  const orderedDetails = sortSectionLikeStoredOrder(sectionDetails, (detail) => detail?.sortOrder);

  return normalizeSectionSortOrder(orderedSections.map((section, index) => {
    const details = orderedDetails[index] || {};
    const granspunktStart = sanitizeSectionText(details.granspunktStart || '');
    const granspunktSlut = sanitizeSectionText(details.granspunktSlut || '');
    const granspunkter = sanitizeSectionText(
      details.granspunkter || [granspunktStart, granspunktSlut].filter(Boolean).join(' - ')
    );
    const areaName = normalizeSectionAreaName(
      section?.name || details.signal || section?.signal || fallbackAreaName
    );

    return {
      ...defaultSection(),
      ...section,
      ...details,
      name: areaName,
      signal: areaName,
      customLabel: String(details.customLabel || section?.customLabel || '').trim(),
      sortOrder: Number.isFinite(Number(details.sortOrder))
        ? Number(details.sortOrder)
        : Number.isFinite(Number(section?.sortOrder))
          ? Number(section.sortOrder)
          : index,
      granspunktStart,
      granspunktSlut,
      granspunkter,
      spar: normalizeTrackValue(details.spar || ''),
      highlightStart: Boolean(details.highlightStart),
      highlightEnd: Boolean(details.highlightEnd),
      highlightStartPart: String(details.highlightStartPart || '').trim(),
      highlightEndPart: String(details.highlightEndPart || '').trim(),
    };
  }).sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0)));
};

const SkapaProjekt = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentProjectId = location.state?.projectId ?? null;
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [plats, setPlats] = useState('');
  const [fromDriftplats, setFromDriftplats] = useState('');
  const [toDriftplats, setToDriftplats] = useState('');
  const [projektNamn, setProjektNamn] = useState('');
  const [granspunktFritext, setGranspunktFritext] = useState('');
  const [namn, setNamn] = useState('');
  const [telefonnummer, setTelefonnummer] = useState('');
  const [nodnummer, setNodnummer] = useState('');
  const [bandriftnummer, setBandriftnummer] = useState('');
  const [eldriftnummer, setEldriftnummer] = useState('');
  const [htsmTelefon, setHtsmTelefon] = useState('');
  const [reservnr, setReservnr] = useState('');
  const [avstamt, setAvstamt] = useState(false);
  const [objekt, setObjekt] = useState('');
  const [uttagningstid, setUttagningstid] = useState('');
  const [signatur, setSignatur] = useState('');
  const [avslutaSkyddTid, setAvslutaSkyddTid] = useState('');
  const [avslutningstid, setAvslutningstid] = useState('');
  const [avslutningssignatur, setAvslutningssignatur] = useState('');
  const [beteckningar, setBeteckningar] = useState([{ value: '' }]);
  const [sections, setSections] = useState(() => createDefaultSections());
  const [blankett31Meta, setBlankett31Meta] = useState({});
  const [dispSettings, setDispSettings] = useState(() => defaultDispSettings());
  const [fjtklBlocks, setFjtklBlocks] = useState([]);
  const [customDispPhoneLines, setCustomDispPhoneLines] = useState([]);
  const [blankett31Files, setBlankett31Files] = useState([]);
  const [blankett31Entries, setBlankett31Entries] = useState([defaultBlankett31Entry()]);
  const [separatePlanTabsByDispBox, setSeparatePlanTabsByDispBox] = useState(false);
  const [planJobs, setPlanJobs] = useState(() => normalizePlanJobs([], []));
  const [primaryDispEntryKeys, setPrimaryDispEntryKeys] = useState([]);
  const [dispSectionGroups, setDispSectionGroups] = useState([]);
  const [dispFiles, setDispFiles] = useState([]);
  const [, setAnteckningar] = useState([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isParsingBlankett31, setIsParsingBlankett31] = useState(false);
  const [blankett31Status, setBlankett31Status] = useState('');
  const [blankett31Suggestions, setBlankett31Suggestions] = useState([]);
  const [blankett31Attention, setBlankett31Attention] = useState({ key: '', checks: [], sourceRef: null });
  const [dismissedBlankett31AttentionKey, setDismissedBlankett31AttentionKey] = useState('');
  const [openingArchiveSuggestionKey, setOpeningArchiveSuggestionKey] = useState('');
  const [applyingSuggestionKey, setApplyingSuggestionKey] = useState('');
  const [, setIsParsingDisp] = useState(false);
  const [dispStatus, setDispStatus] = useState('');
  const [isResolvingDriftplatser, setIsResolvingDriftplatser] = useState(false);
  const [driftplatsStatus, setDriftplatsStatus] = useState('');
  const [isResolvingSections, setIsResolvingSections] = useState(false);
  const [sectionStatus, setSectionStatus] = useState('');
  const [preflightSummary, setPreflightSummary] = useState({ errors: [], warnings: [] });
  const [isSavingProject, setIsSavingProject] = useState(false);
  const {
    isOpen: isPreflightOpen,
    onOpen: openPreflight,
    onClose: closePreflight,
  } = useDisclosure();
  const blankett31InputRef = useRef(null);
  const dispInputRef = useRef(null);
  const availableHtsmPhoneOptions = htsmPhoneOptions.filter((option) => option === htsmTelefon || option !== reservnr);
  const availableReservnrOptions = htsmPhoneOptions.filter((option) => option === reservnr || option !== htsmTelefon);
  const availableBlankett31PhoneOptions = Array.from(
    new Set(getCatalogPhoneOptions([
      telefonnummer,
      ...fjtklBlocks.map((block) => block?.telefonnummer || ''),
    ]).map((value) => String(value || '').trim()).filter(Boolean))
  );
  const planJobEntryOptions = blankett31Entries
    .map((entry, index) => ({
      key: buildPlanJobEntryKey(entry, index),
      label: getEntryDisplayLabel(entry),
    }))
    .filter((option) => option.label);
  const token = JSON.parse(localStorage.getItem('user'))?.token;
  const blankett31EntryKeyMap = new Map(
    blankett31Entries.map((entry, index) => [buildPlanJobEntryKey(entry, index), entry])
  );

  const syncSummaryDatesFromEntries = (entries) => {
    if (!entries.length) {
      return;
    }

    const firstEntry = entries[0];
    const lastEntry = entries[entries.length - 1];
    setStartDate(firstEntry.startDate || '');
    setStartTime(firstEntry.startTime || '');
    setEndDate(lastEntry.endDate || '');
    setEndTime(lastEntry.endTime || '');
  };

  const syncProtectionFieldsFromEntries = (entries) => {
    if (!entries.length) {
      return;
    }

    const firstEntry = entries[0];
    const lastEntry = entries[entries.length - 1];
    setUttagningstid(firstEntry.uttagningstid || '');
    setSignatur(firstEntry.signatur || '');
    setAvslutningstid(lastEntry.avslutningstid || '');
    setAvslutningssignatur(lastEntry.avslutningssignatur || '');
  };

  const updateBlankett31Entry = (index, field, value) => {
    setBlankett31Entries((current) => {
      const updated = current.map((entry, entryIndex) => (
        entryIndex === index
          ? { ...entry, [field]: value }
          : entry
      ));

      syncSummaryDatesFromEntries(updated);
      syncProtectionFieldsFromEntries(updated);
      return updated;
    });
  };

  const applyCatalogMatchToProject = () => {
    const match = matchFjtklPhoneFromCatalog({
      projectName: projektNamn,
      plats,
      granspunkter: granspunktFritext,
    });

    if (!match) {
      alert('Kunde inte hitta något tydligt FJTKL-nummer i telefonkatalogen för den här sträckan ännu.');
      return;
    }

    setTelefonnummer(match.phone);
    alert(`Matchade telefonkatalogen till ${match.phone}`);
  };

  const applyDistrictDefaultsToPrimaryFjtkl = (nextName, previousName = namn) => {
    const previousDefaults = getDistrictContactDefaults(previousName) || {};
    const nextDefaults = getDistrictContactDefaults(nextName) || {};

    if (shouldReplaceDistrictDefault(nodnummer, previousDefaults.emergency, nextDefaults.emergency)) {
      setNodnummer(nextDefaults.emergency || '');
    }
    if (shouldReplaceDistrictDefault(bandriftnummer, previousDefaults.bandrift, nextDefaults.bandrift)) {
      setBandriftnummer(nextDefaults.bandrift || '');
    }
    if (shouldReplaceDistrictDefault(eldriftnummer, previousDefaults.eldrift, nextDefaults.eldrift)) {
      setEldriftnummer(nextDefaults.eldrift || '');
    }
  };

  const applyCatalogMatchToEntry = (index) => {
    const entry = blankett31Entries[index];
    const match = matchFjtklPhoneFromCatalog({
      projectName: projektNamn,
      plats,
      granspunkter: granspunktFritext,
      entry,
    });

    if (!match) {
      alert(`Kunde inte hitta något tydligt FJTKL-nummer i telefonkatalogen för post ${index + 1}.`);
      return;
    }

    updateBlankett31Entry(index, 'telefonnummer', match.phone);
    alert(`Post ${index + 1} matchades till ${match.phone}`);
  };

  const removeBlankett31Entry = (index) => {
    setBlankett31Entries((current) => {
      const updated = current.filter((_, entryIndex) => entryIndex !== index);
      const nextEntries = updated.length ? updated : [defaultBlankett31Entry()];
      syncSummaryDatesFromEntries(nextEntries);
      syncProtectionFieldsFromEntries(nextEntries);
      return nextEntries;
    });
  };

  const addPlanJob = () => {
    setPlanJobs((current) => normalizePlanJobs([
      ...current,
      defaultPlanJob([], current.length),
    ], blankett31Entries));
  };

  const updatePlanJobField = (index, field, value) => {
    setPlanJobs((current) => normalizePlanJobs(current.map((job, jobIndex) => (
      jobIndex === index
        ? { ...job, [field]: value }
        : job
    )), blankett31Entries));
  };

  const togglePlanJobEntry = (jobIndex, entryKey) => {
    setPlanJobs((current) => normalizePlanJobs(current.map((job, index) => {
      if (index !== jobIndex) {
        return job;
      }

      const selectedEntryKeys = new Set(job.selectedEntryKeys || []);
      if (selectedEntryKeys.has(entryKey)) {
        selectedEntryKeys.delete(entryKey);
      } else {
        selectedEntryKeys.add(entryKey);
      }

      return {
        ...job,
        selectedEntryKeys: Array.from(selectedEntryKeys),
      };
    }), blankett31Entries));
  };

  const getPlanJobSelectedOptions = (job) =>
    planJobEntryOptions.filter((option) => (job.selectedEntryKeys || []).includes(option.key));

  const movePlanJob = (index, direction) => {
    setPlanJobs((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const updated = [...current];
      [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
      return normalizePlanJobs(updated, blankett31Entries);
    });
  };

  const removePlanJob = (index) => {
    setPlanJobs((current) => normalizePlanJobs(
      current.filter((_, jobIndex) => jobIndex !== index),
      blankett31Entries
    ));
  };

  const addFjtklBlock = () => {
    setFjtklBlocks([
      ...fjtklBlocks,
      defaultFjtklBlock(),
    ]);
  };

  const addCustomDispPhoneLine = () => {
    setCustomDispPhoneLines((current) => [...current, defaultCustomDispPhoneLine()]);
  };

  const updateCustomDispPhoneLine = (index, value) => {
    setCustomDispPhoneLines((current) => current.map((line, lineIndex) => (
      lineIndex === index
        ? { ...line, value }
        : line
    )));
  };

  const removeCustomDispPhoneLine = (index) => {
    setCustomDispPhoneLines((current) => current.filter((_, lineIndex) => lineIndex !== index));
  };

  const updateFjtklBlock = (index, field, value) => {
    const updated = [...fjtklBlocks];
    const currentBlock = {
      ...defaultFjtklBlock(),
      ...(updated[index] || {}),
    };
    const nextBlock = {
      ...currentBlock,
      [field]: value,
    };

    if (field === 'namn') {
      const previousDefaults = getDistrictContactDefaults(currentBlock.namn) || {};
      const nextDefaults = getDistrictContactDefaults(value) || {};
      if (shouldReplaceDistrictDefault(currentBlock.nodnummer, previousDefaults.emergency, nextDefaults.emergency)) {
        nextBlock.nodnummer = nextDefaults.emergency || '';
      }
      if (shouldReplaceDistrictDefault(currentBlock.bandriftnummer, previousDefaults.bandrift, nextDefaults.bandrift)) {
        nextBlock.bandriftnummer = nextDefaults.bandrift || '';
      }
      if (shouldReplaceDistrictDefault(currentBlock.eldriftnummer, previousDefaults.eldrift, nextDefaults.eldrift)) {
        nextBlock.eldriftnummer = nextDefaults.eldrift || '';
      }
    }

    updated[index] = nextBlock;
    setFjtklBlocks(updated);
  };

  const getCurrentTime = () =>
    new Date().toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

  const removeFjtklBlock = (index) => {
    setFjtklBlocks(fjtklBlocks.filter((_, i) => i !== index));
  };

  const togglePrimaryDispEntryKey = (entryKey) => {
    setPrimaryDispEntryKeys((current) => (
      current.includes(entryKey)
        ? current.filter((key) => key !== entryKey)
        : [...current, entryKey]
    ));
  };

  const addDispSectionGroup = () => {
    setPrimaryDispEntryKeys((current) => (
      current.length ? current : buildDefaultDispEntrySelection(blankett31Entries, planJobs)
    ));
    setDispSectionGroups((current) => normalizeDispSectionGroups([
      ...current,
      defaultDispSectionGroup(current.length),
    ], blankett31Entries));
  };

  const updateDispSectionGroupField = (groupId, field, value) => {
    setDispSectionGroups((current) => normalizeDispSectionGroups(current.map((group) => (
      group.id === groupId ? { ...group, [field]: value } : group
    )), blankett31Entries));
  };

  const toggleDispSectionGroupEntry = (groupId, entryKey) => {
    setDispSectionGroups((current) => normalizeDispSectionGroups(current.map((group) => {
      if (group.id !== groupId) {
        return group;
      }

      const selectedEntryKeys = new Set(group.selectedEntryKeys || []);
      if (selectedEntryKeys.has(entryKey)) {
        selectedEntryKeys.delete(entryKey);
      } else {
        selectedEntryKeys.add(entryKey);
      }

      return {
        ...group,
        selectedEntryKeys: Array.from(selectedEntryKeys),
      };
    }), blankett31Entries));
  };

  const removeDispSectionGroup = (groupId) => {
    setDispSectionGroups((current) => normalizeDispSectionGroups(
      current.filter((group) => group.id !== groupId),
      blankett31Entries
    ));
  };

  const updateDispGroupSections = (groupId, updater) => {
    setDispSectionGroups((current) => normalizeDispSectionGroups(current.map((group) => (
      group.id === groupId
        ? {
            ...group,
            sections: updater(Array.isArray(group.sections) ? group.sections : createDefaultSections()),
          }
        : group
    )), blankett31Entries));
  };

  const addDispGroupSection = (groupId) => {
    updateDispGroupSections(groupId, (current) => addSectionToList(current));
  };

  const insertDispGroupSectionAfter = (groupId, index) => {
    updateDispGroupSections(groupId, (current) => insertSectionAfterInList(current, index));
  };

  const moveDispGroupSection = (groupId, index, direction) => {
    updateDispGroupSections(groupId, (current) => moveSectionInList(current, index, direction));
  };

  const updateDispGroupSectionType = (groupId, index, type) => {
    updateDispGroupSections(groupId, (current) => updateSectionTypeInList(current, index, type));
  };

  const updateDispGroupSectionNamingMode = (groupId, index, namingMode) => {
    updateDispGroupSections(groupId, (current) => updateSectionNamingModeInList(current, index, namingMode));
  };

  const updateDispGroupSectionField = (groupId, index, field, value) => {
    updateDispGroupSections(groupId, (current) => updateSectionFieldInList(current, index, field, value));
  };

  const removeDispGroupSection = (groupId, index) => {
    updateDispGroupSections(groupId, (current) => removeSectionFromList(current, index));
  };

  const getOuterBoundariesForEntryKeys = (selectedEntryKeys = []) => {
    const boundaries = selectedEntryKeys
      .map((key) => blankett31EntryKeyMap.get(key))
      .filter(Boolean)
      .map((entry) => String(entry?.granspunkt || '').trim())
      .filter(Boolean);

    return boundaries.length ? boundaries.join(', ') : granspunktFritext;
  };

  const addSection = () => {
    setSections((current) => addSectionToList(current));
  };

  const insertSectionAfter = (index) => {
    setSections((current) => insertSectionAfterInList(current, index));
  };

  const moveSection = (index, direction) => {
    setSections((current) => moveSectionInList(current, index, direction));
  };

  const updateSectionType = (index, type) => {
    setSections((current) => updateSectionTypeInList(current, index, type));
  };

  const updateSectionNamingMode = (index, namingMode) => {
    setSections((current) => updateSectionNamingModeInList(current, index, namingMode));
  };

  const updateSectionField = (index, field, value) => {
    setSections((current) => updateSectionFieldInList(current, index, field, value));
  };

  const removeSection = (index) => {
    setSections((current) => removeSectionFromList(current, index));
  };

  const handleExpandDriftplatser = async () => {
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) {
      setDriftplatsStatus('Du maste vara inloggad for att hamta driftplatser.');
      return;
    }

    setIsResolvingDriftplatser(true);
    setDriftplatsStatus('Soker mellanliggande driftplatser i NJDB...');

    try {
      const response = await fetch(apiUrl('/api/njdb/driftplatser/expand'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value: plats }),
      });

      if (!response.ok) {
        const message = await getApiErrorMessage(response, 'Kunde inte hamta driftplatser fran NJDB.');
        throw new Error(message);
      }

      const data = await response.json();
      const nextValue = String(data?.value || '').trim();
      setPlats(nextValue);
      setDriftplatsStatus(nextValue ? `Uppdaterade raden med ${data?.places?.length || 0} driftplatser.` : 'Inga driftplatser hittades.');
    } catch (error) {
      console.error('Fel vid hamtning av driftplatser:', error);
      setDriftplatsStatus(error.message || 'Kunde inte hamta driftplatser fran NJDB.');
    } finally {
      setIsResolvingDriftplatser(false);
    }
  };

  const resolveExpandedDriftplatser = async (value) => {
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) {
      throw new Error('Du maste vara inloggad for att hamta driftplatser.');
    }

    const response = await fetch(apiUrl('/api/njdb/driftplatser/expand'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ value }),
    });

    if (!response.ok) {
      const message = await getApiErrorMessage(response, 'Kunde inte hamta driftplatser fran NJDB.');
      throw new Error(message);
    }

    return response.json();
  };

  const resolveSectionsFromSignals = async (value, outerBoundaries) => {
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) {
      throw new Error('Du maste vara inloggad for att hamta signaler.');
    }

    const response = await fetch(apiUrl('/api/njdb/sections/signals'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        value,
        outerBoundaries,
      }),
    });

    if (!response.ok) {
      const message = await getApiErrorMessage(response, 'Kunde inte skapa delomraden fran NJDB.');
      throw new Error(message);
    }

    return response.json();
  };

  const handleBuildFromEndpoints = async () => {
    const fromValue = fromDriftplats.trim();
    const toValue = toDriftplats.trim();

    if (!fromValue || !toValue) {
      setDriftplatsStatus('Ange både startdriftplats och slutdriftplats.');
      return;
    }

    const searchValue = `${fromValue}, ${toValue}`;
    setIsResolvingDriftplatser(true);
    setIsResolvingSections(true);
    setDriftplatsStatus('Soker mellanliggande driftplatser i NJDB...');
    setSectionStatus('Bygger delomraden och signaler fran NJDB...');

    try {
      const driftplatsData = await resolveExpandedDriftplatser(searchValue);
      const nextValue = String(driftplatsData?.value || searchValue).trim();
      setPlats(nextValue);

      const sectionData = await resolveSectionsFromSignals(nextValue, granspunktFritext);
      const nextSections = Array.isArray(sectionData?.sections) && sectionData.sections.length
        ? normalizeSectionSortOrder(sectionData.sections.map((section, index) => ({
            ...defaultSection(),
            ...section,
            displayIndex: section.displayIndex ?? index + 1,
          })))
        : createDefaultSections();

      setSections(nextSections);
      setDriftplatsStatus(nextValue
        ? `Fyllde raden med ${driftplatsData?.places?.length || 0} driftplatser.`
        : 'Inga driftplatser hittades.');
      setSectionStatus(nextSections.length
        ? `Byggde ${nextSections.length} delomraden med signaler och spår.`
        : 'Inga delomraden kunde skapas.');
    } catch (error) {
      console.error('Fel vid automatisk byggning fran driftplatser:', error);
      const message = error.message || 'Kunde inte bygga projektet fran start och slut.';
      setDriftplatsStatus(message);
      setSectionStatus(message);
    } finally {
      setIsResolvingDriftplatser(false);
      setIsResolvingSections(false);
    }
  };

  const handlePopulateSectionsFromSignals = async () => {
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) {
      setSectionStatus('Du maste vara inloggad for att hamta signaler.');
      return;
    }

    setIsResolvingSections(true);
    setSectionStatus('Hamta signaler och bygger delomraden fran NJDB...');

    try {
      const response = await fetch(apiUrl('/api/njdb/sections/signals'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          value: plats,
          outerBoundaries: granspunktFritext,
        }),
      });

      if (!response.ok) {
        const message = await getApiErrorMessage(response, 'Kunde inte skapa delomraden fran NJDB.');
        throw new Error(message);
      }

      const data = await response.json();
      const nextSections = Array.isArray(data?.sections) && data.sections.length
        ? normalizeSectionSortOrder(data.sections.map((section, index) => ({
            ...defaultSection(),
            ...section,
            displayIndex: section.displayIndex ?? index + 1,
          })))
        : createDefaultSections();

      setSections(nextSections);
      setSectionStatus(nextSections.length
        ? `Fyllde ${nextSections.length} delomraden med signaler och strackor.`
        : 'Inga delomraden kunde skapas.');
    } catch (error) {
      console.error('Fel vid hamtning av sektionssignaler:', error);
      setSectionStatus(error.message || 'Kunde inte skapa delomraden fran NJDB.');
    } finally {
      setIsResolvingSections(false);
    }
  };

  const handlePopulateGroupSectionsFromSignals = async (groupId, selectedEntryKeys = []) => {
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) {
      setSectionStatus('Du maste vara inloggad for att hamta signaler.');
      return;
    }

    setIsResolvingSections(true);
    setSectionStatus('Hamta signaler och bygger delomraden fran NJDB for vald delomradesruta...');

    try {
      const data = await resolveSectionsFromSignals(plats, getOuterBoundariesForEntryKeys(selectedEntryKeys));
      const nextSections = Array.isArray(data?.sections) && data.sections.length
        ? normalizeSectionSortOrder(data.sections.map((section, index) => ({
            ...defaultSection(),
            ...section,
            displayIndex: section.displayIndex ?? index + 1,
          })))
        : createDefaultSections();

      updateDispGroupSections(groupId, () => nextSections);
      setSectionStatus(nextSections.length
        ? 'Fyllde delomradesrutan med signaler och strackor.'
        : 'Inga delomraden kunde skapas for den valda delomradesrutan.');
    } catch (error) {
      console.error('Fel vid hamtning av sektionssignaler for extra ruta:', error);
      setSectionStatus(error.message || 'Kunde inte skapa delomraden for den valda delomradesrutan.');
    } finally {
      setIsResolvingSections(false);
    }
  };

  const applyBlankett31Data = (parsed) => {
    const parsedEntries = Array.isArray(parsed?.entries) && parsed.entries.length
      ? parsed.entries
      : [
          {
            beteckning: parsed?.beteckning || '',
            granspunkt: parsed?.granspunkt || '',
            startDate: parsed?.start?.date || '',
            startTime: parsed?.start?.time || '',
            endDate: parsed?.end?.date || '',
            endTime: parsed?.end?.time || '',
            uttagningstid: '',
            signatur: '',
            avslutningstid: '',
            avslutningssignatur: '',
          },
        ].filter((entry) => Object.values(entry).some(Boolean));

    return mergeBlankett31EntryPhones(
      parsedEntries.map(normalizeBlankett31Entry),
      blankett31Entries,
      telefonnummer
    );
  };

  const applyBlankett31Meta = (parsed = {}, nextEntries = []) => {
    const parsedMeta = parsed?.meta || {};
    setBlankett31Meta(parsedMeta);
    const defaultHighlightedBoundaries = getDefaultHighlightedBoundaries(nextEntries);

    if (!hasValue(projektNamn) && hasValue(parsedMeta.projectLabel)) {
      setProjektNamn(parsedMeta.projectLabel);
    }

    setDispSettings((current) => ({
      ...current,
      rubrik: current.rubrik || parsedMeta.projectLabel || '',
      veckaOchDagar: current.veckaOchDagar || buildSuggestedWeekLine(nextEntries, parsedMeta.referenceWeek),
      banobjektVnr:
        current.banobjektVnr || (parsedMeta.banarbetsobjektsId ? `${parsedMeta.banarbetsobjektsId}-1` : ''),
      rodmarkeradeGranspunkter: current.rodmarkeradeGranspunkter || defaultHighlightedBoundaries,
    }));
  };

  const handleBlankett31Upload = async (event) => {
    const files = Array.from(event.target.files || []).filter(
      (file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );

    if (!files.length) {
      setBlankett31Status('');
      setBlankett31Suggestions([]);
      return;
    }

    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) {
      setBlankett31Status('Logga in för att tolka Blankett 31.');
      setBlankett31Suggestions([]);
      return;
    }

    setIsParsingBlankett31(true);
    setBlankett31Status('Tolkar Blankett 31...');

    try {
      const parsedFileEntries = [];
      let parsedMeta = null;
      const uploadedFiles = [];
      let parsedSuggestions = [];

      for (const file of files) {
        const fileData = await readFileAsDataUrl(file);
        uploadedFiles.push(createStoredPdfFile({
          name: file.name,
          size: file.size,
          fileData,
        }));
        const response = await fetch(apiUrl('/api/pdf/blankett31/parse'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fileName: file.name,
            fileData,
          }),
        });

        if (!response.ok) {
          throw new Error(await getApiErrorMessage(response, `Kunde inte tolka ${file.name}`));
        }

        const data = await response.json();
        parsedFileEntries.push(...applyBlankett31Data(data.parsed));
        parsedSuggestions = [...parsedSuggestions, ...(Array.isArray(data?.suggestions) ? data.suggestions : [])];
        if (!parsedMeta && data?.parsed?.meta) {
          parsedMeta = data.parsed.meta;
        }
      }

      const combinedEntries = sortBlankett31Entries(dedupeBlankett31Entries([
        ...blankett31Entries.filter((entry) => Object.values(entry || {}).some(Boolean)),
        ...parsedFileEntries,
      ]));

      const nextEntries = combinedEntries.length
        ? mergeBlankett31EntryPhones(combinedEntries, blankett31Entries, telefonnummer)
        : [defaultBlankett31Entry()];
      setBlankett31Entries(nextEntries);
      setPrimaryDispEntryKeys((current) => {
        const availableKeys = new Set(nextEntries.map((entry, index) => buildPlanJobEntryKey(entry, index)));
        return current.filter((key) => availableKeys.has(key));
      });
      setDispSectionGroups((current) => normalizeDispSectionGroups(current, nextEntries));
      setBeteckningar(nextEntries.map((entry) => ({ value: entry.beteckning || '' })));
      setBlankett31Files((current) => {
        const merged = [...current, ...uploadedFiles].map((file) => ({ ...file }));
        return merged.filter(
          (file, index, array) =>
            index === array.findIndex((candidate) => candidate.name === file.name && candidate.size === file.size)
        );
      });
      if (!granspunktFritext) {
        const firstGranspunkt = nextEntries.find((entry) => entry.granspunkt)?.granspunkt;
        if (firstGranspunkt) {
          setGranspunktFritext(firstGranspunkt);
        }
      }
      if (parsedMeta) {
        applyBlankett31Meta({ meta: parsedMeta }, nextEntries);
      }
      syncSummaryDatesFromEntries(nextEntries);
      syncProtectionFieldsFromEntries(nextEntries);
      const dedupedSuggestions = parsedSuggestions.filter((item, index, collection) =>
        index === collection.findIndex((candidate) =>
          (candidate.suggestionKey || `${candidate.projectId || 'archive'}-${candidate.candidateId}`) ===
          (item.suggestionKey || `${item.projectId || 'archive'}-${item.candidateId}`)
        )
      );
      const bestSuggestion = pickBestBlankett31Suggestion(dedupedSuggestions);
      setBlankett31Suggestions(bestSuggestion ? [bestSuggestion] : []);
      setBlankett31Status(
        files.length > 1
          ? `${files.length} Blankett 31 tolkades och lades till i projektet.`
          : 'Blankett 31 tolkad och lades till i projektet.'
      );
    } catch (error) {
      console.error('Fel vid tolkning av Blankett 31:', error);
      setBlankett31Status('Blankett 31 kunde inte tolkas automatiskt.');
      setBlankett31Suggestions([]);
    } finally {
      setIsParsingBlankett31(false);
    }
  };

  const applyDispData = (parsed) => {
    if (parsed?.projectName) {
      setProjektNamn(parsed.projectName);
    }

    if (parsed?.overview?.berordaDriftplatser || parsed?.plats) {
      setPlats(parsed?.overview?.berordaDriftplatser || parsed.plats);
    }

    setTelefonnummer(parsed?.telefonnummer || '');

    if (Array.isArray(parsed?.sections) && parsed.sections.length) {
      const fallbackAreaName = parsed.sections.length === 1 ? normalizeSectionAreaName(plats || parsed.plats || dispSettings.banNamn) : '';
      setSections(
        mergeSectionDetails(
          parsed.sections.map((section) => ({
            ...defaultSection(),
            ...section,
          })),
          parsed.sections,
          fallbackAreaName
        )
      );
    }
  };

  const applySuggestionTemplate = (template = {}, sourceType = '') => {
    applyDispData(template);

    const templateOverview = getTemplateOverviewFields(template);
    const templateEndpoints = parseDriftplatsEndpoints(templateOverview.plats);
    const defaultSettings = defaultDispSettings();

    if (templateOverview.projectName) {
      setProjektNamn(templateOverview.projectName);
    }

    if (templateOverview.plats) {
      setPlats(templateOverview.plats);
      setFromDriftplats(templateEndpoints.from);
      setToDriftplats(templateEndpoints.to);
    }

    if (template?.namn) {
      setNamn(template.namn);
    }
    if (template?.nodnummer) {
      setNodnummer(template.nodnummer);
    }
    if (template?.bandriftnummer) {
      setBandriftnummer(template.bandriftnummer);
    }
    if (template?.eldriftnummer) {
      setEldriftnummer(template.eldriftnummer);
    }
    if (template?.htsmTelefon) {
      setHtsmTelefon(template.htsmTelefon);
    }
    if (template?.reservnr) {
      setReservnr(template.reservnr);
    }
    if (Array.isArray(template?.fjtklBlocks) && template.fjtklBlocks.length) {
      setFjtklBlocks(template.fjtklBlocks);
    }
    if (Array.isArray(template?.customDispPhoneLines) && template.customDispPhoneLines.length) {
      setCustomDispPhoneLines(template.customDispPhoneLines);
    }

    setDispSettings((current) => {
      const nextRubrik = templateOverview.rubrik || current.rubrik;
      const nextBanNamn = templateOverview.banNamn || current.banNamn;
      const nextVeckaOchDagar = current.veckaOchDagar || templateOverview.veckaOchDagar;
      const nextBanobjektVnr = current.banobjektVnr || templateOverview.banobjektVnr;
      const nextForplaneraCa =
        current.forplaneraCa && current.forplaneraCa !== defaultSettings.forplaneraCa
          ? current.forplaneraCa
          : templateOverview.forplaneraCa || current.forplaneraCa;
      const nextRodmarkeradeGranspunkter =
        templateOverview.rodmarkeradeGranspunkter || current.rodmarkeradeGranspunkter;
      const nextPubliktDispnamn = buildSuggestedDispFileName({
        banNamn: nextBanNamn,
        veckaOchDagar: nextVeckaOchDagar,
        banobjektVnr: nextBanobjektVnr,
      }) || templateOverview.publiktDispnamn || current.publiktDispnamn;

      return {
        ...current,
        ...(template?.dispSettings || {}),
        rubrik: nextRubrik,
        banNamn: nextBanNamn,
        veckaOchDagar: nextVeckaOchDagar,
        banobjektVnr: nextBanobjektVnr,
        forplaneraCa: nextForplaneraCa,
        rodmarkeradeGranspunkter: nextRodmarkeradeGranspunkter,
        publiktDispnamn: nextPubliktDispnamn,
      };
    });

    setDispStatus(
      sourceType === 'archive'
        ? 'Tidigare disp använd som mall. Struktur, signaler, spår och toppfält är förifyllda. Kontrollera nu den nya Blankett 31 mot mallen.'
        : 'Tidigare projekt användes som mall. Struktur, signaler, spår och toppfält är förifyllda. Kontrollera nu den nya Blankett 31 mot mallen.'
    );
  };

  const handleDispUpload = async (event) => {
    const files = Array.from(event.target.files || []).filter(
      (file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );
    setDispFiles(files);

    if (!files.length) {
      setDispStatus('');
      return;
    }

    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) {
      setDispStatus('Logga in för att tolka Disp.');
      return;
    }

    setIsParsingDisp(true);
    setDispStatus('Tolkar Disp...');

    try {
      const firstFile = files[0];
      const fileData = await readFileAsDataUrl(firstFile);
      const response = await fetch(apiUrl('/api/pdf/disp/parse'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileName: firstFile.name,
          fileData,
          blankett31Entries,
        }),
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Kunde inte tolka Disp'));
      }

      const data = await response.json();
      applyDispData(data.parsed);
      setDispFiles((current) => {
        const uploadedFile = createStoredPdfFile({
          name: firstFile.name,
          size: firstFile.size,
          fileData,
        });
        const merged = [...current, uploadedFile];
        return merged.filter(
          (file, index, array) =>
            index === array.findIndex((candidate) => candidate.name === file.name && candidate.size === file.size)
        );
      });

      if (data.parsed?.match?.matches) {
        setDispStatus('Disp inläst som utgångsmaterial. Ladda nu Blankett 31 för tider och beteckningar.');
      } else if (data.parsed?.match?.issues?.length) {
        setDispStatus(`Disp inläst som utgångsmaterial, men kontroll behövs: ${data.parsed.match.issues.join(', ')}`);
      } else {
        setDispStatus('Disp inläst som utgångsmaterial. Projekt, delområden, gränspunkter, spår och telefonnummer är uppdaterade.');
      }
    } catch (error) {
      console.error('Fel vid tolkning av Disp:', error);
      setDispStatus(error?.message || 'Disp kunde inte tolkas automatiskt.');
    } finally {
      setIsParsingDisp(false);
    }
  };

  const openExternalResource = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const saveProject = async () => {
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) {
      alert('Du är inte inloggad.');
      return;
    }

    try {
      setIsSavingProject(true);
      const newProject = {
        name: projektNamn,
        startDate: startDate || '',
        startTime: startTime || '',
        endDate: endDate || '',
        endTime: endTime || '',
        plats: plats || '',
        granspunkter: granspunktFritext || '',
        namn: namn || '',
        telefonnummer: telefonnummer || '',
        bandriftnummer: bandriftnummer || '',
        eldriftnummer: eldriftnummer || '',
        avstamt,
        objekt,
        uttagningstid,
        signatur,
        avslutaSkyddTid,
        avslutningstid,
        avslutningssignatur,
        formState: {
          nodnummer,
          bandriftnummer,
          eldriftnummer,
          htsmTelefon,
          reservnr,
          avstamt,
          objekt,
          uttagningstid,
          signatur,
          avslutaSkyddTid,
          avslutningstid,
          avslutningssignatur,
          fjtklBlocks,
          customDispPhoneLines,
          blankett31Meta,
          dispSettings,
          blankett31Entries,
          separatePlanTabsByDispBox: Boolean(separatePlanTabsByDispBox),
          primaryDispSectionEntryKeys: primaryDispEntryKeys,
          dispSectionGroups: dispSectionGroups.map((group, groupIndex) => ({
            id: group.id,
            title: group.title || `Delområdesruta ${groupIndex + 2}`,
            selectedEntryKeys: group.selectedEntryKeys || [],
            sections: (group.sections || []).map((sec) => ({
              type: sec.type,
              signal: sec.signal || sec.name || '',
              namingMode: sec.namingMode || 'LETTERS',
              displayIndex: sec.displayIndex ?? null,
              customLabel: sec.customLabel || '',
              sortOrder: sec.sortOrder ?? null,
              granspunktStart: sec.granspunktStart || '',
              granspunktSlut: sec.granspunktSlut || '',
              granspunkter: sec.granspunkter || '',
              spar: sec.spar || '',
              highlightStart: Boolean(sec.highlightStart),
              highlightEnd: Boolean(sec.highlightEnd),
              highlightStartPart: sec.highlightStartPart || '',
              highlightEndPart: sec.highlightEndPart || '',
            })),
          })),
          planJobs: normalizePlanJobs(planJobs, blankett31Entries).map((job, index) => ({
            id: job.id,
            name: job.name,
            selectedEntryKeys: job.selectedEntryKeys || [],
            primaryPlanEntryKey: job.primaryPlanEntryKey || '',
            primaryDispEntryKey: job.primaryDispEntryKey || '',
            sortOrder: job.sortOrder ?? index,
          })),
          sectionDetails: sections.map((sec) => ({
            signal: sec.signal || sec.name || '',
            displayIndex: sec.displayIndex ?? null,
            customLabel: sec.customLabel || '',
            sortOrder: sec.sortOrder ?? null,
            granspunktStart: sec.granspunktStart || '',
            granspunktSlut: sec.granspunktSlut || '',
            granspunkter: sec.granspunkter || '',
            spar: sec.spar || '',
            highlightStart: Boolean(sec.highlightStart),
            highlightEnd: Boolean(sec.highlightEnd),
            highlightStartPart: sec.highlightStartPart || '',
            highlightEndPart: sec.highlightEndPart || '',
          })),
          blankett31Files: blankett31Files.map((file) => ({
            name: file.name,
            size: file.size,
            fileData: file.fileData || '',
          })),
          dispFiles: dispFiles.map((file) => ({
            name: file.name,
            size: file.size,
            fileData: file.fileData || '',
          })),
        },
        beteckningar: beteckningar.map((b) => ({ value: b.value })),
        sections: sections.map((sec) => ({
          type: sec.type,
          name: sec.name || sec.signal || '',
          signal: sec.signal || sec.name || '',
          namingMode: sec.namingMode || 'LETTERS',
        })),
      };

      const isEditingProject = Boolean(currentProjectId);
      const response = await fetch(
        isEditingProject
          ? apiUrl(`/api/projects/${currentProjectId}`)
          : apiUrl('/api/projects'),
        {
        method: isEditingProject ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(
            response,
            isEditingProject ? 'Kunde inte uppdatera projektet' : 'Kunde inte skapa projektet'
          )
        );
      }

      const data = await response.json();
      console.log('✅ Projekt skapat med beteckningar:', data.beteckningar);

      closePreflight();
      navigate('/htsmpanel');
    } catch (err) {
      console.error('Fel vid projekt-skapande:', err);
      alert(err?.message || 'Något gick fel. Försök igen.');
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleCreateProject = async () => {
    const summary = buildProjectPreflightSummary({
      projektNamn,
      namn,
      telefonnummer,
      dispSettings,
      sections,
      blankett31Entries,
      planJobs,
      primaryDispEntryKeys,
      dispSectionGroups,
      separatePlanTabsByDispBox,
    });

    setPreflightSummary(summary);

    if (!summary.errors.length && !summary.warnings.length) {
      await saveProject();
      return;
    }

    openPreflight();
  };

  const handleDeleteProject = async () => {
    if (!currentProjectId) {
      return;
    }

    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) {
      alert('Du är inte inloggad.');
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/project/${currentProjectId}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Kunde inte ta bort projektet');
      }

      navigate('/htsmpanel');
    } catch (error) {
      console.error('Fel vid borttagning av projekt:', error);
      alert('Kunde inte ta bort projektet.');
    }
  };

  useEffect(() => {
    setPlanJobs((current) => normalizePlanJobs(current, blankett31Entries));
  }, [blankett31Entries]);

  useEffect(() => {
    const validKeys = new Set(blankett31Entries.map((entry, index) => buildPlanJobEntryKey(entry, index)));
    setPrimaryDispEntryKeys((current) => current.filter((key) => validKeys.has(key)));
    setDispSectionGroups((current) => normalizeDispSectionGroups(current, blankett31Entries));
  }, [blankett31Entries]);

  useEffect(() => {
    const nextAttention = analyzeBoundaryAttention(
      blankett31Entries,
      [sections, ...dispSectionGroups.map((group) => group?.sections || [])]
    );

    setBlankett31Attention(nextAttention);
    if (nextAttention.key !== dismissedBlankett31AttentionKey) {
      setDismissedBlankett31AttentionKey('');
    }
  }, [blankett31Entries, sections, dispSectionGroups, dismissedBlankett31AttentionKey]);

  useEffect(() => {
    if (!currentProjectId) {
      return;
    }

    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) {
      return;
    }

    const fetchProject = async () => {
      setIsLoadingProject(true);

      try {
        const response = await fetch(apiUrl(`/api/project/${currentProjectId}`), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Kunde inte hämta projektet');
        }

        const project = await response.json();

        setProjektNamn(project.name || '');
        setStartDate(project.startDate || '');
        setStartTime(project.startTime || '');
        setEndDate(project.endDate || '');
        setEndTime(project.endTime || '');
        setPlats(project.plats || '');
        {
          const endpoints = parseDriftplatsEndpoints(project.plats || '');
          setFromDriftplats(endpoints.from);
          setToDriftplats(endpoints.to);
        }
        setGranspunktFritext(project.granspunkter || '');
        setNamn(project.namn || '');
        setTelefonnummer(project.telefonnummer || '');
        setNodnummer(project.formState?.nodnummer || '');
        setBandriftnummer(project.formState?.bandriftnummer || '');
        setEldriftnummer(project.formState?.eldriftnummer || '');
        setHtsmTelefon(project.formState?.htsmTelefon || '');
        setReservnr(project.formState?.reservnr || '');
        setAvstamt(Boolean(project.formState?.avstamt));
        setObjekt(project.formState?.objekt || '');
        setUttagningstid(project.formState?.uttagningstid || '');
        setSignatur(project.formState?.signatur || '');
        setAvslutaSkyddTid(project.formState?.avslutaSkyddTid || '');
        setAvslutningstid(project.formState?.avslutningstid || '');
        setAvslutningssignatur(project.formState?.avslutningssignatur || '');
        setFjtklBlocks((project.formState?.fjtklBlocks || []).map((block) => ({
          ...defaultFjtklBlock(),
          ...block,
        })));
        setCustomDispPhoneLines(
          (project.formState?.customDispPhoneLines || []).map((line) => ({
            ...defaultCustomDispPhoneLine(),
            ...line,
          }))
        );
        setBlankett31Meta(project.formState?.blankett31Meta || {});
        setDispSettings({
          ...defaultDispSettings(),
          ...(project.formState?.dispSettings || {}),
        });
        setBlankett31Entries(
          ((project.formState?.blankett31Entries || []).length
            ? project.formState.blankett31Entries
            : [defaultBlankett31Entry()]
          ).map((entry, index, entries) => ({
            ...defaultBlankett31Entry(),
            ...entry,
            telefonnummer: entry.telefonnummer || project.telefonnummer || '',
            uttagningstid: entry.uttagningstid || (index === 0 ? project.formState?.uttagningstid || '' : ''),
            signatur: entry.signatur || (index === 0 ? project.formState?.signatur || '' : ''),
            avslutningstid:
              entry.avslutningstid || (index === entries.length - 1 ? project.formState?.avslutningstid || '' : ''),
            avslutningssignatur:
              entry.avslutningssignatur || (index === entries.length - 1 ? project.formState?.avslutningssignatur || '' : ''),
          }))
        );
        setPlanJobs(normalizePlanJobs(
          project.formState?.planJobs || [],
          (project.formState?.blankett31Entries || []).length
            ? project.formState.blankett31Entries
            : [defaultBlankett31Entry()]
        ));
        setSeparatePlanTabsByDispBox(Boolean(project.formState?.separatePlanTabsByDispBox));
        setPrimaryDispEntryKeys(
          Array.isArray(project.formState?.primaryDispSectionEntryKeys)
            ? project.formState.primaryDispSectionEntryKeys
            : []
        );
        setDispSectionGroups(
          normalizeDispSectionGroups(
            project.formState?.dispSectionGroups || [],
            (project.formState?.blankett31Entries || []).length
              ? project.formState.blankett31Entries
              : [defaultBlankett31Entry()]
          )
        );
        setBlankett31Files(
          Array.isArray(project.formState?.blankett31Files)
            ? project.formState.blankett31Files.map((file) => createStoredPdfFile(file))
            : []
        );
        setBlankett31Suggestions([]);
        setDispFiles(
          Array.isArray(project.formState?.dispFiles)
            ? project.formState.dispFiles.map((file) => createStoredPdfFile(file))
            : []
        );
        setAnteckningar(project.anteckningar || []);
        setBeteckningar(
          (project.formState?.blankett31Entries || []).length
            ? project.formState.blankett31Entries.map((entry) => ({ value: entry.beteckning || '' }))
            : project.beteckningar?.length
              ? project.beteckningar.map((b) => ({ value: b.label || '' }))
            : [{ value: '' }]
        );
        setSections(
          project.sections?.length
            ? mergeSectionDetails(
                project.sections.map((sec) => ({
                  ...defaultSection(),
                  ...sec,
                  signal: sec.name || '',
                })),
                project.formState?.sectionDetails || [],
                (project.sections?.length || 0) === 1 ? normalizeSectionAreaName(project.plats || '') : ''
              )
            : createDefaultSections()
        );
      } catch (error) {
        console.error('Fel vid hämtning av projekt i skapa-projekt:', error);
        alert('Kunde inte ladda projektet.');
      } finally {
        setIsLoadingProject(false);
      }
    };

    fetchProject();
  }, [currentProjectId]);

  const renderDispEntrySelection = (selectedEntryKeys = [], onToggle) => (
    planJobEntryOptions.length ? (
      <div className="grid gap-2 md:grid-cols-2">
        {planJobEntryOptions.map((option) => (
          <label
            key={option.key}
            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
          >
            <input
              type="checkbox"
              checked={selectedEntryKeys.includes(option.key)}
              onChange={() => onToggle(option.key)}
              className="mt-0.5 h-4 w-4 accent-slate-900"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    ) : (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
        Ladda in eller skriv in Blankett 31-poster först, så kan du koppla dem till delområdesrutan här.
      </div>
    )
  );

  const renderSectionEditorCards = ({
    sectionList = [],
    onMove,
    onInsertAfter,
    onRemove,
    onUpdateType,
    onUpdateNamingMode,
    onUpdateField,
  }) => (
    <div className="space-y-3">
      {sectionList.map((sec, i) => (
        <div key={`${sec.sortOrder ?? i}-${i}`} className="rounded-2xl border border-rose-400 bg-rose-200/70 px-5 py-4 shadow-sm shadow-rose-100/70">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-700">
              {getSectionLabel(sec, i)}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => onMove(i, -1)}
                disabled={i === 0}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Upp
              </button>
              <button
                type="button"
                onClick={() => onMove(i, 1)}
                disabled={i === sectionList.length - 1}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Ner
              </button>
              <button
                type="button"
                onClick={() => onInsertAfter(i)}
                className="rounded-full border border-slate-900 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-slate-900 hover:bg-slate-100"
              >
                Infoga efter
              </button>
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  Ta bort
                </button>
              )}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-[140px_180px_120px_160px_1fr]">
            <select
              value={sec.type}
              onChange={(e) => onUpdateType(i, e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
            >
              <option value="Linje">Linje</option>
              <option value="DP">DP</option>
              <option value="Delområde">Delområde</option>
            </select>
            <select
              value={sec.namingMode || 'LETTERS'}
              onChange={(e) => onUpdateNamingMode(i, e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
            >
              <option value="LETTERS">Bokstäver: A, B, C</option>
              <option value="NUMBERS">Siffror: 1, 2, 3</option>
            </select>
            <input
              type="number"
              min="1"
              value={sec.displayIndex ?? ''}
              onChange={(e) => onUpdateField(i, 'displayIndex', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              placeholder="Nr"
            />
            <input
              type="text"
              value={sec.customLabel || ''}
              onChange={(e) => onUpdateField(i, 'customLabel', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              placeholder="Egen etikett, ex 2B"
            />
            <input
              type="text"
              placeholder="Delområde / sträcka"
              value={sec.signal || sec.name || ''}
              onChange={(e) => onUpdateField(i, 'signal', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
            />
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <input
              type="text"
              placeholder="Gränspunkt start"
              value={sec.granspunktStart || ''}
              onChange={(e) => onUpdateField(i, 'granspunktStart', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Gränspunkt slut"
              value={sec.granspunktSlut || ''}
              onChange={(e) => onUpdateField(i, 'granspunktSlut', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Spår"
              value={sec.spar || ''}
              onChange={(e) => onUpdateField(i, 'spar', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
            />
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-rose-100 bg-rose-50/60 px-3 py-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(sec.highlightStart)}
                  onChange={(e) => onUpdateField(i, 'highlightStart', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                Rödmarkera startpunkt
              </label>
              <input
                type="text"
                placeholder="Endast röd del, ex 21"
                value={sec.highlightStartPart || ''}
                onChange={(e) => onUpdateField(i, 'highlightStartPart', e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div className="rounded-xl border border-rose-100 bg-rose-50/60 px-3 py-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(sec.highlightEnd)}
                  onChange={(e) => onUpdateField(i, 'highlightEnd', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                Rödmarkera slutpunkt
              </label>
              <input
                type="text"
                placeholder="Endast röd del, ex 22"
                value={sec.highlightEndPart || ''}
                onChange={(e) => onUpdateField(i, 'highlightEndPart', e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Etikett: {getSectionLabel(sec, i)}. Lämna "Egen etikett" tom för automatisk numrering eller bokstav.
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Gränspunkter: {sec.granspunkter || [sec.granspunktStart, sec.granspunktSlut].filter(Boolean).join(' - ') || 'Ej angivet'}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-black">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 right-0 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <Header />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 pb-16 pt-24">
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-700">Skapa projekt</p>
              <h1 className="mt-2 text-3xl font-semibold text-black">
                {currentProjectId ? 'Redigera dispositionsarbetsplan' : 'Ny dispositionsarbetsplan'}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Samla allt på en plats – från FJTKL till delområden. Du kan alltid justera senare.
              </p>
            </div>
            <button
              onClick={handleCreateProject}
              disabled={isLoadingProject}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
            >
              {currentProjectId ? 'Spara projekt' : 'Skapa projekt'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-6 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 text-white shadow-xl shadow-slate-900/15">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">Import & utgångspunkt</p>
                <h2 className="mt-2 text-lg font-semibold">Bygg projektet smart</h2>
                <p className="mt-1.5 text-xs leading-5 text-slate-300">
                  Börja med Blankett 31 och låt Railworker föreslå tidigare underlag när det finns en säker träff.
                </p>
                <input
                  ref={blankett31InputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  multiple
                  onChange={handleBlankett31Upload}
                  className="hidden"
                />
                <input
                  ref={dispInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  multiple
                  onChange={handleDispUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => blankett31InputRef.current?.click()}
                  disabled={isParsingBlankett31}
                  className="mt-4 w-full rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
                >
                  {isParsingBlankett31 ? 'Tolkar Blankett 31...' : 'Blankett 31'}
                </button>
                {blankett31Status && (
                  <div className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-[11px] text-slate-100">
                    {blankett31Status}
                  </div>
                )}
                {blankett31Suggestions.length > 0 && (
                  <div className="mt-3 rounded-2xl border border-emerald-300/25 bg-emerald-500/10 p-3 text-xs text-emerald-50">
                    <p className="font-semibold uppercase tracking-[0.2em] text-emerald-200">Liknande tidigare underlag</p>
                    <p className="mt-1 text-[11px] text-emerald-100/75">
                      Förslagen är stöd, inte facit. Kontrollera alltid signaler, spår och tider innan du utgår från en äldre disp.
                    </p>
                    <div className="mt-2 space-y-2">
                      {blankett31Suggestions.map((suggestion) => (
                        <div key={suggestion.suggestionKey || `${suggestion.projectId || 'archive'}-${suggestion.candidateId}`} className="rounded-xl bg-black/10 px-3 py-2">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-semibold text-white">{suggestion.projectName || 'Tidigare projekt'}</span>
                          </div>
                          <p className="mt-1 text-[11px] text-emerald-100/90">
                            {suggestion.projectPlats || 'Plats saknas'} • {suggestion.normalizedGranspunkt}
                          </p>
                          {suggestion.matchType ? (
                            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                              {suggestion.matchType}
                            </p>
                          ) : null}
                          {suggestion.matchSummary ? (
                            <p className="mt-1 text-[10px] text-emerald-100/80">
                              {suggestion.matchSummary}
                            </p>
                          ) : null}
                          {suggestion.sourceType === 'archive' && suggestion.archiveDispPath ? (
                            <p className="mt-1 text-[10px] text-emerald-100/75">
                              Arkivdisp hittad i: {suggestion.archiveDispPath.split('/').slice(-3).join(' / ')}
                            </p>
                          ) : null}
                          {suggestion.reviewNote ? (
                            <p className="mt-1 text-[10px] font-medium text-amber-100/95">
                              {suggestion.reviewNote}
                            </p>
                          ) : null}
                          {(suggestion.projectId || suggestion.archiveDispPath) ? (
                            <div className="mt-2">
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    const key = suggestion.suggestionKey || `${suggestion.projectId || 'archive'}-${suggestion.candidateId}`;
                                    setApplyingSuggestionKey(key);
                                    const response = await fetch(apiUrl('/api/blankett31-registry/use-suggestion'), {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${token}`,
                                      },
                                      body: JSON.stringify({
                                        projectId: suggestion.projectId || null,
                                        archiveDispPath: suggestion.archiveDispPath || '',
                                      }),
                                    });

                                    if (!response.ok) {
                                      throw new Error(await getApiErrorMessage(response, 'Kunde inte använda den gamla dispen som mall.'));
                                    }

                                    const data = await response.json();
                                    applySuggestionTemplate(data.template, data.sourceType);
                                  } catch (error) {
                                    window.alert(error.message || 'Kunde inte använda den gamla dispen som mall.');
                                  } finally {
                                    setApplyingSuggestionKey('');
                                  }
                                }}
                                className="rounded-full border border-amber-200/35 bg-amber-100/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-50 transition hover:bg-amber-100/15"
                              >
                                {applyingSuggestionKey === (suggestion.suggestionKey || `${suggestion.projectId || 'archive'}-${suggestion.candidateId}`) ? 'Använder…' : 'Använd denna'}
                              </button>
                            </div>
                          ) : null}
                          {(suggestion.archiveDispPath || suggestion.archiveBlankettPath) ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {suggestion.archiveDispPath ? (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const previewWindow = openPendingPdfWindow();
                                    try {
                                      setOpeningArchiveSuggestionKey(`${suggestion.suggestionKey}:disp`);
                                      await openArchivePdfFile({
                                        filePath: suggestion.archiveDispPath,
                                        token,
                                        previewWindow,
                                      });
                                    } catch (error) {
                                      window.alert(error.message || 'Kunde inte öppna arkivdispen.');
                                    } finally {
                                      setOpeningArchiveSuggestionKey('');
                                    }
                                  }}
                                  className="rounded-full border border-emerald-200/35 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white/15"
                                >
                                  {openingArchiveSuggestionKey === `${suggestion.suggestionKey}:disp` ? 'Öppnar…' : 'Öppna disp'}
                                </button>
                              ) : null}
                              {suggestion.archiveBlankettPath ? (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const previewWindow = openPendingPdfWindow();
                                    try {
                                      setOpeningArchiveSuggestionKey(`${suggestion.suggestionKey}:31`);
                                      await openArchivePdfFile({
                                        filePath: suggestion.archiveBlankettPath,
                                        token,
                                        previewWindow,
                                      });
                                    } catch (error) {
                                      window.alert(error.message || 'Kunde inte öppna Blankett 31-filen.');
                                    } finally {
                                      setOpeningArchiveSuggestionKey('');
                                    }
                                  }}
                                  className="rounded-full border border-white/20 bg-black/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-50 transition hover:bg-black/20"
                                >
                                  {openingArchiveSuggestionKey === `${suggestion.suggestionKey}:31` ? 'Öppnar…' : 'Öppna 31'}
                                </button>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {blankett31Attention.checks.length > 0 && dismissedBlankett31AttentionKey !== blankett31Attention.key && (
                  <div className="mt-3 rounded-2xl border border-amber-300/35 bg-amber-400/10 p-3 text-xs text-amber-50">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold uppercase tracking-[0.2em] text-amber-200">Kontrollera extra noga</p>
                        <p className="mt-1 text-[11px] text-amber-100/85">
                          Den här Blankett 31 ser ut att avvika från ett vanligt driftplats - linje - driftplats-läge.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDismissedBlankett31AttentionKey(blankett31Attention.key)}
                        className="shrink-0 rounded-full border border-amber-200/35 bg-black/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-100 transition hover:bg-black/20"
                      >
                        Dölj
                      </button>
                    </div>
                    <div className="mt-3 space-y-2">
                      {blankett31Attention.checks.map((check) => (
                        <div key={check.code} className="rounded-xl bg-black/10 px-3 py-2">
                          <p className="font-semibold text-amber-50">{check.title}</p>
                          <p className="mt-1 text-[11px] leading-5 text-amber-100/85">{check.text}</p>
                        </div>
                      ))}
                    </div>
                    {blankett31Attention.sourceRef?.url ? (
                      <div className="mt-3 rounded-xl border border-amber-200/20 bg-black/10 px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200">Källa</p>
                        <p className="mt-1 text-[11px] leading-5 text-amber-100/85">
                          {blankett31Attention.sourceRef.label}
                        </p>
                        <button
                          type="button"
                          onClick={() => openExternalResource(blankett31Attention.sourceRef.url)}
                          className="mt-2 rounded-full border border-amber-200/35 bg-black/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-100 transition hover:bg-black/20"
                        >
                          Öppna källa i linjeboken
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
                {blankett31Files.length > 0 && (
                  <div className="mt-3 space-y-2 text-xs text-slate-100">
                    {blankett31Files.map((file) => (
                      <div key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-3 rounded-xl bg-white/10 px-3 py-2">
                        <div className="min-w-0">
                          <span className="block truncate">{file.name}</span>
                          {!hasStoredPdfContent(file) ? (
                            <span className="mt-1 block text-[10px] text-amber-200">
                              Äldre fil. Ladda in den igen en gång för att kunna öppna den härifrån.
                            </span>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (hasStoredPdfContent(file)) {
                              const previewWindow = openPendingPdfWindow();
                              if (!openStoredPdfFile(file, previewWindow)) {
                                window.alert('Webbläsaren blockerade öppningen av PDF-filen.');
                              }
                              return;
                            }

                            setBlankett31Status('Välj samma Blankett 31 igen, så sparas den för öppning nästa gång.');
                            blankett31InputRef.current?.click();
                          }}
                          className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest transition ${
                            hasStoredPdfContent(file)
                              ? 'border-white/25 bg-white/10 text-white hover:bg-white/20'
                              : 'border-amber-300/40 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20'
                          }`}
                        >
                          {hasStoredPdfContent(file) ? 'Öppna' : 'Ladda in igen'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {dispFiles.length > 0 && (
                  <div className="mt-3 space-y-2 text-xs text-slate-100">
                    {dispFiles.map((file) => (
                      <div key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-3 rounded-xl bg-white/10 px-3 py-2">
                        <div className="min-w-0">
                          <span className="block truncate">{file.name}</span>
                          {!hasStoredPdfContent(file) ? (
                            <span className="mt-1 block text-[10px] text-amber-200">
                              Äldre fil. Läs in den igen en gång för att kunna öppna den härifrån.
                            </span>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (hasStoredPdfContent(file)) {
                              const previewWindow = openPendingPdfWindow();
                              if (!openStoredPdfFile(file, previewWindow)) {
                                window.alert('Webbläsaren blockerade öppningen av PDF-filen.');
                              }
                              return;
                            }

                            setDispStatus('Välj samma DISP igen, så sparas den för öppning nästa gång.');
                            dispInputRef.current?.click();
                          }}
                          className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest transition ${
                            hasStoredPdfContent(file)
                              ? 'border-white/25 bg-white/10 text-white hover:bg-white/20'
                              : 'border-amber-300/40 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20'
                          }`}
                        >
                          {hasStoredPdfContent(file) ? 'Öppna' : 'Läs in igen'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {dispStatus && (
                  <div className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-[11px] text-slate-100">
                    {dispStatus}
                  </div>
                )}
                <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">Snabblänkar</p>
                  <div className="mt-3 space-y-2">
                    <button
                      type="button"
                      onClick={() => openExternalResource(TELEFONKATALOG_URL)}
                      className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                    >
                      Telefonkatalog
                    </button>
                    <button
                      type="button"
                      onClick={() => openExternalResource(NJDB_URL)}
                      className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                    >
                      NJDB
                    </button>
                    <button
                      type="button"
                      onClick={() => openExternalResource(TRAFIKVERKET_BLANKETTER_URL)}
                      className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                    >
                      Trafikverket
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Arbetsordning</p>
              <ol className="mt-3 space-y-2 text-sm text-slate-600">
                <li className="rounded-xl bg-slate-50 px-3 py-2"><span className="font-semibold text-slate-900">1.</span> Bygg från Blankett 31 eller tidigare disp.</li>
                <li className="rounded-xl bg-slate-50 px-3 py-2"><span className="font-semibold text-slate-900">2.</span> Kontrollera FJTKL, jobb och telefonnummer.</li>
                <li className="rounded-xl bg-slate-50 px-3 py-2"><span className="font-semibold text-slate-900">3.</span> Finjustera delområden innan du sparar projektet.</li>
              </ol>
            </div>

          </aside>

          <main className="space-y-6">
            <section className="rounded-2xl border border-blue-400 bg-gradient-to-br from-blue-100 via-white to-blue-200/80 p-6 shadow-sm shadow-blue-100/60">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-black">Projektöversikt</h2>
                  <p className="text-xs text-slate-500">Namngivning och tidsram</p>
                </div>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  01
                </span>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-900">Projektnamn</label>
                  <input
                    type="text"
                    value={projektNamn}
                    onChange={(e) => setProjektNamn(e.target.value)}
                    placeholder="Ex. Rååbanan nattarbete"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-900">Driftplats/er</label>
                  <div className="mb-3 grid gap-3 xl:grid-cols-[1fr_1fr_auto]">
                    <input
                      type="text"
                      value={fromDriftplats}
                      onChange={(e) => {
                        setFromDriftplats(e.target.value);
                        if (driftplatsStatus) {
                          setDriftplatsStatus('');
                        }
                        if (sectionStatus) {
                          setSectionStatus('');
                        }
                      }}
                      placeholder="Från driftplats"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={toDriftplats}
                      onChange={(e) => {
                        setToDriftplats(e.target.value);
                        if (driftplatsStatus) {
                          setDriftplatsStatus('');
                        }
                        if (sectionStatus) {
                          setSectionStatus('');
                        }
                      }}
                      placeholder="Till driftplats"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleBuildFromEndpoints}
                      disabled={isResolvingDriftplatser || isResolvingSections || !fromDriftplats.trim() || !toDriftplats.trim()}
                      className="rounded-xl border border-slate-900 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                    >
                      {isResolvingDriftplatser || isResolvingSections ? 'Bygger...' : 'Bygg från start/slut'}
                    </button>
                  </div>
                  <div className="flex flex-col gap-3 xl:flex-row">
                    <input
                      type="text"
                      value={plats}
                      onChange={(e) => {
                        setPlats(e.target.value);
                        if (driftplatsStatus) {
                          setDriftplatsStatus('');
                        }
                        if (sectionStatus) {
                          setSectionStatus('');
                        }
                      }}
                      placeholder="Ex. Kattarp, Ängelholm"
                      className="w-full flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleExpandDriftplatser}
                      disabled={isResolvingDriftplatser || !plats.trim()}
                      className="rounded-xl border border-slate-900 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                    >
                      {isResolvingDriftplatser ? 'Soker...' : 'Hamta mellanliggande'}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Skriv helst start och slut ovanför så kan Railworker bygga hela raden, signalerna och delområdena automatiskt.
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Skriv start och slut med kommatecken, till exempel `Kattarp, Ängelholm`, och lat sedan appen fylla pa raden.
                  </p>
                  {driftplatsStatus ? (
                    <p className="mt-2 text-xs font-medium text-slate-600">{driftplatsStatus}</p>
                  ) : null}
                </div>
              </div>
              <div className="mt-5 border-t border-slate-200 pt-6">
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-black">Disp-inställningar</h3>
                  <p className="text-xs text-slate-500">
                    Rubrik och sidhuvud för den färdiga dispositionsarbetsplanen.
                  </p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2 items-start auto-rows-auto">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-900">
                      Rubrik efter "Dispositionsarbetsplan"
                    </label>
                    <input
                      type="text"
                      value={dispSettings.rubrik}
                      onChange={(e) => setDispSettings((current) => ({ ...current, rubrik: e.target.value }))}
                      placeholder="Ex. Projekt Hbgb-Tp"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-900">PDF-filnamn</label>
                    <input
                      type="text"
                      value={dispSettings.publiktDispnamn}
                      onChange={(e) => setDispSettings((current) => ({ ...current, publiktDispnamn: e.target.value }))}
                      placeholder="Ex. Disp Rååbanan"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Används bara för själva PDF-filnamnet. Namnet utåt i appen hämtas från Projektnamn.
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-900">Banans namn</label>
                    <input
                      type="text"
                      value={dispSettings.banNamn}
                      onChange={(e) => setDispSettings((current) => ({ ...current, banNamn: e.target.value }))}
                      placeholder="Ex. Rååbanan"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-900">Vecka / dagar / nätter</label>
                    <input
                      type="text"
                      value={dispSettings.veckaOchDagar}
                      onChange={(e) => setDispSettings((current) => ({ ...current, veckaOchDagar: e.target.value }))}
                      placeholder="Ex. V13 Tis, Lör-Sön"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-900">Versionsnummer</label>
                    <input
                      type="text"
                      value={dispSettings.versionsnummer}
                      onChange={(e) => setDispSettings((current) => ({ ...current, versionsnummer: e.target.value }))}
                      placeholder="Ex. 1/MA11"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-900">Banobjekt-Vnr</label>
                    <input
                      type="text"
                      value={dispSettings.banobjektVnr}
                      onChange={(e) => setDispSettings((current) => ({ ...current, banobjektVnr: e.target.value }))}
                      placeholder="Ex. 17096-1"
                      className="min-h-[56px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-900">Giltig tillägg</label>
                    <input
                      type="text"
                      value={dispSettings.giltigTillagg || ''}
                      onChange={(e) => setDispSettings((current) => ({ ...current, giltigTillagg: e.target.value }))}
                      placeholder="Valfritt tillägg till Giltig i sidhuvudet"
                      className="min-h-[56px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 focus:border-slate-900 focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Lägg bara till text här om Giltig-raden behöver kompletteras. Standardvärdet fylls fortfarande i automatiskt.
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-900">Förplanering</label>
                    <input
                      type="text"
                      value={dispSettings.forplaneraCa}
                      onChange={(e) => setDispSettings((current) => ({ ...current, forplaneraCa: e.target.value }))}
                      placeholder="Ex. ca 1 tim innan start"
                      className="min-h-[56px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-semibold text-slate-900">Rödmarkera gränspunkter</label>
                    <input
                      type="text"
                      value={dispSettings.rodmarkeradeGranspunkter}
                      onChange={(e) => setDispSettings((current) => ({ ...current, rodmarkeradeGranspunkter: e.target.value }))}
                      placeholder="Ex. Hb103, Tp33, Tp82"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="rounded-2xl border border-indigo-400 bg-indigo-200/70 p-4 shadow-sm shadow-indigo-100/70">
                      <p className="text-sm font-semibold text-slate-900">Kapitel 1 i dispen</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Styr hur rutan med tider och delområden ska visas i den färdiga dispositionsarbetsplanen.
                      </p>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={Boolean(dispSettings.visaBeteckningarKapitel1)}
                            onChange={(e) => setDispSettings((current) => ({
                              ...current,
                              visaBeteckningarKapitel1: e.target.checked,
                            }))}
                            className="mt-1"
                          />
                          <span>
                            <span className="block font-semibold">Visa beteckningar</span>
                            <span className="mt-1 block text-xs text-slate-500">
                              Visar kolumnen med Blankett 31-beteckningar i kapitel 1.
                            </span>
                          </span>
                        </label>
                        <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={Boolean(dispSettings.komprimeraLikaTiderKapitel1)}
                            onChange={(e) => setDispSettings((current) => ({
                              ...current,
                              komprimeraLikaTiderKapitel1: e.target.checked,
                            }))}
                            className="mt-1"
                          />
                          <span>
                            <span className="block font-semibold">Komprimera lika tider</span>
                            <span className="mt-1 block text-xs text-slate-500">
                              Slår ihop upprepade tider till en kompakt rad, till exempel `Mån - Sön 09.00 - 15.00`.
                            </span>
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 border-t border-slate-200 pt-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-black">FJTKL</h3>
                    <p className="text-xs text-slate-500">Ansvarig kontakt och nödnummer</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={addCustomDispPhoneLine}
                      className="rounded-full border border-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-900 hover:bg-white/80"
                    >
                      + Extra TKL-rad
                    </button>
                    <button
                      type="button"
                      onClick={addFjtklBlock}
                      className="rounded-full border border-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-900 hover:bg-white/80"
                    >
                      + Ny FJTKL
                    </button>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                      Kontakt
                    </span>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-900">FJTKL namn</label>
                    <input
                      type="text"
                      list="fjtkl-name-options"
                      value={namn}
                      onChange={(e) => {
                        const nextValue = e.target.value;
                        applyDistrictDefaultsToPrimaryFjtkl(nextValue, namn);
                        setNamn(nextValue);
                      }}
                      placeholder="Namn"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-900">FJTKL telefon</label>
                    <input
                      type="text"
                      list="fjtkl-phone-options"
                      value={telefonnummer}
                      onChange={(e) => setTelefonnummer(e.target.value)}
                      placeholder="Telefonnummer"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Huvudnummer. Anvands som projektets vanliga FJTKL-nummer och som fallback i disp/planka nar ingen
                      Blankett 31-post styr ett eget nummer.
                    </p>
                    <button
                      type="button"
                      onClick={applyCatalogMatchToProject}
                      className="mt-2 rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Matcha från telefonkatalog
                    </button>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-900">Nödnummer</label>
                    <input
                      type="text"
                      list="emergency-phone-options"
                      value={nodnummer}
                      onChange={(e) => setNodnummer(e.target.value)}
                      placeholder="Nödnummer"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-900">Bandriftnummer</label>
                    <input
                      type="text"
                      list="bandrift-phone-options"
                      value={bandriftnummer}
                      onChange={(e) => setBandriftnummer(e.target.value)}
                      placeholder="Bandriftnummer"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-900">Eldriftnummer</label>
                    <input
                      type="text"
                      list="eldrift-phone-options"
                      value={eldriftnummer}
                      onChange={(e) => setEldriftnummer(e.target.value)}
                      placeholder="Eldriftnummer"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-900">HTSM telefon</label>
                    <select
                      value={htsmTelefon}
                      onChange={(e) => {
                        const nextValue = e.target.value;
                        setHtsmTelefon(nextValue);
                        if (nextValue && reservnr === nextValue) {
                          setReservnr('');
                        }
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    >
                      <option value="">Välj HTSM telefon</option>
                      {availableHtsmPhoneOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-900">Reservnr</label>
                    <select
                      value={reservnr}
                      onChange={(e) => {
                        const nextValue = e.target.value;
                        setReservnr(nextValue);
                        if (nextValue && htsmTelefon === nextValue) {
                          setHtsmTelefon('');
                        }
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    >
                      <option value="">Välj reservnr</option>
                      {availableReservnrOptions.map((option) => (
                        <option key={`reserv-${option}`} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {customDispPhoneLines.length > 0 && (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-white/70 p-4">
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-slate-900">Extra TKL-rader i kapitel 13</h4>
                      <p className="mt-1 text-xs text-slate-500">
                        Skriv exakt den text som ska synas på dispen, till exempel <span className="font-semibold text-slate-700">Malmö Ätk 010-127 12 42</span>.
                      </p>
                    </div>
                    <div className="space-y-3">
                      {customDispPhoneLines.map((line, index) => (
                        <div key={`custom-disp-phone-${index}`} className="flex flex-col gap-2 md:flex-row md:items-center">
                          <input
                            type="text"
                            value={line.value || ''}
                            onChange={(e) => updateCustomDispPhoneLine(index, e.target.value)}
                            placeholder="Ex. Malmö Ätk 010-127 12 42"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeCustomDispPhoneLine(index)}
                            className="shrink-0 rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-rose-600 hover:bg-rose-50"
                          >
                            Ta bort
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {blankett31Entries.length > 0 && (
                <div className="mt-6 border-t border-slate-200 pt-6">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-black">Blankett 31 poster</h3>
                    <p className="text-xs text-slate-500">
                      Alla dagar och tider som lästs in från Blankett 31. Telefonnummer pa varje post foljer med till
                      dispens telefonkapitel och planka nar posten anvands.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {blankett31Entries.map((entry, index) => (
                      <div key={`${entry.beteckning || 'post'}-${index}`} className="rounded-2xl border border-amber-400 bg-amber-200/75 p-4 shadow-sm shadow-amber-100/80">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                            Post {index + 1}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeBlankett31Entry(index)}
                            className="rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                          >
                            Ta bort post
                          </button>
                        </div>
                        <div className="grid gap-3 md:grid-cols-6">
                          <input
                            type="text"
                            value={entry.beteckning || ''}
                            onChange={(e) => updateBlankett31Entry(index, 'beteckning', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                            placeholder={`Beteckning ${index + 1}`}
                          />
                          <input
                            type="text"
                            value={entry.granspunkt || ''}
                            onChange={(e) => updateBlankett31Entry(index, 'granspunkt', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none md:col-span-2"
                            placeholder={`Gränspunkt ${index + 1}`}
                          />
                          <input
                            type="date"
                            value={entry.startDate || ''}
                            onChange={(e) => updateBlankett31Entry(index, 'startDate', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                          />
                          <input
                            type="time"
                            value={entry.startTime || ''}
                            onChange={(e) => updateBlankett31Entry(index, 'startTime', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                          />
                          <input
                            type="date"
                            value={entry.endDate || ''}
                            onChange={(e) => updateBlankett31Entry(index, 'endDate', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                          />
                          <input
                            type="time"
                            value={entry.endTime || ''}
                            onChange={(e) => updateBlankett31Entry(index, 'endTime', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                          />
                        </div>
                        <div className="mt-3 grid gap-3 md:grid-cols-3">
                          <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                              FJTKL telefon
                            </label>
                            <select
                              value={entry.telefonnummer || ''}
                              onChange={(e) => updateBlankett31Entry(index, 'telefonnummer', e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                            >
                              <option value="">Välj telefonnummer</option>
                              {availableBlankett31PhoneOptions.map((option) => (
                                <option key={`${index}-${option}`} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                            <p className="mt-2 text-[11px] text-slate-500">
                              Detta nummer foljer med just den har Blankett 31-posten till disp och planka.
                            </p>
                            <button
                              type="button"
                              onClick={() => applyCatalogMatchToEntry(index)}
                              className="mt-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              Matcha från katalog
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 border-t border-slate-200 pt-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-black">Jobb / planka</h3>
                    <p className="text-xs text-slate-500">
                      Varje jobb blir senare en egen planka och Excel-flik. Ett jobb kan ha en eller flera Blankett 31.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addPlanJob}
                    className="rounded-full border border-slate-900 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-900 hover:bg-slate-50"
                  >
                    Nytt jobb
                  </button>
                </div>
                <label className="mb-4 flex items-start gap-3 rounded-2xl border border-emerald-300 bg-white px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={separatePlanTabsByDispBox}
                    onChange={(e) => setSeparatePlanTabsByDispBox(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-slate-900"
                  />
                  <span>
                    <span className="block font-semibold text-slate-900">Separera delområdesrutor till egna flikar</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      Låt varje delområdesruta bli en egen Excel-flik när tider och gränspunkter skiljer sig. Lämna av om allt ska samlas som vanligt.
                    </span>
                  </span>
                </label>
                <div className="space-y-3">
                  {planJobs.map((job, index) => (
                    <div key={job.id || index} className="rounded-2xl border border-emerald-400 bg-emerald-200/75 p-4 shadow-sm shadow-emerald-100/80">
                      {(() => {
                        const selectedOptions = getPlanJobSelectedOptions(job);
                        return (
                          <>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                          Dag/Natt {index + 1}
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => movePlanJob(index, -1)}
                            disabled={index === 0}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Upp
                          </button>
                          <button
                            type="button"
                            onClick={() => movePlanJob(index, 1)}
                            disabled={index === planJobs.length - 1}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Ner
                          </button>
                          {planJobs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePlanJob(index)}
                              className="rounded-full border border-rose-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-rose-600 hover:bg-rose-50"
                            >
                              Ta bort
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid gap-3 lg:grid-cols-[280px_1fr]">
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-slate-700">Fliknamn</label>
                          <input
                            type="text"
                            value={job.name || ''}
                            onChange={(e) => updatePlanJobField(index, 'name', e.target.value)}
                            placeholder="Ex. Dag/Natt 1 eller HBG"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                          />
                          <p className="mt-2 text-xs text-slate-500">
                            Namnet används senare som plansida och Excel-flik.
                          </p>
                          <div className="mt-4 space-y-3">
                            <div>
                              <label className="mb-1 block text-sm font-semibold text-slate-700">Visas i planka</label>
                              <select
                                value={job.primaryPlanEntryKey || ''}
                                onChange={(e) => updatePlanJobField(index, 'primaryPlanEntryKey', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                              >
                                <option value="">Välj beteckning</option>
                                {selectedOptions.map((option) => (
                                  <option key={`plan-${job.id}-${option.key}`} value={option.key}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-semibold text-slate-700">Visas i DISP</label>
                              <select
                                value={job.primaryDispEntryKey || ''}
                                onChange={(e) => updatePlanJobField(index, 'primaryDispEntryKey', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                              >
                                <option value="">Välj beteckning</option>
                                {selectedOptions.map((option) => (
                                  <option key={`disp-${job.id}-${option.key}`} value={option.key}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <p className="mt-2 text-xs text-slate-500">
                                Dispen visar bara den valda beteckningen för jobbet, även om plankan visar flera.
                              </p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">Beteckningar i jobbet</label>
                          {planJobEntryOptions.length ? (
                            <div className="grid gap-2 md:grid-cols-2">
                              {planJobEntryOptions.map((option) => (
                                <label
                                  key={`${job.id}-${option.key}`}
                                  className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                                >
                                  <input
                                    type="checkbox"
                                    checked={(job.selectedEntryKeys || []).includes(option.key)}
                                    onChange={() => togglePlanJobEntry(index, option.key)}
                                    className="mt-0.5 h-4 w-4 accent-slate-900"
                                  />
                                  <span>{option.label}</span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                              Ladda in eller skriv in Blankett 31-poster först, så kan du koppla dem till jobbet här.
                            </div>
                          )}
                          <p className="mt-2 text-xs text-slate-500">
                            Samma beteckning kan ligga i flera jobb om en Blankett 31 gäller flera nätter.
                          </p>
                        </div>
                      </div>
                          </>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-6">
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-black">Gränspunkter</h3>
                  <p className="text-xs text-slate-500">Egen ruta för kompletterande gränspunkter</p>
                </div>
                <textarea
                  value={granspunktFritext}
                  onChange={(e) => setGranspunktFritext(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                  placeholder="Ange gränspunkter här vid behov"
                />
              </div>
            </section>

            {fjtklBlocks.map((block, index) => (
              <section key={index}>
                <div className="rounded-2xl border border-sky-400 bg-gradient-to-br from-sky-100 via-white to-sky-200/80 p-6 shadow-sm shadow-sky-100/60">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-black">FJTKL</h2>
                      <p className="text-xs text-slate-500">Ansvarig kontakt</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => removeFjtklBlock(index)}
                        className="rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-rose-600 hover:bg-rose-50"
                      >
                        Ta bort
                      </button>
                      <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                        Extra FJTKL
                      </span>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-900">FJTKL namn</label>
                      <input
                        type="text"
                        list="fjtkl-name-options"
                        value={block.namn}
                        onChange={(e) => updateFjtklBlock(index, 'namn', e.target.value)}
                        placeholder="Namn"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-900">FJTKL telefon</label>
                      <input
                        type="text"
                        list="fjtkl-phone-options"
                        value={block.telefonnummer}
                        onChange={(e) => updateFjtklBlock(index, 'telefonnummer', e.target.value)}
                        placeholder="Telefonnummer"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-900">Nödnummer</label>
                      <input
                        type="text"
                        list="emergency-phone-options"
                        value={block.nodnummer}
                        onChange={(e) => updateFjtklBlock(index, 'nodnummer', e.target.value)}
                        placeholder="Nödnummer"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-900">Bandriftnummer</label>
                      <input
                        type="text"
                        list="bandrift-phone-options"
                        value={block.bandriftnummer}
                        onChange={(e) => updateFjtklBlock(index, 'bandriftnummer', e.target.value)}
                        placeholder="Bandriftnummer"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-900">Eldriftnummer</label>
                      <input
                        type="text"
                        list="eldrift-phone-options"
                        value={block.eldriftnummer}
                        onChange={(e) => updateFjtklBlock(index, 'eldriftnummer', e.target.value)}
                        placeholder="Eldriftnummer"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-900">Avslutningstid</label>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={block.avslutningstid}
                          onChange={(e) => updateFjtklBlock(index, 'avslutningstid', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm focus:border-slate-900 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateFjtklBlock(index, 'avslutningstid', getCurrentTime())}
                          className="shrink-0 rounded-xl border border-slate-200 px-3 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Nu
                        </button>
                      </div>
                    </div>
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 md:col-span-2 xl:col-span-1 xl:self-end">
                      <input
                        type="checkbox"
                        checked={block.avstamt}
                        onChange={(e) => updateFjtklBlock(index, 'avstamt', e.target.checked)}
                        className="h-4 w-4 accent-slate-900"
                      />
                      Avstämt
                    </label>
                  </div>
                </div>
              </section>
            ))}

            <section className="rounded-2xl border border-rose-400 bg-gradient-to-br from-rose-100 via-white to-rose-200/70 p-6 shadow-sm shadow-rose-100/60">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-black">Delområden</h2>
                  <p className="text-xs text-slate-500">Skapa DP/Linje och ange signaltext. Lägg bara till fler delområdesrutor när olika Blankett 31-poster ska bli egna kapitel 1-rutor i dispen.</p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handlePopulateSectionsFromSignals}
                    disabled={isResolvingSections || !plats.trim()}
                    className="rounded-full border border-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                  >
                    {isResolvingSections ? 'Soker signaler...' : 'Fyll från signaler'}
                  </button>
                  <button
                    onClick={addSection}
                    className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white"
                  >
                    Lägg till delområde
                  </button>
                  <button
                    type="button"
                    onClick={addDispSectionGroup}
                    className="rounded-full border border-rose-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-rose-700 hover:bg-rose-50"
                  >
                    Flera delområdesrutor
                  </button>
                </div>
              </div>
              <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-rose-200 bg-white/80 px-4 py-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">Text i DISP-rutor</p>
                  <p className="mt-1 text-xs text-slate-600">
                    Välj om gränspunkter ska skrivas med fulla driftplatsnamn eller bara signalbeteckningar i alla delområdesrutor.
                  </p>
                </div>
                <div className="inline-flex rounded-full border border-rose-200 bg-rose-50 p-1">
                  <button
                    type="button"
                    onClick={() => setDispSettings((prev) => ({ ...prev, visaFullaGranspunkterKapitel1: true }))}
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition ${
                      dispSettings.visaFullaGranspunkterKapitel1 !== false
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-rose-700 hover:bg-white'
                    }`}
                  >
                    Fulla namn
                  </button>
                  <button
                    type="button"
                    onClick={() => setDispSettings((prev) => ({ ...prev, visaFullaGranspunkterKapitel1: false }))}
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition ${
                      dispSettings.visaFullaGranspunkterKapitel1 === false
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-rose-700 hover:bg-white'
                    }`}
                  >
                    Signalbeteckningar
                  </button>
                </div>
              </div>
              {sectionStatus ? (
                <p className="mb-4 text-xs font-medium text-slate-600">{sectionStatus}</p>
              ) : null}

              <div className="rounded-2xl border border-rose-300 bg-white/70 p-4 shadow-sm shadow-rose-100/50">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Delområdesruta 1 i DISP</h3>
                    <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-600">
                      Den vanliga rutan i dispen. Välj vilka Blankett 31-poster som ska styra tider, dagar och yttre gränspunkter för just den här rutan.
                    </p>
                  </div>
                  <div className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    Vanligast: en enda delområdesruta för hela dispen.
                  </div>
                </div>
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Blankett 31 som hör till ruta 1</p>
                  {renderDispEntrySelection(primaryDispEntryKeys, togglePrimaryDispEntryKey)}
                </div>
                <div className="mt-4">
                  {renderSectionEditorCards({
                    sectionList: sections,
                    onMove: moveSection,
                    onInsertAfter: insertSectionAfter,
                    onRemove: removeSection,
                    onUpdateType: updateSectionType,
                    onUpdateNamingMode: updateSectionNamingMode,
                    onUpdateField: updateSectionField,
                  })}
                </div>
              </div>

              {dispSectionGroups.length > 0 && (
                <div className="mt-6 space-y-4">
                  {dispSectionGroups.map((group, groupIndex) => {
                    const boundaries = getOuterBoundariesForEntryKeys(group.selectedEntryKeys);
                    return (
                      <div
                        key={group.id}
                        className="rounded-2xl border border-rose-300 bg-white/70 p-4 shadow-sm shadow-rose-100/50"
                      >
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div className="flex-1">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                              <div className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
                                Extra disp-ruta {groupIndex + 2}
                              </div>
                              <input
                                type="text"
                                value={group.title || ''}
                                onChange={(e) => updateDispSectionGroupField(group.id, 'title', e.target.value)}
                                placeholder={`Delområdesruta ${groupIndex + 2}`}
                                className="w-full max-w-sm rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                              />
                            </div>
                            <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-600">
                              Använd en extra ruta när samma dispositionsarbetsplan ska innehålla ett separat jobb med andra dagar, tider eller yttre gränspunkter.
                            </p>
                            {boundaries ? (
                              <p className="mt-2 text-xs text-slate-500">
                                Yttre gränspunkter från valda Blankett 31: <span className="font-semibold text-slate-700">{boundaries}</span>
                              </p>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handlePopulateGroupSectionsFromSignals(group.id, group.selectedEntryKeys)}
                              disabled={isResolvingSections || !group.selectedEntryKeys.length}
                              className="rounded-full border border-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                            >
                              Fyll från signaler
                            </button>
                            <button
                              type="button"
                              onClick={() => addDispGroupSection(group.id)}
                              className="rounded-full border border-slate-900 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-900 hover:bg-slate-100"
                            >
                              Lägg till delområde
                            </button>
                            <button
                              type="button"
                              onClick={() => removeDispSectionGroup(group.id)}
                              className="rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-rose-700 hover:bg-rose-50"
                            >
                              Ta bort ruta
                            </button>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Blankett 31 som hör till {group.title || `delområdesruta ${groupIndex + 2}`}
                          </p>
                          {renderDispEntrySelection(
                            group.selectedEntryKeys || [],
                            (entryKey) => toggleDispSectionGroupEntry(group.id, entryKey)
                          )}
                        </div>

                        <div className="mt-4">
                          {renderSectionEditorCards({
                            sectionList: group.sections || [],
                            onMove: (sectionIndex, direction) => moveDispGroupSection(group.id, sectionIndex, direction),
                            onInsertAfter: (sectionIndex) => insertDispGroupSectionAfter(group.id, sectionIndex),
                            onRemove: (sectionIndex) => removeDispGroupSection(group.id, sectionIndex),
                            onUpdateType: (sectionIndex, value) => updateDispGroupSectionType(group.id, sectionIndex, value),
                            onUpdateNamingMode: (sectionIndex, value) => updateDispGroupSectionNamingMode(group.id, sectionIndex, value),
                            onUpdateField: (sectionIndex, field, value) => updateDispGroupSectionField(group.id, sectionIndex, field, value),
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </main>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleCreateProject}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
            >
              {currentProjectId ? 'Spara projekt' : 'Skapa projekt'}
            </button>
            {currentProjectId && !confirmDeleteOpen && (
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700"
              >
                Ta bort projekt
              </button>
            )}
            {currentProjectId && confirmDeleteOpen && (
              <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <span>Vill du verkligen ta bort projektet?</span>
                <button
                  type="button"
                  onClick={handleDeleteProject}
                  className="rounded-full bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700"
                >
                  Ja, ta bort
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteOpen(false)}
                  className="rounded-full border border-rose-300 px-4 py-2 font-semibold text-rose-700 hover:bg-white"
                >
                  Avbryt
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <datalist id="fjtkl-name-options">
        {fjtklNameOptions.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
      <datalist id="fjtkl-phone-options">
        {fjtklPhoneOptions.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
      <datalist id="emergency-phone-options">
        {emergencyPhoneOptions.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
      <datalist id="bandrift-phone-options">
        {bandriftPhoneOptions.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
      <datalist id="eldrift-phone-options">
        {eldriftPhoneOptions.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>

      <Modal isOpen={isPreflightOpen} onClose={closePreflight} isCentered size="2xl">
        <ModalOverlay bg="blackAlpha.500" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Projektkontroll före sparning</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {!preflightSummary.errors.length && !preflightSummary.warnings.length ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Inga avvikelser hittades.
              </div>
            ) : null}

            {preflightSummary.errors.length ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4">
                <div className="text-sm font-semibold text-rose-800">Det här måste rättas först</div>
                <ul className="mt-3 space-y-2 text-sm text-rose-700">
                  {preflightSummary.errors.map((item) => (
                    <li key={item} className="list-disc ml-5">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {preflightSummary.warnings.length ? (
              <div className={`mt-4 rounded-2xl border px-4 py-4 ${preflightSummary.errors.length ? 'border-amber-200 bg-amber-50' : 'border-sky-200 bg-sky-50'}`}>
                <div className={`text-sm font-semibold ${preflightSummary.errors.length ? 'text-amber-800' : 'text-sky-800'}`}>
                  Kontrollera gärna detta innan du sparar
                </div>
                <ul className={`mt-3 space-y-2 text-sm ${preflightSummary.errors.length ? 'text-amber-700' : 'text-sky-700'}`}>
                  {preflightSummary.warnings.map((item) => (
                    <li key={item} className="list-disc ml-5">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <div className="flex w-full justify-end gap-3">
              <button
                type="button"
                onClick={closePreflight}
                className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Tillbaka
              </button>
              {!preflightSummary.errors.length && preflightSummary.warnings.length ? (
                <button
                  type="button"
                  onClick={saveProject}
                  disabled={isSavingProject}
                  className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {isSavingProject ? 'Sparar...' : 'Spara ändå'}
                </button>
              ) : null}
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SkapaProjekt;
