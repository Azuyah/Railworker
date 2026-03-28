const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const COVER_LOGO_PATH = path.join(__dirname, '..', 'assets', 'vallakra-logo-watermark.png');

const COLORS = {
  text: '#0f172a',
  muted: '#64748b',
  accent: '#b91c1c',
  border: '#cbd5e1',
  surface: '#f8fafc',
  strong: '#111827',
};

const SWEDISH_SHORT_DAYS = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];
const FONT_SIZES = {
  tableHeader: 11,
  tableBody: 11,
  sectionHeading: 16,
  body: 12.5,
  phoneHighlight: 16.5,
  note: 11,
};

const getCurrentPageNumber = (doc) => doc.bufferedPageRange().count;
const ensurePageSpace = (doc, requiredHeight = 120) => {
  const availableBottom = doc.page.height - doc.page.margins.bottom;
  if (doc.y + requiredHeight > availableBottom) {
    doc.addPage();
  }
};

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
  if (!normalized) {
    return '';
  }

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
  if (!match) {
    return value || '';
  }

  return `${match[1]}-${match[2]}-${match[3]}`;
};

const formatTime = (value = '') => String(value || '').trim();

const buildPlanJobEntryKey = (entry = {}, index = 0) =>
  `${entry.beteckning || 'entry'}|${entry.startDate || ''}|${index}`;

const buildEntries = (project = {}) => {
  const entries = Array.isArray(project.formState?.blankett31Entries)
    ? project.formState.blankett31Entries
    : [];
  const entryMap = new Map(entries.map((entry, index) => [buildPlanJobEntryKey(entry, index), entry]));
  const planJobs = Array.isArray(project.formState?.planJobs)
    ? project.formState.planJobs
    : [];
  const selectedDispEntries = planJobs
    .map((job) => entryMap.get(job?.primaryDispEntryKey || ''))
    .filter(Boolean);
  const sourceEntries = selectedDispEntries.length ? selectedDispEntries : entries;

  return sourceEntries
    .filter((entry) => entry?.beteckning || entry?.startDate || entry?.endDate)
    .map((entry) => ({
      beteckning: cleanText(entry.beteckning),
      startDate: cleanText(entry.startDate),
      startTime: cleanText(entry.startTime),
      endDate: cleanText(entry.endDate),
      endTime: cleanText(entry.endTime),
    }))
    .sort((left, right) => {
      const leftKey = `${left.startDate || '9999-99-99'} ${left.startTime || '99:99'} ${left.beteckning || ''}`;
      const rightKey = `${right.startDate || '9999-99-99'} ${right.startTime || '99:99'} ${right.beteckning || ''}`;
      return leftKey.localeCompare(rightKey, 'sv');
    });
};

const buildSections = (project = {}) => {
  const sections = Array.isArray(project.sections) ? project.sections : [];
  const sectionDetails = Array.isArray(project.formState?.sectionDetails)
    ? project.formState.sectionDetails
    : [];
  const fallbackBoundary = sanitizeSectionText(project.granspunkter || '');
  const singleSectionFallbackName =
    sections.length === 1
      ? normalizeSectionAreaName(project.plats || project.formState?.dispSettings?.banNamn || '')
      : '';

  return sections
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
        granspunktStart,
        granspunktSlut,
        granspunkter,
        spar: normalizeTrackValue(details.spar),
      };
    })
    .sort((left, right) => left.sortOrder - right.sortOrder);
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

const buildDayRangeLabel = (entries = []) => {
  const uniqueDates = [...new Set(entries.map((entry) => entry.startDate).filter(Boolean))].sort();
  if (!uniqueDates.length) {
    return '';
  }

  const labels = uniqueDates.map((dateValue) => {
    const date = new Date(`${dateValue}T00:00:00Z`);
    return Number.isNaN(date.getTime()) ? dateValue : SWEDISH_SHORT_DAYS[date.getUTCDay()];
  });

  if (labels.length === 1) {
    return labels[0];
  }

  if (labels.length === 2) {
    return `${labels[0]} – ${labels[1]}`;
  }

  return `${labels.slice(0, -1).join(', ')} och ${labels[labels.length - 1]}`;
};

const extractBlankettMeta = (project = {}) => project.formState?.blankett31Meta || {};

const buildDispSettings = (project = {}, entries = []) => {
  const meta = extractBlankettMeta(project);
  const settings = project.formState?.dispSettings || {};
  const weekLabel = cleanText(settings.weekLine || settings.veckaOchDagar);
  const derivedWeek = meta.referenceWeek || getIsoWeek(entries[0]?.startDate || project.startDate || '');
  const derivedDayRange = buildDayRangeLabel(entries);

  return {
    rubrik: cleanText(settings.rubrik || settings.projectLabel || meta.projectLabel || project.name),
    banNamn: cleanText(settings.banNamn || settings.banName),
    veckaOchDagar: weekLabel || [derivedWeek, derivedDayRange].filter(Boolean).join(' '),
    banobjektVnr: cleanText(
      settings.banobjektVnr ||
        (meta.banarbetsobjektsId ? `${meta.banarbetsobjektsId}-1` : '')
    ),
    forplaneraCa: cleanText(settings.forplaneraCa || '1 tim innan start'),
  };
};

