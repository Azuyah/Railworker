const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadCachedDriftplatser } = require('./njdbDriftplatsService');
const { parseBlankett31Pdf } = require('./blankett31Parser');

const cleanText = (value = '') =>
  String(value || '')
    .replace(/\r/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const escapeRegExp = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

let cachedDriftplatsMaps = null;

const getDriftplatsMaps = () => {
  if (cachedDriftplatsMaps) {
    return cachedDriftplatsMaps;
  }

  const items = loadCachedDriftplatser();
  const codeToName = new Map();
  const nameToCode = new Map();

  items.forEach((item = {}) => {
    const code = cleanText(item.code);
    const name = cleanText(item.name);
    if (!code || !name) return;
    codeToName.set(code, name);
    nameToCode.set(name, code);
  });

  cachedDriftplatsMaps = {
    codeToName,
    nameToCode,
    namesByLength: [...nameToCode.keys()].sort((left, right) => right.length - left.length),
    codesByLength: [...codeToName.keys()].sort((left, right) => right.length - left.length),
  };

  return cachedDriftplatsMaps;
};

const normalizeBoundaryCodeSpacing = (value = '') => {
  let text = cleanText(value);
  const { codesByLength } = getDriftplatsMaps();
  const codePattern = codesByLength.map(escapeRegExp).join('|');

  if (codePattern) {
    text = text.replace(
      new RegExp(`(^|[\\s\\-–,(/])(${codePattern})\\s*([A-Za-z0-9]+)`, 'gu'),
      (_, prefix = '', code = '', suffix = '') => `${prefix}${code} ${suffix}`
    );
  }

  return text;
};

const normalizeBoundaryNameSpacing = (value = '') => {
  let text = cleanText(value);
  const { namesByLength } = getDriftplatsMaps();

  namesByLength.forEach((name) => {
    text = text.replace(
      new RegExp(`(${escapeRegExp(name)})\\s*([A-Za-z0-9]+)`, 'gu'),
      (_, placeName = '', suffix = '') => `${placeName} ${suffix}`
    );
  });

  return text;
};

const abbreviateBoundaryText = (value = '') => {
  const { nameToCode, namesByLength } = getDriftplatsMaps();
  let text = cleanText(value);

  namesByLength.forEach((name) => {
    const code = nameToCode.get(name);
    if (!code) return;

    const regex = new RegExp(
      `(^|[\\s\\-–,(/])(${escapeRegExp(name)})(?=(?:\\s*[A-Za-z0-9]+|\\s*[\\-–,/)])|$)`,
      'gu'
    );
    text = text.replace(regex, (_, prefix = '') => `${prefix}${code}`);
  });

  return normalizeBoundaryCodeSpacing(text);
};

const splitBoundarySides = (value = '') => {
  const parts = cleanText(value).split(/\s*[–-]\s*/);
  return {
    start: cleanText(parts[0] || ''),
    end: cleanText(parts.slice(1).join(' - ') || ''),
  };
};

const extractOrderedCodes = (value = '') => {
  const abbreviated = abbreviateBoundaryText(value);
  const { codesByLength } = getDriftplatsMaps();
  const codePattern = codesByLength.map(escapeRegExp).join('|');
  if (!codePattern) return [];

  const matches = [...abbreviated.matchAll(new RegExp(`\\b(${codePattern})\\b(?=\\s+[A-Za-z0-9])`, 'gu'))]
    .map((match) => cleanText(match[1]))
    .filter(Boolean);

  return matches.filter((code, index) => matches.indexOf(code) === index);
};

const normalizeBoundaryForComparison = (value = '') =>
  normalizeBoundaryCodeSpacing(abbreviateBoundaryText(value))
    .replace(/\s*-\s*/g, ' – ')
    .replace(/\s*,\s*/g, ', ')
    .trim();

const buildBoundarySignature = (value = '') => {
  const normalized = normalizeBoundaryForComparison(value);
  const { start, end } = splitBoundarySides(normalized);
  return [start, end].filter(Boolean).join('|');
};

const summarizeProjectEntries = (project = {}) =>
  Array.isArray(project?.formState?.blankett31Entries)
    ? project.formState.blankett31Entries
        .filter((entry) => entry?.granspunkt || entry?.beteckning)
        .map((entry) => ({
          beteckning: cleanText(entry.beteckning),
          planeringsId: cleanText(entry.planeringsId),
          granspunkt: cleanText(entry.granspunkt),
          startDate: cleanText(entry.startDate),
          startTime: cleanText(entry.startTime),
          endDate: cleanText(entry.endDate),
          endTime: cleanText(entry.endTime),
        }))
    : [];

const buildRegistryRowsFromProject = (project = {}) => {
  const entries = summarizeProjectEntries(project);

  return entries
    .map((entry, index) => {
      const rawGranspunkt = cleanText(entry.granspunkt);
      if (!rawGranspunkt) return null;

      const normalizedGranspunkt = normalizeBoundaryForComparison(rawGranspunkt);
      const boundarySignature = buildBoundarySignature(rawGranspunkt);
      const { start, end } = splitBoundarySides(normalizedGranspunkt);
      const codes = extractOrderedCodes(rawGranspunkt);

      return {
        registryKey: `project:${project.id}:${boundarySignature}`,
        sourceFileName: null,
        projectId: project.id,
        projectName: cleanText(project.name),
        projectPlats: cleanText(project.plats),
        beteckning: cleanText(entry.beteckning),
        planeringsId: cleanText(entry.planeringsId),
        rawGranspunkt,
        normalizedGranspunkt,
        boundarySignature,
        boundaryStart: start,
        boundaryEnd: end,
        boundaryStartCode: cleanText(codes[0] || ''),
        boundaryEndCode: cleanText(codes[codes.length - 1] || ''),
        driftplatsCodes: codes,
        entries: [entry],
        meta: {
          source: 'project',
          index,
        },
      };
    })
    .filter(Boolean)
    .filter((row, index, rows) => index === rows.findIndex((candidate) => candidate.registryKey === row.registryKey));
};

const normalizeParsedEntries = (parsed = {}) => {
  const rawEntries = Array.isArray(parsed?.entries) ? parsed.entries : [];
  const fallbackBoundary = cleanText(parsed?.granspunkt);

  return rawEntries
    .map((entry = {}) => ({
      beteckning: cleanText(entry.beteckning),
      planeringsId: cleanText(entry.planeringsId),
      granspunkt: cleanText(entry.granspunkt || fallbackBoundary),
      startDate: cleanText(entry.startDate),
      startTime: cleanText(entry.startTime),
      endDate: cleanText(entry.endDate),
      endTime: cleanText(entry.endTime),
    }))
    .filter((entry) => entry.granspunkt || entry.beteckning);
};

const hashUploadedFile = (fileData = '') =>
  crypto.createHash('sha1').update(String(fileData || '')).digest('hex');

const hashFilePath = (filePath = '') =>
  crypto.createHash('sha1').update(String(filePath || '')).digest('hex');

const isPdfFile = (filePath = '') => String(filePath || '').toLowerCase().endsWith('.pdf');

const isPlankaPath = (filePath = '') => String(filePath || '').toLowerCase().includes(`${path.sep}planka`);

const detectArchiveCategory = (relativePath = '') => {
  const parts = String(relativePath || '')
    .split(path.sep)
    .map((part) => part.trim().toLowerCase());

  if (parts.some((part) => part.includes('blankett'))) return 'blankett';
  if (parts.some((part) => part === 'disp' || part.startsWith('disp '))) return 'disp';
  if (parts.some((part) => part.includes('planka'))) return 'planka';
  return 'other';
};

const getArchiveContextPath = (relativePath = '') => {
  const parts = String(relativePath || '').split(path.sep);
  const categoryIndex = parts.findIndex((part) => {
    const lowered = part.trim().toLowerCase();
    return lowered.includes('blankett') || lowered === 'disp' || lowered.startsWith('disp ');
  });

  if (categoryIndex <= 0) {
    return parts.slice(0, -1).join(path.sep);
  }

  return parts.slice(0, categoryIndex).join(path.sep);
};

const getArchiveProjectLabel = (contextPath = '') => {
  const parts = String(contextPath || '').split(path.sep).filter(Boolean);
  if (!parts.length) return '';
  if (parts[0] === 'BIB' && parts[1]) {
    return `${parts[0]} / ${parts[1]}`;
  }
  return parts[0];
};

const extractNumericIdentifiers = (...values) => {
  const ids = values
    .flatMap((value) => String(value || '').match(/\b\d{4,6}\b/g) || [])
    .map((value) => cleanText(value))
    .filter(Boolean);

  return ids.filter((value, index) => ids.indexOf(value) === index);
};

const scoreArchiveDispCandidate = (blankettRecord = {}, dispRecord = {}) => {
  let score = 0;
  const reasons = [];

  const sharedIds = (blankettRecord.identifiers || []).filter((id) => (dispRecord.identifiers || []).includes(id));
  if (sharedIds.length) {
    score += sharedIds.length * 100;
    reasons.push(`shared-id:${sharedIds.join(',')}`);
  }

  if (blankettRecord.contextPath && blankettRecord.contextPath === dispRecord.contextPath) {
    score += 40;
    reasons.push('same-context');
  }

  if (
    blankettRecord.projectLabel &&
    dispRecord.projectLabel &&
    cleanText(blankettRecord.projectLabel) === cleanText(dispRecord.projectLabel)
  ) {
    score += 20;
    reasons.push('same-project');
  }

  return { score, reasons };
};

const chooseBestArchiveDisp = (blankettRecord = {}, dispRecords = []) =>
  dispRecords
    .map((dispRecord) => ({
      dispRecord,
      ...scoreArchiveDispCandidate(blankettRecord, dispRecord),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)[0] || null;

const buildRegistryRowsFromParsed = ({ parsed = {}, fileName = '', fileData = '' } = {}) => {
  const entries = normalizeParsedEntries(parsed);
  const fileHash = fileData ? hashUploadedFile(fileData) : '';

  return entries
    .map((entry, index) => {
      const rawGranspunkt = cleanText(entry.granspunkt);
      if (!rawGranspunkt) return null;

      const normalizedGranspunkt = normalizeBoundaryForComparison(rawGranspunkt);
      const boundarySignature = buildBoundarySignature(rawGranspunkt);
      const { start, end } = splitBoundarySides(normalizedGranspunkt);
      const codes = extractOrderedCodes(rawGranspunkt);

      return {
        registryKey: fileHash
          ? `upload:${fileHash}:${boundarySignature}`
          : `upload:${cleanText(fileName)}:${index}:${boundarySignature}`,
        sourceFileName: cleanText(fileName),
        projectId: null,
        projectName: '',
        projectPlats: '',
        beteckning: cleanText(entry.beteckning),
        planeringsId: cleanText(entry.planeringsId),
        rawGranspunkt,
        normalizedGranspunkt,
        boundarySignature,
        boundaryStart: start,
        boundaryEnd: end,
        boundaryStartCode: cleanText(codes[0] || ''),
        boundaryEndCode: cleanText(codes[codes.length - 1] || ''),
        driftplatsCodes: codes,
        entries: [entry],
        meta: {
          source: 'upload',
          fileHash,
          parsedMeta: parsed?.meta || {},
        },
      };
    })
    .filter(Boolean)
    .filter((row, index, rows) => index === rows.findIndex((candidate) => candidate.registryKey === row.registryKey));
};

const buildArchiveRegistryRowsFromParsed = ({
  parsed = {},
  fileName = '',
  filePath = '',
  projectName = '',
  projectPlats = '',
  dispPath = '',
  contextPath = '',
  matchScore = 0,
  matchReasons = [],
} = {}) => {
  const rows = buildRegistryRowsFromParsed({ parsed, fileName, fileData: filePath || fileName });

  return rows.map((row) => ({
    ...row,
    registryKey: `archive:${hashFilePath(filePath || fileName)}:${row.boundarySignature}`,
    sourceFileName: cleanText(fileName),
    projectId: null,
    projectName: cleanText(projectName),
    projectPlats: cleanText(projectPlats),
    meta: {
      source: 'archive',
      filePath: cleanText(filePath),
      dispPath: cleanText(dispPath),
      contextPath: cleanText(contextPath),
      matchScore,
      matchReasons,
      parsedMeta: parsed?.meta || {},
    },
  }));
};

const syncProjectBlankett31Registry = async (prisma, project = {}) => {
  if (!project?.id) return [];

  const rows = buildRegistryRowsFromProject(project);
  await prisma.blankett31Registry.deleteMany({ where: { projectId: project.id } });

  for (const row of rows) {
    await prisma.blankett31Registry.create({ data: row });
  }

  return rows;
};

const bootstrapBlankett31RegistryFromProjects = async (prisma) => {
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      name: true,
      plats: true,
      formState: true,
    },
  });

  let created = 0;
  for (const project of projects) {
    const rows = await syncProjectBlankett31Registry(prisma, project);
    created += rows.length;
  }

  return {
    projects: projects.length,
    rows: created,
  };
};

