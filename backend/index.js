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
origin: ['http://localhost:3000', 'https://railworker.vercel.app', 'https://railworker-production.up.railway.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
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
  const { email, password, name, phone, company } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      phone,
      company,
      role: 'TSM'
    },
  });

  res.status(201).json({ message: 'User created', user: { id: user.id, email: user.email, role: user.role } });
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
        name: true,
        phone: true,
        company: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Användare hittades inte' });
    }

    res.json(user);
  } catch (error) {
    console.error('❌ Fel vid hämtning av användare:', error);
    res.status(500).json({ error: 'Kunde inte hämta användare' });
  }
});
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Skicka endast token och användardata – ingen cookie
    res.json({
      message: 'Login successful',
      token,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      company: user.company,
    });
  } catch (error) {
    console.error('❌ Fel vid inloggning:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/projects', authMiddleware, async (req, res) => {
  console.log('POST /api/projects');
  console.log('Inkommande req.body:', req.body);

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
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      plats,
      namn,
      telefonnummer,
      sections = [],
    } = req.body;

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
      },
    });

    for (const sec of sections) {
      await prisma.section.create({
        data: {
          name: sec.signal || '',
          type: sec.type,
          projectId: project.id,
        },
      });
    }

    res.status(201).json(project);
  } catch (error) {
    console.error('❌ Create project error:', error);
    res.status(500).json({ error: 'Could not create project' });
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
    const userId = decoded.userId;

    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        sections: true,
      },
    });

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
    jwt.verify(token, JWT_SECRET); // Du behöver inte userId här, men verifierar token

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
    rows: true, // 👈 DETTA ÄR DET SOM SAKNAS
    sections: true,
  },
});

    if (!project) {
      return res.status(404).json({ error: 'Projekt hittades inte' });
    }

    res.json(project);
  } catch (error) {
    console.error('❌ Fel vid hämtning av projekt:', error.message, error.stack);
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
    console.error('❌ Fel vid borttagning:', error);
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
    jwt.verify(token, JWT_SECRET); // Token verifieras, men userId behövs ej här

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
    } = req.body;

    const updatedProject = await prisma.project.update({
      where: { id: parseInt(id) },
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
      },
    });

    await prisma.section.deleteMany({
      where: { projectId: parseInt(id) },
    });

    await prisma.section.createMany({
      data: sections.map((section) => ({
        name: section.name,
        type: section.type,
        projectId: updatedProject.id,
      })),
    });

    res.json(updatedProject);
  } catch (error) {
    console.error('❌ Detaljerat fel vid uppdatering av projektet:', error.message, error.stack, error);
    res.status(500).json({ error: 'Något gick fel vid uppdatering av projektet' });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));