import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

const htsmPhoneOptions = [
  '010-149 01 64',
  '010-149 01 65',
  '010-149 01 66',
];

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Kunde inte läsa PDF-filen.'));
    reader.readAsDataURL(file);
  });

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

const defaultDispSettings = () => ({
  publiktDispnamn: 'Disp',
  rubrik: '',
  banNamn: '',
  veckaOchDagar: '',
  versionsnummer: '1/MA10',
  banobjektVnr: '',
  forplaneraCa: '1 tim innan start',
  rodmarkeradeGranspunkter: '',
  visaBeteckningarKapitel1: true,
  komprimeraLikaTiderKapitel1: true,
});

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

const mergeSectionDetails = (sections = [], sectionDetails = [], fallbackAreaName = '') =>
  normalizeSectionSortOrder(sections.map((section, index) => {
    const details = sectionDetails[index] || {};
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
  const [blankett31Files, setBlankett31Files] = useState([]);
  const [blankett31Entries, setBlankett31Entries] = useState([defaultBlankett31Entry()]);
  const [planJobs, setPlanJobs] = useState(() => normalizePlanJobs([], []));
  const [dispFiles, setDispFiles] = useState([]);
  const [anteckningar, setAnteckningar] = useState([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isParsingBlankett31, setIsParsingBlankett31] = useState(false);
  const [blankett31Status, setBlankett31Status] = useState('');
  const [isParsingDisp, setIsParsingDisp] = useState(false);
  const [dispStatus, setDispStatus] = useState('');
  const [isResolvingDriftplatser, setIsResolvingDriftplatser] = useState(false);
  const [driftplatsStatus, setDriftplatsStatus] = useState('');
  const [isResolvingSections, setIsResolvingSections] = useState(false);
  const [sectionStatus, setSectionStatus] = useState('');
  const [showProjectTemplatePicker, setShowProjectTemplatePicker] = useState(false);
  const [projectTemplateSearch, setProjectTemplateSearch] = useState('');
  const [projectTemplateOptions, setProjectTemplateOptions] = useState([]);
  const [isLoadingProjectTemplates, setIsLoadingProjectTemplates] = useState(false);
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

  const applyProjectTemplate = (project) => {
    if (!project) {
      return;
    }

    setProjektNamn(project.name || '');
    setPlats(project.plats || '');
    setTelefonnummer(project.telefonnummer || '');
    setGranspunktFritext(project.granspunkter || '');

    const sourceSections = project.sections?.length
      ? mergeSectionDetails(
          project.sections.map((sec) => ({
            ...defaultSection(),
            ...sec,
            signal: sec.name || sec.signal || '',
          })),
          project.formState?.sectionDetails || [],
          (project.sections?.length || 0) === 1 ? normalizeSectionAreaName(project.plats || '') : ''
        )
      : createDefaultSections();

    setSections(sourceSections);
    setDispStatus('Projektet är nu förifyllt från en befintlig Railworker-disp. Ladda Blankett 31 för tider och beteckningar.');
    setShowProjectTemplatePicker(false);
  };

  const loadProjectTemplateOptions = async () => {
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) {
      setDispStatus('Logga in för att välja disp från Railworker.');
      return;
    }

    setIsLoadingProjectTemplates(true);
    try {
      const response = await fetch(apiUrl('/api/projects'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Kunde inte hämta projekt från Railworker.'));
      }

      const data = await response.json();
      const options = Array.isArray(data) ? data.filter((project) => project.id !== currentProjectId) : [];
      setProjectTemplateOptions(options);
      setShowProjectTemplatePicker(true);
    } catch (error) {
      console.error('Fel vid hämtning av projektmallar:', error);
      setDispStatus(error?.message || 'Kunde inte hämta projekt från Railworker.');
    } finally {
      setIsLoadingProjectTemplates(false);
    }
  };

  const handleApplyProjectTemplate = async (projectId) => {
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) {
      setDispStatus('Logga in för att välja disp från Railworker.');
      return;
    }

    try {
      setIsLoadingProjectTemplates(true);
      const response = await fetch(apiUrl(`/api/project/${projectId}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Kunde inte läsa projektet från Railworker.'));
      }

      const project = await response.json();
      applyProjectTemplate(project);
    } catch (error) {
      console.error('Fel vid val av projektmall:', error);
      setDispStatus(error?.message || 'Kunde inte använda projektet som utgångsmaterial.');
    } finally {
      setIsLoadingProjectTemplates(false);
    }
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

  const addSection = () => {
    const highestDisplayIndex = sections.reduce((maxValue, section) => {
      const parsed = Number(section?.displayIndex);
      return Number.isFinite(parsed) ? Math.max(maxValue, parsed) : maxValue;
    }, 0);

    setSections((current) => normalizeSectionSortOrder([
      ...current,
      {
        ...defaultSection(),
        displayIndex: highestDisplayIndex + 1,
      },
    ]));
  };

  const insertSectionAfter = (index) => {
    const highestDisplayIndex = sections.reduce((maxValue, section) => {
      const parsed = Number(section?.displayIndex);
      return Number.isFinite(parsed) ? Math.max(maxValue, parsed) : maxValue;
    }, 0);

    setSections((current) => normalizeSectionSortOrder([
      ...current.slice(0, index + 1),
      {
        ...defaultSection(),
        displayIndex: highestDisplayIndex + 1,
      },
      ...current.slice(index + 1),
    ]));
  };

  const moveSection = (index, direction) => {
    setSections((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const updated = [...current];
      [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
      return normalizeSectionSortOrder(updated);
    });
  };

  const updateSectionType = (index, type) => {
    const updated = [...sections];
    updated[index].type = type;
    setSections(normalizeSectionSortOrder(updated));
  };

  const updateSectionNamingMode = (index, namingMode) => {
    const updated = [...sections];
    updated[index].namingMode = namingMode;
    if (namingMode === 'NUMBERS' && !updated[index].displayIndex) {
      updated[index].displayIndex = index + 1;
    }
    setSections(normalizeSectionSortOrder(updated));
  };

  const updateSectionField = (index, field, value) => {
    setSections((current) => normalizeSectionSortOrder(current.map((section, sectionIndex) => {
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
    })));
  };

  const removeSection = (index) => {
    const updated = sections.filter((_, i) => i !== index);
    setSections(normalizeSectionSortOrder(updated));
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
      return;
    }

    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) {
      setBlankett31Status('Logga in för att tolka Blankett 31.');
      return;
    }

    setIsParsingBlankett31(true);
    setBlankett31Status('Tolkar Blankett 31...');

    try {
      const parsedFileEntries = [];
      let parsedMeta = null;

      for (const file of files) {
        const fileData = await readFileAsDataUrl(file);
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
      setBeteckningar(nextEntries.map((entry) => ({ value: entry.beteckning || '' })));
      setBlankett31Files((current) => {
        const merged = [...current, ...files];
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
      setBlankett31Status(
        files.length > 1
          ? `${files.length} Blankett 31 tolkades och lades till i projektet.`
          : 'Blankett 31 tolkad och lades till i projektet.'
      );
    } catch (error) {
      console.error('Fel vid tolkning av Blankett 31:', error);
      setBlankett31Status('Blankett 31 kunde inte tolkas automatiskt.');
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

  const buildHandelseLoggContent = () => {
    const sortedAnteckningar = [...anteckningar].sort(
      (a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
    );

    const subject = `Händelselogg - ${projektNamn || 'Projekt'}`;
    const headerLines = [
      `Projekt: ${projektNamn || 'Ej angivet'}`,
      `Plats: ${plats || 'Ej angivet'}`,
      `Skydd uttaget: ${uttagningstid || 'Ej angivet'}`,
      `Skydd avslutat: ${avslutningstid || 'Ej angivet'}`,
      '',
      'Händelselogg:',
    ];

    const eventLines = sortedAnteckningar.length
      ? sortedAnteckningar.flatMap((note, index) => {
          const timestamp = note.timestamp
            ? new Date(note.timestamp).toLocaleString('sv-SE')
            : 'Tid saknas';
          const author = note.author ? ` av ${note.author}` : '';
          return [
            `${index + 1}. ${note.text || ''}`,
            `   ${timestamp}${author}`,
            '',
          ];
        })
      : ['Inga anteckningar registrerade ännu.'];

    const body = [...headerLines, ...eventLines].join('\n');
    return { subject, body };
  };

  const handleHandelseLogg = () => {
    const { subject, body } = buildHandelseLoggContent();
    const openInOutlook = window.confirm(
      'Vill du öppna händelselogg i Outlook?\nVälj Avbryt för vanligt e-postutkast.'
    );

    if (openInOutlook) {
      window.open(
        `https://outlook.office.com/mail/deeplink/compose?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
        '_blank',
        'noopener,noreferrer'
      );
      return;
    }

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleCreateProject = async () => {
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) {
      alert('Du är inte inloggad.');
      return;
    }

    try {
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
          blankett31Meta,
          dispSettings,
          blankett31Entries,
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
          })),
          dispFiles: dispFiles.map((file) => ({
            name: file.name,
            size: file.size,
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
        throw new Error('Kunde inte skapa projekt');
      }

      const data = await response.json();
      console.log('✅ Projekt skapat med beteckningar:', data.beteckningar);

      navigate(`/plan/${data.id || currentProjectId}`);
    } catch (err) {
      console.error('Fel vid projekt-skapande:', err);
      alert('Något gick fel. Försök igen.');
    }
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
        setBlankett31Files(project.formState?.blankett31Files || []);
        setDispFiles(project.formState?.dispFiles || []);
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 right-0 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <Header />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 pb-16 pt-24">
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Skapa projekt</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="space-y-6 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
              <div>
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
                  className="w-full rounded-xl border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  {isParsingBlankett31 ? 'Tolkar Blankett 31...' : 'Blankett 31'}
                </button>
                {blankett31Status && (
                  <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    {blankett31Status}
                  </div>
                )}
                {blankett31Files.length > 0 && (
                  <div className="mt-3 space-y-2 text-xs text-slate-600">
                    {blankett31Files.map((file) => (
                      <div key={`${file.name}-${file.size}`} className="rounded-lg bg-slate-50 px-3 py-2">
                        {file.name}
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={loadProjectTemplateOptions}
                  disabled={isLoadingProjectTemplates}
                  className="mt-3 w-full rounded-xl border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  {isLoadingProjectTemplates ? 'Hämtar projekt...' : 'Utgå ifrån Railworker-disp'}
                </button>
                {showProjectTemplatePicker && (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <input
                      type="text"
                      value={projectTemplateSearch}
                      onChange={(e) => setProjectTemplateSearch(e.target.value)}
                      placeholder="Sök projekt"
                      className="mb-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                    />
                    <div className="max-h-64 space-y-2 overflow-y-auto">
                      {projectTemplateOptions
                        .filter((project) => (
                          !projectTemplateSearch.trim()
                            || String(project.name || '').toLowerCase().includes(projectTemplateSearch.trim().toLowerCase())
                            || String(project.plats || '').toLowerCase().includes(projectTemplateSearch.trim().toLowerCase())
                        ))
                        .map((project) => (
                          <button
                            key={project.id}
                            type="button"
                            onClick={() => handleApplyProjectTemplate(project.id)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left hover:border-slate-300 hover:bg-slate-50"
                          >
                            <div className="text-sm font-semibold text-slate-900">{project.name || 'Namnlöst projekt'}</div>
                            <div className="mt-1 text-xs text-slate-500">{project.plats || 'Plats saknas'}</div>
                          </button>
                        ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowProjectTemplatePicker(false)}
                      className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-white"
                    >
                      Stäng
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => dispInputRef.current?.click()}
                  disabled={isParsingDisp}
                  className="mt-3 w-full rounded-xl border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  {isParsingDisp ? 'Läser in PDF-disp...' : 'Läs in PDF-disp'}
                </button>
                {dispStatus && (
                  <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    {dispStatus}
                  </div>
                )}
                {dispFiles.length > 0 && (
                  <div className="mt-3 space-y-2 text-xs text-slate-600">
                    {dispFiles.map((file) => (
                      <div key={`${file.name}-${file.size}`} className="rounded-lg bg-slate-50 px-3 py-2">
                        {file.name}
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleHandelseLogg}
                  className="mt-3 w-full rounded-xl border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Händelselogg
                </button>
              </div>
            </div>

          </aside>

          <main className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Projektöversikt</h2>
                  <p className="text-xs text-slate-500">Namngivning och tidsram</p>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                  01
                </span>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Projektnamn</label>
                  <input
                    type="text"
                    value={projektNamn}
                    onChange={(e) => setProjektNamn(e.target.value)}
                    placeholder="Ex. Rååbanan nattarbete"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Driftplats/er</label>
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
                  <h3 className="text-base font-semibold text-slate-900">Disp-inställningar</h3>
                  <p className="text-xs text-slate-500">
                    Rubrik och sidhuvud för den färdiga dispositionsarbetsplanen.
                  </p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2 items-start auto-rows-auto">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
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
                    <label className="mb-1 block text-sm font-semibold text-slate-700">PDF-filnamn</label>
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
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Banans namn</label>
                    <input
                      type="text"
                      value={dispSettings.banNamn}
                      onChange={(e) => setDispSettings((current) => ({ ...current, banNamn: e.target.value }))}
                      placeholder="Ex. Rååbanan"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Vecka / dagar / nätter</label>
                    <input
                      type="text"
                      value={dispSettings.veckaOchDagar}
                      onChange={(e) => setDispSettings((current) => ({ ...current, veckaOchDagar: e.target.value }))}
                      placeholder="Ex. V13 Tis, Lör-Sön"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Versionsnummer</label>
                    <input
                      type="text"
                      value={dispSettings.versionsnummer}
                      onChange={(e) => setDispSettings((current) => ({ ...current, versionsnummer: e.target.value }))}
                      placeholder="Ex. 1/MA10"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Banobjekt-Vnr</label>
                    <input
                      type="text"
                      value={dispSettings.banobjektVnr}
                      onChange={(e) => setDispSettings((current) => ({ ...current, banobjektVnr: e.target.value }))}
                      placeholder="Ex. 17096-1"
                      className="min-h-[56px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Förplanera ca</label>
                    <input
                      type="text"
                      value={dispSettings.forplaneraCa}
                      onChange={(e) => setDispSettings((current) => ({ ...current, forplaneraCa: e.target.value }))}
                      placeholder="Ex. 1 tim innan start"
                      className="min-h-[56px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Rödmarkera gränspunkter</label>
                    <input
                      type="text"
                      value={dispSettings.rodmarkeradeGranspunkter}
                      onChange={(e) => setDispSettings((current) => ({ ...current, rodmarkeradeGranspunkter: e.target.value }))}
                      placeholder="Ex. Hb103, Tp33, Tp82"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-700">Kapitel 1 i dispen</p>
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
                    <h3 className="text-base font-semibold text-slate-900">FJTKL</h3>
                    <p className="text-xs text-slate-500">Ansvarig kontakt och nödnummer</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={addFjtklBlock}
                      className="rounded-full border border-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-900 hover:bg-slate-50"
                    >
                      + Ny FJTKL
                    </button>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                      02
                    </span>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">FJTKL namn</label>
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
                    <label className="mb-1 block text-sm font-semibold text-slate-700">FJTKL telefon</label>
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
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Nödnummer</label>
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
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Bandriftnummer</label>
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
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Eldriftnummer</label>
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
                    <label className="mb-1 block text-sm font-semibold text-slate-700">HTSM telefon</label>
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
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Reservnr</label>
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
              </div>
              {blankett31Entries.length > 0 && (
                <div className="mt-6 border-t border-slate-200 pt-6">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-slate-900">Blankett 31 poster</h3>
                    <p className="text-xs text-slate-500">
                      Alla dagar och tider som lästs in från Blankett 31. Telefonnummer pa varje post foljer med till
                      dispens telefonkapitel och planka nar posten anvands.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {blankett31Entries.map((entry, index) => (
                      <div key={`${entry.beteckning || 'post'}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
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
                        <div className="mt-3 grid gap-3 md:grid-cols-4">
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
                          <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                              Uttagningstid
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="time"
                                value={entry.uttagningstid || ''}
                                onChange={(e) => updateBlankett31Entry(index, 'uttagningstid', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => updateBlankett31Entry(index, 'uttagningstid', getCurrentTime())}
                                className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white"
                              >
                                Nu
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                              Signatur
                            </label>
                            <input
                              type="text"
                              value={entry.signatur || ''}
                              onChange={(e) => updateBlankett31Entry(index, 'signatur', e.target.value)}
                              placeholder="Signatur"
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                              Avslutningstid
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="time"
                                value={entry.avslutningstid || ''}
                                onChange={(e) => updateBlankett31Entry(index, 'avslutningstid', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => updateBlankett31Entry(index, 'avslutningstid', getCurrentTime())}
                                className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white"
                              >
                                Nu
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                              Avslutningssignatur
                            </label>
                            <input
                              type="text"
                              value={entry.avslutningssignatur || ''}
                              onChange={(e) => updateBlankett31Entry(index, 'avslutningssignatur', e.target.value)}
                              placeholder="Signatur"
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                            />
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
                    <h3 className="text-base font-semibold text-slate-900">Jobb / planka</h3>
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
                <div className="space-y-3">
                  {planJobs.map((job, index) => (
                    <div key={job.id || index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
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
                  <h3 className="text-base font-semibold text-slate-900">Gränspunkter</h3>
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
              <section key={index} className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">FJTKL</h2>
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
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                        02
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">FJTKL namn</label>
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
                      <label className="mb-1 block text-sm font-semibold text-slate-700">FJTKL telefon</label>
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
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Nödnummer</label>
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
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Bandriftnummer</label>
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
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Eldriftnummer</label>
                      <input
                        type="text"
                        list="eldrift-phone-options"
                        value={block.eldriftnummer}
                        onChange={(e) => updateFjtklBlock(index, 'eldriftnummer', e.target.value)}
                        placeholder="Eldriftnummer"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Skydd & Signatur</h2>
                      <p className="text-xs text-slate-500">Tider och signering</p>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                      03
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Uttagningstid
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={block.uttagningstid}
                          onChange={(e) => updateFjtklBlock(index, 'uttagningstid', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateFjtklBlock(index, 'uttagningstid', getCurrentTime())}
                          className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Nu
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Avslutningstid
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={block.avslutningstid}
                          onChange={(e) => updateFjtklBlock(index, 'avslutningstid', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateFjtklBlock(index, 'avslutningstid', getCurrentTime())}
                          className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Nu
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Signatur
                      </label>
                      <input
                        type="text"
                        value={block.signatur}
                        onChange={(e) => updateFjtklBlock(index, 'signatur', e.target.value)}
                        placeholder="Signatur"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Avslutningssignatur
                      </label>
                      <input
                        type="text"
                        value={block.avslutningssignatur}
                        onChange={(e) => updateFjtklBlock(index, 'avslutningssignatur', e.target.value)}
                        placeholder="Signatur"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                    <label className="md:col-span-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
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

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Delområden</h2>
                  <p className="text-xs text-slate-500">Skapa DP/Linje och ange signaltext</p>
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
                </div>
              </div>
              {sectionStatus ? (
                <p className="mb-4 text-xs font-medium text-slate-600">{sectionStatus}</p>
              ) : null}

              <div className="space-y-3">
                {sections.map((sec, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-700">
                        {getSectionLabel(sec, i)}
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => moveSection(i, -1)}
                          disabled={i === 0}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Upp
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSection(i, 1)}
                          disabled={i === sections.length - 1}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Ner
                        </button>
                        <button
                          type="button"
                          onClick={() => insertSectionAfter(i)}
                          className="rounded-full border border-slate-900 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-slate-900 hover:bg-slate-100"
                        >
                          Infoga efter
                        </button>
                        {i > 0 && (
                          <button
                            type="button"
                            onClick={() => removeSection(i)}
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
                        onChange={(e) => updateSectionType(i, e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                      >
                        <option value="Linje">Linje</option>
                        <option value="DP">DP</option>
                        <option value="Delområde">Delområde</option>
                      </select>
                      <select
                        value={sec.namingMode || 'LETTERS'}
                        onChange={(e) => updateSectionNamingMode(i, e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                      >
                        <option value="LETTERS">Bokstäver: A, B, C</option>
                        <option value="NUMBERS">Siffror: 1, 2, 3</option>
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={sec.displayIndex ?? ''}
                        onChange={(e) => updateSectionField(i, 'displayIndex', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                        placeholder="Nr"
                      />
                      <input
                        type="text"
                        value={sec.customLabel || ''}
                        onChange={(e) => updateSectionField(i, 'customLabel', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                        placeholder="Egen etikett, ex 2B"
                      />
                      <input
                        type="text"
                        placeholder="Delområde / sträcka"
                        value={sec.signal || sec.name || ''}
                        onChange={(e) => updateSectionField(i, 'signal', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <input
                        type="text"
                        placeholder="Gränspunkt start"
                        value={sec.granspunktStart || ''}
                        onChange={(e) => updateSectionField(i, 'granspunktStart', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Gränspunkt slut"
                        value={sec.granspunktSlut || ''}
                        onChange={(e) => updateSectionField(i, 'granspunktSlut', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Spår"
                        value={sec.spar || ''}
                        onChange={(e) => updateSectionField(i, 'spar', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-rose-100 bg-rose-50/60 px-3 py-2">
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={Boolean(sec.highlightStart)}
                            onChange={(e) => updateSectionField(i, 'highlightStart', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                          />
                          Rödmarkera startpunkt
                        </label>
                        <input
                          type="text"
                          placeholder="Endast röd del, ex 21"
                          value={sec.highlightStartPart || ''}
                          onChange={(e) => updateSectionField(i, 'highlightStartPart', e.target.value)}
                          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                      <div className="rounded-xl border border-rose-100 bg-rose-50/60 px-3 py-2">
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={Boolean(sec.highlightEnd)}
                            onChange={(e) => updateSectionField(i, 'highlightEnd', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                          />
                          Rödmarkera slutpunkt
                        </label>
                        <input
                          type="text"
                          placeholder="Endast röd del, ex 22"
                          value={sec.highlightEndPart || ''}
                          onChange={(e) => updateSectionField(i, 'highlightEndPart', e.target.value)}
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
            </section>
          </main>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleCreateProject}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
            >
              Skapa projekt
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
    </div>
  );
};

export default SkapaProjekt;