const buildBlankett31ArchiveInventory = async (rootPath) => {
  const archiveRoot = path.resolve(String(rootPath || ''));
  const discovered = [];

  const walk = (currentPath) => {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    entries.forEach((entry) => {
      const absolutePath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(absolutePath);
        return;
      }

      if (!entry.isFile() || !isPdfFile(absolutePath) || isPlankaPath(absolutePath)) {
        return;
      }

      const relativePath = path.relative(archiveRoot, absolutePath);
      const category = detectArchiveCategory(relativePath);
      if (category === 'planka') return;

      discovered.push({
        absolutePath,
        relativePath,
        category,
        contextPath: getArchiveContextPath(relativePath),
        projectLabel: getArchiveProjectLabel(getArchiveContextPath(relativePath)),
        identifiers: extractNumericIdentifiers(entry.name, relativePath),
      });
    });
  };

  walk(archiveRoot);

  const blankettRecords = discovered.filter((item) => item.category === 'blankett');
  const dispRecords = discovered.filter((item) => item.category === 'disp');
  const otherPdfRecords = discovered.filter((item) => item.category === 'other');

  const projects = new Map();
  [...blankettRecords, ...dispRecords].forEach((item) => {
    const key = item.contextPath || item.projectLabel || item.relativePath;
    if (!projects.has(key)) {
      projects.set(key, {
        contextPath: key,
        projectLabel: item.projectLabel,
        blankettFiles: [],
        dispFiles: [],
      });
    }

    const project = projects.get(key);
    if (item.category === 'blankett') project.blankettFiles.push(item.relativePath);
    if (item.category === 'disp') project.dispFiles.push(item.relativePath);
  });

  const rows = [];
  const parseErrors = [];

  for (const blankettRecord of blankettRecords) {
    try {
      const parsed = await parseBlankett31Pdf(fs.readFileSync(blankettRecord.absolutePath));
      const bestDisp = chooseBestArchiveDisp(blankettRecord, dispRecords);
      const archiveRows = buildArchiveRegistryRowsFromParsed({
        parsed,
        fileName: path.basename(blankettRecord.absolutePath),
        filePath: blankettRecord.absolutePath,
        projectName: parsed?.meta?.projectLabel || blankettRecord.projectLabel,
        projectPlats: parsed?.meta?.projectLabel || blankettRecord.projectLabel,
        dispPath: bestDisp?.dispRecord?.absolutePath || '',
        contextPath: blankettRecord.contextPath,
        matchScore: bestDisp?.score || 0,
        matchReasons: bestDisp?.reasons || [],
      });
      rows.push(...archiveRows);
    } catch (error) {
      parseErrors.push({
        file: blankettRecord.relativePath,
        error: cleanText(error?.message || error),
      });
    }
  }

  return {
    rootPath: archiveRoot,
    stats: {
      projectsWithAnyFiles: projects.size,
      blankettPdfCount: blankettRecords.length,
      dispPdfCount: dispRecords.length,
      otherPdfCount: otherPdfRecords.length,
      archiveRows: rows.length,
      parseErrors: parseErrors.length,
    },
    projects: [...projects.values()]
      .sort((left, right) => left.contextPath.localeCompare(right.contextPath, 'sv'))
      .map((project) => ({
        ...project,
        blankettCount: project.blankettFiles.length,
        dispCount: project.dispFiles.length,
      })),
    rows,
    parseErrors,
  };
};

