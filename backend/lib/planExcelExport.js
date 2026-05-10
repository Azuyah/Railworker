const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const njdbDriftplatser = require('../data/njdb-driftplatser.json');

const TEMPLATE_PATH = path.join(__dirname, '..', 'assets', 'plan-template.xlsx');
const DRIFTPLATS_CODE_BY_NAME = new Map(
  Array.isArray(njdbDriftplatser?.items)
    ? njdbDriftplatser.items
        .filter((item) => item?.name && item?.code)
        .map((item) => [String(item.name).trim(), String(item.code).trim()])
    : []
);
const DRIFTPLATS_ALIAS_TO_CODE = new Map([
  ...DRIFTPLATS_CODE_BY_NAME.entries(),
  ['Landskrona Ö', 'Lkö'],
]);
const DRIFTPLATS_NAMES_BY_LENGTH = [...DRIFTPLATS_ALIAS_TO_CODE.keys()].sort((left, right) => right.length - left.length);

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
  abbreviateBoundaryText(String(section.granspunkter || ''))
    .trim()
    .replace(/\s*-\s*/g, '-')
    .replace(/\s*,\s*/g, ', ');

const escapeRegExp = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const abbreviateBoundaryText = (value = '') => {
  let text = String(value || '').trim();
  if (!text) {
    return '';
  }

  for (const name of DRIFTPLATS_NAMES_BY_LENGTH) {
    const code = DRIFTPLATS_ALIAS_TO_CODE.get(name);
    if (!code) continue;

    const regex = new RegExp(`(^|[\\s\\-–,(/])(${escapeRegExp(name)})(?=(?:\\s+\\S|\\s*[\\-–,/)])|$)`, 'gu');
    text = text.replace(regex, (_, prefix = '') => `${prefix}${code}`);
  }

  return text;
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

const forceBlackFont = (cell) => {
  if (!cell) return;
  cell.font = {
    ...(cell.font || {}),
    color: { argb: 'FF000000' },
  };
};

const MAX_TOP_ENTRY_ROWS = 6;

const getTemplateKind = (worksheet) => {
  const d1 = String(worksheet.getCell('D1').value || '').trim();
  const e1 = String(worksheet.getCell('E1').value || '').trim();
  const l1 = String(worksheet.getCell('L1').value || '').trim();
  const o1 = String(worksheet.getCell('O1').value || '').trim();

  if (d1 === 'Gränspunkter:' && o1 === 'Telnr TKL:') {
    return 'new-railworker';
  }

  if (e1 === 'Bet' && l1 === 'TKL Tel' && o1 === 'GRP') {
    return 'updated-legacy-v2';
  }

  if (d1 === 'Bet' && l1 === 'TKL Tel') {
    return 'updated-legacy';
  }

  return 'legacy';
};

const getEntryFjtklValue = (project = {}, entry = {}) =>
  String(entry?.telefonnummer || project.telefonnummer || '').trim();

const getEntryBoundaryValue = (project = {}, entry = {}) =>
  abbreviateBoundaryText(String(entry?.granspunkt || project.granspunkter || ''))
    .trim()
    .replace(/\s*-\s*/g, '-')
    .replace(/\s*,\s*/g, ', ');

const getHtsmPhoneValue = (projectFormState = {}) =>
  String(projectFormState?.htsmTelefon || '').trim();

const setTopInfoRows = (worksheet, project = {}, entries = []) => {
  const templateKind = getTemplateKind(worksheet);
  const rowCount =
    templateKind === 'updated-legacy-v2'
      ? 5
      : templateKind === 'updated-legacy' || templateKind === 'legacy'
        ? 4
        : MAX_TOP_ENTRY_ROWS;

  for (let index = 0; index < rowCount; index += 1) {
    const rowNumber = index + 1;
    const entry = entries[index] || {};
    const hasEntry = index < entries.length;

    if (templateKind === 'updated-legacy-v2') {
      setCell(worksheet, `E${rowNumber}`, hasEntry ? (entry?.beteckning || '') : '');
      setCell(worksheet, `L${rowNumber}`, hasEntry ? getEntryFjtklValue(project, entry) : '');
      setCell(worksheet, `O${rowNumber}`, hasEntry ? getEntryBoundaryValue(project, entry) : '');
      forceBlackFont(worksheet.getCell(`E${rowNumber}`));
      forceBlackFont(worksheet.getCell(`L${rowNumber}`));
      forceBlackFont(worksheet.getCell(`O${rowNumber}`));
      worksheet.getCell(`L${rowNumber}`).alignment = {
        ...(worksheet.getCell(`L${rowNumber}`).alignment || {}),
        horizontal: 'left',
        vertical: 'middle',
        wrapText: false,
      };
      worksheet.getCell(`O${rowNumber}`).alignment = {
        ...(worksheet.getCell(`O${rowNumber}`).alignment || {}),
        horizontal: 'left',
        vertical: 'middle',
        wrapText: true,
      };
      continue;
    }

    if (templateKind === 'updated-legacy') {
      setCell(worksheet, `D${rowNumber}`, hasEntry ? (entry?.beteckning || '') : '');
      setCell(worksheet, `E${rowNumber}`, hasEntry ? getEntryBoundaryValue(project, entry) : '');
      setCell(worksheet, `L${rowNumber}`, hasEntry ? getEntryFjtklValue(project, entry) : '');
      forceBlackFont(worksheet.getCell(`D${rowNumber}`));
      forceBlackFont(worksheet.getCell(`E${rowNumber}`));
      forceBlackFont(worksheet.getCell(`L${rowNumber}`));
      worksheet.getCell(`L${rowNumber}`).alignment = {
        ...(worksheet.getCell(`L${rowNumber}`).alignment || {}),
        horizontal: 'left',
        vertical: 'middle',
        wrapText: false,
      };
      continue;
    }

    if (templateKind === 'legacy') {
      setCell(worksheet, `E${rowNumber}`, hasEntry ? (entry?.beteckning || '') : '');
      setCell(worksheet, `L${rowNumber}`, hasEntry ? getEntryFjtklValue(project, entry) : '');
      forceBlackFont(worksheet.getCell(`E${rowNumber}`));
      forceBlackFont(worksheet.getCell(`L${rowNumber}`));
      worksheet.getCell(`L${rowNumber}`).alignment = {
        ...(worksheet.getCell(`L${rowNumber}`).alignment || {}),
        horizontal: 'left',
        vertical: 'middle',
        wrapText: false,
      };
      continue;
    }

    setCell(worksheet, `D${rowNumber}`, hasEntry ? getEntryBoundaryValue(project, entry) : '');
    setCell(worksheet, `E${rowNumber}`, hasEntry ? (entry?.beteckning || '') : '');
    setCell(worksheet, `O${rowNumber}`, hasEntry ? getEntryFjtklValue(project, entry) : '');
    forceBlackFont(worksheet.getCell(`D${rowNumber}`));
    forceBlackFont(worksheet.getCell(`E${rowNumber}`));
    forceBlackFont(worksheet.getCell(`O${rowNumber}`));
  }
};

const styleTopInfoBlock = (worksheet) => {
  const templateKind = getTemplateKind(worksheet);
  const maxTopRow = templateKind === 'updated-legacy-v2' ? 5 : 4;
  const styleRanges =
    templateKind === 'updated-legacy-v2'
      ? [
          [5, 5],
          [12, 12],
          [15, 15],
        ]
      : [
          [4, 11],
        ];

  for (let rowNumber = 1; rowNumber <= maxTopRow; rowNumber += 1) {
    styleRanges.forEach(([startColumn, endColumn]) => {
      for (let columnNumber = startColumn; columnNumber <= endColumn; columnNumber += 1) {
      const cell = worksheet.getCell(rowNumber, columnNumber);
      cell.font = {
        ...(cell.font || {}),
        name: 'Calibri',
        size: 14,
        bold: true,
      };
      cell.alignment = {
        ...(cell.alignment || {}),
        horizontal: 'left',
        vertical: 'middle',
      };
      }
    });
  }
};

const compactTopEntryRows = (worksheet, entryCount = 0) => {
  const templateKind = getTemplateKind(worksheet);

  if (templateKind === 'new-railworker') {
    for (let rowIndex = 1; rowIndex <= MAX_TOP_ENTRY_ROWS; rowIndex += 1) {
      const row = worksheet.getRow(rowIndex);
      row.hidden = false;
      row.height = 22;
    }

    for (let rowIndex = 7; rowIndex <= 10; rowIndex += 1) {
      const row = worksheet.getRow(rowIndex);
      row.hidden = false;
    }

    return {
      rowOffset: 0,
      summaryRow: 11,
      sectionBoundaryRow: 11,
      sectionTypeRow: 12,
      sectionNumberRow: 13,
      dataStartRow: 14,
      locationRow: 5,
      isNewTemplate: true,
    };
  }

  if (templateKind === 'updated-legacy-v2') {
    const visibleRows = Math.max(1, Math.min(5, entryCount || 1));
    for (let rowIndex = 1; rowIndex <= 5; rowIndex += 1) {
      const row = worksheet.getRow(rowIndex);
      const isHidden = rowIndex > visibleRows;
      row.hidden = isHidden;
      row.height = isHidden ? 0 : 22;
    }

    return {
      rowOffset: 0,
      summaryRow: 7,
      sectionBoundaryRow: 7,
      sectionTypeRow: 8,
      sectionNumberRow: 9,
      dataStartRow: 10,
      locationRow: 6,
      routeRow: 6,
      templateKind,
      isNewTemplate: false,
    };
  }

  const visibleRows = Math.max(1, Math.min(4, entryCount || 1));
  for (let rowIndex = 1; rowIndex <= 4; rowIndex += 1) {
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
    locationRow: 5,
    routeRow: 5,
    templateKind,
    isNewTemplate: false,
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
  const sections = Array.isArray(project) ? project : mergeSectionDetails(project);
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

const extractLocationNameFromBoundaryPart = (value = '') => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const match = raw.match(/^(.+?)(?=\s+\d|$)/);
  return String(match?.[1] || raw).trim();
};

const getSectionLocationLabel = (section = {}, index = 0) => {
  const label = String(section.signal || section.name || '').trim();
  if (!isDpSection(section, index)) {
    return '';
  }

  if (label && !label.includes(' - ')) {
    return label;
  }

  const explicitStart = extractLocationNameFromBoundaryPart(section.granspunktStart || '');
  const explicitEnd = extractLocationNameFromBoundaryPart(section.granspunktSlut || '');
  if (explicitStart && explicitEnd && explicitStart === explicitEnd) {
    return explicitStart;
  }
  if (explicitStart) {
    return explicitStart;
  }
  if (explicitEnd) {
    return explicitEnd;
  }

  const boundaryText = String(section.granspunkter || '').trim();
  if (boundaryText) {
    const [startPart = '', endPart = ''] = boundaryText.split(/\s*-\s*/);
    const startName = extractLocationNameFromBoundaryPart(startPart);
    const endName = extractLocationNameFromBoundaryPart(endPart);
    if (startName && endName && startName === endName) {
      return startName;
    }
    return startName || endName || '';
  }

  return label;
};

const buildSectionPopupLines = (section = {}, index = 0) => {
  const type = isDpSection(section, index) ? 'DP' : 'Linje';
  const label = String(section.signal || section.name || '').trim();
  const location = getSectionLocationLabel(section, index);
  const boundary = String(section.granspunkter || [section.granspunktStart, section.granspunktSlut].filter(Boolean).join(' - ')).trim();
  const spar = String(section.spar || '').trim();

  return [
    `${type} ${getSectionDisplayIndex(section, index)}`,
    label ? `Signal/område: ${label}` : '',
    location ? `Driftplats: ${location}` : '',
    boundary ? `Gränspunkter: ${boundary}` : '',
    spar ? `Spår: ${spar}` : '',
  ].filter(Boolean);
};

const applySectionPopupNote = (cell, section = {}, index = 0) => {
  if (!cell) return;
  const lines = buildSectionPopupLines(section, index);
  if (!lines.length) {
    cell.note = undefined;
    return;
  }

  // Keep the note plain and simple so Excel reliably preserves it.
  cell.note = lines.join('\n');
};

const setSectionHeaders = (worksheet, sections, sectionColumns, layout) => {
  const sectionColumnMap = buildSectionColumnMap(sections, sectionColumns);
  const boundaryRow = layout?.sectionBoundaryRow || 6;
  const typeRow = layout?.sectionTypeRow || 7;
  const numberRow = layout?.sectionNumberRow || 8;
  const locationRow = layout?.locationRow;

  sectionColumns.forEach((column, columnIndex) => {
    const mappedSection = sectionColumnMap.get(columnIndex);
    if (!mappedSection) {
      if (locationRow) {
        setCell(worksheet, `${column}${locationRow}`, '');
      }
      setCell(worksheet, `${column}${boundaryRow}`, '');
      setCell(worksheet, `${column}${typeRow}`, '');
      setCell(worksheet, `${column}${numberRow}`, '');
      return;
    }

    const section = mappedSection.section || {};
    const isDp = isDpSection(section, mappedSection.index);
    const styleSourceColumn = isDp ? 'I' : 'H';

    [String(boundaryRow), String(typeRow), String(numberRow)].forEach((rowSuffix) => {
      worksheet.getCell(`${column}${rowSuffix}`).style = cloneStyle(worksheet.getCell(`${styleSourceColumn}${rowSuffix}`).style || {});
    });

    if (locationRow) {
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
    }
    setCell(worksheet, `${column}${boundaryRow}`, getSectionBoundaryText(section) || getSectionSignalAndTrack(section).signal || '');
    worksheet.getCell(`${column}${boundaryRow}`).font = {
      ...(worksheet.getCell(`${column}${boundaryRow}`).font || {}),
      bold: true,
      size: 12,
      name: 'Calibri',
      color: { argb: 'FF000000' },
    };
    worksheet.getCell(`${column}${boundaryRow}`).alignment = {
      ...(worksheet.getCell(`${column}${boundaryRow}`).alignment || {}),
      horizontal: 'left',
      vertical: 'middle',
      wrapText: true,
    };
    applySectionPopupNote(worksheet.getCell(`${column}${boundaryRow}`), section, mappedSection.index);
    setCell(worksheet, `${column}${typeRow}`, isDp ? 'DP' : 'Linje');
    setCell(worksheet, `${column}${numberRow}`, getSectionDisplayIndex(section, mappedSection.index));
    worksheet.getCell(`${column}${numberRow}`).fill = isDp
      ? {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF00' },
          bgColor: { indexed: 64 },
        }
      : {
          type: 'pattern',
          pattern: 'none',
        };
  });

  return sectionColumnMap;
};

const stabilizeSectionLocationRow = (worksheet, sectionColumnMap, layout = {}) => {
  const locationRow = layout?.locationRow;
  if (!locationRow || !(sectionColumnMap instanceof Map)) {
    return;
  }

  sectionColumnMap.forEach(({ section, index }, columnIndex) => {
    const columnLetter = getColumnLetter(8 + columnIndex); // H = 8
    const cell = worksheet.getCell(`${columnLetter}${locationRow}`);
    const label = getSectionLocationLabel(section, index);

    cell.value = label || '';
    cell.alignment = {
      ...(cell.alignment || {}),
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };

    if (label) {
      cell.font = {
        ...(cell.font || {}),
        bold: true,
        size: 12,
        color: { argb: 'FF1F5EA8' },
        name: 'Calibri',
      };
    }
  });
};

const ensureWorksheetHasSectionCapacity = (worksheet, sections, layout = {}) => {
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
    if (trailingBase + offset !== templateTrailingBase + offset) {
      copyColumnStyles(worksheet, templateTrailingBase + offset, trailingBase + offset);
    }
  }

  const lastUsedColumn = trailingBase + 4;
  const templateLastColumn = trailingStart + 4;
  if (lastUsedColumn < templateLastColumn) {
    for (let columnNumber = lastUsedColumn + 1; columnNumber <= templateLastColumn; columnNumber += 1) {
      copyColumnStyles(worksheet, neutralTemplateColumn, columnNumber);
    }
    resetRangeFormatting(worksheet, lastUsedColumn + 1, templateLastColumn, 6, 80);
  }

  clearRangeValues(
    worksheet,
    baseSectionStart,
    clearUntilColumn,
    layout?.sectionBoundaryRow || 6,
    layout?.sectionNumberRow || 8
  );

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
    signal:
      sectionDetails[index]?.signal ||
      section?.signal ||
      section?.name ||
      '',
  }));
};