const parseList = (value = '') =>
  String(value || '')
    .split(/\s*,\s*|\s*-\s*/)
    .map(cleanText)
    .filter(Boolean)
    .join(', ');

const PHONE_PATTERN = /(010[- ]\s*\d{3}\s*\d{2}\s*\d{2}(?:\s*\(\s*010[- ]\s*\d{3}\s*\d{2}\s*\d{2}\s*\))?)/;
const PHONE_PATTERN_GLOBAL = new RegExp(PHONE_PATTERN.source, 'g');

const extractNamedPhone = (label = '', value = '') => {
  const combined = cleanText([label, value].filter(Boolean).join(' '));
  const phoneMatches = [...combined.matchAll(PHONE_PATTERN_GLOBAL)].map((match) => cleanText(match[1]));
  const uniquePhones = [...new Set(phoneMatches.filter(Boolean))];
  const fallbackPhone = cleanText(value);
  const phone = uniquePhones[0] || fallbackPhone;
  const name = cleanText(combined.replace(PHONE_PATTERN_GLOBAL, '')).replace(/\s+/g, ' ').trim();

  return {
    name,
    phone: cleanText(phone),
  };
};

const buildPhoneRows = (project = {}) => {
  const htsmTelefon = cleanText(project.formState?.htsmTelefon || '');
  const reservnr = cleanText(project.formState?.reservnr || '');
  const fjtklBlocks = Array.isArray(project.formState?.fjtklBlocks) ? project.formState.fjtklBlocks : [];
  const primaryFjtklName = cleanText(project.namn || '');
  const primaryFjtklPhone = extractNamedPhone('', project.telefonnummer).phone || cleanText(project.telefonnummer || '');
  const primaryFjtklLabel = primaryFjtklName
    ? (/^TKL\b/i.test(primaryFjtklName) ? primaryFjtklName : `TKL ${primaryFjtklName}`)
    : 'TKL';
  const primaryFjtklValue = primaryFjtklPhone || 'Ej angivet';

  return [
    { label: 'SOS Alarm', value: '112 eller se övriga nummer nedan' },
    { label: 'Larm TLC', value: cleanText(project.formState?.nodnummer || '') || 'Ej angivet' },
    {
      label: 'HTSM',
      value: [htsmTelefon || 'Ej angivet', reservnr ? `Reservnr: ${reservnr}` : ''].filter(Boolean).join(' '),
    },
    {
      label: primaryFjtklLabel,
      value: primaryFjtklValue,
    },
    ...fjtklBlocks
      .filter((block) => cleanText(block?.namn) || cleanText(block?.telefonnummer))
      .map((block, index) => ({
        label: `FJTKL ${index + 1}`,
        value: cleanText([block.namn, block.telefonnummer].filter(Boolean).join(' ')) || 'Ej angivet',
      })),
  ];
};

const createDocument = (title = 'Dispositionsarbetsplan') => {
  const doc = new PDFDocument({
    size: 'A4',
    margins: {
      top: 42,
      right: 48,
      bottom: 42,
      left: 48,
    },
    bufferPages: true,
    info: {
      Title: title,
      Author: 'Railworker',
      Subject: 'Dispositionsarbetsplan',
    },
  });

  const buffers = [];
  doc.on('pageAdded', () => {
    drawPageWatermark(doc);
  });
  doc.on('data', (chunk) => buffers.push(chunk));
  drawPageWatermark(doc);

  return {
    doc,
    toBuffer: () =>
      new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);
      }),
  };
};

const drawPageBadge = (doc, value, x, y, width = 90) => {
  doc.save();
  doc.roundedRect(x, y, width, 22, 11).fillAndStroke('#f8fafc', '#cbd5e1');
  doc.fillColor(COLORS.strong).font('Helvetica-Bold').fontSize(10).text(value, x, y + 6, {
    width,
    align: 'center',
  });
  doc.restore();
};

const drawPageWatermark = (doc) => {
  if (!fs.existsSync(COVER_LOGO_PATH)) {
    return;
  }

  const watermarkWidth = Math.min(500, doc.page.width - 92);
  const watermarkHeight = watermarkWidth * (520 / 1500);
  const x = (doc.page.width - watermarkWidth) / 2;
  const y = (doc.page.height - watermarkHeight) / 2 + 10;

  doc.save();
  doc.opacity(0.03);
  doc.image(COVER_LOGO_PATH, x, y, {
    fit: [watermarkWidth, watermarkHeight],
    align: 'center',
    valign: 'center',
  });
  doc.restore();
};

const drawInfoCard = (doc, title, value, x, y, width, accent = false) => {
  doc.save();
  doc.roundedRect(x, y, width, 56, 12).fillAndStroke(accent ? '#fff5f5' : '#f8fafc', accent ? '#fecaca' : '#e2e8f0');
  doc.fillColor(COLORS.strong).font('Helvetica-Bold').fontSize(10.5).text(title, x + 12, y + 10, { width: width - 24 });
  doc.fillColor(COLORS.strong).font('Helvetica-Bold').fontSize(14.2).text(value || 'Ej angivet', x + 12, y + 27, {
    width: width - 24,
  });
  doc.restore();
};

