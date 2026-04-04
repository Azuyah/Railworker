const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const LEGACY_LOGO_PATH = path.join(__dirname, '..', 'assets', 'vallakra-logo-cropped.png');
const LEGACY_VERSION_NUMBER = '1/MA09';
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
const PDF_FONTS = {
  header: 'LegacyVerdana',
  headerBold: 'LegacyVerdanaBold',
  headerItalic: 'LegacyVerdanaItalic',
  headerBoldItalic: 'LegacyVerdanaBoldItalic',
  body: 'LegacyTimes',
  bodyBold: 'LegacyTimesBold',
  bodyItalic: 'LegacyTimesItalic',
  bodyBoldItalic: 'LegacyTimesBoldItalic',
};

const SWEDISH_SHORT_DAYS = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];

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
    .replace(/\s+Driftplats(?:er)?$/i, '')
    .replace(/s$/i, '');

const normalizeTrackValue = (value = '') => {
  const normalized = sanitizeSectionText(value).replace(/^sp[aå]r\s*/i, '');
  if (!normalized) return '';

  const compactNumeric = normalized.match(/^\d+(?:[\s,]+\d+)*/)?.[0];
  if (compactNumeric) {
    return compactNumeric
      .split(/[\s,]+/)
      .filter(Boolean)
      .join(', ');
  }

  const letterTrack = normalized.match(/^[A-Za-z](?:,\s*[A-Za-z])*/)?.[0];
  return cleanText(letterTrack || normalized);
};

const formatDate = (value = '') => {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return cleanText(value);
  return `${match[1]}-${match[2]}-${match[3]}`;
};

const formatTime = (value = '') => cleanText(value);

const buildPlanJobEntryKey = (entry = {}, index = 0) =>
  `${entry.beteckning || 'entry'}|${entry.startDate || ''}|${index}`;

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
  const baseSections = sections.length
    ? sections
    : sectionDetails.map((details = {}, index) => ({
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
      const details = sectionDetails[index] || {};
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
      };
    })
    .sort((left, right) => left.sortOrder - right.sortOrder);
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

const buildDayRangeLabel = (entries = []) => {
  const uniqueDates = [...new Set(entries.map((entry) => entry.startDate).filter(Boolean))].sort();
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
    .replace(/Nm/gi, 'NM')
    .replace(/Em/gi, 'EM')
    .replace(/Kv/gi, 'KV')
    .replace(/Lör,\s*Sön/gi, 'Lör-Sön')
    .replace(/Fre,\s*Lör/gi, 'Fre-Lör');

const buildLegacyCoverRoute = (project = {}, dispSettings = {}) => {
  const explicit = cleanText(dispSettings.rubrik || project.name || '');
  const parts = cleanText(project.plats || '')
    .split(',')
    .map((part) => cleanText(part))
    .filter(Boolean);

  const looksAbbreviated =
    /^[A-Za-zÅÄÖåäö]{1,6}\s*-\s*[A-Za-zÅÄÖåäö]{1,6}$/.test(explicit) ||
    explicit.length <= 12;
  if (parts.length >= 2 && (looksAbbreviated || !explicit)) {
    return `${parts[0]} - ${parts[parts.length - 1]}`;
  }

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
    versionsnummer: cleanText(settings.versionsnummer || LEGACY_VERSION_NUMBER),
    banobjektVnr: cleanText(
      settings.banobjektVnr ||
        (meta.banarbetsobjektsId ? `${meta.banarbetsobjektsId}-1` : '')
    ),
    forplaneraCa: cleanText(settings.forplaneraCa || '1 tim innan start'),
    rodmarkeradeGranspunkter: cleanText(settings.rodmarkeradeGranspunkter || settings.highlightedBoundaries || ''),
  };
};

const formatLegacyBoundaryText = (value = '') =>
  cleanText(value)
    .replace(/\s*-\s*/g, ' – ')
    .replace(/\bHb\b/g, 'HB')
    .replace(/\bTp\b/g, 'TP')
    .replace(/\bBlb\b/g, 'Blb')
    .replace(/\bGan\b/g, 'Gan')
    .replace(/\bVåk\b/g, 'Våk')
    .replace(/\bTgp\b/g, 'Tgp');

