const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

const TEMPLATE_PATH = path.join(__dirname, '..', 'assets', 'plan-template.xlsx');

const formatAnordningLabel = (item = '') => {
  const upper = String(item).toUpperCase();
  switch (upper) {
    case 'A-S':
      return 'A-Skydd';
    case 'L-S':
      return 'L-Skydd';
    case 'S-S':
      return 'S-Skydd';
    case 'E-S':
      return 'E-Skydd';
    case 'SPF':
      return 'Spärrfärd';
    case 'VXL':
      return 'Växling';
    case 'TVN':
      return 'Tågvarning';
    default:
      return item;
  }
};

const getSectionSignalAndTrack = (section = {}) => {
  const raw = String(section.signal || section.name || '').trim();
  const trackMatch = raw.match(/(Spår\s+.+)$/i);
  if (!trackMatch) {
    return {
      signal: raw,
      spar: section.spar || '',
    };
  }

  return {
    signal: raw.replace(/\s*,?\s*Spår\s+.+$/i, '').trim(),
    spar: trackMatch[1].trim(),
  };
};

const getSectionBoundaryText = (section = {}) =>
  String(section.granspunkter || '')
    .trim()
    .replace(/\s*-\s*/g, '-')
    .replace(/\s*,\s*/g, ', ');

const extractWeek = (projectName = '') => {
  const match = String(projectName).match(/\b(V\d+)\b/i);
  return match?.[1]?.toUpperCase() || '';
};

const formatProjectPeriod = (item) => {
  const start = [item.startDate, item.startTime].filter(Boolean).join(' ');
  const end = [item.endDate, item.endTime].filter(Boolean).join(' ');
  return [start, end].filter(Boolean).join(' - ');
};

const sheetNameFromDate = (dateValue = '') => {
  const match = String(dateValue).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return 'Planka';
  }

  return `${match[2]}-${match[3]}`;
};

