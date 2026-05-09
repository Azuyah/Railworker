// backend/index.js
const express = require('express');
const bcrypt = require('bcrypt');
const authMiddleware = require('./middleware/auth');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('./generated/prisma/client');
const { parseBlankett31Pdf } = require('./lib/blankett31Parser');
const {
  bootstrapBlankett31RegistryFromProjects,
  buildBlankett31ArchiveInventory,
  importBlankett31Archive,
  suggestBlankett31Matches,
  syncProjectBlankett31Registry,
} = require('./lib/blankett31Registry');
const { parseDispPdf } = require('./lib/dispParser');
const { createPlanWorkbookBuffer } = require('./lib/planExcelExport');
const { importPlanWorkbookBuffer } = require('./lib/planExcelImport');
const { createDispPdfBuffer, getPublicDispName } = require('./lib/dispPdfExport');
const { buildSignalSections, expandDriftplatsSequence } = require('./lib/njdbDriftplatsService');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const TELEFONKATALOG_PATH = '/Users/matsmalleandersson/Desktop/Disp Arbetsmall/Telefonkatalog 2024-10-03.pdf';
const BLANKETT31_ARCHIVE_ROOT = '/Users/matsmalleandersson/Desktop/Disper';

const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length', 'X-Export-Filename'],
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '25mb' }));

app.get('/api/telefonkatalog', (req, res) => {
  if (!fs.existsSync(TELEFONKATALOG_PATH)) {
    return res.status(404).json({ error: 'Telefonkatalogen kunde inte hittas.' });
  }

  return res.sendFile(TELEFONKATALOG_PATH, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="Telefonkatalog-2024-10-03.pdf"',
    },
  });
});

app.get('/api/public/projects', async (req, res) => {
  try {
    await syncExpiredTsmVisibility();

    const projects = await prisma.project.findMany({
      where: { visibleToTsm: true },
      include: {
        sections: true,
        beteckningar: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(projects.map((project) => hydrateProjectSections(project)));
  } catch (error) {
    console.error('Kunde inte hämta publika projekt:', error);
    res.status(500).json({ error: 'Kunde inte hämta projekt just nu' });
  }
});

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in your .env file');
}

const normalizePhoneNumber = (value = '') =>
  String(value || '').replace(/[^\d+]/g, '').trim();

const sanitizeAsciiFilename = (value = '') =>
  String(value || 'dokument.pdf')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/["\\]/g, '')
    .trim() || 'dokument.pdf';

const normalizeFullName = (value = '') =>
  String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();

const buildAuthPayload = (user) => {
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    message: 'Login successful',
    token,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    signature: user.signature,
    email: user.email,
    phone: user.phone,
    company: user.company,
  };
};

const decodeUploadedPdf = (fileData, fileName = '') => {
  const raw = String(fileData || '').trim();
  if (!raw) {
    throw new Error('PDF-data saknas');
  }

  const dataUrlMatch = raw.match(/^data:([^;,]+)?(?:;charset=[^;]+)?;base64,(.+)$/i);
  const base64Payload = (dataUrlMatch ? dataUrlMatch[2] : raw).replace(/\s+/g, '');
  if (!base64Payload) {
    throw new Error('Ogiltigt PDF-format');
  }

  const pdfBuffer = Buffer.from(base64Payload, 'base64');
  const headerSample = pdfBuffer.subarray(0, 1024).toString('latin1');
  const looksLikePdf = headerSample.includes('%PDF-');

  if (!pdfBuffer.length || !looksLikePdf) {
    throw new Error('Ogiltigt PDF-format');
  }

  return pdfBuffer;
};

const decodeUploadedBinary = (fileData) => {
  const raw = String(fileData || '').trim();
  if (!raw) {
    throw new Error('Fil-data saknas');
  }

  const dataUrlMatch = raw.match(/^data:([^;,]+)?(?:;charset=[^;]+)?;base64,(.+)$/i);
  const base64Payload = (dataUrlMatch ? dataUrlMatch[2] : raw).replace(/\s+/g, '');
  if (!base64Payload) {
    throw new Error('Ogiltigt filformat');
  }

  const fileBuffer = Buffer.from(base64Payload, 'base64');
  if (!fileBuffer.length) {
    throw new Error('Ogiltigt filformat');
  }

  return fileBuffer;
};

const hydrateProjectSections = (project = null) => {
  if (!project || !Array.isArray(project.sections)) {
    return project;
  }

  const sortByStoredOrder = (items = [], getOrder) =>
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

  const sectionDetails = Array.isArray(project.formState?.sectionDetails)
    ? project.formState.sectionDetails
    : [];
  const orderedSections = sortByStoredOrder(project.sections, (section) => section?.sortOrder);
  const orderedDetails = sortByStoredOrder(sectionDetails, (details) => details?.sortOrder);
  const mergedLength = Math.max(orderedSections.length, orderedDetails.length);

  const sections = Array.from({ length: mergedLength }, (_, index) => {
      const section = orderedSections[index] || {};
      const details = orderedDetails[index] || {};
      const sortOrder = Number(details.sortOrder);
      const displayIndex = Number(details.displayIndex);

      return {
        ...section,
        signal: details.signal || section.signal || section.name || '',
        name: details.signal || section.name || '',
        displayIndex: Number.isFinite(displayIndex) ? displayIndex : null,
        customLabel: String(details.customLabel || '').trim(),
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : index,
      };
    })
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));

  return {
    ...project,
    sections,
  };
};

const getProjectSectionTemplateData = (project = null) => {
  const hydrated = hydrateProjectSections(project);
  if (!hydrated || !Array.isArray(hydrated.sections)) {
    return [];
  }

  const sectionDetails = Array.isArray(hydrated.formState?.sectionDetails)
    ? hydrated.formState.sectionDetails
    : [];

  const sortByStoredOrder = (items = [], getOrder) =>
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

  const orderedSections = sortByStoredOrder(hydrated.sections, (section) => section?.sortOrder);
  const orderedDetails = sortByStoredOrder(sectionDetails, (details) => details?.sortOrder);

  return orderedSections.map((section, index) => ({
    ...section,
    ...(orderedDetails[index] || {}),
  }));
};