const extractPrimaryPhone = (value = '') => {
  const match = cleanText(value).match(/010[- ]?\s*\d{3}\s*\d{2}\s*\d{2}/);
  return match ? cleanText(match[0]) : cleanText(value);
};

const extractValidityLabel = (weekLine = '') => {
  const match = cleanText(weekLine).match(/\bV\d{1,2}\b/i);
  return match ? match[0].toUpperCase() : 'V00';
};

const extractPeriodPrefix = (weekLine = '') => {
  const match = cleanText(weekLine).match(/\bV\d{1,2}\s+([A-Za-zÅÄÖåäö]+)/);
  const token = match ? cleanText(match[1]) : '';
  return ['Nm', 'Em', 'Kv'].includes(token) ? token : '';
};

const getShortDayName = (dateValue = '') => {
  const match = String(dateValue || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';
  const date = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? '' : SWEDISH_SHORT_DAYS[date.getUTCDay()];
};

const buildEntryDayLabel = (entry = {}, weekLine = '') => {
  const day = getShortDayName(entry.startDate);
  const prefix = extractPeriodPrefix(weekLine);
  if (!prefix) return day;
  if (cleanText(prefix).toLowerCase() === cleanText(day).toLowerCase()) return day;
  return [prefix, day].filter(Boolean).join(' ');
};

const getBoundaryHighlightTokens = (boundaryText = '') =>
  cleanText(boundaryText)
    .split(/\s*[-–]\s*|,\s*/)
    .map((token) => cleanText(token))
    .filter(Boolean);

const normalizeBoundaryToken = (value = '') => cleanText(value).replace(/\s+/g, '').toLowerCase();

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

  const registerFontIfPresent = (fontName, fontPath) => {
    if (fs.existsSync(fontPath)) {
      doc.registerFont(fontName, fontPath);
      return true;
    }
    return false;
  };

  registerFontIfPresent(PDF_FONTS.header, FONT_PATHS.verdana);
  registerFontIfPresent(PDF_FONTS.headerBold, FONT_PATHS.verdanaBold);
  registerFontIfPresent(PDF_FONTS.headerItalic, FONT_PATHS.verdanaItalic);
  registerFontIfPresent(PDF_FONTS.headerBoldItalic, FONT_PATHS.verdanaBoldItalic);
  registerFontIfPresent(PDF_FONTS.body, FONT_PATHS.times);
  registerFontIfPresent(PDF_FONTS.bodyBold, FONT_PATHS.timesBold);
  registerFontIfPresent(PDF_FONTS.bodyItalic, FONT_PATHS.timesItalic);
  registerFontIfPresent(PDF_FONTS.bodyBoldItalic, FONT_PATHS.timesBoldItalic);

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
  const validity = extractValidityLabel(dispSettings.veckaOchDagar || '');

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

  doc.text(validity, left, valueY, { lineBreak: false });
  doc.text(cleanText(dispSettings.versionsnummer || LEGACY_VERSION_NUMBER), left + 92, valueY, { lineBreak: false });
  doc.text(String(totalPages), left + 204, valueY, { lineBreak: false });
  doc.text('Vallåkra Rail AB', left, 74, { lineBreak: false });
  doc.restore();
};

const estimateChapterOnePageCount = (entries, sections) => {
  const firstPageCapacity = 22;
  const continuedPageCapacity = 24;
  const entryRows = entries.length + 1;
  const sectionRows = sections.length;
  const firstPageSectionCapacity = Math.max(0, firstPageCapacity - entryRows);

  if (sectionRows <= firstPageSectionCapacity) return 1;
  return 1 + Math.ceil((sectionRows - firstPageSectionCapacity) / continuedPageCapacity);
};

const estimateLegacyTotalPages = (entries, sections) => 2 + estimateChapterOnePageCount(entries, sections) + 4;