const sanitizeWorksheetName = (value = '') =>
  String(value || '')
    .replace(/[\\/*?:[\]]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

const ensureUniqueWorksheetName = (baseName, usedNames) => {
  const trimmedBase = sanitizeWorksheetName(baseName || 'Planka').slice(0, 31) || 'Planka';
  if (!usedNames.has(trimmedBase)) {
    usedNames.add(trimmedBase);
    return trimmedBase;
  }

  let counter = 2;
  while (counter < 1000) {
    const suffix = `-${counter}`;
    const candidate = `${trimmedBase.slice(0, 31 - suffix.length)}${suffix}`;
    if (!usedNames.has(candidate)) {
      usedNames.add(candidate);
      return candidate;
    }
    counter += 1;
  }

  throw new Error('Kunde inte skapa unikt fliknamn för Excel-export');
};

const setCell = (worksheet, cellAddress, value) => {
  worksheet.getCell(cellAddress).value = value;
};

const MAX_TOP_ENTRY_ROWS = 4;

const getEntryFjtklValue = (project = {}, entry = {}) =>
  [project.namn || '', entry?.telefonnummer || project.telefonnummer || '']
    .filter(Boolean)
    .join(' ');

const setBeteckningarColumn = (worksheet, entries = []) => {
  for (let index = 0; index < MAX_TOP_ENTRY_ROWS; index += 1) {
    setCell(worksheet, `E${index + 1}`, entries[index]?.beteckning || '');
  }
};

const setFjtklRows = (worksheet, project = {}, entries = []) => {
  for (let index = 0; index < MAX_TOP_ENTRY_ROWS; index += 1) {
    const value = index < entries.length ? getEntryFjtklValue(project, entries[index]) : '';
    setCell(worksheet, `L${index + 1}`, value);
  }
};

const compactTopEntryRows = (worksheet, entryCount = 0) => {
  const visibleRows = Math.max(1, Math.min(MAX_TOP_ENTRY_ROWS, entryCount || 1));
  for (let rowIndex = 1; rowIndex <= MAX_TOP_ENTRY_ROWS; rowIndex += 1) {
    const row = worksheet.getRow(rowIndex);
    const isHidden = rowIndex > visibleRows;
    row.hidden = isHidden;
    row.height = isHidden ? 0 : 22;
  }

  return {
    rowOffset: 0,
    summaryRow: 6,
    sectionBoundaryRow: 6,
    sectionTypeRow: 7,
    sectionNumberRow: 8,
    dataStartRow: 9,
  };
};

const buildPlanJobEntryKey = (entry = {}, index = 0) =>
  `${entry.beteckning || 'entry'}|${entry.startDate || ''}|${index}`;

const cloneStyle = (style = {}) => ({
  ...style,
  font: style.font ? { ...style.font } : undefined,
  fill: style.fill ? { ...style.fill } : undefined,
  border: style.border ? { ...style.border } : undefined,
  alignment: style.alignment ? { ...style.alignment } : undefined,
  numFmt: style.numFmt,
  protection: style.protection ? { ...style.protection } : undefined,
});

const getColumnLetter = (columnNumber) => {
  let value = Number(columnNumber);
  let letters = '';

  while (value > 0) {
    const remainder = (value - 1) % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    value = Math.floor((value - 1) / 26);
  }

  return letters;
};

const clearRangeValues = (worksheet, startColumnNumber, endColumnNumber, startRow, endRow) => {
  for (let columnNumber = startColumnNumber; columnNumber <= endColumnNumber; columnNumber += 1) {
    for (let rowNumber = startRow; rowNumber <= endRow; rowNumber += 1) {
      worksheet.getCell(rowNumber, columnNumber).value = null;
    }
  }
};

const resetRangeFormatting = (worksheet, startColumnNumber, endColumnNumber, startRow, endRow) => {
  for (let columnNumber = startColumnNumber; columnNumber <= endColumnNumber; columnNumber += 1) {
    for (let rowNumber = startRow; rowNumber <= endRow; rowNumber += 1) {
      const cell = worksheet.getCell(rowNumber, columnNumber);
      cell.style = {};
      cell.value = null;
    }
  }
};

const copyColumnStyles = (worksheet, sourceColumnNumber, targetColumnNumber, maxRow = 80) => {
  const sourceColumn = worksheet.getColumn(sourceColumnNumber);
  const targetColumn = worksheet.getColumn(targetColumnNumber);
  targetColumn.width = sourceColumn.width;
  targetColumn.style = cloneStyle(sourceColumn.style || {});

  for (let rowNumber = 1; rowNumber <= maxRow; rowNumber += 1) {
    const sourceCell = worksheet.getCell(rowNumber, sourceColumnNumber);
    const targetCell = worksheet.getCell(rowNumber, targetColumnNumber);
    targetCell.style = cloneStyle(sourceCell.style || {});
  }
};

const applyTopGridBorders = (worksheet, startColumnNumber = 5, endColumnNumber = 14, startRow = 1, endRow = 4) => {
  const thinBorder = { style: 'thin', color: { indexed: 64 } };

  for (let columnNumber = startColumnNumber; columnNumber <= endColumnNumber; columnNumber += 1) {
    for (let rowNumber = startRow; rowNumber <= endRow; rowNumber += 1) {
      const cell = worksheet.getCell(rowNumber, columnNumber);
      cell.border = {
        left: thinBorder,
        right: thinBorder,
        top: thinBorder,
        bottom: thinBorder,
      };
    }
  }
};

const buildNameAndPhone = (row) => {
  const name = row.namn || '';
  const phone = row.telefon || '';
  return [name, phone].filter(Boolean).join(' / ');
};

const getSectionDisplayIndex = (section, index) => {
  const parsedDisplayIndex = Number(section?.displayIndex);
  if (section?.namingMode === 'NUMBERS' && Number.isFinite(parsedDisplayIndex) && parsedDisplayIndex > 0) {
    return parsedDisplayIndex;
  }

  return index + 1;
};

const buildSamradText = (row, project) => {
  const sections = mergeSectionDetails(project);
  const selections = Array.isArray(row.selections) ? row.selections : [];
  const active = selections
    .map((selected, index) => (selected ? getSectionDisplayIndex(sections[index], index) : null))
    .filter(Boolean);
  if (active.length <= 1) {
    return '';
  }

  return `Delområde ${active.join(', ')}`;
};

const buildSectionColumnMap = (sections, columns) => {
  const columnMap = new Map();
  sections.forEach((section, index) => {
    if (index < columns.length) {
      columnMap.set(index, { section, index });
    }
  });

  return columnMap;
};

const isDpSection = (section = {}, index = 0) => {
  const explicitType = String(section.type || section.sectionType || '').trim().toLowerCase();
  if (explicitType.includes('dp') || explicitType.includes('driftplats')) {
    return true;
  }
  if (explicitType.includes('linje') || explicitType.includes('sträcka')) {
    return false;
  }

  const label = String(section.signal || section.name || '').trim();
  if (label.includes(' - ')) {
    return false;
  }
  if (label) {
    return true;
  }

  // Fallback for NJDB-built projects where sections normally alternate line / DP.
  return index % 2 === 1;
};

const getSectionLocationLabel = (section = {}, index = 0) => {
  const label = String(section.signal || section.name || '').trim();
  if (!label) return '';
  if (isDpSection(section, index)) {
    return label;
  }
  if (index === 0 && label.includes(' - ')) {
    return label.split(/\s*-\s*/)[0] || '';
  }
  return '';
};