const getContentBottomY = (doc) => doc.page.height - doc.page.margins.bottom;

const getTextHeight = (doc, text, width, { font = 'Helvetica', fontSize = FONT_SIZES.body, lineGap = 2 } = {}) => {
  doc.font(font).fontSize(fontSize);
  return doc.heightOfString(text || '—', {
    width,
    lineGap,
  });
};

const getFittedFontSize = (doc, text, maxWidth, preferredSize, minSize, font = 'Helvetica') => {
  let currentSize = preferredSize;

  while (currentSize > minSize) {
    doc.font(font).fontSize(currentSize);
    if (doc.widthOfString(text || '—') <= maxWidth) {
      break;
    }
    currentSize -= 0.2;
  }

  return Math.max(minSize, Number(currentSize.toFixed(1)));
};

const getTableCellLayout = (doc, column, value) => {
  const text = cleanText(value) || '—';
  const preferredFont = column.font || 'Helvetica';
  const preferredSize = column.fontSize || FONT_SIZES.tableBody;

  if (column.noWrap) {
    const fontSize = getFittedFontSize(
      doc,
      text,
      column.width - 16,
      preferredSize,
      column.minFontSize || 8.4,
      preferredFont
    );

    return {
      text,
      font: preferredFont,
      fontSize,
      height: getTextHeight(doc, text, column.width - 16, {
        font: preferredFont,
        fontSize,
        lineGap: 1,
      }),
    };
  }

  return {
    text,
    font: preferredFont,
    fontSize: preferredSize,
    height: getTextHeight(doc, text, column.width - 16, {
      font: preferredFont,
      fontSize: preferredSize,
      lineGap: 1,
    }),
  };
};

const getPhoneRowLayout = (doc, row, index, width) => {
  const label = `${index + 1}. ${row.label}`;
  const isHtsmRow = String(row.label || '').trim().toUpperCase() === 'HTSM';
  const labelGap = 10;
  const measuredLabelWidth = doc.widthOfString(label, {
    font: 'Helvetica-Bold',
    size: COMPACT_CHAPTER_FONT.label,
  });
  const labelWidth = Math.max(54, Math.min(Math.max(68, measuredLabelWidth + 6), width * 0.29));
  const valueWidth = width - labelWidth - labelGap;
  const value = row.value || 'Ej angivet';
  const htsmMatch = isHtsmRow
    ? value.match(/^(.*?)(?:\s+Reservnr:\s*(.*))?$/i)
    : null;
  const primaryValue = isHtsmRow ? cleanText(htsmMatch?.[1] || value) : value;
  const secondaryValue = isHtsmRow ? cleanText(htsmMatch?.[2] || '') : '';
  const valueFontSize = isHtsmRow
    ? COMPACT_CHAPTER_FONT.body
    : getFittedFontSize(doc, value, valueWidth, COMPACT_CHAPTER_FONT.body, 8.2);
  const labelHeight = getTextHeight(doc, label, labelWidth, {
    font: 'Helvetica-Bold',
    fontSize: COMPACT_CHAPTER_FONT.label,
    lineGap: 1,
  });
  const primaryValueHeight = getTextHeight(doc, primaryValue, valueWidth, {
    font: 'Helvetica',
    fontSize: valueFontSize,
    lineGap: 1,
  });
  const secondaryValueHeight = secondaryValue
    ? getTextHeight(doc, `Reservnr: ${secondaryValue}`, valueWidth, {
        font: 'Helvetica',
        fontSize: valueFontSize,
        lineGap: 1,
      })
    : 0;
  const rowHeight = isHtsmRow
    ? Math.max(labelHeight, primaryValueHeight + (secondaryValueHeight ? secondaryValueHeight + 2 : 0))
    : Math.max(labelHeight, getTextHeight(doc, value, valueWidth, {
        font: 'Helvetica',
        fontSize: valueFontSize,
        lineGap: 1,
      }));

  return {
    label,
    labelGap,
    labelWidth,
    value,
    primaryValue,
    primaryValueHeight,
    secondaryValue,
    valueFontSize,
    valueWidth,
    rowHeight,
    isHtsmRow,
  };
};

const drawTableHeader = (doc, { x, y, columns, headerHeight = 26 }) => {
  const tableWidth = columns.reduce((sum, column) => sum + column.width, 0);

  doc.save();
  doc.roundedRect(x, y, tableWidth, headerHeight, 12).fillAndStroke('#e2e8f0', '#cbd5e1');

  let currentX = x;
  columns.forEach((column, index) => {
    if (index > 0) {
      doc.moveTo(currentX, y).lineTo(currentX, y + headerHeight).strokeColor('#cbd5e1').stroke();
    }
    doc.fillColor(COLORS.strong).font('Helvetica-Bold').fontSize(FONT_SIZES.tableHeader).text(column.label, currentX + 8, y + 7, {
      width: column.width - 16,
      align: column.align || 'left',
    });
    currentX += column.width;
  });

  doc.restore();
  return y + headerHeight;
};

