// middleware/auth.js
require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Ingen token skickades' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token saknas' });

  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'JWT_SECRET saknas på servern' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Lägg till user info i request
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Ogiltig token' });
  }
};
