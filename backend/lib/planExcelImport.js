const ExcelJS = require('exceljs');

const PHONE_PATTERN = /(0\d{2,3}[- ]?\d{2,3}[- ]?\d{2,3}(?:[- ]?\d{2})?)/g;
const ANORDNING_IMPORT_MAP = {
  'A-Skydd': 'A-S',
  'L-Skydd': 'L-S',
  'S-Skydd': 'S-S',
  'E-Skydd': 'E-S',
  Spärrfärd: 'SPF',
  Växling: 'VXL',
  Tågvarning: 'TVN',
};

const normalizeText = (value = '') =>
  String(value ?? '')
    .replace(/\r/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const getCellText = (worksheet, address) => normalizeText(worksheet.getCell(address).text || worksheet.getCell(address).value || '');

const getColumnLetter = (columnNumber) => {
  let dividend = Number(columnNumber) || 1;
  let columnName = '';

  while (dividend > 0) {
    const modulo = (dividend - 1) % 26;
    columnName = String.fromCharCode(65 + modulo) + columnName;
    dividend = Math.floor((dividend - modulo) / 26);
  }

  return columnName;
};

const buildPlanJobEntryKey = (entry = {}, index = 0) =>
  `${entry.beteckning || 'entry'}|${entry.startDate || ''}|${index}`;

const sheetNameFromDate = (dateValue = '') => {
  const match = String(dateValue).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return 'Planka';
  }

  return `${match[2]}-${match[3]}`;
};

const sortEntries = (entries = []) =>
  [...entries].sort((left, right) => {
    const leftKey = `${left.startDate || '9999-99-99'} ${left.startTime || '99:99'} ${left.beteckning || ''}`;
    const rightKey = `${right.startDate || '9999-99-99'} ${right.startTime || '99:99'} ${right.beteckning || ''}`;
    return leftKey.localeCompare(rightKey, 'sv');
  });

const getProjectEntries = (project = {}) => {
  const entries = Array.isArray(project.formState?.blankett31Entries)
    ? project.formState.blankett31Entries.filter((entry) => entry?.beteckning)
    : [];

  if (entries.length) {
    return entries.map((entry, index) => ({
      ...entry,
      key: buildPlanJobEntryKey(entry, index),
    }));
  }

  return [
    {
      key: 'default-entry',
      beteckning: Array.isArray(project.beteckningar) ? project.beteckningar[0]?.label || '' : '',
      startDate: project.startDate || '',
      startTime: project.startTime || '',
      endDate: project.endDate || '',
      endTime: project.endTime || '',
    },
  ];
};

const buildWorksheetPlans = (project = {}) => {
  const entries = getProjectEntries(project);
  const entryMap = new Map(entries.map((entry, index) => [buildPlanJobEntryKey(entry, index), entry]));
  const storedJobs = Array.isArray(project.formState?.planJobs)
    ? project.formState.planJobs.filter((job) => job && (job.name || Array.isArray(job.selectedEntryKeys)))
    : [];

  if (!storedJobs.length) {
    return entries.map((entry, index) => ({
      sheetName: sheetNameFromDate(entry.startDate),
      entries: [{ ...entry, key: buildPlanJobEntryKey(entry, index) }],
    }));
  }

  return storedJobs.map((job, index) => {
    const selectedEntries = Array.isArray(job.selectedEntryKeys)
      ? job.selectedEntryKeys.map((key) => entryMap.get(key)).filter(Boolean)
      : [];
    const resolvedEntries = selectedEntries.length
      ? selectedEntries
      : storedJobs.length === 1
        ? entries
        : [];

    return {
      sheetName: normalizeText(job.name) || sheetNameFromDate(resolvedEntries[0]?.startDate) || `Plan ${index + 1}`,
      entries: sortEntries(resolvedEntries),
    };
  });
};

const parseNameAndPhone = (value = '') => {
  const text = normalizeText(value);
  const phoneMatches = [...text.matchAll(PHONE_PATTERN)].map((match) => normalizeText(match[1]));
  const phone = phoneMatches[phoneMatches.length - 1] || '';
  const name = normalizeText(text.replace(PHONE_PATTERN, '').replace(/\s*\/\s*/g, ' '));

  return {
    name,
    phone,
  };
};

const parseAnordningar = (value = '') =>
  normalizeText(value)
    .split(',')
    .map((item) => normalizeText(item))
    .filter(Boolean)
    .map((item) => ANORDNING_IMPORT_MAP[item] || item)
    .filter(Boolean);

const isSelectedCell = (value = '') => ['X', 'x', '1', '☒', '☑', '✓'].includes(normalizeText(value));

const isImportedRowEmpty = (row = {}) => {
  const hasSubstantiveContent = [
    row.btkn,
    row.telefon,
    row.starttid,
    row.begard,
    row.avslutat,
    row.anteckning,
  ].some((value) => normalizeText(value));

  return (
    !hasSubstantiveContent &&
    !(Array.isArray(row.anordning) && row.anordning.length) &&
    !row.tsa &&
    !(Array.isArray(row.selections) && row.selections.some(Boolean))
  );
};