const getTableRowHeight = (doc, columns, row, minHeight = 26) => {
  const contentHeight = columns.reduce((maxHeight, column) => {
    const cell = getTableCellLayout(doc, column, row[column.key]);
    return Math.max(maxHeight, cell.height);
  }, 0);

  return Math.max(minHeight, Math.ceil(contentHeight) + 10);
};

const drawTableRow = (doc, { x, y, columns, row, rowIndex, rowHeight, accentColumns = [] }) => {
  const tableWidth = columns.reduce((sum, column) => sum + column.width, 0);
  const rowColor = rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc';

  doc.save();
  doc.rect(x, y, tableWidth, rowHeight).fillAndStroke(rowColor, '#e2e8f0');

  let cellX = x;
  columns.forEach((column, columnIndex) => {
    if (columnIndex > 0) {
      doc.moveTo(cellX, y).lineTo(cellX, y + rowHeight).strokeColor('#e2e8f0').stroke();
    }

    const cell = getTableCellLayout(doc, column, row[column.key]);
    doc.fillColor(COLORS.text)
      .font(accentColumns.includes(columnIndex) ? 'Helvetica-Bold' : 'Helvetica')
      .fontSize(cell.fontSize)
      .text(cell.text, cellX + 8, y + 7, {
        width: column.width - 16,
        align: column.align || 'left',
        lineGap: 1,
      });
    cellX += column.width;
  });

  doc.restore();
  return y + rowHeight;
};

const renderChapterOneHeading = (doc, continuation = false) => {
  drawPageBadge(doc, 'Kapitel 1', doc.page.margins.left, 26, 84);
  doc.y = 62;
  doc.fillColor(COLORS.strong).font('Helvetica-Bold').fontSize(20).text(
    continuation ? '1 Gränspunkter och delområde, fortsättning' : '1 Gränspunkter och delområde'
  );
  doc.moveDown(0.45);
};

const drawChapterOneTable = (doc, { sectionTitle, columns, rows, accentColumns = [] }) => {
  const tableRows = rows.length ? rows : [Object.fromEntries(columns.map((column) => [column.key, '—']))];
  const renderSectionHeader = (continuation = false) => {
    doc.x = doc.page.margins.left;
    doc.fillColor(COLORS.strong).font('Helvetica-Bold').fontSize(11.5).text(
      continuation ? `${sectionTitle} (forts.)` : sectionTitle
    );
    doc.moveDown(0.3);
  };

  renderSectionHeader(false);
  let currentY = drawTableHeader(doc, {
    x: doc.page.margins.left,
    y: doc.y,
    columns,
  });

  tableRows.forEach((row, rowIndex) => {
    const rowHeight = getTableRowHeight(doc, columns, row);

    if (currentY + rowHeight > getContentBottomY(doc)) {
      doc.addPage();
      renderChapterOneHeading(doc, true);
      renderSectionHeader(true);
      currentY = drawTableHeader(doc, {
        x: doc.page.margins.left,
        y: doc.y,
        columns,
      });
    }

    currentY = drawTableRow(doc, {
      x: doc.page.margins.left,
      y: currentY,
      columns,
      row,
      rowIndex,
      rowHeight,
      accentColumns,
    });
  });

  doc.y = currentY + 16;
};

const COMPACT_CHAPTER_FONT = {
  heading: 13.8,
  body: 10.8,
  label: 10,
  highlight: 14.8,
};