const setSectionHeaders = (worksheet, sections, sectionColumns, layout) => {
  const sectionColumnMap = buildSectionColumnMap(sections, sectionColumns);
  const boundaryRow = layout?.sectionBoundaryRow || 6;
  const typeRow = layout?.sectionTypeRow || 7;
  const numberRow = layout?.sectionNumberRow || 8;
  const locationRow = 5;

  sectionColumns.forEach((column, columnIndex) => {
    const mappedSection = sectionColumnMap.get(columnIndex);
    if (!mappedSection) {
      setCell(worksheet, `${column}${locationRow}`, '');
      setCell(worksheet, `${column}${boundaryRow}`, '');
      setCell(worksheet, `${column}${typeRow}`, '');
      setCell(worksheet, `${column}${numberRow}`, '');
      return;
    }

    const section = mappedSection.section || {};
    const isDp = isDpSection(section, mappedSection.index);
    const styleSourceColumn = isDp ? 'I' : 'H';

    ['6', '7', '8'].forEach((rowSuffix) => {
      worksheet.getCell(`${column}${rowSuffix}`).style = cloneStyle(worksheet.getCell(`${styleSourceColumn}${rowSuffix}`).style || {});
    });

    setCell(worksheet, `${column}${locationRow}`, getSectionLocationLabel(section, mappedSection.index));
    worksheet.getCell(`${column}${locationRow}`).alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };
    worksheet.getCell(`${column}${locationRow}`).font = {
      bold: true,
      size: 12,
      color: { argb: 'FF1F5EA8' },
      name: 'Calibri',
    };
    setCell(worksheet, `${column}${boundaryRow}`, getSectionBoundaryText(section) || getSectionSignalAndTrack(section).signal || '');
    setCell(worksheet, `${column}${typeRow}`, isDp ? 'DP' : 'Linje');
    setCell(worksheet, `${column}${numberRow}`, getSectionDisplayIndex(section, mappedSection.index));
  });

  return sectionColumnMap;
};