const isLineSection = (section = {}) => {
  const explicitType = String(section?.type || section?.sectionType || '').trim().toLowerCase();
  if (explicitType.includes('linje') || explicitType.includes('sträcka')) {
    return true;
  }
  if (explicitType.includes('dp') || explicitType.includes('driftplats')) {
    return false;
  }

  const label = String(section?.signal || section?.name || '').trim();
  return label.includes(' - ');
};

const validatePlanningSelectionRules = (sections = [], selections = [], anordning = []) => {
  const selectedIndexes = Array.isArray(selections)
    ? selections
        .map((selected, index) => (selected ? index : -1))
        .filter((index) => index >= 0)
    : [];

  if (anordning.includes('L-S')) {
    if (selectedIndexes.length !== 1) {
      return 'L-Skydd kräver exakt ett delområde.';
    }
    const selectedSection = sections[selectedIndexes[0]];
    if (!isLineSection(selectedSection)) {
      return 'L-Skydd kan bara läggas på linjedelområde.';
    }
  }

  if (anordning.includes('A-S')) {
    if (selectedIndexes.length === 0) {
      return 'A-Skydd kräver minst ett delområde.';
    }

    const sortedIndexes = [...selectedIndexes].sort((left, right) => left - right);
    const isContiguousChain = sortedIndexes.every((index, currentIndex) => (
      currentIndex === 0 || index - sortedIndexes[currentIndex - 1] === 1
    ));

    if (!isContiguousChain) {
      return 'A-Skydd måste vara en sammanhängande kedja av angränsande delområden.';
    }
  }

  return null;
};

const normalizeDateForInput = (value = '') => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const slashMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return '';
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildPlanEntries = (project) => {
  const entries = Array.isArray(project?.formState?.blankett31Entries)
    ? project.formState.blankett31Entries.filter((entry) => entry?.startDate || entry?.beteckning)
    : [];

  if (entries.length) {
    return entries.map((entry, index) => ({
      ...entry,
      key: `${entry.beteckning || 'entry'}|${entry.startDate || ''}|${index}`,
    }));
  }

  return [
    {
      key: 'default-entry',
      beteckning: project?.beteckningar?.[0]?.label || '',
      startDate: project?.startDate || '',
      startTime: project?.startTime || '',
      endDate: project?.endDate || '',
      endTime: project?.endTime || '',
    },
  ];
};

const getPlanEntryAnchor = (entry = {}) => {
  const date = normalizeDateForInput(entry.startDate || entry.endDate || '');
  const time = String(entry.startTime || entry.endTime || '00:00').trim() || '00:00';
  if (!date) return Number.POSITIVE_INFINITY;
  const parsed = new Date(`${date}T${time.length === 5 ? time : '00:00'}:00`);
  return Number.isNaN(parsed.getTime()) ? Number.POSITIVE_INFINITY : parsed.getTime();
};

const getPlanEntryEndAnchor = (entry = {}) => {
  const date = normalizeDateForInput(entry.endDate || entry.startDate || '');
  const time = String(entry.endTime || entry.startTime || '23:59').trim() || '23:59';
  if (!date) return Number.NEGATIVE_INFINITY;
  const parsed = new Date(`${date}T${time.length === 5 ? time : '23:59'}:00`);
  return Number.isNaN(parsed.getTime()) ? Number.NEGATIVE_INFINITY : parsed.getTime();
};

const getNextPlanEntry = (project) => {
  const now = Date.now();
  const entries = buildPlanEntries(project)
    .map((entry) => ({ entry, anchor: getPlanEntryAnchor(entry) }))
    .filter(({ anchor }) => Number.isFinite(anchor))
    .sort((left, right) => left.anchor - right.anchor);

  return entries.find(({ anchor }) => anchor >= now)?.entry || null;
};

const getPlanEntryCutoffTimestamp = (entry) => {
  const anchor = getPlanEntryAnchor(entry);
  if (!Number.isFinite(anchor)) return Number.NEGATIVE_INFINITY;
  return anchor - 60 * 60 * 1000;
};

const isPlanningWindowOpen = (entry) => Date.now() < getPlanEntryCutoffTimestamp(entry);

const getRowPlanDate = (row = {}) =>
  normalizeDateForInput(row?.begardDatum || row?.datum || row?.startdatum || '');