const getCompactChapters = (project = {}) => {
  const htsmTelefon = cleanText(project.formState?.htsmTelefon || '');
  const reservnr = cleanText(project.formState?.reservnr || '');
  const phoneRows = buildPhoneRows(project);

  return [
    {
      number: 2,
      title: 'Allmänt',
      type: 'paragraphs',
      paragraphs: [
        'Dispositionsarbetsplanen gäller varje dag enligt beviljad dispositionsarbetsplan och ska alltid medföras av säkerhetspersonal digitalt eller i pappersform.',
        'Dispositionen gäller enligt TTJ Modul 16 tillsammans med de tillägg som anges i denna dispositionsarbetsplan. Alla aktiviteter i spårområdet ska föregås av riskbedömning.',
        'All personal och besökare inom spårområde ska bära avtalad personlig skyddsutrustning och varselkläder enligt gällande regler.',
      ],
    },
    {
      number: 3,
      title: 'Ansvarsfrågor',
      type: 'paragraphs',
      paragraphs: [
        'Det dagliga trafiksäkerhetsarbetet inom D-skyddsområdet leds av tjänstgörande huvudtillsyningsman (HTSM).',
        'Innan arbeten får påbörjas ska dispositionsarbetsplanen gås igenom med berörd arbetsledning och säkerhetspersonal.',
      ],
    },
    {
      number: 4,
      title: 'Skyddsåtgärder',
      type: 'paragraphs',
      paragraphs: [
        'Respektive tillsyningsman ansvarar för att skyddsåtgärder enligt TTJ-moduler utförs och dokumenteras.',
      ],
    },
    {
      number: 5,
      title: 'Skydds och Säkerhetssamtal',
      type: 'safetyCall',
      intro: 'Skydds och säkerhetssamtal till HTSM ska ske via telefon.',
      highlight: [htsmTelefon || 'Ej angivet', reservnr ? `Reservnr: ${reservnr}` : ''].filter(Boolean).join('   '),
      paragraphs: [
        'Tänk på samtalsdisciplinen. Alla samtal ska föras tydligt och med korrekt referens till aktuell dispositionsarbetsplan.',
      ],
    },
    {
      number: 6,
      title: 'Huvudtillsyningsman (HTSM)',
      type: 'paragraphs',
      paragraphs: [
        'HTSM för anteckningar över och beviljar A-, E- och L-skydd, spärrfärder och växling inom dispositionsområdet.',
      ],
    },
    {
      number: 7,
      title: 'Arbeten och trafikverksamheter',
      type: 'paragraphs',
      paragraphs: [
        'Alla skydd och fordonsrörelser inom D-skyddsområdet ska ske enligt TTJ Modul 16. För spärrfärd och växling gäller halv siktfart om inget annat anges.',
        'För TSA med spårföljare gäller att utrustningen är besiktigad och godkänd före användning.',
      ],
    },
    {
      number: 8,
      title: 'Uppställning eller kvarlämnande av arbetsredskap/fordon',
      pageBreakBefore: true,
      type: 'paragraphs',
      paragraphs: [
        'Uppställning av fordon och arbetsredskap inom D-skyddsområdet kräver medgivande från HTSM. Uppställning får inte ske under spänningssatt kontaktledning.',
        'Fordon eller arbetsredskap som lämnas utan tillsyn ska säkras så att rullning eller obehörig användning förhindras.',
      ],
    },
    {
      number: 9,
      title: 'Förändringar i spåranläggningen',
      type: 'paragraphs',
      paragraphs: [
        'Förändringar i spåranläggningen ska alltid meddelas HTSM. Om förändringar sker ska ibruktagandebesiktning utföras enligt gällande regler.',
      ],
    },
    {
      number: 10,
      title: 'Åtgärder vid plankorsningar',
      type: 'paragraphs',
      paragraphs: [
        'Vid behov används vägvakt enligt TTJ modul 7. Spärrfärd och växling ska ske i enlighet med TTJ modul 9H och modul 10.',
      ],
    },
    {
      number: 11,
      title: 'Växlar',
      type: 'paragraphs',
      paragraphs: [
        'Skyddsåtgärder för att förhindra felaktig omläggning av växlar eller oavsiktligt signalbesked ska alltid vidtas. Rörelser ska framföras så att de kan stanna före växel eller spårspärr i fel läge.',
      ],
    },
    {
      number: 12,
      title: 'Sidospår',
      type: 'paragraphs',
      paragraphs: [
        'Om D-skyddet gränsar mot sidospår får passage endast ske efter godkännande av HTSM och berörd infrastrukturförvaltare.',
      ],
    },
    {
      number: 13,
      title: 'Telefonnummer',
      type: 'phoneList',
      intro: 'Vid händelse eller olycka ska personal rapportera enligt nedanstående ordning:',
      phoneRows,
    },
  ];
};

const getCompactChapterHeight = (doc, chapter, width) => {
  const bodyWidth = width;
  let height = getTextHeight(doc, `${chapter.number} ${chapter.title}`, bodyWidth, {
    font: 'Helvetica-Bold',
    fontSize: COMPACT_CHAPTER_FONT.heading,
    lineGap: 1,
  }) + 12;

  if (chapter.type === 'paragraphs') {
    chapter.paragraphs.forEach((paragraph) => {
      height += getTextHeight(doc, paragraph, bodyWidth, {
        font: 'Helvetica',
        fontSize: COMPACT_CHAPTER_FONT.body,
        lineGap: 1.5,
      }) + 5;
    });
    return height + 9;
  }

  if (chapter.type === 'safetyCall') {
    height += getTextHeight(doc, chapter.intro, bodyWidth, {
      font: 'Helvetica',
      fontSize: COMPACT_CHAPTER_FONT.body,
      lineGap: 1.5,
    }) + 6;
    const highlightFontSize = getFittedFontSize(
      doc,
      chapter.highlight || 'Ej angivet',
      bodyWidth - 24,
      COMPACT_CHAPTER_FONT.highlight,
      10.2,
      'Helvetica-Bold'
    );
    const highlightHeight = getTextHeight(doc, chapter.highlight || 'Ej angivet', bodyWidth - 22, {
      font: 'Helvetica-Bold',
      fontSize: highlightFontSize,
      lineGap: 1,
    });
    height += Math.max(36, highlightHeight + 18) + 10;
    chapter.paragraphs.forEach((paragraph) => {
      height += getTextHeight(doc, paragraph, bodyWidth, {
        font: 'Helvetica',
        fontSize: COMPACT_CHAPTER_FONT.body,
        lineGap: 1.5,
      }) + 5;
    });
    return height + 9;
  }

  if (chapter.type === 'phoneList') {
    height += getTextHeight(doc, chapter.intro, bodyWidth, {
      font: 'Helvetica',
      fontSize: COMPACT_CHAPTER_FONT.body,
      lineGap: 1.5,
    }) + 8;

    chapter.phoneRows.forEach((row, index) => {
      height += getPhoneRowLayout(doc, row, index, bodyWidth).rowHeight + 4;
    });
    return height + 7;
  }

  return height + 9;
};