const buildImportedRowIdentity = (row = {}) =>
  [
    normalizeText(row.planEntryKey),
    normalizeText(row.btkn),
    normalizeText(row.namn),
    normalizeText(row.starttid),
  ].join('|');

const importRowsFromWorksheet = (worksheet, project = {}, plan = {}) => {
  const sectionCount = Math.max(1, Array.isArray(project.sections) ? project.sections.length : 0);
  const baseSectionStart = 8;
  const dataHeaderRow = normalizeText(getCellText(worksheet, 'C9')) === 'NR' ? 9 : 8;
  const dataStartRow = dataHeaderRow + 1;
  const trailingBase = baseSectionStart + sectionCount;
  const sectionColumns = Array.from({ length: sectionCount }, (_, index) => getColumnLetter(baseSectionStart + index));
  const trailingColumns = {
    start: getColumnLetter(trailingBase),
    begard: getColumnLetter(trailingBase + 1),
    avslutat: getColumnLetter(trailingBase + 2),
    tsa: getColumnLetter(trailingBase + 3),
    anteckning: getColumnLetter(trailingBase + 4),
  };

  const importedRows = [];
  let blankStreak = 0;

  for (let rowNumber = dataStartRow; rowNumber <= Math.max(worksheet.rowCount, 120); rowNumber += 1) {
    const btkn = getCellText(worksheet, `D${rowNumber}`);
    const nameAndPhone = parseNameAndPhone(getCellText(worksheet, `E${rowNumber}`));
    const anordning = parseAnordningar(getCellText(worksheet, `F${rowNumber}`));
    const selections = sectionColumns.map((column) => isSelectedCell(getCellText(worksheet, `${column}${rowNumber}`)));
    const tsa = isSelectedCell(getCellText(worksheet, `${trailingColumns.tsa}${rowNumber}`));

    const row = {
      btkn,
      namn: nameAndPhone.name,
      telefon: nameAndPhone.phone,
      anordning,
      starttid: getCellText(worksheet, `${trailingColumns.start}${rowNumber}`),
      begard: getCellText(worksheet, `${trailingColumns.begard}${rowNumber}`),
      avslutat: getCellText(worksheet, `${trailingColumns.avslutat}${rowNumber}`),
      tsa,
      anteckning: getCellText(worksheet, `${trailingColumns.anteckning}${rowNumber}`),
      avslutadRad: false,
      begardDatum: plan.entries?.[0]?.startDate || '',
      planDate: plan.entries?.[0]?.startDate || '',
      planEntryKey: plan.entries?.[0]?.key || '',
      selections,
      selectedAreas: selections.map((selected, index) => (selected ? index : null)).filter((index) => index !== null),
      cellMeta: {},
      samrad: [],
    };

    if (isImportedRowEmpty(row)) {
      blankStreak += 1;
      if (blankStreak >= 8 && importedRows.length) {
        break;
      }
      continue;
    }

    blankStreak = 0;
    importedRows.push(row);
  }

  return importedRows;
};

const mergeImportedRows = (existingRows = [], importedRows = [], importedPlanKeys = new Set()) => {
  const untouchedRows = existingRows.filter((row) => !importedPlanKeys.has(String(row?.planEntryKey || '')));
  const existingRowMap = new Map(existingRows.map((row) => [buildImportedRowIdentity(row), row]));
  let nextId = existingRows.reduce((maxValue, row) => Math.max(maxValue, Number(row?.id) || 0), 0) + 1;

  const normalizedImportedRows = importedRows.map((row) => {
    const existing = existingRowMap.get(buildImportedRowIdentity(row));
    return {
      ...existing,
      ...row,
      id: existing?.id || nextId++,
    };
  });

  return [...untouchedRows, ...normalizedImportedRows];
};

const importPlanWorkbookBuffer = async (buffer, project = {}) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheetPlans = buildWorksheetPlans(project);
  const workbookSheets = workbook.worksheets.filter((sheet) => normalizeText(sheet.name));
  const importedRows = [];
  const importedPlanKeys = new Set();
  const importedSheetNames = [];

  worksheetPlans.forEach((plan, index) => {
    const sheet = workbookSheets.find((candidate) => normalizeText(candidate.name) === normalizeText(plan.sheetName))
      || (worksheetPlans.length === 1 ? workbookSheets[0] : null)
      || (index < workbookSheets.length ? workbookSheets[index] : null);

    if (!sheet) {
      return;
    }

    importedSheetNames.push(sheet.name);
    (plan.entries || []).forEach((entry) => importedPlanKeys.add(String(entry.key || '')));
    importedRows.push(...importRowsFromWorksheet(sheet, project, plan));
  });

  return {
    rows: mergeImportedRows(Array.isArray(project.rows) ? project.rows : [], importedRows, importedPlanKeys),
    importedRowCount: importedRows.length,
    importedSheetNames,
  };
};

module.exports = {
  importPlanWorkbookBuffer,
};