const getApproverBtknPrefix = (user = {}) => {
  const explicitSignature = String(user?.signature || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .trim();

  if (explicitSignature) {
    return explicitSignature;
  }

  const fallback = `${String(user?.firstName || '').trim()[0] || ''}${String(user?.lastName || '').trim()[0] || ''}`
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .trim();

  return fallback || 'HT';
};

const getNextProjectBtkn = (prefix = '', rows = []) => {
  const safePrefix = String(prefix || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!safePrefix) {
    return '';
  }

  const regex = new RegExp(`^${safePrefix}(\\d+)$`);
  let maxNumber = 0;

  (rows || []).forEach((row) => {
    const match = String(row?.btkn || '').trim().toUpperCase().match(regex);
    if (match?.[1]) {
      maxNumber = Math.max(maxNumber, Number.parseInt(match[1], 10) || 0);
    }
  });

  const nextNumber = String(maxNumber + 1).padStart(2, '0');
  return `${safePrefix}${nextNumber}`;
};

const getRowSortTimestamp = (row = {}) => {
  const rawValue = row?.createdAt || row?.skapadDatum || row?.updatedAt || row?.datum || '';
  const timestamp = new Date(rawValue).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const sanitizeDownloadFileBase = (value = '', fallback = 'fil') => {
  const normalized = sanitizeAsciiFilename(String(value || ''))
    .replace(/[<>:\/\\|?*\u0000-\u001F]/g, '')
    .trim()
    .replace(/\s+/g, ' ');

  return normalized || fallback;
};

const buildDispExportBaseName = (project = {}) => {
  const dispSettings = project?.formState?.dispSettings || {};
  const explicitFileName = String(dispSettings.publiktDispnamn || '').trim();
  const fallbackName = String(project?.name || getPublicDispName(project, dispSettings) || '').trim();
  const baseName = explicitFileName || fallbackName;
  return baseName.slice(0, 80);
};

const canAccessProject = (role = '', project = null) => {
  const normalizedRole = String(role || '').toUpperCase();
  if (!project) return false;
  if (normalizedRole === 'TSM') {
    return Boolean(project.visibleToTsm);
  }
  return true;
};

const isProjectTsmVisibilityExpired = (project = {}) => {
  if (!project?.visibleToTsm) {
    return false;
  }

  const endAnchors = buildPlanEntries(project)
    .map((entry) => getPlanEntryEndAnchor(entry))
    .filter((anchor) => Number.isFinite(anchor) && anchor > Number.NEGATIVE_INFINITY);

  if (!endAnchors.length) {
    return false;
  }

  return Date.now() > Math.max(...endAnchors);
};

const syncExpiredTsmVisibility = async () => {
  const candidates = await prisma.project.findMany({
    where: { visibleToTsm: true },
    select: {
      id: true,
      visibleToTsm: true,
      startDate: true,
      startTime: true,
      endDate: true,
      endTime: true,
      formState: true,
      beteckningar: true,
    },
  });

  const expiredIds = candidates
    .filter((project) => isProjectTsmVisibilityExpired(project))
    .map((project) => project.id);

  if (!expiredIds.length) {
    return;
  }

  await prisma.project.updateMany({
    where: { id: { in: expiredIds } },
    data: { visibleToTsm: false },
  });
};

app.post('/api/njdb/driftplatser/expand', authMiddleware, async (req, res) => {
  try {
    const { value, places } = req.body || {};
    const result = await expandDriftplatsSequence(Array.isArray(places) ? places : value);
    res.json(result);
  } catch (error) {
    console.error('Fel vid NJDB-driftplatssokning:', error);
    res.status(400).json({ error: error.message || 'Kunde inte hamta driftplatser fran NJDB' });
  }
});

app.post('/api/njdb/sections/signals', authMiddleware, async (req, res) => {
  try {
    const { value, places, outerBoundaries } = req.body || {};
    const result = await buildSignalSections({
      places: Array.isArray(places) ? places : value,
      outerBoundaries,
    });
    res.json(result);
  } catch (error) {
    console.error('Fel vid NJDB-sektionssokning:', error);
    res.status(400).json({ error: error.message || 'Kunde inte skapa delomraden fran NJDB' });
  }
});

// Register user
app.post('/api/register', async (req, res) => {
  const { firstName, lastName, phone, company } = req.body;


  try {
    const normalizedPhone = normalizePhoneNumber(phone);

    if (!firstName || !lastName || !normalizedPhone || !company) {
      return res.status(400).json({ error: 'Förnamn, efternamn, telefon och företag krävs' });
    }

    const existingUser = await prisma.user.findFirst({ where: { phone: normalizedPhone } });
    if (existingUser) {
      if (existingUser.role !== 'TSM') {
        return res.status(400).json({ error: 'Telefonnumret används redan av ett annat konto' });
      }

      return res.status(200).json(buildAuthPayload(existingUser));
    }

    const generatedEmail = `${normalizedPhone.replace(/[^\d]/g, '')}@railworker.local`;
    const generatedPassword = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);
    const signature = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

    const user = await prisma.user.create({
      data: {
        email: generatedEmail,
        password: hashedPassword,
        firstName,
        lastName,
        phone: normalizedPhone,
        company,
        signature,
        role: 'TSM'
      },
    });

    res.status(201).json(buildAuthPayload(user));
  } catch (err) {
    console.error('❌ Fel vid registrering:', err);
    res.status(500).json({ error: 'Registreringen misslyckades internt' });
  }
});

app.get('/api/user', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Ingen token angiven' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        company: true,
        role: true,
        signature: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Användare hittades inte' });
    }

    res.json(user);
  } catch (error) {
    console.error('Fel vid hämtning av användare:', error);
    res.status(500).json({ error: 'Kunde inte hämta användare' });
  }
});
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    res.json(buildAuthPayload(user));
  } catch (error) {
    console.error('Fel vid inloggning:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login-tsm', async (req, res) => {
  const normalizedPhone = normalizePhoneNumber(req.body?.phone);
  const normalizedName = normalizeFullName(req.body?.name);

  try {
    if (!normalizedPhone || !normalizedName) {
      return res.status(400).json({ error: 'Namn och telefon krävs' });
    }

    const user = await prisma.user.findFirst({
      where: {
        phone: normalizedPhone,
        role: 'TSM',
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Ingen TSM-användare hittades med det telefonnumret' });
    }

    const storedName = normalizeFullName(`${user.firstName || ''} ${user.lastName || ''}`);
    if (storedName !== normalizedName) {
      return res.status(400).json({ error: 'Namnet stämmer inte med telefonnumret' });
    }

    res.json(buildAuthPayload(user));
  } catch (error) {
    console.error('Fel vid TSM-inloggning:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/user', authMiddleware, async (req, res) => {
  const { firstName, lastName, email, phone, company, password } = req.body;
  const userId = req.user.userId;

  const signature =
    `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        email,
        phone,
        company,
        signature,
        ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
      },
    });

    res.json({
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      company: updatedUser.company,
      role: updatedUser.role,
      signature: updatedUser.signature,
    });
  } catch (error) {
    console.error('Fel vid uppdatering av användare:', error);
    res.status(500).json({ error: 'Kunde inte uppdatera användaren' });
  }
});

app.post('/api/employees', authMiddleware, async (req, res) => {
  const { email } = req.body;
  const employerId = req.user.userId;

  try {
    const employee = await prisma.user.findUnique({
      where: { email },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Ingen användare med den e-postadressen hittades' });
    }

    if (employee.id === employerId) {
      return res.status(400).json({ error: 'Du kan inte lägga till dig själv som anställd' });
    }

    const alreadyAdded = await prisma.employee.findFirst({
      where: {
        employerId,
        employeeId: employee.id
      }
    });

    if (alreadyAdded) {
      return res.status(400).json({ error: 'Användaren är redan anställd' });
    }

    await prisma.employee.create({
      data: {
        employerId,
        employeeId: employee.id
      }
    });

    res.json({ message: 'Anställd tillagd' });
  } catch (err) {
    console.error('Fel vid tillägg av anställd:', err);
    res.status(500).json({ error: 'Kunde inte lägga till anställd' });
  }
});

app.get('/api/employees', authMiddleware, async (req, res) => {
  const userId = req.user.userId;

  try {
    const employees = await prisma.employee.findMany({
      where: { employerId: userId },
      include: {
        employee: true // inkluderar användarinfo för varje anställd
      }
    });

    res.json(employees);
  } catch (error) {
    console.error('Fel vid hämtning av anställda:', error);
    res.status(500).json({ error: 'Kunde inte hämta anställda' });
  }
});

app.delete('/api/employees/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(id) }
    });

    if (!employee || employee.employerId !== userId) {
      return res.status(403).json({ error: 'Obehörig eller ogiltig anställd' });
    }

    await prisma.employee.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Anställd borttagen' });
  } catch (error) {
    console.error('Fel vid borttagning:', error);
    res.status(500).json({ error: 'Kunde inte ta bort anställd' });
  }
});

app.post('/api/projects', authMiddleware, async (req, res) => {

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Ingen token angiven' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const {
      name,
      startDate,
      startTime,
      endDate,
      endTime,
      plats,
      namn,
      telefonnummer,
      granspunkter,
      formState,
      visibleToTsm = false,
      sections = [],
      beteckningar = [],
    } = req.body;

    // 🔎 Mappa och validera beteckningar
    const filteredBeteckningar = Array.isArray(beteckningar)
      ? beteckningar
          .filter((b) => typeof b.value === 'string' && b.value.trim() !== '')
          .map((b) => ({ label: b.value.trim() }))
      : [];

    // 🔧 Skapa projektet
    const project = await prisma.project.create({
      data: {
        name,
        startDate,
        startTime,
        endDate,
        endTime,
        plats,
        namn,
        telefonnummer,
        granspunkter,
        formState,
        visibleToTsm: Boolean(visibleToTsm),
        user: { connect: { id: userId } },

        // 🔥 Koppla in direkt
        beteckningar: {
          create: filteredBeteckningar,
        },

        sections: {
          create: sections.map((sec) => ({
            name: sec.signal || '',
            type: sec.type,
            namingMode: sec.namingMode || 'LETTERS',
          })),
        },
      },
      include: {
        beteckningar: true,
        sections: true,
      },
    });

    await syncProjectBlankett31Registry(prisma, project);

    res.status(201).json(hydrateProjectSections(project));
  } catch (error) {
    console.error('❌ Create project error:', error);
    res.status(500).json({ error: 'Kunde inte skapa projekt' });
  }
});

app.get('/api/projects', authMiddleware, async (req, res) => {
  try {
    await syncExpiredTsmVisibility();

    const requesterRole = String(req.user?.role || '').toUpperCase();

    const projects = await prisma.project.findMany({
      where: requesterRole === 'TSM' ? { visibleToTsm: true } : {},
      select: {
        id: true,
        name: true,
        visibleToTsm: true,
        startDate: true,
        startTime: true,
        endDate: true,
        endTime: true,
        plats: true,
        namn: true,
        telefonnummer: true,
        granspunkter: true,
        formState: true,
        rows: true,
        sections: true,
        beteckningar: true,
        tsmRows: requesterRole === 'TSM'
          ? {
              where: {
                userId: req.user.userId,
              },
              orderBy: {
                createdAt: 'desc',
              },
            }
          : {
              where: {
                isPending: true,
              },
              include: {
                user: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    res.json(projects.map((project) => hydrateProjectSections(project)));
  } catch (err) {
    console.error('❌ Fel vid hämtning av projekt:', err);
    res.status(500).json({ error: 'Kunde inte hämta projekt' });
  }
});

const getProjectByIdHandler = async (req, res) => {
  try {
    await syncExpiredTsmVisibility();

    const projectId = parseInt(req.params.id, 10);
    if (isNaN(projectId)) {
      return res.status(400).json({ error: 'Ogiltigt projekt-ID' });
    }
const project = await prisma.project.findUnique({
  where: { id: projectId },
  select: {
    id: true,
    name: true,
    visibleToTsm: true,
    startDate: true,
    startTime: true,
    endDate: true,
    endTime: true,
    plats: true,
    namn: true,
    telefonnummer: true,
    granspunkter: true,
    formState: true,
    rows: true,
    sections: true,
    beteckningar: true,
    anteckningar: true,

    tsmRows: {
      where: { isPending: true },
      include: {
        user: true,
        section: true,
        approvedBy: true,
      },
    },
  },
});

    if (!project) {
      return res.status(404).json({ error: 'Projekt hittades inte' });
    }

    if (!canAccessProject(req.user?.role, project)) {
      return res.status(403).json({ error: 'Du har inte behörighet att se detta projekt' });
    }

    res.json(hydrateProjectSections(project));
  } catch (error) {
    console.error('Fel vid hämtning av projekt:', error.message, error.stack);
    res.status(500).json({ error: 'Kunde inte hämta projekt' });
  }
};

app.get('/api/project/:id', authMiddleware, getProjectByIdHandler);
app.get('/api/projects/:id', authMiddleware, getProjectByIdHandler);

const deleteProjectByIdHandler = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Ingen token angiven' });
  }

  try {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET); // Verifiering av token

    const projectId = parseInt(req.params.id, 10);

    await prisma.blankett31Registry.deleteMany({ where: { projectId } });
    await prisma.section.deleteMany({ where: { projectId } });
    await prisma.project.delete({ where: { id: projectId } });

    res.json({ message: 'Projekt raderat' });
  } catch (error) {
    console.error('Fel vid borttagning:', error);
    res.status(500).json({ error: 'Kunde inte ta bort projekt' });
  }
};

app.delete('/api/project/:id', deleteProjectByIdHandler);
app.delete('/api/projects/:id', deleteProjectByIdHandler);

app.put('/api/projects/:id', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Ingen token angiven' });
  }

  const token = authHeader.split(' ')[1];

  try {
    jwt.verify(token, JWT_SECRET);

    const { id } = req.params;
    const {
      name,
      startDate,
      startTime,
      endDate,
      endTime,
      plats,
      namn,
      telefonnummer,
      granspunkter,
      formState,
      visibleToTsm,
      rows,
      sections = [],
      beteckningar = [],
      anteckningar = [],
    } = req.body;

    const projectId = parseInt(id);
    const filteredBeteckningar = Array.isArray(beteckningar)
      ? beteckningar
          .map((b) => ({
            label:
              typeof b?.label === 'string' && b.label.trim()
                ? b.label.trim()
                : typeof b?.value === 'string' && b.value.trim()
                  ? b.value.trim()
                  : '',
          }))
          .filter((b) => b.label)
      : [];

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        name,
        startDate,
        startTime,
        endDate,
        endTime,
        plats,
        namn,
        telefonnummer,
        granspunkter,
        formState,
        ...(typeof visibleToTsm === 'boolean' ? { visibleToTsm } : {}),
        rows,
        anteckningar,
      },
    });

    try {
      const deleted = await prisma.beteckning.deleteMany({
        where: { projectId },
      });
    } catch (err) {
      console.error('❌ Fel vid deleteMany på beteckning:', err.message);
    }

    try {
      if (filteredBeteckningar.length > 0) {
        await prisma.beteckning.createMany({
          data: filteredBeteckningar.map((b) => ({
            label: b.label,
            projectId,
          })),
        });
      } else {

      }
    } catch (err) {
      console.error('❌ FEL vid createMany på beteckning:', err.message);
    }

    try {
      await prisma.section.deleteMany({ where: { projectId } });
      if (sections.length > 0) {
        await prisma.section.createMany({
          data: sections.map((s) => ({
            name: s.name || s.signal || '',
            type: s.type,
            namingMode: s.namingMode || 'LETTERS',
            projectId,
          })),
        });
      }
    } catch (err) {
      console.error('❌ FEL vid sections:', err.message);
    }

    const result = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        sections: true,
        beteckningar: true,
      },
    });
    await syncProjectBlankett31Registry(prisma, result);
    console.log('📌 Anteckningar mottaget från frontend:', anteckningar);

    res.json(hydrateProjectSections(result));
  } catch (error) {
    console.error('❌ Globalt fel:', error.message, error.stack);
    res.status(500).json({ error: 'Kunde inte uppdatera projektet' });
  }
});

app.put('/api/projects/:projectId/rows/:rowId/complete', authMiddleware, async (req, res) => {
  const { projectId, rowId } = req.params;
  const userId = req.user.userId;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

    const project = await prisma.project.findUnique({ where: { id: Number(projectId) } });
    if (!project || !project.rows) return res.status(404).json({ error: 'Projekt hittades inte' });

    const rows = project.rows;
    const updatedRows = rows.map((row) => {
      if (row.id === Number(rowId)) {
        return {
          ...row,
          avslutadRad: true,
          avslutatDatum: new Date().toISOString(),
          avslutat: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
          avslutadAv: initials
        };
      }
      return row;
    });

    const updatedProject = await prisma.project.update({
      where: { id: Number(projectId) },
      data: { rows: updatedRows }
    });

    res.json(updatedProject);
  } catch (err) {
    console.error('Fel vid avslut:', err);
    res.status(500).json({ error: 'Misslyckades med att avsluta rad' });
  }
});

app.patch('/api/projects/:id/visibility', authMiddleware, async (req, res) => {
  try {
    const requesterRole = String(req.user?.role || '').toUpperCase();
    if (requesterRole !== 'HTSM') {
      return res.status(403).json({ error: 'Endast HTSM kan ändra projektsynlighet' });
    }

    const projectId = parseInt(req.params.id, 10);
    if (Number.isNaN(projectId)) {
      return res.status(400).json({ error: 'Ogiltigt projekt-ID' });
    }

    const { visibleToTsm } = req.body || {};
    if (typeof visibleToTsm !== 'boolean') {
      return res.status(400).json({ error: 'visibleToTsm måste vara true eller false' });
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: { visibleToTsm },
      select: {
        id: true,
        visibleToTsm: true,
      },
    });

    res.json(project);
  } catch (error) {
    console.error('Fel vid uppdatering av projektsynlighet:', error);
    res.status(500).json({ error: 'Kunde inte uppdatera projektsynlighet' });
  }
});

app.patch('/api/projects/:id/sent-status', authMiddleware, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    if (Number.isNaN(projectId)) {
      return res.status(400).json({ error: 'Ogiltigt projekt-ID' });
    }

    const { sentToManagement } = req.body || {};
    if (typeof sentToManagement !== 'boolean') {
      return res.status(400).json({ error: 'sentToManagement måste vara true eller false' });
    }

    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        formState: true,
      },
    });

    if (!existingProject) {
      return res.status(404).json({ error: 'Projekt hittades inte' });
    }

    const nextFormState = {
      ...(existingProject.formState || {}),
      sentToManagement,
    };

    const project = await prisma.project.update({
      where: { id: projectId },
      data: { formState: nextFormState },
      select: {
        id: true,
        formState: true,
      },
    });

    res.json({
      id: project.id,
      sentToManagement: Boolean(project.formState?.sentToManagement),
    });
  } catch (error) {
    console.error('Fel vid uppdatering av skickat-status:', error);
    res.status(500).json({ error: 'Kunde inte uppdatera skickat-status' });
  }
});

app.post('/api/pdf/blankett31/parse', authMiddleware, async (req, res) => {
  const { fileName, fileData } = req.body;

  if (!fileName || !fileData) {
    return res.status(400).json({ error: 'PDF-data saknas' });
  }

  try {
    const pdfBuffer = decodeUploadedPdf(fileData, fileName);
    const parsed = await parseBlankett31Pdf(pdfBuffer);
    const suggestions = await suggestBlankett31Matches(prisma, parsed, { limit: 5 });
    const { rawText, ...fields } = parsed;

    res.json({
      fileName: path.basename(fileName),
      parsed: fields,
      suggestions,
    });
  } catch (error) {
    console.error('Fel vid tolkning av Blankett 31:', error);
    if (error?.message === 'PDF-data saknas' || error?.message === 'Ogiltigt PDF-format') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Kunde inte tolka Blankett 31' });
  }
});

app.post('/api/blankett31-registry/bootstrap', authMiddleware, async (req, res) => {
  try {
    const requesterRole = String(req.user?.role || '').toUpperCase();
    if (requesterRole !== 'HTSM') {
      return res.status(403).json({ error: 'Endast HTSM kan bygga Blankett 31-registret' });
    }

    const result = await bootstrapBlankett31RegistryFromProjects(prisma);
    res.json(result);
  } catch (error) {
    console.error('Fel vid bootstrap av Blankett 31-register:', error);
    res.status(500).json({ error: 'Kunde inte bygga Blankett 31-registret' });
  }
});

app.post('/api/blankett31-registry/import-archive', authMiddleware, async (req, res) => {
  try {
    const requesterRole = String(req.user?.role || '').toUpperCase();
    if (requesterRole !== 'HTSM') {
      return res.status(403).json({ error: 'Endast HTSM kan importera historiskt Blankett 31-register' });
    }

    const rootPath = String(req.body?.rootPath || '').trim();
    if (!rootPath) {
      return res.status(400).json({ error: 'Sökväg till arkivmappen saknas' });
    }

    const result = await importBlankett31Archive(prisma, rootPath);
    res.json(result);
  } catch (error) {
    console.error('Fel vid import av historiskt Blankett 31-register:', error);
    res.status(500).json({ error: 'Kunde inte importera historiskt Blankett 31-register' });
  }
});

app.post('/api/blankett31-registry/inventory', authMiddleware, async (req, res) => {
  try {
    const requesterRole = String(req.user?.role || '').toUpperCase();
    if (requesterRole !== 'HTSM') {
      return res.status(403).json({ error: 'Endast HTSM kan läsa inventeringen' });
    }

    const rootPath = String(req.body?.rootPath || '').trim();
    if (!rootPath) {
      return res.status(400).json({ error: 'Sökväg till arkivmappen saknas' });
    }

    const inventory = await buildBlankett31ArchiveInventory(rootPath);
    res.json(inventory);
  } catch (error) {
    console.error('Fel vid inventering av historiskt Blankett 31-register:', error);
    res.status(500).json({ error: 'Kunde inte läsa historiskt Blankett 31-register' });
  }
});

app.post('/api/blankett31-registry/open-archive-file', authMiddleware, async (req, res) => {
  try {
    const requesterRole = String(req.user?.role || '').toUpperCase();
    if (requesterRole !== 'HTSM') {
      return res.status(403).json({ error: 'Endast HTSM kan öppna arkivfiler härifrån' });
    }

    const requestedPath = String(req.body?.filePath || '').trim();
    if (!requestedPath) {
      return res.status(400).json({ error: 'Sökväg till arkivfil saknas' });
    }

    const resolvedPath = path.resolve(requestedPath);
    const allowedRoot = path.resolve(BLANKETT31_ARCHIVE_ROOT);

    if (!resolvedPath.startsWith(allowedRoot + path.sep) && resolvedPath !== allowedRoot) {
      return res.status(403).json({ error: 'Filen ligger utanför tillåtet arkivområde' });
    }

    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ error: 'Arkivfilen kunde inte hittas' });
    }

    if (path.extname(resolvedPath).toLowerCase() !== '.pdf') {
      return res.status(400).json({ error: 'Endast PDF-filer kan öppnas härifrån' });
    }

    return res.sendFile(resolvedPath, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${sanitizeAsciiFilename(path.basename(resolvedPath))}"`,
      },
    });
  } catch (error) {
    console.error('Fel vid öppning av arkivfil:', error);
    res.status(500).json({ error: 'Kunde inte öppna arkivfilen' });
  }
});

app.post('/api/blankett31-registry/use-suggestion', authMiddleware, async (req, res) => {
  try {
    const requesterRole = String(req.user?.role || '').toUpperCase();
    if (requesterRole !== 'HTSM') {
      return res.status(403).json({ error: 'Endast HTSM kan använda tidigare underlag härifrån' });
    }

    const projectId = Number(req.body?.projectId);
    const archiveDispPath = String(req.body?.archiveDispPath || '').trim();

    if (Number.isFinite(projectId) && projectId > 0) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          sections: true,
          beteckningar: true,
        },
      });

      if (!project) {
        return res.status(404).json({ error: 'Projektet som mallen pekar på kunde inte hittas' });
      }

      const hydrated = hydrateProjectSections(project);
      return res.json({
        sourceType: 'project',
        template: {
          projectName: hydrated.name || '',
          plats: hydrated.plats || '',
          namn: hydrated.namn || '',
          telefonnummer: hydrated.telefonnummer || '',
          nodnummer: hydrated.formState?.nodnummer || '',
          bandriftnummer: hydrated.formState?.bandriftnummer || '',
          eldriftnummer: hydrated.formState?.eldriftnummer || '',
          htsmTelefon: hydrated.formState?.htsmTelefon || '',
          reservnr: hydrated.formState?.reservnr || '',
          sections: getProjectSectionTemplateData(project),
          dispSettings: hydrated.formState?.dispSettings || {},
          fjtklBlocks: Array.isArray(hydrated.formState?.fjtklBlocks) ? hydrated.formState.fjtklBlocks : [],
          customDispPhoneLines: Array.isArray(hydrated.formState?.customDispPhoneLines) ? hydrated.formState.customDispPhoneLines : [],
        },
      });
    }

    if (archiveDispPath) {
      const resolvedPath = path.resolve(archiveDispPath);
      const allowedRoot = path.resolve(BLANKETT31_ARCHIVE_ROOT);

      if (!resolvedPath.startsWith(allowedRoot + path.sep) && resolvedPath !== allowedRoot) {
        return res.status(403).json({ error: 'Arkivdispen ligger utanför tillåtet område' });
      }

      if (!fs.existsSync(resolvedPath)) {
        return res.status(404).json({ error: 'Arkivdispen kunde inte hittas' });
      }

      const parsed = await parseDispPdf(fs.readFileSync(resolvedPath), []);
      return res.json({
        sourceType: 'archive',
        template: parsed,
      });
    }

    return res.status(400).json({ error: 'Ingen giltig mall träffades att använda' });
  } catch (error) {
    console.error('Fel vid användning av tidigare Blankett 31-underlag:', error);
    res.status(500).json({ error: 'Kunde inte använda tidigare underlag som mall' });
  }
});

