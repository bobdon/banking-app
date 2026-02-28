const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../middleware/auth');

function createAuthRouter(db, saveDb) {
  const router = express.Router();

  function generateAccountNumber() {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }

  function makeToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  }

  function getUser(id) {
    const rows = db.exec('SELECT id, email, first_name, last_name FROM users WHERE id = ?', [id]);
    if (!rows.length || !rows[0].values.length) return null;
    const [uid, email, firstName, lastName] = rows[0].values[0];
    return { id: uid, email, firstName, lastName };
  }

  router.post('/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const existing = db.exec('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length && existing[0].values.length) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      db.run('INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)', [email, passwordHash, firstName, lastName]);
      const userId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];

      db.run('INSERT INTO accounts (user_id, name, type, account_number, balance) VALUES (?, ?, ?, ?, ?)', [userId, 'Primary Checking', 'checking', generateAccountNumber(), 0]);
      saveDb();

      const token = makeToken(userId);
      const user = getUser(userId);
      res.status(201).json({ token, user });
    } catch (err) {
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const rows = db.exec('SELECT id, password_hash FROM users WHERE email = ?', [email]);
      if (!rows.length || !rows[0].values.length) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const [userId, passwordHash] = rows[0].values[0];
      const valid = await bcrypt.compare(password, passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = makeToken(userId);
      const user = getUser(userId);
      res.json({ token, user });
    } catch (err) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  router.get('/me', authMiddleware, (req, res) => {
    const user = getUser(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  });

  return router;
}

module.exports = { createAuthRouter };