const drawCompactChapterBlock = (doc, chapter, x, y, width) => {
  let cursorY = y;

  doc.fillColor(COLORS.strong).font('Helvetica-Bold').fontSize(COMPACT_CHAPTER_FONT.heading).text(
    `${chapter.number} ${chapter.title}`,
    x,
    cursorY,
    { width, lineGap: 1 }
  );
  cursorY = doc.y + 3;

  doc.save();
  doc.moveTo(x, cursorY).lineTo(x + width, cursorY).lineWidth(1).strokeColor('#e2e8f0').stroke();
  doc.restore();
  cursorY += 8;

  if (chapter.type === 'paragraphs') {
    chapter.paragraphs.forEach((paragraph) => {
      doc.fillColor(COLORS.text).font('Helvetica').fontSize(COMPACT_CHAPTER_FONT.body).text(paragraph, x, cursorY, {
        width,
        lineGap: 1.5,
      });
      cursorY = doc.y + 5;
    });
    return cursorY + 6;
  }

  if (chapter.type === 'safetyCall') {
    doc.fillColor(COLORS.text).font('Helvetica').fontSize(COMPACT_CHAPTER_FONT.body).text(chapter.intro, x, cursorY, {
      width,
      lineGap: 1.5,
    });
    cursorY = doc.y + 6;

    const highlightFontSize = getFittedFontSize(
      doc,
      chapter.highlight || 'Ej angivet',
      width - 24,
      COMPACT_CHAPTER_FONT.highlight,
      10.2,
      'Helvetica-Bold'
    );
    const highlightHeight = Math.max(
      36,
      getTextHeight(doc, chapter.highlight || 'Ej angivet', width - 22, {
        font: 'Helvetica-Bold',
        fontSize: highlightFontSize,
        lineGap: 1,
      }) + 18
    );
    doc.save();
    doc.roundedRect(x, cursorY, width, highlightHeight, 10).fillAndStroke('#fff5f5', '#fca5a5');
    doc.restore();
    doc.fillColor(COLORS.strong).font('Helvetica-Bold').fontSize(highlightFontSize).text(
      chapter.highlight || 'Ej angivet',
      x + 12,
      cursorY + 9,
      {
        width: width - 24,
        lineGap: 1,
        lineBreak: false,
      }
    );
    cursorY += highlightHeight + 10;

    chapter.paragraphs.forEach((paragraph) => {
      doc.fillColor(COLORS.text).font('Helvetica').fontSize(COMPACT_CHAPTER_FONT.body).text(paragraph, x, cursorY, {
        width,
        lineGap: 1.5,
      });
      cursorY = doc.y + 5;
    });
    return cursorY + 6;
  }

  if (chapter.type === 'phoneList') {
    doc.fillColor(COLORS.text).font('Helvetica').fontSize(COMPACT_CHAPTER_FONT.body).text(chapter.intro, x, cursorY, {
      width,
      lineGap: 1.5,
    });
    cursorY = doc.y + 7;

    chapter.phoneRows.forEach((row, index) => {
      const phoneRow = getPhoneRowLayout(doc, row, index, width);
      doc.fillColor(COLORS.strong).font('Helvetica-Bold').fontSize(COMPACT_CHAPTER_FONT.label).text(phoneRow.label, x, cursorY, {
        width: phoneRow.labelWidth,
        lineGap: 1,
      });
      if (phoneRow.isHtsmRow) {
        const valueX = x + phoneRow.labelWidth + phoneRow.labelGap;
        doc.fillColor(COLORS.text).font('Helvetica').fontSize(phoneRow.valueFontSize).text(phoneRow.primaryValue, valueX, cursorY, {
          width: phoneRow.valueWidth,
          lineGap: 1,
        });
        if (phoneRow.secondaryValue) {
          doc.text(`Reservnr: ${phoneRow.secondaryValue}`, valueX, cursorY + phoneRow.primaryValueHeight + 2, {
            width: phoneRow.valueWidth,
            lineGap: 1,
          });
        }
      } else {
        doc.fillColor(COLORS.text).font('Helvetica').fontSize(phoneRow.valueFontSize).text(phoneRow.value, x + phoneRow.labelWidth + phoneRow.labelGap, cursorY, {
          width: phoneRow.valueWidth,
          lineGap: 1,
        });
      }
      cursorY += phoneRow.rowHeight + 4;
    });
    return cursorY + 4;
  }

  return cursorY + 8;
};

const startCompactChapterPage = (doc) => {
  doc.addPage();
  drawPageBadge(doc, 'Kapitel 2-13', doc.page.margins.left, 26, 94);
  doc.fillColor(COLORS.strong).font('Helvetica').fontSize(10.5).text(
    'Säkerhetsbestämmelser och kontaktvägar',
    doc.page.width - doc.page.margins.right - 220,
    32,
    {
      width: 220,
      align: 'right',
    }
  );

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const columnGap = 24;
  const columnWidth = (right - left - columnGap) / 2;

  return {
    left,
    right,
    top: 74,
    bottom: getContentBottomY(doc),
    columnGap,
    columnWidth,
    currentColumn: 0,
    x: left,
    y: 74,
  };
};