app.post('/api/pdf/disp/parse', authMiddleware, async (req, res) => {
  const { fileName, fileData, blankett31Entries = [] } = req.body;

  if (!fileName || !fileData) {
    return res.status(400).json({ error: 'PDF-data saknas' });
  }

  try {
    const pdfBuffer = decodeUploadedPdf(fileData, fileName);
    const parsed = await parseDispPdf(pdfBuffer, blankett31Entries);

    res.json({
      fileName: path.basename(fileName),
      parsed,
    });
  } catch (error) {
    console.error('Fel vid tolkning av Disp:', error);
    if (error?.message === 'PDF-data saknas' || error?.message === 'Ogiltigt PDF-format') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Kunde inte tolka Disp' });
  }
});

app.get('/api/projects/:id/export-excel', authMiddleware, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    if (Number.isNaN(projectId)) {
      return res.status(400).json({ error: 'Ogiltigt projekt-ID' });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        sections: true,
        beteckningar: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Projekt hittades inte' });
    }

    if (!canAccessProject(req.user?.role, project)) {
      return res.status(403).json({ error: 'Du har inte behörighet att exportera detta projekt' });
    }

    const buffer = await createPlanWorkbookBuffer(project);
    const safeName = sanitizeDownloadFileBase(project.name, 'planka');
    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    const timestamp = [
      now.getFullYear(),
      pad(now.getMonth() + 1),
      pad(now.getDate()),
    ].join('-') + '_' + [
      pad(now.getHours()),
      pad(now.getMinutes()),
      pad(now.getSeconds()),
    ].join('-');
    const debugExportPath = path.join(__dirname, 'tmp', 'latest-plan-export.xlsx');
    fs.mkdirSync(path.dirname(debugExportPath), { recursive: true });
    fs.writeFileSync(debugExportPath, Buffer.from(buffer));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=\"${safeName || 'planka'}_${timestamp}.xlsx\"`);
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Fel vid export av Excel:', error);
    res.status(500).json({ error: 'Kunde inte exportera Excel' });
  }
});