const importBlankett31Archive = async (prisma, rootPath) => {
  const inventory = await buildBlankett31ArchiveInventory(rootPath);

  await prisma.blankett31Registry.deleteMany({
    where: {
      projectId: null,
    },
  });

  for (const row of inventory.rows) {
    await prisma.blankett31Registry.create({ data: row });
  }

  return {
    ...inventory.stats,
    importedRows: inventory.rows.length,
    rootPath: inventory.rootPath,
  };
};

const scoreRegistryMatch = (candidate = {}, current = {}) => {
  let score = 0;

  if (candidate.boundarySignature === current.boundarySignature) score += 100;
  if (candidate.boundaryStartCode && candidate.boundaryStartCode === current.boundaryStartCode) score += 20;
  if (candidate.boundaryEndCode && candidate.boundaryEndCode === current.boundaryEndCode) score += 20;

  const candidateCodes = Array.isArray(candidate.driftplatsCodes) ? candidate.driftplatsCodes : [];
  const currentCodes = Array.isArray(current.driftplatsCodes) ? current.driftplatsCodes : [];
  const overlap = currentCodes.filter((code) => candidateCodes.includes(code));
  score += overlap.length * 10;

  return {
    score,
    overlap,
  };
};

const describeRegistryMatch = (item = {}) => {
  const score = Number(item.score || 0);
  const overlapCount = Array.isArray(item.overlap) ? item.overlap.length : 0;
  const sameBoundary = score >= 100;

  if (sameBoundary) {
    return {
      matchType: 'Samma gränspunkter',
      reviewNote: 'Kontrollera ändå signaler, spår och tider mot den gamla dispen innan du utgår från den.',
      matchSummary:
        overlapCount > 0
          ? `Samma normaliserade gränspunkter och ${overlapCount} gemensam driftplatskod.`
          : 'Samma normaliserade gränspunkter.',
    };
  }

  if (score >= 60) {
    return {
      matchType: 'Liknande gränspunkter',
      reviewNote: 'Liknar området, men kontroll av signaler, spår och tider behövs alltid innan användning.',
      matchSummary:
        overlapCount > 0
          ? `${overlapCount} gemensamma driftplatskoder, men inte samma gränspunkter fullt ut.`
          : 'Liknande område, men inte samma gränspunkter fullt ut.',
    };
  }

  return {
    matchType: 'Liknande område',
    reviewNote: 'Använd bara som referens. Kontrollera signaler, spår och tider noggrant.',
    matchSummary:
      overlapCount > 0
        ? `${overlapCount} gemensamma driftplatskoder i området.`
        : 'Överlappar området, men är inte tillräckligt nära för att räknas som samma gränspunkter.',
  };
};