const ensureWorksheetHasSectionCapacity = (worksheet, sections) => {
  const sectionCount = Math.max(1, sections.length);
  const baseSectionStart = 8; // H
  const baseSectionCount = 14; // H-U
  const trailingStart = baseSectionStart + baseSectionCount; // V
  const deltaSections = sectionCount - baseSectionCount;

  if (deltaSections > 0) {
    worksheet.spliceColumns(trailingStart, 0, ...Array.from({ length: deltaSections }, () => []));

    for (let offset = 0; offset < deltaSections; offset += 1) {
      const sourceColumnNumber = trailingStart - 1;
      const targetColumnNumber = trailingStart + offset;
      const sourceColumn = worksheet.getColumn(sourceColumnNumber);
      const targetColumn = worksheet.getColumn(targetColumnNumber);
      targetColumn.width = sourceColumn.width;
      targetColumn.style = cloneStyle(sourceColumn.style || {});
      for (let row = 1; row <= Math.max(worksheet.rowCount, 60); row += 1) {
        const sourceCell = worksheet.getCell(row, sourceColumnNumber);
        const targetCell = worksheet.getCell(row, targetColumnNumber);
        targetCell.style = cloneStyle(sourceCell.style || {});
      }
    }
  }

  const sectionColumns = Array.from(
    { length: sectionCount },
    (_, index) => getColumnLetter(baseSectionStart + index)
  );
  const trailingBase = baseSectionStart + sectionCount;
  const templateTrailingBase = trailingStart;
  const clearUntilColumn = Math.max(trailingStart + 4, trailingBase + 4);
  const neutralTemplateColumn = templateTrailingBase + 5;

  for (let offset = 0; offset < 5; offset += 1) {
    copyColumnStyles(worksheet, templateTrailingBase + offset, trailingBase + offset);
  }

  const lastUsedColumn = trailingBase + 4;
  const templateLastColumn = trailingStart + 4;
  if (lastUsedColumn < templateLastColumn) {
    for (let columnNumber = lastUsedColumn + 1; columnNumber <= templateLastColumn; columnNumber += 1) {
      copyColumnStyles(worksheet, neutralTemplateColumn, columnNumber);
    }
    resetRangeFormatting(worksheet, lastUsedColumn + 1, templateLastColumn, 6, 80);
  }

  clearRangeValues(worksheet, baseSectionStart, clearUntilColumn, 6, 8);

  return {
    sectionColumns,
    trailingColumns: {
      start: getColumnLetter(trailingBase),
      begard: getColumnLetter(trailingBase + 1),
      avslutat: getColumnLetter(trailingBase + 2),
      tsa: getColumnLetter(trailingBase + 3),
      anteckning: getColumnLetter(trailingBase + 4),
      nodnummer: getColumnLetter(trailingBase + 1),
      sluttid: getColumnLetter(trailingBase + 1),
    },
  };
};

const mergeSectionDetails = (project = {}) => {
  const sections = Array.isArray(project.sections) ? project.sections : [];
  const sectionDetails = Array.isArray(project.formState?.sectionDetails) ? project.formState.sectionDetails : [];

  return sections.map((section, index) => ({
    ...section,
    ...(sectionDetails[index] || {}),
    signal: section?.signal || section?.name || sectionDetails[index]?.signal || '',
  }));
};

const getProjectEntries = (project) => {
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
      startDate: project.startDate,
      startTime: project.startTime,
      endDate: project.endDate,
      endTime: project.endTime,
    },
  ];
};

const sortEntries = (entries = []) =>
  [...entries].sort((left, right) => {
    const leftKey = `${left.startDate || '9999-99-99'} ${left.startTime || '99:99'} ${left.beteckning || ''}`;
    const rightKey = `${right.startDate || '9999-99-99'} ${right.startTime || '99:99'} ${right.beteckning || ''}`;
    return leftKey.localeCompare(rightKey, 'sv');
  });

const formatProjectPeriodFromEntries = (entries = [], project = {}) => {
  const sortedEntries = sortEntries(entries.filter((entry) => entry?.startDate || entry?.beteckning));
  if (!sortedEntries.length) {
    return formatProjectPeriod({
      startDate: project.startDate,
      startTime: project.startTime,
      endDate: project.endDate,
      endTime: project.endTime,
    });
  }

  const first = sortedEntries[0];
  const last = sortedEntries[sortedEntries.length - 1];
  return formatProjectPeriod({
    startDate: first.startDate,
    startTime: first.startTime,
    endDate: last.endDate,
    endTime: last.endTime,
  });
};

const buildWorksheetPlans = (project) => {
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
      sheetName: String(job.name || '').trim() || sheetNameFromDate(resolvedEntries[0]?.startDate) || `Plan ${index + 1}`,
      entries: sortEntries(resolvedEntries),
    };
  });
};

