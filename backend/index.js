// backend/index.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { PrismaClient } = require('./generated/prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

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

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  });
res.json({ token, role: user.role });
});

// Create project (auth required)
app.post('/api/projects', async (req, res) => {
  const { name, description } = req.body;

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

const project = await prisma.project.create({
  data: {
    name,
    description,
    user: { connect: { id: userId } },
  },
});

    res.status(201).json(project);
  } catch (error) {
    console.error('❌ Create project error:', error);
    res.status(500).json({ error: 'Could not create project' });
  }
});

// Hämta ett specifikt projekt med ID (HTSM och TSM ser alla)
app.get('/api/projects/:id', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Ingen token angiven' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const project = await prisma.project.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: {
        sections: true,
        beteckningar: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Projekt hittades inte' });
    }

    res.json(project);
  } catch (error) {
    console.error('❌ Fel vid hämtning av projekt:', error);
    res.status(500).json({ error: 'Kunde inte hämta projekt' });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));