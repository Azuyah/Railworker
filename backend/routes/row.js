const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma/client');
const authMiddleware = require('../middleware/auth');
const prisma = new PrismaClient();

/**
 * POST /api/row/self-enroll
 * TSM skapar en rad i ett projekt
 */
router.post('/self-enroll', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const { projectId, sectionId, anordning, datum } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Användare hittades inte' });

    const section = await prisma.section.findUnique({ where: { id: sectionId } });
    if (!section) return res.status(404).json({ error: 'Delområde hittades inte' });

    const newRow = await prisma.row.create({
      data: {
        projectId,
        sectionId,
        userId,
        datum,
        anordning,
        isPending: true // Indikerar att HTSM ska godkänna denna
      },
      include: {
        section: true,
        user: true
      }
    });

    res.status(201).json({ message: 'Rad skapad för godkännande', row: newRow });
  } catch (error) {
    console.error('❌ Fel vid self-enroll:', error);
    res.status(500).json({ error: 'Kunde inte skapa rad' });
  }
});

/**
 * PUT /api/row/approve/:rowId
 * HTSM godkänner en TSM-rad och lägger in den i projektets "rows"
 */
router.put('/approve/:rowId', authMiddleware, async (req, res) => {
  const { rowId } = req.params;
  const userId = req.user.userId;

  try {
    // Hämta HTSM-användaren
    const approver = await prisma.user.findUnique({ where: { id: userId } });
    if (!approver) return res.status(404).json({ error: 'HTSM-användare hittades inte' });

    // Hämta raden som ska godkännas
    const row = await prisma.row.findUnique({
      where: { id: Number(rowId) },
      include: { user: true, section: true, project: true },
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

module.exports = router;