const placePlanSheetsFirst = (workbook, planWorksheets = []) => {
  const planIds = new Set(planWorksheets.filter(Boolean).map((worksheet) => worksheet.id));
  const orderedSheets = [
    ...planWorksheets.filter(Boolean),
    ...workbook.worksheets.filter((worksheet) => worksheet && !planIds.has(worksheet.id)),
  ];

  orderedSheets.forEach((worksheet, index) => {
    worksheet.orderNo = index;
  });
};

const rowMatchesEntry = (row, entry) => {
  if (row?.planEntryKey && entry?.key) {
    return String(row.planEntryKey) === String(entry.key);
  }

  const rowDate = row.startdatum || row.begardDatum || row.avslutatDatum || '';
  if (!entry?.startDate) {
    return true;
  }

  if (!rowDate) {
    return true;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(rowDate)) {
    return rowDate === entry.startDate;
  }

  const match = String(rowDate).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}` === entry.startDate;
  }

  return true;
};

const rowMatchesEntries = (row, entries = []) => {
  if (!entries.length) {
    return true;
  }

  return entries.some((entry) => rowMatchesEntry(row, entry));
};

const cloneWorksheetFromTemplate = (workbook, templateSource, sheetName) => {
  const clonedSheet = workbook.addWorksheet(sheetName);
  const templateModel = JSON.parse(JSON.stringify(templateSource));
  if (Array.isArray(templateModel?.merges)) {
    templateModel.merges = templateModel.merges.filter((range) => range !== 'G5:Z5');
  }
  if (Array.isArray(templateModel?.rows)) {
    templateModel.rows.forEach((row) => {
      if (!Array.isArray(row?.cells)) return;
      row.cells.forEach((cell) => {
        if (cell && Object.prototype.hasOwnProperty.call(cell, 'note')) {
          delete cell.note;
        }
      });
    });
  }
  clonedSheet.model = {
    ...templateModel,
    name: sheetName,
  };
  return clonedSheet;
};

const fillWorksheet = (worksheet, project, entriesForSheet, rows) => {
  const projectFormState = project.formState || {};
  const sections = mergeSectionDetails(project);
  const sheetEntries = Array.isArray(entriesForSheet) ? entriesForSheet : [];
  const primaryEntry = sheetEntries[0] || {};
  const layout = compactTopEntryRows(worksheet, sheetEntries.length);
  try {
    worksheet.unMergeCells('G5:Z5');
  } catch (error) {
    // ignore if merge already changed
  }
  const routeCell = worksheet.getCell('G5');
  const previewLabelCell = worksheet.getCell(`G${layout.summaryRow}`);

  setBeteckningarColumn(worksheet, sheetEntries);
  setFjtklRows(worksheet, project, sheetEntries);
  applyTopGridBorders(worksheet);
  clearRangeValues(worksheet, 15, 26, 1, 4);
  clearRangeValues(worksheet, 7, 26, 5, 5);
  setCell(worksheet, 'G5', '');
  routeCell.alignment = {
    ...(routeCell.alignment || {}),
    horizontal: 'left',
    vertical: 'middle',
    wrapText: true,
  };
  routeCell.font = {
    ...(routeCell.font || {}),
    bold: true,
    size: 12,
    color: { argb: 'FF000000' },
  };
  worksheet.getRow(5).height = 36;
  clearRangeValues(worksheet, 21, 26, 5, 5);
  setCell(worksheet, `C${layout.summaryRow}`, extractWeek(project.name));
  setCell(worksheet, `E${layout.summaryRow}`, formatProjectPeriodFromEntries(sheetEntries, project));
  const { sectionColumns, trailingColumns } = ensureWorksheetHasSectionCapacity(worksheet, sections);
  setCell(worksheet, `G${layout.summaryRow}`, 'Tittibild:');
  previewLabelCell.alignment = {
    ...(previewLabelCell.alignment || {}),
    horizontal: 'left',
    vertical: 'top',
    wrapText: true,
  };
  previewLabelCell.font = {
    ...(previewLabelCell.font || {}),
    bold: true,
    size: 12,
    color: { argb: 'FF000000' },
  };
  setCell(worksheet, `${trailingColumns.nodnummer}${layout.sectionBoundaryRow}`, `Nöd nr ${projectFormState.nodnummer || ''}`.trim());
  setCell(worksheet, `${trailingColumns.sluttid}${layout.sectionTypeRow}`, `Senast Kl: ${primaryEntry.endTime || project.endTime || projectFormState.avslutningstid || ''}`.trim());
  setCell(worksheet, `${trailingColumns.start}${layout.sectionNumberRow}`, 'Starttid');
  setCell(worksheet, `${trailingColumns.begard}${layout.sectionNumberRow}`, 'Begärd');
  setCell(worksheet, `${trailingColumns.avslutat}${layout.sectionNumberRow}`, 'Avslutat');
  setCell(worksheet, `${trailingColumns.tsa}${layout.sectionNumberRow}`, 'TSA');
  setCell(worksheet, `${trailingColumns.anteckning}${layout.sectionNumberRow}`, 'Anteckningar');

  const sectionColumnMap = setSectionHeaders(worksheet, sections, sectionColumns, layout);

  const startRow = layout.dataStartRow;
  rows.forEach((row, index) => {
    const excelRow = startRow + index;
    setCell(worksheet, `C${excelRow}`, index + 1);
    setCell(worksheet, `D${excelRow}`, row.btkn || '');
    setCell(worksheet, `E${excelRow}`, buildNameAndPhone(row));
    setCell(
      worksheet,
      `F${excelRow}`,
      Array.isArray(row.anordning) ? row.anordning.map(formatAnordningLabel).join(', ') : ''
    );
    setCell(worksheet, `G${excelRow}`, buildSamradText(row, project));

    sectionColumns.forEach((column, columnIndex) => {
      const mappedSection = sectionColumnMap.get(columnIndex);
      const sectionIndex = mappedSection?.index;
      const isSelected = Number.isInteger(sectionIndex) ? row.selections?.[sectionIndex] : false;
      setCell(worksheet, `${column}${excelRow}`, isSelected ? 'X' : '');
    });

    setCell(worksheet, `${trailingColumns.start}${excelRow}`, row.startTime || row.starttid || '');
    setCell(worksheet, `${trailingColumns.begard}${excelRow}`, row.begard || '');
    setCell(worksheet, `${trailingColumns.avslutat}${excelRow}`, row.avslutat || '');
    setCell(
      worksheet,
      `${trailingColumns.tsa}${excelRow}`,
      row.tsa || (Array.isArray(row.anordning) && row.anordning.some((item) => String(item).toUpperCase() === 'TSA'))
        ? 'X'
        : ''
    );
    setCell(worksheet, `${trailingColumns.anteckning}${excelRow}`, row.anteckning || '');
  });
};

const createPlanWorkbookBuffer = async (project) => {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(`Excel-mallen saknas: ${TEMPLATE_PATH}`);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(TEMPLATE_PATH);

  const rows = Array.isArray(project.rows) ? project.rows : [];
  const worksheetPlans = buildWorksheetPlans(project);
  const templateSheet = workbook.getWorksheet('Dag natt') || workbook.worksheets[0];
  const templateSheetModel = JSON.parse(JSON.stringify(templateSheet.model));
  const usedSheetNames = new Set(
    workbook.worksheets
      .filter((sheet) => sheet && sheet !== templateSheet)
      .map((sheet) => String(sheet.name || ''))
      .filter(Boolean)
  );
  const createdPlanSheets = [];

  worksheetPlans.forEach((plan, index) => {
    const fallbackName = plan.sheetName || sheetNameFromDate(plan.entries[0]?.startDate);
    const sheetName = ensureUniqueWorksheetName(fallbackName, usedSheetNames);
    const worksheet = cloneWorksheetFromTemplate(workbook, templateSheetModel, sheetName);
    worksheet.name = sheetName;
    const matchingRows = rows.filter((row) => rowMatchesEntries(row, plan.entries));
    fillWorksheet(worksheet, project, plan.entries, matchingRows);
    createdPlanSheets.push(worksheet);
  });

  workbook.removeWorksheet(templateSheet.id);
  placePlanSheetsFirst(workbook, createdPlanSheets);

  return workbook.xlsx.writeBuffer();
};

module.exports = {
  TEMPLATE_PATH,
  createPlanWorkbookBuffer,
};
