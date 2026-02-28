const express = require('express');
const { authMiddleware } = require('../middleware/auth');

function createAccountsRouter(db, saveDb) {
  const router = express.Router();
  router.use(authMiddleware);

  function generateAccountNumber() {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }

  function rowsToObjects(result, columns) {
    if (!result.length) return [];
    const cols = result[0].columns;
    return result[0].values.map(row => {
      const obj = {};
      cols.forEach((col, i) => { obj[col] = row[i]; });
      return obj;
    });
  }

  router.get('/', (req, res) => {
    const result = db.exec('SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at', [req.userId]);
    const accounts = rowsToObjects(result);
    res.json({ accounts });
  });

  router.post('/', (req, res) => {
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }
    if (!['checking', 'savings'].includes(type)) {
      return res.status(400).json({ error: 'Type must be checking or savings' });
    }

    db.run('INSERT INTO accounts (user_id, name, type, account_number, balance) VALUES (?, ?, ?, ?, ?)', [req.userId, name, type, generateAccountNumber(), 0]);
    saveDb();

    const result = db.exec('SELECT * FROM accounts WHERE id = last_insert_rowid()');
    const account = rowsToObjects(result)[0];
    res.status(201).json({ account });
  });

  router.get('/:id', (req, res) => {
    const result = db.exec('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    const accounts = rowsToObjects(result);
    if (!accounts.length) return res.status(404).json({ error: 'Account not found' });
    res.json({ account: accounts[0] });
  });

  return router;
}

module.exports = { createAccountsRouter };
