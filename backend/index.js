// backend/index.js
const express = require('express');
const bcrypt = require('bcrypt');
const authMiddleware = require('./middleware/auth');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { PrismaClient } = require('./generated/prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in your .env file');
}
// Register user
app.post('/api/register', async (req, res) => {
  const { email, password, firstName, lastName, phone, company } = req.body;


  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Lösenord saknas' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const signature = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        company,
        signature,
        role: 'TSM'
      },
    });

    res.status(201).json({
      message: 'User created',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
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

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

res.json({
  message: 'Login successful',
  token,
  role: user.role,
  firstName: user.firstName,
  lastName: user.lastName,
  signature: user.signature,
  email: user.email,
  phone: user.phone,
  company: user.company,
});
  } catch (error) {
    console.error('Fel vid inloggning:', error);
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
        user: { connect: { id: userId } },

        // 🔥 Koppla in direkt
        beteckningar: {
          create: filteredBeteckningar,
        },

        sections: {
          create: sections.map((sec) => ({
            name: sec.signal || '',
            type: sec.type,
          })),
        },
      },
      include: {
        beteckningar: true,
        sections: true,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('❌ Create project error:', error);
    res.status(500).json({ error: 'Kunde inte skapa projekt' });
  }
});

app.get('/api/projects', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Ingen token angiven' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('🔓 Token verifierad:', decoded);

const projects = await prisma.project.findMany({
  include: {
    sections: true,
    beteckningar: true,
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

    console.log('✅ Alla projekt:', projects.map(p => ({ id: p.id, userId: p.userId })));

    res.json(projects);
  } catch (err) {
    console.error('❌ Fel vid hämtning av projekt:', err);
    res.status(500).json({ error: 'Kunde inte hämta projekt' });
  }
});

app.get('/api/project/:id', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Ingen token angiven' });
  }

  try {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET);

    const projectId = parseInt(req.params.id, 10);
    if (isNaN(projectId)) {
      return res.status(400).json({ error: 'Ogiltigt projekt-ID' });
    }
const project = await prisma.project.findUnique({
  where: { id: projectId },
  select: {
    id: true,
    name: true,
    startDate: true,
    startTime: true,
    endDate: true,
    endTime: true,
    plats: true,
    namn: true,
    telefonnummer: true,
    rows: true,
    sections: true,
    beteckningar: true,
    anteckningar: true,

    // 🟢 Lägg till TSM-rader med relationsdata
    tsmRows: {
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

    res.json(project);
  } catch (error) {
    console.error('Fel vid hämtning av projekt:', error.message, error.stack);
    res.status(500).json({ error: 'Kunde inte hämta projekt' });
  }
});

app.delete('/api/project/:id', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Ingen token angiven' });
  }

  try {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET); // Verifiering av token

    const projectId = parseInt(req.params.id, 10);

    await prisma.section.deleteMany({ where: { projectId } });
    await prisma.project.delete({ where: { id: projectId } });

    res.json({ message: 'Projekt raderat' });
  } catch (error) {
    console.error('Fel vid borttagning:', error);
    res.status(500).json({ error: 'Kunde inte ta bort projekt' });
  }
});

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
      rows,
      sections = [],
      beteckningar = [],
      anteckningar = [],
    } = req.body;

    const projectId = parseInt(id);
    const filteredBeteckningar = Array.isArray(beteckningar)
      ? beteckningar.filter((b) => typeof b.label === 'string' && b.label.trim() !== '')
      : [];

console.log('📦 Vi skickar anteckningar till Prisma:', anteckningar);

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
        rows,
        anteckningar,
      },
    });

    console.log('🧾 Efter update – project:', updatedProject);

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
            name: s.name,
            type: s.type,
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
    console.log('📌 Anteckningar mottaget från frontend:', anteckningar);

    res.json(result);
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

app.post('/api/row/self-enroll', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const { projectId, sectionId, datum, anordning } = req.body;

  try {
    if (!projectId || !sectionId) {
      return res.status(400).json({ error: 'projectId eller sectionId saknas' });
    }

    const alreadyEnrolled = await prisma.row.findFirst({
      where: {
        userId,
        projectId: Number(projectId),
        sectionId: Number(sectionId),
      },
    });

    if (alreadyEnrolled) {
      return res.status(400).json({ error: 'Du är redan anmäld till detta delområde' });
    }

    const row = await prisma.row.create({
      data: {
        projectId: Number(projectId),
        sectionId: Number(sectionId),
        userId,
        datum: datum || null,
        anordning: anordning || null,
        isPending: true,
      },
    });

    res.status(201).json(row);
} catch (err) {
  console.error('❌ Fel vid TSM-anmälan:', err.message, err.stack); // Lägg till både message och stack
  res.status(500).json({ error: 'Kunde inte skapa rad', details: err.message });
}
});

app.put('/api/row/approve/:rowId', authMiddleware, async (req, res) => {
  const { rowId } = req.params;
  const userId = req.user.userId;

  try {
    // Hämta HTSM-användaren
    const approver = await prisma.user.findUnique({ where: { id: userId } });
    if (!approver) return res.status(404).json({ error: 'HTSM-användare hittades inte' });

// Hämta raden som ska godkännas (inkl. project.sections + project.rows)
const row = await prisma.row.findUnique({
  where: { id: Number(rowId) },
  include: {
    user: true,
    section: true,
    project: {
      include: {
        sections: true,
        rows: true,
      },
    },
  },
});
    if (!row) return res.status(404).json({ error: 'Rad hittades inte' });

    // Läs in befintliga rader i projektet
    const project = row.project;
    const existingRows = Array.isArray(project.rows) ? project.rows : [];

    // Skapa ny radstruktur i JSON
    const newRow = {
      id: Date.now(), // unik ID för frontend
      datum: row.datum,
      anordning: row.anordning,
      section: row.section.name,
      type: row.section.type,
      skapadAv: row.signature,
      skapadDatum: new Date().toISOString(),
      avslutadRad: false,
      avslutadAv: '',
      avslutat: '',
      avslutatDatum: '',
      selections: Array(project.sections.length).fill(false),
    };

    // Uppdatera projektets rows-array
    await prisma.project.update({
      where: { id: project.id },
      data: {
        rows: [...existingRows, newRow],
      },
    });

    // Markera som godkänd
    await prisma.row.update({
      where: { id: row.id },
      data: {
        isPending: false,
        approvedById: userId,
      },
    });

    res.json({ message: 'Rad godkänd och tillagd i projektet', addedRow: newRow });
  } catch (err) {
    console.error('❌ Fel vid godkännande:', err);
    res.status(500).json({ error: 'Kunde inte godkänna raden' });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => console.log(`✅ Server running on port ${PORT}`));