const suggestBlankett31Matches = async (prisma, parsed = {}, options = {}) => {
  const limit = Number(options.limit || 5);
  const currentRows = buildRegistryRowsFromParsed({ parsed });
  if (!currentRows.length) return [];

  const candidates = await prisma.blankett31Registry.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const suggestions = [];

  currentRows.forEach((currentRow) => {
    candidates.forEach((candidate) => {
      const { score, overlap } = scoreRegistryMatch(candidate, currentRow);
      if (score <= 0) return;
      suggestions.push({
        score,
        overlap,
        boundarySignature: currentRow.boundarySignature,
        projectId: candidate.projectId,
        projectName: candidate.projectName,
        projectPlats: candidate.projectPlats,
        normalizedGranspunkt: candidate.normalizedGranspunkt,
        candidateId: candidate.id,
        sourceType: candidate.projectId ? 'project' : (candidate.meta?.source || 'archive'),
        archiveDispPath: cleanText(candidate.meta?.dispPath || ''),
        archiveBlankettPath: cleanText(candidate.meta?.filePath || ''),
        suggestionKey: candidate.projectId ? `project:${candidate.projectId}` : `archive:${candidate.id}`,
        referenceStartDate: cleanText(candidate.referenceStartDate || candidate.entries?.[0]?.startDate || ''),
        referenceEndDate: cleanText(candidate.referenceEndDate || candidate.entries?.[0]?.endDate || ''),
      });
    });
  });

  const compareSuggestionRecency = (left, right) => {
    const leftDate = `${left.referenceStartDate || '0000-00-00'}|${left.referenceEndDate || '0000-00-00'}`;
    const rightDate = `${right.referenceStartDate || '0000-00-00'}|${right.referenceEndDate || '0000-00-00'}`;
    return rightDate.localeCompare(leftDate, 'sv');
  };

  const deduped = suggestions
    .sort((left, right) => right.score - left.score || compareSuggestionRecency(left, right))
    .filter((item, index, collection) =>
      index === collection.findIndex((candidate) => candidate.suggestionKey === item.suggestionKey)
    )
    .filter((item) => {
      if (item.sourceType === 'project') {
        return Boolean(item.projectId);
      }

      if (item.sourceType === 'archive') {
        return Boolean(item.archiveDispPath || item.archiveBlankettPath);
      }

      return Boolean(item.projectId || item.archiveDispPath || item.archiveBlankettPath);
    })
    .slice(0, limit)
    .map((item) => ({
      ...item,
      ...describeRegistryMatch(item),
    }));

  return deduped;
};

module.exports = {
  buildRegistryRowsFromParsed,
  bootstrapBlankett31RegistryFromProjects,
  buildBlankett31ArchiveInventory,
  importBlankett31Archive,
  normalizeBoundaryForComparison,
  suggestBlankett31Matches,
  syncProjectBlankett31Registry,
};