const advanceCompactChapterColumn = (doc, layout) => {
  if (layout.currentColumn === 0) {
    layout.currentColumn = 1;
    layout.x = layout.left + layout.columnWidth + layout.columnGap;
    layout.y = layout.top;
    return;
  }

  const nextLayout = startCompactChapterPage(doc);
  layout.currentColumn = nextLayout.currentColumn;
  layout.x = nextLayout.x;
  layout.y = nextLayout.y;
  layout.top = nextLayout.top;
  layout.bottom = nextLayout.bottom;
  layout.columnWidth = nextLayout.columnWidth;
  layout.columnGap = nextLayout.columnGap;
};

const addCoverPage = (doc, project, entries, sections, dispSettings) => {
  const outerGranspunkter = cleanText(project.granspunkter || '');
  const routeLine = cleanText(project.plats || '');
  const htsmTelefon = cleanText(project.formState?.htsmTelefon || '');
  const title = ['Dispositionsarbetsplan', dispSettings.rubrik].filter(Boolean).join(' ');

  drawPageBadge(doc, 'Dispositionsarbetsplan', doc.page.margins.left, 28, 150);

  doc.y = 90;
  doc.fillColor(COLORS.strong).font('Helvetica-Bold').fontSize(28).text(title, {
    align: 'left',
  });
  doc.moveDown(0.55);
  doc.fontSize(23).text(dispSettings.banNamn || 'Ange banans namn', {
    align: 'left',
  });
  doc.moveDown(0.25);
  doc.fontSize(16.5).text(dispSettings.veckaOchDagar || 'Ange vecka och dagar/nätter', {
    align: 'left',
  });
  doc.moveDown(0.75);

  const topY = doc.y;
  const availableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const cardGap = 12;
  const cardWidth = (availableWidth - cardGap) / 2;
  drawInfoCard(doc, 'Banobjekt-Vnr', dispSettings.banobjektVnr || 'Ej angivet', doc.page.margins.left, topY, cardWidth, true);
  drawInfoCard(doc, 'Förplanera ca', dispSettings.forplaneraCa || 'Ej angivet', doc.page.margins.left + cardWidth + cardGap, topY, cardWidth);
  doc.y = topY + 70;

  drawInfoCard(doc, 'Berörda driftplatser', routeLine || 'Ej angivet', doc.page.margins.left, doc.y, availableWidth, false);
  doc.y += 72;
  drawInfoCard(doc, 'HTSM telefonnr', htsmTelefon || 'Ej angivet', doc.page.margins.left, doc.y, availableWidth, false);
  doc.y += 72;

  doc.fillColor(COLORS.strong).font('Helvetica-Bold').fontSize(13).text(
    'Gränspunkter som ej får passeras utan TKL:s medgivande är:',
    { lineGap: 2 }
  );
  doc.moveDown(0.15);
  doc.fillColor(COLORS.accent).font('Helvetica-Bold').fontSize(19).text(
    outerGranspunkter || 'Ej angivet',
    { lineGap: 2 }
  );

  doc.moveDown(1);
  doc.fillColor(COLORS.text).font('Helvetica').fontSize(10).text(
    `Skapad via Vallåkra Railworker. ${entries.length} post(er) och ${sections.length} delområde(n) ingår i underlaget.`,
    { lineGap: 2 }
  );
};

const addContentsPage = (doc, chapterPages = null, pageIndex = null) => {
  if (pageIndex === null) {
    doc.addPage();
    return getCurrentPageNumber(doc) - 1;
  }

  doc.switchToPage(pageIndex);
  doc.x = doc.page.margins.left;
  doc.y = 78;
  doc.fillColor(COLORS.strong).font('Helvetica-Bold').fontSize(26).text('Innehållsförteckning');
  doc.moveDown(1.05);

  const items = [
    ['1', 'Gränspunkter och delområde', String(chapterPages?.[1] || 3)],
    ['2', 'Allmänt', String(chapterPages?.[2] || 4)],
    ['3', 'Ansvarsfrågor', String(chapterPages?.[3] || 4)],
    ['4', 'Skyddsåtgärder', String(chapterPages?.[4] || 4)],
    ['5', 'Skydds och Säkerhetssamtal', String(chapterPages?.[5] || 5)],
    ['6', 'Huvudtillsyningsman (HTSM)', String(chapterPages?.[6] || 5)],
    ['7', 'Arbeten och trafikverksamheter', String(chapterPages?.[7] || 5)],
    ['8', 'Uppställning eller kvarlämnande av arbetsredskap/fordon', String(chapterPages?.[8] || 6)],
    ['9', 'Förändringar i spåranläggningen', String(chapterPages?.[9] || 6)],
    ['10', 'Åtgärder vid plankorsningar', String(chapterPages?.[10] || 6)],
    ['11', 'Växlar', String(chapterPages?.[11] || 6)],
    ['12', 'Sidospår', String(chapterPages?.[12] || 6)],
    ['13', 'Telefonnummer', String(chapterPages?.[13] || 6)],
  ];

  items.forEach(([index, title, page]) => {
    doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(13).text(index, doc.page.margins.left, doc.y, {
      width: 24,
    });
    doc.font('Helvetica').fontSize(13).text(title, doc.page.margins.left + 32, doc.y - 13, {
      width: 420,
    });
    doc.font('Helvetica-Bold').fontSize(13).text(page, doc.page.width - doc.page.margins.right - 20, doc.y - 13, {
      width: 20,
      align: 'right',
    });
    doc.moveDown(0.62);
  });
};

