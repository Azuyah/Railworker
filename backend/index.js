// backend/index.js
const express = require('express');
const bcrypt = require('bcrypt');
const authMiddleware = require('./middleware/auth');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { PrismaClient } = require('./generated/prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: ['http://localhost:3000', 'https://railworker.vercel.app'],
  credentials: true,
};

app.use(cors(corsOptions));

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('❌ JWT_SECRET is not defined in your .env file');
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
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Ingen token i cookie' });
  }

  try {
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
        role: true
      }
    });

    if (!user) return res.status(404).json({ error: 'Användare hittades inte' });

    res.json(user);
  } catch (error) {
    console.error('❌ Fel vid hämtning av användare:', error);
    res.status(500).json({ error: 'Kunde inte hämta användare' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  });
res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'None',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dagar
});

res.json({
  message: 'Login successful',
  role: user.role,
  name: user.name,
  email: user.email,
  phone: user.phone,
  company: user.company
});
});

app.post('/api/projects', authMiddleware, async (req, res) => {
  console.log('POST /api/projects');
  console.log('Inkommande req.body:', req.body);

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

  try {
    const userId = req.user.userId; // Hämtas från middleware

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

    // Skapa sektioner
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

app.get('/api/projects', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

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

app.get('/api/project/:id', authMiddleware, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    if (isNaN(projectId)) {
      return res.status(400).json({ error: 'Ogiltigt projekt-ID' });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
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

app.delete('/api/project/:id', authMiddleware, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);

    // Radera sektioner & beteckningar först om du inte har ON DELETE CASCADE
    await prisma.section.deleteMany({ where: { projectId } });

    await prisma.project.delete({ where: { id: projectId } });

    res.json({ message: 'Projekt raderat' });
  } catch (error) {
    console.error('❌ Fel vid borttagning:', error);
    res.status(500).json({ error: 'Kunde inte ta bort projekt' });
  }
});

app.put('/api/projects/:id', authMiddleware, async (req, res) => {
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

  try {
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

    // Ta bort gamla sektioner
    await prisma.section.deleteMany({
      where: { projectId: parseInt(id) },
    });

    // Lägg till nya sektioner
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