const sectionHasVisibleContent = (section = {}) =>
  Boolean(
    String(section?.signal || section?.name || '').trim() ||
    String(section?.granspunkter || '').trim() ||
    String(section?.granspunktStart || '').trim() ||
    String(section?.granspunktSlut || '').trim() ||
    String(section?.spar || '').trim()
  );

const normalizeGroupSections = (sections = []) =>
  (Array.isArray(sections) ? sections : [])
    .filter(sectionHasVisibleContent)
    .map((section, index) => ({
      ...section,
      sortOrder: Number.isFinite(Number(section?.sortOrder)) ? Number(section.sortOrder) : index,
    }))
    .sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0));

const buildDispSectionContexts = (project = {}, entries = []) => {
  const allEntryKeys = entries.map((entry) => entry.key).filter(Boolean);
  const primarySections = normalizeGroupSections(mergeSectionDetails(project));
  const configuredPrimaryKeys = Array.isArray(project.formState?.primaryDispSectionEntryKeys)
    ? project.formState.primaryDispSectionEntryKeys.filter(Boolean)
    : [];
  const primarySelectedEntryKeys = configuredPrimaryKeys.length ? configuredPrimaryKeys : allEntryKeys;

  const groups = [
    {
      id: 'primary-disp-group',
      title: 'Delområdesruta 1',
      selectedEntryKeys: primarySelectedEntryKeys,
      sections: primarySections,
    },
  ];

  const extraGroups = Array.isArray(project.formState?.dispSectionGroups)
    ? project.formState.dispSectionGroups
    : [];

  extraGroups.forEach((group, index) => {
    const sections = normalizeGroupSections(group?.sections);
    if (!sections.length) {
      return;
    }

    groups.push({
      id: String(group?.id || `disp-group-${index + 2}`),
      title: String(group?.title || `Delområdesruta ${index + 2}`).trim(),
      selectedEntryKeys: Array.isArray(group?.selectedEntryKeys) ? group.selectedEntryKeys.filter(Boolean) : [],
      sections,
    });
  });

  return groups;
};