app.post('/api/projects/:id/import-excel', authMiddleware, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    if (Number.isNaN(projectId)) {
      return res.status(400).json({ error: 'Ogiltigt projekt-ID' });
    }

    const { fileData } = req.body;
    if (!fileData) {
      return res.status(400).json({ error: 'Excel-data saknas' });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        sections: true,
        beteckningar: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Projekt hittades inte' });
    }

    if (!canAccessProject(req.user?.role, project)) {
      return res.status(403).json({ error: 'Du har inte behörighet att importera detta projekt' });
    }

    const buffer = decodeUploadedBinary(fileData);
    const imported = await importPlanWorkbookBuffer(buffer, project);

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        rows: imported.rows,
      },
      include: {
        sections: true,
        beteckningar: true,
      },
    });

    res.json({
      message: `Excel importerad (${imported.importedRowCount} rad(er))`,
      importedRowCount: imported.importedRowCount,
      importedSheetNames: imported.importedSheetNames,
      project: hydrateProjectSections(updatedProject),
    });
  } catch (error) {
    console.error('Fel vid import av Excel:', error);
    if (error?.message === 'Fil-data saknas' || error?.message === 'Ogiltigt filformat') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Kunde inte importera Excel' });
  }
});

app.get('/api/projects/:id/export-disp', authMiddleware, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    if (Number.isNaN(projectId)) {
      return res.status(400).json({ error: 'Ogiltigt projekt-ID' });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        sections: true,
        beteckningar: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Projekt hittades inte' });
    }

    if (!canAccessProject(req.user?.role, project)) {
      return res.status(403).json({ error: 'Du har inte behörighet att exportera detta projekt' });
    }

    const buffer = await createDispPdfBuffer(project);
    const safeName = sanitizeDownloadFileBase(buildDispExportBaseName(project), 'dispositionsarbetsplan');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('X-Export-Filename', `${safeName || 'dispositionsarbetsplan'}.pdf`);
    res.setHeader('Content-Disposition', `attachment; filename=\"${safeName || 'dispositionsarbetsplan'}.pdf\"`);
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Fel vid export av dispositionsarbetsplan:', error);
    res.status(500).json({ error: 'Kunde inte exportera dispositionsarbetsplan' });
  }
});

