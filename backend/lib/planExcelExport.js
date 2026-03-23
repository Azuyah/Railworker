const path = require('path');
const ExcelJS = require('exceljs');

const TEMPLATE_PATH = '/Users/matsmalleandersson/Desktop/Disper/Pågående Disp Jobb/Rååbanan /V12/Planka/Planka Mall Rååbanan V12.xlsx';

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
    return 'Plan';
  }

  return `${match[2]}-${match[3]}`;
};

const ensureUniqueWorksheetName = (baseName, usedNames) => {
  const trimmedBase = String(baseName || 'Plan').slice(0, 31) || 'Plan';
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
  let nextFallbackColumn = 0;

  sections.forEach((section, index) => {
    let columnIndex = -1;
    const displayIndex = Number(section?.displayIndex);

    if (section?.namingMode === 'NUMBERS' && Number.isFinite(displayIndex) && displayIndex > 0) {
      columnIndex = displayIndex - 1;
    } else {
      while (columnMap.has(nextFallbackColumn) && nextFallbackColumn < columns.length) {
        nextFallbackColumn += 1;
      }
      columnIndex = nextFallbackColumn;
    }

    if (columnIndex < 0 || columnIndex >= columns.length || columnMap.has(columnIndex)) {
      return;
    }

    if (columnIndex === nextFallbackColumn) {
      nextFallbackColumn += 1;
    }

    if (columnIndex < columns.length) {
      columnMap.set(columnIndex, { section, index });
    }
  });

  return columnMap;
};

const setSectionHeaders = (worksheet, sections, sectionColumns) => {
  const sectionColumnMap = buildSectionColumnMap(sections, sectionColumns);

  sectionColumns.forEach((column, columnIndex) => {
    const mappedSection = sectionColumnMap.get(columnIndex);
    if (!mappedSection) {
      setCell(worksheet, `${column}3`, columnIndex < Math.max(...Array.from(sectionColumnMap.keys()), -1) ? '.' : '');
      worksheet.getCell(`${column}3`).note = undefined;
      return;
    }

    const { signal, spar } = getSectionSignalAndTrack(mappedSection.section || {});
    setCell(worksheet, `${column}3`, signal || '');
    if (spar) {
      worksheet.getCell(`${column}3`).note = { texts: [{ text: spar }] };
    } else {
      worksheet.getCell(`${column}3`).note = undefined;
    }
  });

  return sectionColumnMap;
};