const resolveJobEntries = (job = {}, entryMap = new Map(), entries = [], storedJobsCount = 0) => {
  const selectedEntries = Array.isArray(job.selectedEntryKeys)
    ? job.selectedEntryKeys.map((key) => entryMap.get(key)).filter(Boolean)
    : [];

  if (selectedEntries.length) {
    return sortEntries(selectedEntries);
  }

  const fallbackKeys = [
    String(job.primaryPlanEntryKey || '').trim(),
    String(job.primaryDispEntryKey || '').trim(),
  ].filter(Boolean);
  const fallbackEntries = fallbackKeys.map((key) => entryMap.get(key)).filter(Boolean);

  if (fallbackEntries.length) {
    return sortEntries(fallbackEntries);
  }

  if (storedJobsCount === 1) {
    return sortEntries(entries);
  }

  return [];
};

const resolveJobSectionContext = (job = {}, contexts = []) => {
  const candidateKeys = [
    String(job.primaryDispEntryKey || '').trim(),
    ...(Array.isArray(job.selectedEntryKeys) ? job.selectedEntryKeys.map((key) => String(key || '').trim()) : []),
    String(job.primaryPlanEntryKey || '').trim(),
  ].filter(Boolean);

  for (const key of candidateKeys) {
    const matchingContext = contexts.find((context) =>
      Array.isArray(context?.selectedEntryKeys) && context.selectedEntryKeys.includes(key)
    );
    if (matchingContext) {
      return matchingContext;
    }
  }

  const overlapContext = contexts.find((context) => {
    const keys = Array.isArray(context?.selectedEntryKeys) ? context.selectedEntryKeys : [];
    return candidateKeys.some((key) => keys.includes(key));
  });

  if (overlapContext) {
    return overlapContext;
  }

  return contexts[0] || { sections: [] };
};

