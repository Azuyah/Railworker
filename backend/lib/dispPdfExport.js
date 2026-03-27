const PDFDocument = require('pdfkit');

const COLORS = {
  text: '#0f172a',
  muted: '#64748b',
  accent: '#b91c1c',
  border: '#cbd5e1',
  surface: '#f8fafc',
  strong: '#111827',
};

const SWEDISH_SHORT_DAYS = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];

const cleanText = (value = '') =>
  String(value || '')
    .replace(/\r/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const formatDate = (value = '') => {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return value || '';
  }

  return `${match[1]}-${match[2]}-${match[3]}`;
};

const formatTime = (value = '') => String(value || '').trim();

const buildEntries = (project = {}) => {
  const entries = Array.isArray(project.formState?.blankett31Entries)
    ? project.formState.blankett31Entries
    : [];

  return entries
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

  return sections
    .map((section, index) => {
      const details = sectionDetails[index] || {};
      const displayIndex = Number(details.displayIndex || index + 1) || index + 1;
      const granspunktStart = cleanText(details.granspunktStart);
      const granspunktSlut = cleanText(details.granspunktSlut);
      const granspunkter = cleanText(details.granspunkter || [granspunktStart, granspunktSlut].filter(Boolean).join(' - '));

      return {
        displayIndex,
        label: `Delområde ${displayIndex}`,
        name: cleanText(section?.name || ''),
        signal: cleanText(details.signal || ''),
        granspunktStart,
        granspunktSlut,
        granspunkter,
        spar: cleanText(details.spar),
      };
    })
    .sort((left, right) => left.displayIndex - right.displayIndex);
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

const buildPhoneRows = (project = {}) => {
  const htsmTelefon = cleanText(project.formState?.htsmTelefon || '');
  const fjtklBlocks = Array.isArray(project.formState?.fjtklBlocks) ? project.formState.fjtklBlocks : [];
  const primaryFjtkl = cleanText(
    [project.namn, project.telefonnummer].filter(Boolean).join(' ')
  );

  return [
    { label: 'SOS Alarm', value: '112' },
    { label: 'Larm TLC', value: cleanText(project.formState?.nodnummer || '') || 'Ej angivet' },
    { label: 'HTSM', value: htsmTelefon || 'Ej angivet' },
    {
      label: 'Ansvarig arbetsledare',
      value: primaryFjtkl || 'Ej angivet',
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
  doc.on('data', (chunk) => buffers.push(chunk));

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
  doc.roundedRect(x, y, width, 22, 11).fillAndStroke('#eef2ff', '#c7d2fe');
  doc.fillColor('#3730a3').font('Helvetica-Bold').fontSize(10).text(value, x, y + 6, {
    width,
    align: 'center',
  });
  doc.restore();
};

const drawInfoCard = (doc, title, value, x, y, width, accent = false) => {
  doc.save();
  doc.roundedRect(x, y, width, 48, 12).fillAndStroke(accent ? '#fff5f5' : '#f8fafc', accent ? '#fecaca' : '#e2e8f0');
  doc.fillColor(COLORS.muted).font('Helvetica-Bold').fontSize(9).text(title, x + 12, y + 10, { width: width - 24 });
  doc.fillColor(accent ? COLORS.accent : COLORS.strong).font('Helvetica-Bold').fontSize(12).text(value || 'Ej angivet', x + 12, y + 24, {
    width: width - 24,
  });
  doc.restore();
};

const drawSimpleTable = (doc, { x, y, columns, rows, rowHeight = 28, headerHeight = 26, accentColumns = [] }) => {
  let currentY = y;

  doc.save();
  doc.roundedRect(x, currentY, columns.reduce((sum, column) => sum + column.width, 0), headerHeight, 12)
    .fillAndStroke('#e2e8f0', '#cbd5e1');

  let currentX = x;
  columns.forEach((column, index) => {
    if (index > 0) {
      doc.moveTo(currentX, currentY).lineTo(currentX, currentY + headerHeight + rowHeight * rows.length).strokeColor('#cbd5e1').stroke();
    }
    doc.fillColor(COLORS.strong).font('Helvetica-Bold').fontSize(9).text(column.label, currentX + 8, currentY + 8, {
      width: column.width - 16,
      align: column.align || 'left',
    });
    currentX += column.width;
  });

  currentY += headerHeight;

  rows.forEach((row, rowIndex) => {
    const rowColor = rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc';
    doc.rect(x, currentY, columns.reduce((sum, column) => sum + column.width, 0), rowHeight)
      .fillAndStroke(rowColor, '#e2e8f0');

    let cellX = x;
    columns.forEach((column, columnIndex) => {
      const value = cleanText(row[column.key]);
      doc.fillColor(accentColumns.includes(columnIndex) ? COLORS.accent : COLORS.text)
        .font(accentColumns.includes(columnIndex) ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(9)
        .text(value || '—', cellX + 8, currentY + 8, {
          width: column.width - 16,
          align: column.align || 'left',
        });
      cellX += column.width;
    });

    currentY += rowHeight;
  });

  doc.restore();
  return currentY;
};

const writeParagraph = (doc, heading, paragraphs = []) => {
  doc.fillColor(COLORS.strong).font('Helvetica-Bold').fontSize(13).text(heading, { underline: false });
  doc.moveDown(0.35);
  paragraphs.forEach((paragraph) => {
    doc.fillColor(COLORS.text).font('Helvetica').fontSize(10.5).text(paragraph, {
      lineGap: 2,
      paragraphGap: 6,
    });
  });
  doc.moveDown(0.5);
};

const addCoverPage = (doc, project, entries, sections, dispSettings) => {
  const outerGranspunkter = cleanText(project.granspunkter || '');
  const routeLine = cleanText(project.plats || '');
  const title = ['Dispositionsarbetsplan', dispSettings.rubrik].filter(Boolean).join(' ');

  drawPageBadge(doc, 'Dispositionsarbetsplan', doc.page.margins.left, 28, 150);

  doc.moveDown(1.5);
  doc.fillColor(COLORS.accent).font('Helvetica-Bold').fontSize(24).text(title, {
    align: 'left',
  });
  doc.moveDown(0.45);
  doc.fontSize(20).text(dispSettings.banNamn || 'Ange banans namn', {
    align: 'left',
  });
  doc.moveDown(0.2);
  doc.fontSize(14).text(dispSettings.veckaOchDagar || 'Ange vecka och dagar/nätter', {
    align: 'left',
  });
  doc.moveDown(0.55);

  const topY = doc.y;
  const availableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const cardGap = 12;
  const cardWidth = (availableWidth - cardGap) / 2;
  drawInfoCard(doc, 'Banobjekt-Vnr', dispSettings.banobjektVnr || 'Ej angivet', doc.page.margins.left, topY, cardWidth, true);
  drawInfoCard(doc, 'Förplanera ca', dispSettings.forplaneraCa || 'Ej angivet', doc.page.margins.left + cardWidth + cardGap, topY, cardWidth);
  doc.y = topY + 62;

  drawInfoCard(doc, 'Berörda driftplatser', routeLine || 'Ej angivet', doc.page.margins.left, doc.y, availableWidth, false);
  doc.y += 64;

  doc.fillColor(COLORS.strong).font('Helvetica-Bold').fontSize(11).text(
    'Gränspunkter som ej får passeras utan TKL:s medgivande är:',
    { lineGap: 2 }
  );
  doc.moveDown(0.15);
  doc.fillColor(COLORS.accent).font('Helvetica-Bold').fontSize(16).text(
    outerGranspunkter || 'Ej angivet',
    { lineGap: 2 }
  );

  doc.moveDown(1);
  doc.fillColor(COLORS.muted).font('Helvetica').fontSize(10).text(
    `Skapad ${new Date().toLocaleString('sv-SE')} via Railworker. ${entries.length} post(er) och ${sections.length} delområde(n) ingår i underlaget.`,
    { lineGap: 2 }
  );
};

const addContentsPage = (doc) => {
  doc.addPage();
  doc.fillColor(COLORS.strong).font('Helvetica-Bold').fontSize(22).text('Innehållsförteckning');
  doc.moveDown(0.8);

  const items = [
    ['1', 'Gränspunkter och delområde', '3'],
    ['2', 'Allmänt', '4'],
    ['3', 'Ansvarsfrågor', '4'],
    ['4', 'Skyddsåtgärder', '4'],
    ['5', 'Säkerhetssamtal', '5'],
    ['6', 'Huvudtillsyningsman (HTSM)', '5'],
    ['7', 'Arbeten och trafikverksamheter', '5'],
    ['8', 'Uppställning eller kvarlämnande av arbetsredskap/fordon', '6'],
    ['9', 'Förändringar i spåranläggningen', '6'],
    ['10', 'Åtgärder vid plankorsningar', '6'],
    ['11', 'Växlar', '6'],
    ['12', 'Sidospår', '6'],
    ['13', 'Telefonnummer', '7'],
  ];

  items.forEach(([index, title, page]) => {
    doc.fillColor(COLORS.text).font('Helvetica').fontSize(11).text(index, doc.page.margins.left, doc.y, {
      width: 24,
    });
    doc.text(title, doc.page.margins.left + 28, doc.y - 11, {
      width: 420,
    });
    doc.text(page, doc.page.width - doc.page.margins.right - 20, doc.y - 11, {
      width: 20,
      align: 'right',
    });
    doc.moveDown(0.45);
  });
};

const addEntriesAndSectionsPage = (doc, project, entries, sections) => {
  doc.addPage();
  doc.fillColor(COLORS.strong).font('Helvetica-Bold').fontSize(18).text('Gränspunkter och delområde');
  doc.moveDown(0.6);

  const entriesTableBottom = drawSimpleTable(doc, {
    x: doc.page.margins.left,
    y: doc.y,
    columns: [
      { key: 'beteckning', label: 'Beteckning', width: 120 },
      { key: 'start', label: 'Startdag och tid', width: 180 },
      { key: 'end', label: 'Slutdag och tid', width: 180 },
    ],
    rows: entries.map((entry) => ({
      beteckning: entry.beteckning,
      start: [formatDate(entry.startDate), formatTime(entry.startTime)].filter(Boolean).join('  '),
      end: [formatDate(entry.endDate), formatTime(entry.endTime)].filter(Boolean).join('  '),
    })),
    accentColumns: [0, 1, 2],
  });

  doc.y = entriesTableBottom + 22;

  const sectionsTableBottom = drawSimpleTable(doc, {
    x: doc.page.margins.left,
    y: doc.y,
    columns: [
      { key: 'label', label: 'Delområde', width: 92 },
      { key: 'name', label: 'Sträcka / område', width: 168 },
      { key: 'granspunkter', label: 'Gränspunkter', width: 170 },
      { key: 'spar', label: 'Spår', width: 70 },
    ],
    rows: sections.map((section) => ({
      label: section.label,
      name: section.signal || section.name,
      granspunkter: section.granspunkter,
      spar: section.spar ? `Spår ${section.spar}` : '',
    })),
    accentColumns: [0, 1, 2, 3],
  });

  doc.y = sectionsTableBottom + 18;
  doc.fillColor(COLORS.muted).font('Helvetica-Oblique').fontSize(10).text(
    `Yttre gränspunkter som ej får passeras utan medgivande från TKL: ${cleanText(project.granspunkter || '') || 'Ej angivet'}`,
    { lineGap: 2 }
  );
};

const addStaticTextPages = (doc, project) => {
  const htsmTelefon = cleanText(project.formState?.htsmTelefon || '');
  const phoneRows = buildPhoneRows(project);

  doc.addPage();
  writeParagraph(doc, 'Allmänt', [
    'Dispositionsarbetsplanen gäller varje dag enligt beviljad dispositionsarbetsplan och ska alltid medföras av säkerhetspersonal digitalt eller i pappersform.',
    'Dispositionen gäller enligt TTJ Modul 16 tillsammans med de tillägg som anges i denna dispositionsarbetsplan. Alla aktiviteter i spårområdet ska föregås av riskbedömning.',
    'All personal och besökare inom spårområde ska bära avtalad personlig skyddsutrustning och varselkläder enligt gällande regler.',
  ]);
  writeParagraph(doc, 'Ansvarsfrågor', [
    'Det dagliga trafiksäkerhetsarbetet inom D-skyddsområdet leds av tjänstgörande huvudtillsyningsman (HTSM).',
    'Innan arbeten får påbörjas ska dispositionsarbetsplanen gås igenom med berörd arbetsledning och säkerhetspersonal.',
  ]);
  writeParagraph(doc, 'Skyddsåtgärder', [
    'Respektive tillsyningsman ansvarar för att skyddsåtgärder enligt TTJ-moduler utförs och dokumenteras.',
  ]);

  doc.addPage();
  writeParagraph(doc, 'Säkerhetssamtal', [
    `Säkerhetssamtal till HTSM ska ske via telefon ${htsmTelefon || 'ej angivet'}.`,
    'Tänk på samtalsdisciplinen. Alla samtal ska föras tydligt och med korrekt referens till aktuell dispositionsarbetsplan.',
  ]);
  writeParagraph(doc, 'Huvudtillsyningsman (HTSM)', [
    'HTSM för anteckningar över och beviljar A-, E- och L-skydd, spärrfärder och växling inom dispositionsområdet.',
  ]);
  writeParagraph(doc, 'Arbeten och trafikverksamheter', [
    'Alla skydd och fordonsrörelser inom D-skyddsområdet ska ske enligt TTJ Modul 16. För spärrfärd och växling gäller halv siktfart om inget annat anges.',
    'För TSA med spårföljare gäller att utrustningen är besiktigad och godkänd före användning.',
  ]);

  doc.addPage();
  writeParagraph(doc, 'Uppställning eller kvarlämnande av arbetsredskap/fordon', [
    'Uppställning av fordon och arbetsredskap inom D-skyddsområdet kräver medgivande från HTSM. Uppställning får inte ske under spänningssatt kontaktledning.',
    'Fordon eller arbetsredskap som lämnas utan tillsyn ska säkras så att rullning eller obehörig användning förhindras.',
  ]);
  writeParagraph(doc, 'Förändringar i spåranläggningen', [
    'Förändringar i spåranläggningen ska alltid meddelas HTSM. Om förändringar sker ska ibruktagandebesiktning utföras enligt gällande regler.',
  ]);
  writeParagraph(doc, 'Åtgärder vid plankorsningar', [
    'Vid behov används vägvakt enligt TTJ modul 7. Spärrfärd och växling ska ske i enlighet med TTJ modul 9H och modul 10.',
  ]);
  writeParagraph(doc, 'Växlar', [
    'Skyddsåtgärder för att förhindra felaktig omläggning av växlar eller oavsiktligt signalbesked ska alltid vidtas. Rörelser ska framföras så att de kan stanna före växel eller spårspärr i fel läge.',
  ]);
  writeParagraph(doc, 'Sidospår', [
    'Om D-skyddet gränsar mot sidospår får passage endast ske efter godkännande av HTSM och berörd infrastrukturförvaltare.',
  ]);

  doc.addPage();
  doc.fillColor(COLORS.strong).font('Helvetica-Bold').fontSize(18).text('Telefonnummer');
  doc.moveDown(0.6);
  doc.fillColor(COLORS.text).font('Helvetica').fontSize(11).text(
    'Vid händelse eller olycka ska personal rapportera enligt nedanstående ordning:',
    { lineGap: 2 }
  );
  doc.moveDown(0.5);

  phoneRows.forEach((row, index) => {
    doc.font('Helvetica-Bold').fillColor(COLORS.strong).text(`${index + 1}. ${row.label}`, {
      continued: true,
    });
    doc.font('Helvetica').fillColor(COLORS.text).text(`  ${row.value || 'Ej angivet'}`);
    doc.moveDown(0.2);
  });
};

const createDispPdfBuffer = async (project = {}) => {
  const entries = buildEntries(project);
  const sections = buildSections(project);
  const dispSettings = buildDispSettings(project, entries);
  const title = ['Dispositionsarbetsplan', dispSettings.rubrik || project.name].filter(Boolean).join(' ');
  const { doc, toBuffer } = createDocument(title);

  addCoverPage(doc, project, entries, sections, dispSettings);
  addContentsPage(doc);
  addEntriesAndSectionsPage(doc, project, entries, sections);
  addStaticTextPages(doc, project);

  doc.end();
  return toBuffer();
};

module.exports = {
  createDispPdfBuffer,
};