const addEntriesAndSectionsPage = (doc, project, entries, sections) => {
  doc.addPage();
  const pageNumber = getCurrentPageNumber(doc);
  renderChapterOneHeading(doc);

  const availableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  drawChapterOneTable(doc, {
    sectionTitle: 'Beteckningar och tider',
    columns: [
      { key: 'beteckning', label: 'Beteckning', width: 116 },
      { key: 'start', label: 'Startdag och tid', width: 189 },
      { key: 'end', label: 'Slutdag och tid', width: availableWidth - 305 },
    ],
    rows: entries.map((entry) => ({
      beteckning: entry.beteckning,
      start: [formatDate(entry.startDate), formatTime(entry.startTime)].filter(Boolean).join('  '),
      end: [formatDate(entry.endDate), formatTime(entry.endTime)].filter(Boolean).join('  '),
    })),
    accentColumns: [0, 1, 2],
  });

  if (doc.y + 78 > getContentBottomY(doc)) {
    doc.addPage();
    renderChapterOneHeading(doc, true);
  }
  drawChapterOneTable(doc, {
    sectionTitle: 'Delområden',
    columns: [
      { key: 'label', label: 'Delområde', width: 108, noWrap: true, minFontSize: 9 },
      { key: 'name', label: 'Sträcka / område', width: 156 },
      { key: 'granspunkter', label: 'Gränspunkter', width: 151, noWrap: true, minFontSize: 8.8 },
      { key: 'spar', label: 'Spår', width: availableWidth - 415, noWrap: true, minFontSize: 8.8 },
    ],
    rows: sections.map((section) => ({
      label: section.label,
      name: section.signal || section.name,
      granspunkter: section.granspunkter,
      spar: section.spar ? `Spår ${section.spar}` : '',
    })),
    accentColumns: [0, 1, 2, 3],
  });

  if (doc.y + 38 > getContentBottomY(doc)) {
    doc.addPage();
    renderChapterOneHeading(doc, true);
  }
  const outerBoundaryX = doc.page.margins.left;
  const outerBoundaryY = doc.y;
  const outerBoundaryLabel = 'Yttre gränspunkter som ej får passeras utan medgivande från TKL:';
  const outerBoundaryValue = cleanText(project.granspunkter || '') || 'Ej angivet';
  doc.fillColor(COLORS.strong).font('Helvetica-Oblique').fontSize(10).text(outerBoundaryLabel, outerBoundaryX, outerBoundaryY, {
    width: availableWidth,
    lineGap: 2,
  });
  const outerBoundaryValueY = doc.y + 2;
  doc.fillColor(COLORS.accent).font('Helvetica-Bold').fontSize(10.5).text(outerBoundaryValue, outerBoundaryX, outerBoundaryValueY, {
    width: availableWidth,
    lineGap: 2,
  });

  return { 1: pageNumber };
};

const addStaticTextPages = (doc, project) => {
  const chapters = getCompactChapters(project);
  const chapterPages = {};

  const layout = startCompactChapterPage(doc);

  chapters.forEach((chapter) => {
    if (chapter.pageBreakBefore && (layout.currentColumn !== 0 || layout.y > layout.top + 1)) {
      Object.assign(layout, startCompactChapterPage(doc));
    }

    const chapterHeight = getCompactChapterHeight(doc, chapter, layout.columnWidth);

    if (layout.y + chapterHeight > layout.bottom) {
      advanceCompactChapterColumn(doc, layout);
    }

    chapterPages[chapter.number] = getCurrentPageNumber(doc);
    layout.y = drawCompactChapterBlock(doc, chapter, layout.x, layout.y, layout.columnWidth) + 10;
  });

  return chapterPages;
};

const createDispPdfBuffer = async (project = {}) => {
  const entries = buildEntries(project);
  const sections = buildSections(project);
  const dispSettings = buildDispSettings(project, entries);
  const title = ['Dispositionsarbetsplan', dispSettings.rubrik || project.name].filter(Boolean).join(' ');
  const { doc, toBuffer } = createDocument(title);

  addCoverPage(doc, project, entries, sections, dispSettings);
  const contentsPageIndex = addContentsPage(doc);
  const chapterPages = {
    ...addEntriesAndSectionsPage(doc, project, entries, sections),
    ...addStaticTextPages(doc, project),
  };
  addContentsPage(doc, chapterPages, contentsPageIndex);

  doc.end();
  return toBuffer();
};

module.exports = {
  createDispPdfBuffer,
};