const ensureWorksheetHasSectionCapacity = (worksheet, sections) => {
  const maxDisplayIndex = sections.reduce((maxValue, section, index) => {
    const displayIndex = getSectionDisplayIndex(section, index);
    return Math.max(maxValue, displayIndex);
  }, 0);
  const baseSectionStart = 8; // H
  const baseSectionCount = 10; // H-Q
  const extraSections = Math.max(0, maxDisplayIndex - baseSectionCount);

  if (extraSections > 0) {
    const insertAt = baseSectionStart + baseSectionCount; // before R
    worksheet.spliceColumns(insertAt, 0, ...Array.from({ length: extraSections }, () => []));

    for (let offset = 0; offset < extraSections; offset += 1) {
      const sourceColumnNumber = insertAt - 1;
      const targetColumnNumber = insertAt + offset;
      const sourceColumn = worksheet.getColumn(sourceColumnNumber);
      const targetColumn = worksheet.getColumn(targetColumnNumber);
      targetColumn.width = sourceColumn.width;
      targetColumn.style = cloneStyle(sourceColumn.style || {});
      for (let row = 1; row <= Math.max(worksheet.rowCount, 60); row += 1) {
        const sourceCell = worksheet.getCell(row, sourceColumnNumber);
        const targetCell = worksheet.getCell(row, targetColumnNumber);
        targetCell.style = cloneStyle(sourceCell.style || {});
        if (row === 4) {
          const displayIndex = targetColumnNumber - baseSectionStart + 1;
          targetCell.value = displayIndex % 2 === 1 ? 'Linje' : 'DP';
        }
      }
    }

    try {
      worksheet.unMergeCells('G2:W2');
    } catch (error) {
      // ignore if merge is already adjusted
    }
    worksheet.mergeCells(`G2:${getColumnLetter(23 + extraSections)}2`);
  }

  const sectionColumns = Array.from(
    { length: baseSectionCount + extraSections },
    (_, index) => getColumnLetter(baseSectionStart + index)
  );

  return {
    sectionColumns,
    trailingColumns: {
      start: getColumnLetter(baseSectionStart + baseSectionCount + extraSections),
      begard: getColumnLetter(baseSectionStart + baseSectionCount + extraSections + 1),
      avslutat: getColumnLetter(baseSectionStart + baseSectionCount + extraSections + 2),
      tsa: getColumnLetter(baseSectionStart + baseSectionCount + extraSections + 3),
      anteckning: getColumnLetter(baseSectionStart + baseSectionCount + extraSections + 5),
      nodnummer: getColumnLetter(baseSectionStart + baseSectionCount + extraSections + 1),
      sluttid: getColumnLetter(baseSectionStart + baseSectionCount + extraSections + 1),
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
    return entries;
  }

  return [
    {
      beteckning: Array.isArray(project.beteckningar) ? project.beteckningar[0]?.label || '' : '',
      startDate: project.startDate,
      startTime: project.startTime,
      endDate: project.endDate,
      endTime: project.endTime,
    },
  ];
};

const rowMatchesEntry = (row, entry) => {
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

const cloneWorksheetFromTemplate = (workbook, templateSheet, sheetName) => {
  const clonedSheet = workbook.addWorksheet(sheetName);
  const templateModel = JSON.parse(JSON.stringify(templateSheet.model));
  clonedSheet.model = {
    ...templateModel,
    name: sheetName,
  };
  return clonedSheet;
};

const fillWorksheet = (worksheet, project, entry, rows) => {
  const projectFormState = project.formState || {};
  const sections = mergeSectionDetails(project);

  setCell(worksheet, 'C3', extractWeek(project.name));
  setCell(worksheet, 'E2', formatProjectPeriod(entry));
  setCell(worksheet, 'F3', entry.beteckning || '');
  const { sectionColumns, trailingColumns } = ensureWorksheetHasSectionCapacity(worksheet, sections);
  setCell(
    worksheet,
    'G2',
    `${project.namn || ''} ${project.telefonnummer || ''} ${project.plats || ''}`.trim()
  );
  setCell(worksheet, `${trailingColumns.nodnummer}3`, `Nöd nr ${projectFormState.nodnummer || ''}`.trim());
  setCell(worksheet, `${trailingColumns.sluttid}4`, `Senast Kl: ${entry.endTime || project.endTime || projectFormState.avslutningstid || ''}`.trim());

  const sectionColumnMap = setSectionHeaders(worksheet, sections, sectionColumns);

  const startRow = 6;
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
    setCell(worksheet, `${trailingColumns.tsa}${excelRow}`, Array.isArray(row.anordning) && row.anordning.some((item) => String(item).toUpperCase() === 'TSA') ? 1 : 0);
    setCell(worksheet, `${trailingColumns.anteckning}${excelRow}`, row.anteckning || '');
  });
};

const createPlanWorkbookBuffer = async (project) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(TEMPLATE_PATH);

  const rows = Array.isArray(project.rows) ? project.rows : [];
  const entries = getProjectEntries(project);
  const templateSheet = workbook.getWorksheet('Dag natt') || workbook.worksheets[0];
  const usedSheetNames = new Set(
    workbook.worksheets
      .filter((sheet) => sheet && sheet !== templateSheet)
      .map((sheet) => String(sheet.name || ''))
      .filter(Boolean)
  );

  entries.forEach((entry, index) => {
    const sheetName = ensureUniqueWorksheetName(sheetNameFromDate(entry.startDate), usedSheetNames);
    const worksheet = index === 0
      ? templateSheet
      : cloneWorksheetFromTemplate(workbook, templateSheet, sheetName);
    worksheet.name = sheetName;
    const matchingRows = rows.filter((row) => rowMatchesEntry(row, entry));
    fillWorksheet(worksheet, project, entry, matchingRows);
  });

  return workbook.xlsx.writeBuffer();
};

module.exports = {
  TEMPLATE_PATH,
  createPlanWorkbookBuffer,
};