const resolveContextEntries = (context = {}, entryMap = new Map()) => {
  const selectedKeys = Array.isArray(context?.selectedEntryKeys) ? context.selectedEntryKeys.filter(Boolean) : [];
  return sortEntries(selectedKeys.map((key) => entryMap.get(key)).filter(Boolean));
};

const inferWorksheetSequencePrefix = (jobs = []) => {
  const firstJobName = String(jobs?.[0]?.name || '').trim();
  if (/^dag\b/i.test(firstJobName)) {
    return 'Dag';
  }
  if (/^natt\b/i.test(firstJobName)) {
    return 'Natt';
  }
  return 'Plan';
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
  const dispSectionContexts = buildDispSectionContexts(project, entries);
  const separatePlanTabsByDispBox = Boolean(project.formState?.separatePlanTabsByDispBox);
  const storedJobs = Array.isArray(project.formState?.planJobs)
    ? project.formState.planJobs.filter((job) => job && (job.name || Array.isArray(job.selectedEntryKeys)))
    : [];

  if (separatePlanTabsByDispBox && dispSectionContexts.length) {
    const sequencePrefix = inferWorksheetSequencePrefix(storedJobs);
    return dispSectionContexts.map((context, index) => {
      const resolvedEntries = resolveContextEntries(context, entryMap);
      const matchingJob = storedJobs.find((job) => {
        const jobContext = resolveJobSectionContext(job, dispSectionContexts);
        return String(jobContext?.id || '') === String(context?.id || '');
      });
      const contextTitle = String(context?.title || '').trim();
      const hasDefaultContextTitle = /^Delområdesruta\s+\d+$/i.test(contextTitle);

      return {
        sheetName: String(matchingJob?.name || '').trim() ||
          (hasDefaultContextTitle ? `${sequencePrefix} ${index + 1}` : contextTitle) ||
          `${sequencePrefix} ${index + 1}`,
        entries: resolvedEntries,
        sections: Array.isArray(context?.sections) && context.sections.length
          ? context.sections
          : (dispSectionContexts[0]?.sections || mergeSectionDetails(project)),
      };
    });
  }

  if (!storedJobs.length) {
    return entries.map((entry, index) => ({
      sheetName: sheetNameFromDate(entry.startDate),
      entries: [{ ...entry, key: buildPlanJobEntryKey(entry, index) }],
      sections: dispSectionContexts[0]?.sections || mergeSectionDetails(project),
    }));
  }

  return storedJobs.map((job, index) => {
    const resolvedEntries = resolveJobEntries(job, entryMap, entries, storedJobs.length);
    const sectionContext = resolveJobSectionContext(job, dispSectionContexts);

    return {
      sheetName: String(job.name || '').trim() || sheetNameFromDate(resolvedEntries[0]?.startDate) || `Plan ${index + 1}`,
      entries: sortEntries(resolvedEntries),
      sections: Array.isArray(sectionContext?.sections) && sectionContext.sections.length
        ? sectionContext.sections
        : (dispSectionContexts[0]?.sections || mergeSectionDetails(project)),
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
  const templateMerges = Array.isArray(templateModel?.merges) ? [...templateModel.merges] : [];
  if (Array.isArray(templateModel?.merges)) {
    templateModel.merges = [];
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
  clonedSheet._railworkerTemplateMerges = templateMerges;
  return clonedSheet;
};

const reapplyTemplateMerges = (worksheet) => {
  const templateMerges = Array.isArray(worksheet?._railworkerTemplateMerges)
    ? worksheet._railworkerTemplateMerges
    : [];

  templateMerges.forEach((range) => {
    if (range === 'G5:Z5' || range === 'G6:Z6') {
      return;
    }
    try {
      worksheet.mergeCells(range);
    } catch (error) {
      // ignore ranges that are already merged or invalid after template adjustments
    }
  });
};

const fillWorksheet = (worksheet, project, entriesForSheet, rows) => {
  const projectFormState = project.formState || {};
  const sections = Array.isArray(entriesForSheet?.sections)
    ? entriesForSheet.sections
    : Array.isArray(entriesForSheet)
      ? mergeSectionDetails(project)
      : mergeSectionDetails(project);
  const normalizedEntries = Array.isArray(entriesForSheet?.entries)
    ? entriesForSheet.entries
    : Array.isArray(entriesForSheet)
      ? entriesForSheet
      : [];
  const sheetEntries = normalizedEntries;
  const primaryEntry = sheetEntries[0] || {};
  const layout = compactTopEntryRows(worksheet, sheetEntries.length);
  const routeRow = layout.routeRow || 5;
  try {
    worksheet.unMergeCells(`G${routeRow}:Z${routeRow}`);
  } catch (error) {
    // ignore if merge already changed
  }
  const routeCell = worksheet.getCell(`G${routeRow}`);
  const previewLabelCell = worksheet.getCell(`G${layout.summaryRow}`);

  setTopInfoRows(worksheet, project, sheetEntries);
  styleTopInfoBlock(worksheet);
  if (!layout.isNewTemplate) {
    applyTopGridBorders(worksheet);
    if (layout.templateKind !== 'updated-legacy-v2') {
      clearRangeValues(worksheet, 15, 26, 1, 4);
    }
    clearRangeValues(worksheet, 7, 26, routeRow, routeRow);
    setCell(worksheet, `G${routeRow}`, '');
    routeCell.alignment = {
      ...(routeCell.alignment || {}),
      horizontal: 'left',
      vertical: 'middle',
      wrapText: true,
    };
    routeCell.font = {
      ...(routeCell.font || {}),
      bold: true,
      color: { argb: 'FF000000' },
    };
    worksheet.getRow(routeRow).height = 36;
    clearRangeValues(worksheet, 21, 26, routeRow, routeRow);
  } else {
    clearRangeValues(worksheet, 4, 5, 7, 9);
    clearRangeValues(worksheet, 7, 26, 10, 10);
  }
  setCell(worksheet, `C${layout.summaryRow}`, extractWeek(project.name));
  setCell(worksheet, `E${layout.summaryRow}`, formatProjectPeriodFromEntries(sheetEntries, project));
  forceBlackFont(worksheet.getCell(`C${layout.summaryRow}`));
  forceBlackFont(worksheet.getCell(`E${layout.summaryRow}`));
  if (layout.templateKind === 'updated-legacy-v2') {
    setCell(worksheet, 'E6', getHtsmPhoneValue(projectFormState));
    forceBlackFont(worksheet.getCell('E6'));
  }
  const { sectionColumns, trailingColumns } = ensureWorksheetHasSectionCapacity(worksheet, sections, layout);
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
    color: { argb: 'FF000000' },
  };
  setCell(worksheet, `${trailingColumns.nodnummer}${layout.sectionBoundaryRow}`, `Nöd nr ${projectFormState.nodnummer || ''}`.trim());
  setCell(worksheet, `${trailingColumns.sluttid}${layout.sectionTypeRow}`, `Senast Kl: ${primaryEntry.endTime || project.endTime || projectFormState.avslutningstid || ''}`.trim());
  setCell(worksheet, `${trailingColumns.start}${layout.sectionNumberRow}`, 'Starttid');
  setCell(worksheet, `${trailingColumns.begard}${layout.sectionNumberRow}`, 'Begärd');
  setCell(worksheet, `${trailingColumns.avslutat}${layout.sectionNumberRow}`, 'Avslutat');
  setCell(worksheet, `${trailingColumns.tsa}${layout.sectionNumberRow}`, 'TSA');
  setCell(worksheet, `${trailingColumns.anteckning}${layout.sectionNumberRow}`, 'Anteckningar');
  forceBlackFont(worksheet.getCell(`${trailingColumns.nodnummer}${layout.sectionBoundaryRow}`));
  forceBlackFont(worksheet.getCell(`${trailingColumns.sluttid}${layout.sectionTypeRow}`));

  const sectionColumnMap = setSectionHeaders(worksheet, sections, sectionColumns, layout);
  stabilizeSectionLocationRow(worksheet, sectionColumnMap, layout);

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
    setCell(worksheet, `G${excelRow}`, buildSamradText(row, sections));

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
        ? '☒'
        : '☐'
    );
    setCell(worksheet, `${trailingColumns.anteckning}${excelRow}`, row.anteckning || '');
  });

  const tsaLastRow = Math.max(startRow, worksheet.rowCount || startRow);
  for (let rowNumber = startRow; rowNumber <= tsaLastRow; rowNumber += 1) {
    const tsaCell = worksheet.getCell(`${trailingColumns.tsa}${rowNumber}`);
    if (!String(tsaCell.value || '').trim()) {
      setCell(worksheet, `${trailingColumns.tsa}${rowNumber}`, '☐');
    }
  }

  for (let rowNumber = Math.max(layout.dataStartRow + 1, 11); rowNumber <= 27; rowNumber += 1) {
    setCell(worksheet, `E${rowNumber}`, rows[rowNumber - startRow]?.namn ? worksheet.getCell(`E${rowNumber}`).value : '');
  }

  applyTsaSelector(worksheet, trailingColumns, layout);
  applyCompletionHighlightRule(worksheet, trailingColumns, layout);

  reapplyTemplateMerges(worksheet);
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
    fillWorksheet(worksheet, project, plan, matchingRows);
    createdPlanSheets.push(worksheet);
  });

  workbook.removeWorksheet(templateSheet.id);
  placePlanSheetsFirst(workbook, createdPlanSheets);

  return workbook.xlsx.writeBuffer();
};