app.get('/api/public/projects/:id/export-disp', async (req, res) => {
  try {
    await syncExpiredTsmVisibility();

    const projectId = parseInt(req.params.id, 10);
    if (Number.isNaN(projectId)) {
      return res.status(400).json({ error: 'Ogiltigt projekt-ID' });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        sections: true,
        beteckningar: true,
      },
    });

    if (!project || !project.visibleToTsm) {
      return res.status(404).json({ error: 'Projekt hittades inte' });
    }

    const buffer = await createDispPdfBuffer(project);
    const safeName = sanitizeDownloadFileBase(buildDispExportBaseName(project), 'dispositionsarbetsplan');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('X-Export-Filename', `${safeName || 'dispositionsarbetsplan'}.pdf`);
    res.setHeader('Content-Disposition', `attachment; filename=\"${safeName || 'dispositionsarbetsplan'}.pdf\"`);
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Fel vid publik export av dispositionsarbetsplan:', error);
    res.status(500).json({ error: 'Kunde inte exportera dispositionsarbetsplan' });
  }
});

app.post('/api/row/self-enroll', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const {
    projectId,
    anordning,
    selections,
    begard,
    tsa,
    anteckning
  } = req.body;

  try {
    if (!projectId || !selections || !Array.isArray(selections)) {
      return res.status(400).json({ error: 'projectId eller selections saknas eller ogiltiga' });
    }

    const project = await prisma.project.findUnique({
      where: { id: Number(projectId) },
      select: {
        id: true,
        startDate: true,
        startTime: true,
        endDate: true,
        endTime: true,
        formState: true,
        beteckningar: true,
        rows: true,
        sections: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Projekt hittades inte' });
    }

    const targetPlanEntry = getNextPlanEntry(project);
    const targetPlanDate = normalizeDateForInput(targetPlanEntry?.startDate || targetPlanEntry?.endDate);
    if (!targetPlanDate) {
      return res.status(400).json({ error: 'Projektet har ingen kommande planering att förplanera mot' });
    }

    if (!isPlanningWindowOpen(targetPlanEntry)) {
      return res.status(400).json({ error: 'Förplanering är stängd mindre än en timme före dispstart. Ring in i stället.' });
    }

    const validationError = validatePlanningSelectionRules(project.sections || [], selections, anordning || []);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const existingPendingRow = await prisma.row.findFirst({
      where: {
        projectId: Number(projectId),
        userId,
        OR: [
          { begardDatum: targetPlanDate },
          { datum: targetPlanDate },
        ],
      },
    });

    const existingApprovedRows = Array.isArray(project.rows) ? project.rows : [];
    const alreadyApprovedForPlan = existingApprovedRows.some((row) => {
      const sameUser = Number(row?.userId) === Number(userId);
      return sameUser && getRowPlanDate(row) === targetPlanDate;
    });

    if (existingPendingRow || alreadyApprovedForPlan) {
      return res.status(409).json({ error: 'Du har redan en förplanering för projektets nästa planering' });
    }

    const row = await prisma.row.create({
      data: {
        projectId: Number(projectId),
        userId,
        datum: targetPlanDate,
        anordning: anordning || [],
        selections,
        isPending: true,
        begard: begard || null,
        begardDatum: targetPlanDate,
        planEntryKey: targetPlanEntry?.key || null,
        tsa: Boolean(tsa),
        anteckning: anteckning || null,
      },
    });

    res.status(201).json(row);
  } catch (err) {
    console.error('❌ Fel vid TSM-anmälan:', err.message, err.stack);
    res.status(500).json({ error: 'Kunde inte skapa rad', details: err.message });
  }
});

app.put('/api/row/approve/:rowId', authMiddleware, async (req, res) => {
  const { rowId } = req.params;
  const userId = req.user.userId;

  try {
    if (String(req.user?.role || '').toUpperCase() !== 'HTSM') {
      return res.status(403).json({ error: 'Endast HTSM kan godkänna förplaneringar' });
    }

    // Hämta HTSM-användaren
    const approver = await prisma.user.findUnique({ where: { id: userId } });
    if (!approver) return res.status(404).json({ error: 'HTSM-användare hittades inte' });

    // Hämta raden som ska godkännas (inkl. projektets sections och rows via select)
    const row = await prisma.row.findUnique({
      where: { id: Number(rowId) },
      include: {
        user: true,
        section: true,
        project: {
          select: {
            id: true,
            rows: true,      // ✅ JSON-fält, korrekt via select
            sections: true,  // ✅ Relation
          },
        },
      },
    });

    if (!row) return res.status(404).json({ error: 'Rad hittades inte' });

    const project = row.project;
    const existingRows = Array.isArray(project.rows) ? project.rows : [];
    const generatedBtkn = getNextProjectBtkn(getApproverBtknPrefix(approver), existingRows);

const newRow = {
  id: Date.now(),
  userId: row.userId || null,
  sourceRowId: row.id,
  approvedById: userId,
  datum: row.datum,
  anordning: row.anordning,
  section: row.section?.name || '',
  type: row.section?.type || '',
  skapadAv: row.signature,
  telefon: row.user?.phone || '',
  namn: `${row.user?.firstName || ''} ${row.user?.lastName || ''}`.trim(),
  skapadDatum: new Date().toISOString(),
  avslutadRad: false,
  avslutadAv: '',
  avslutat: '',
  avslutatDatum: '',
  btkn: generatedBtkn,
  selections: row.selections,
  tsa: Boolean(row.tsa),
  anteckning: row.anteckning || '',
  begard: row.begard || '',
  begardDatum: row.begardDatum || null,
  planEntryKey: row.planEntryKey || null,
  createdAt: new Date().toISOString(),
};

    // Uppdatera projektets JSON-fält med ny rad
    await prisma.project.update({
      where: { id: project.id },
      data: {
        rows: [...existingRows, newRow],
      },
    });

    // Markera ursprungliga raden som godkänd
    await prisma.row.update({
      where: { id: row.id },
      data: {
        isPending: false,
        approvedById: userId,
      },
    });

    res.json({
      message: 'Rad godkänd och tillagd i projektet',
      addedRow: newRow,
      generatedBtkn,
    });
  } catch (err) {
    console.error('❌ Fel vid godkännande:', err);
    res.status(500).json({ error: 'Kunde inte godkänna raden' });
  }
});

app.put('/api/row/call-in/:rowId', authMiddleware, async (req, res) => {
  const { rowId } = req.params;

  try {
    if (String(req.user?.role || '').toUpperCase() !== 'HTSM') {
      return res.status(403).json({ error: 'Endast HTSM kan hänvisa till att ringa in' });
    }

    const row = await prisma.row.findUnique({
      where: { id: Number(rowId) },
    });

    if (!row) {
      return res.status(404).json({ error: 'Rad hittades inte' });
    }

    await prisma.row.update({
      where: { id: row.id },
      data: {
        isPending: false,
        approvedById: null,
      },
    });

    res.json({ message: 'Förplaneringen hänvisades till att ringa in' });
  } catch (err) {
    console.error('❌ Fel vid hänvisning till att ringa in:', err);
    res.status(500).json({ error: 'Kunde inte uppdatera förplaneringen' });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => console.log(`✅ Server running on port ${PORT}`));