const addCoverPage = (doc, project, dispSettings) => {
  const left = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const routeLine = cleanText(project.plats || '');
  const displayRouteLine = routeLine && !/[.!?]$/.test(routeLine) ? `${routeLine}.` : routeLine;
  const weekLine = formatLegacyWeekLine(dispSettings.veckaOchDagar || '');
  const boundary = formatLegacyBoundaryText(project.granspunkter || '');

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

const drawLegacyBoundarySegment = (doc, text, x, y, maxWidth, highlightTokens = []) => {
  const normalizedText = cleanText(text);
  const dashMatch = normalizedText.match(/^(.+?)\s*[–-]\s*(.+)$/);
  const fitFontSize = () => {
    const sizes = [12, 11.5, 11, 10.5, 10, 9.5, 9];
    if (!maxWidth) return 12;
    return sizes.find((size) => {
      doc.font(PDF_FONTS.bodyBold).fontSize(size);
      return doc.widthOfString(normalizedText) <= maxWidth;
    }) || 9;
  };
  const fontSize = fitFontSize();
  doc.font(PDF_FONTS.bodyBold).fontSize(fontSize);

  if (!dashMatch) {
    const color = highlightTokens.includes(normalizeBoundaryToken(normalizedText)) ? '#c1121f' : '#000000';
    doc.fillColor(color).text(normalizedText, x, y, { width: maxWidth, lineBreak: false });
    return;
  }

  const leftToken = cleanText(dashMatch[1]);
  const rightToken = cleanText(dashMatch[2]);
  const separator = ' – ';
  const leftColor = highlightTokens.includes(normalizeBoundaryToken(leftToken)) ? '#c1121f' : '#000000';
  const rightColor = highlightTokens.includes(normalizeBoundaryToken(rightToken)) ? '#c1121f' : '#000000';

  doc.fillColor(leftColor).text(leftToken, x, y, { lineBreak: false });
  const leftWidth = doc.widthOfString(leftToken);
  doc.fillColor('#000000').text(separator, x + leftWidth, y, { lineBreak: false });
  const separatorWidth = doc.widthOfString(separator);
  doc.fillColor(rightColor).text(rightToken, x + leftWidth + separatorWidth, y, {
    width: Math.max(0, (maxWidth || 0) - leftWidth - separatorWidth),
    lineBreak: false,
  });
};

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
  const totalHeight = headerHeight + (rows.length * rowHeight) + 12;
  const bottom = top + totalHeight;
  const headerFontSize = 12;
  const rowFontSize = 12;

  doc.save();
  doc.lineWidth(0.7).strokeColor('#666666').rect(left, top, width, totalHeight).stroke();

  const entryHeaderY = top + 7;
  doc.font(PDF_FONTS.bodyBold).fontSize(headerFontSize).fillColor('#000000');
  if (mode === 'full') {
    doc.text('Beteckning', left + entryColumns.beteckning.x, entryHeaderY, { lineBreak: false });
    doc.text('Startdag och tid', left + entryColumns.start.x, entryHeaderY, { lineBreak: false });
    doc.text('Slutdag och tid', left + entryColumns.end.x, entryHeaderY, { lineBreak: false });
  } else {
    doc.text('Delområde', left + sectionColumns.label.x, entryHeaderY, { lineBreak: false });
    doc.text('Sträcka / område', left + sectionColumns.name.x, entryHeaderY, { lineBreak: false });
    doc.text('Gränspunkter', left + sectionColumns.granspunkter.x, entryHeaderY, { lineBreak: false });
    doc.text('Spår', left + sectionColumns.spar.x, entryHeaderY, { lineBreak: false });
  }

  let y = top + headerHeight;

  rows.forEach((row) => {
    if (row.kind === 'entry') {
      doc.font(PDF_FONTS.bodyBold).fontSize(rowFontSize).fillColor('#000000');
      doc.text(row.beteckning, left + entryColumns.beteckning.x, y, {
        width: entryColumns.beteckning.width,
        lineBreak: false,
      });
      doc.text(row.dayLabel, left + entryColumns.start.x, y, {
        width: entryColumns.startDay.width,
        lineBreak: false,
      });
      doc.font(PDF_FONTS.bodyBold).fontSize(rowFontSize).text(row.startDateTime, left + entryColumns.startDateTime.x, y, {
        width: entryColumns.startDateTime.width,
        lineBreak: false,
      });
      doc.text(`—     ${row.endDateTime}`, left + entryColumns.end.x, y, {
        width: entryColumns.end.width,
        lineBreak: false,
      });
    } else if (row.kind === 'spacer') {
      // Keep the visual gap between entry rows and section rows, but remove the extra header line.
    } else if (row.kind === 'section') {
      doc.font(PDF_FONTS.bodyBold).fontSize(rowFontSize).fillColor('#000000');
      doc.text(row.label, left + sectionColumns.label.x, y, {
        width: sectionColumns.label.width,
        lineBreak: false,
      });
      doc.text(row.name, left + sectionColumns.name.x, y, {
        width: sectionColumns.name.width,
        lineBreak: false,
      });
      drawLegacyBoundarySegment(
        doc,
        row.granspunkter,
        left + sectionColumns.granspunkter.x,
        y,
        sectionColumns.granspunkter.width,
        highlightTokens
      );
      doc.fillColor('#000000').font(PDF_FONTS.bodyBold).fontSize(12).text(row.spar, left + sectionColumns.spar.x, y, {
        width: sectionColumns.spar.width,
        lineBreak: false,
      });
    }

    y += rowHeight;
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

const addEntriesAndSectionsPage = (doc, project, entries, sections, dispSettings, totalPages) => {
  doc.addPage();
  const firstPageNumber = doc.bufferedPageRange().count;
  drawLegacyHeader(doc, dispSettings, totalPages, firstPageNumber);
  const pageWidth = doc.page.width;
  const tableLeft = 74;
  const tableWidth = pageWidth - 2 * tableLeft;
  const rowHeight = 21;
  const headerHeight = 31;
  const noteText = 'Yttre gränspunkter som ej får passeras utan medgivande från TKL är rödmarkerade.';
  const weekLine = cleanText(dispSettings.veckaOchDagar || '');
  const explicitHighlightValue = cleanText(dispSettings.rodmarkeradeGranspunkter || '');
  const highlightSource = explicitHighlightValue || project.granspunkter || '';
  const highlightTokens = getBoundaryHighlightTokens(highlightSource).map(normalizeBoundaryToken);

  const entryColumns = {
    beteckning: { x: 6, width: 82 },
    start: { x: 116 },
    startDay: { x: 116, width: 52 },
    startDateTime: { x: 166, width: 140 },
    end: { x: 274, width: 154 },
  };
  const sectionColumns = {
    label: { x: 10, width: 92 },
    name: { x: 108, width: 136 },
    granspunkter: { x: 244, width: 84 },
    spar: { x: 344, width: 78 },
  };

  const entryRows = entries.map((entry) => ({
    kind: 'entry',
    beteckning: entry.beteckning,
    dayLabel: buildEntryDayLabel(entry, weekLine),
    startDateTime: [formatDate(entry.startDate), formatTime(entry.startTime)].filter(Boolean).join('     '),
    endDateTime: [formatDate(entry.endDate), formatTime(entry.endTime)].filter(Boolean).join('     '),
  }));
  const sectionRows = sections.map((section) => ({
    kind: 'section',
    label: section.label,
    name: cleanText(section.signal || section.name),
    granspunkter: formatLegacyBoundaryText(section.granspunkter),
    spar: section.spar ? `Spår ${section.spar}` : '—',
  }));
  const firstPageCapacity = 22;
  const continuedPageCapacity = 24;
  const firstPageSectionCapacity = Math.max(0, firstPageCapacity - (entryRows.length + 1));
  const firstPageSectionRows = sectionRows.slice(0, firstPageSectionCapacity);
  const remainingSectionRows = sectionRows.slice(firstPageSectionCapacity);
  const continuationChunks = [];

  for (let index = 0; index < remainingSectionRows.length; index += continuedPageCapacity) {
    continuationChunks.push(remainingSectionRows.slice(index, index + continuedPageCapacity));
  }

  const rows = [
    ...entryRows,
    { kind: 'spacer' },
    ...firstPageSectionRows,
  ];

  drawLegacyChapterHeading(doc, '1 Gränspunkter och delområde.');
  drawLegacyChapterOneTable(doc, rows, {
    left: tableLeft,
    top: 248,
    width: tableWidth,
    rowHeight,
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
    drawLegacyChapterOneTable(doc, chunk, {
      left: tableLeft,
      top: 188,
      width: tableWidth,
      rowHeight,
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

const getLegacyChapters = (project = {}, dispSettings = {}) => {
  const htsmTelefon = cleanText(project.formState?.htsmTelefon || '');
  const reservnr = cleanText(project.formState?.reservnr || '');
  const bandriftnummer = cleanText(project.formState?.bandriftnummer || '');
  const eldriftnummer = cleanText(project.formState?.eldriftnummer || '');
  const larmTlc = extractPrimaryPhone(project.formState?.nodnummer || '') || 'Ej angivet';
  const fjtklRawName = cleanText(project.namn || '');
  const fjtklName = fjtklRawName
    ? (/^TKL\b/i.test(fjtklRawName) ? fjtklRawName.replace(/^TKL\b/i, 'Fjtkl') : `Fjtkl ${fjtklRawName}`)
    : 'Fjtkl';
  const fjtklPhone = extractPrimaryPhone(project.telefonnummer || '') || 'Ej angivet';

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
        `${fjtklName || 'Fjtkl'}  ${fjtklPhone}`,
      ].filter(Boolean),
    },
  ];
};

const addStaticTextPages = (doc, project, dispSettings, totalPages) => {
  const chapters = getLegacyChapters(project, dispSettings);
  const chapterPages = {};
  const groups = [
    [2, 3, 4],
    [5, 6, 7],
    [8, 9, 10, 11],
    [12, 13],
  ];
  const chapterMap = new Map(chapters.map((chapter) => [chapter.number, chapter]));

  groups.forEach((group) => {
    doc.addPage();
    const pageNumber = doc.bufferedPageRange().count;
    drawLegacyHeader(doc, dispSettings, totalPages, pageNumber);
    const bodyX = doc.page.margins.left + 48;
    const bodyWidth = doc.page.width - bodyX - doc.page.margins.right;
    let y = 122;

    group.forEach((chapterNumber) => {
      const chapter = chapterMap.get(chapterNumber);
      if (!chapter) return;

      chapterPages[chapter.number] = pageNumber;
      y = drawLegacySplitChapterHeading(doc, chapter.number, chapter.title, y) + 8;

      const lines = Array.isArray(chapter.lines) ? chapter.lines : chapter.paragraphs;
      lines.forEach((line) => {
        doc.font(PDF_FONTS.body).fontSize(12).fillColor('#000000').text(line, bodyX, y, {
          width: bodyWidth,
          lineGap: 2,
        });
        y = doc.y + 3;
      });

      y += 18;
    });
  });

  return chapterPages;
};

const createDispPdfBuffer = async (project = {}) => {
  const entries = buildEntries(project);
  const sections = buildSections(project);
  const dispSettings = buildDispSettings(project, entries);
  const totalPages = estimateLegacyTotalPages(entries, sections);
  const title = ['Dispositionsarbetsplan', getPublicDispName(project, dispSettings) || dispSettings.rubrik || project.name].filter(Boolean).join(' ');
  const { doc, toBuffer } = createDocument(title);

  drawLegacyHeader(doc, dispSettings, totalPages, 1);
  addCoverPage(doc, project, dispSettings);
  const contentsPageIndex = addContentsPage(doc);
  doc.switchToPage(contentsPageIndex);
  drawLegacyHeader(doc, dispSettings, totalPages, 2);
  const chapterPages = {
    ...addEntriesAndSectionsPage(doc, project, entries, sections, dispSettings, totalPages),
    ...addStaticTextPages(doc, project, dispSettings, totalPages),
  };
  addContentsPage(doc, chapterPages, contentsPageIndex);

  doc.end();
  return toBuffer();
};

module.exports = {
  createDispPdfBuffer,
  getPublicDispName,
};