const applyCompletionHighlightRule = (worksheet, trailingColumns, layout) => {
  if (!worksheet || !trailingColumns?.avslutat || !trailingColumns?.anteckning || !layout?.dataStartRow) {
    return;
  }

  const firstDataRow = Number(layout.dataStartRow);
  const lastDataRow = Math.max(firstDataRow, worksheet.rowCount || firstDataRow);
  const range = `C${firstDataRow}:${trailingColumns.anteckning}${lastDataRow}`;
  const avslutatColumn = trailingColumns.avslutat;

  if (Array.isArray(worksheet.conditionalFormattings)) {
    worksheet.conditionalFormattings = worksheet.conditionalFormattings.filter((entry) => {
      const ref = String(entry?.ref || '');
      const formulas = Array.isArray(entry?.rules)
        ? entry.rules.flatMap((rule) => Array.isArray(rule?.formulae) ? rule.formulae : [])
        : [];
      const normalizedFormulas = formulas.map((formula) => String(formula || '').replace(/\s+/g, ''));
      const looksLikeCompletionRule = normalizedFormulas.some((formula) =>
        formula.includes('<>""') || formula.startsWith('LEN(TRIM($')
      );

      return !(ref.startsWith(`C${firstDataRow}:`) && looksLikeCompletionRule);
    });
  }

  worksheet.addConditionalFormatting({
    ref: range,
    rules: [
      {
        type: 'expression',
        priority: 1,
        formulae: [`$${avslutatColumn}${firstDataRow}<>""`],
        style: {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE46C6C' },
            bgColor: { argb: 'FFE46C6C' },
          },
          font: {
            color: { argb: 'FF000000' },
          },
        },
      },
    ],
  });
};

const applyTsaSelector = (worksheet, trailingColumns, layout) => {
  if (!worksheet || !trailingColumns?.tsa || !layout?.dataStartRow) {
    return;
  }

  const firstDataRow = Number(layout.dataStartRow);
  const lastDataRow = Math.max(firstDataRow, worksheet.rowCount || firstDataRow);

  for (let rowNumber = firstDataRow; rowNumber <= lastDataRow; rowNumber += 1) {
    const cell = worksheet.getCell(`${trailingColumns.tsa}${rowNumber}`);
    cell.dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: ['"☐,☒"'],
      showErrorMessage: true,
    };
    cell.alignment = {
      ...(cell.alignment || {}),
      horizontal: 'center',
      vertical: 'middle',
    };
  }
};

module.exports = {
  TEMPLATE_PATH,
  createPlanWorkbookBuffer,
};
