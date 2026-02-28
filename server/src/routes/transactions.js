const express = require('express');
const { authMiddleware } = require('../middleware/auth');

function createTransactionsRouter(db, saveDb) {
  const router = express.Router();
  router.use(authMiddleware);

  function rowsToObjects(result) {
    if (!result.length) return [];
    const cols = result[0].columns;
    return result[0].values.map(row => {
      const obj = {};
      cols.forEach((col, i) => { obj[col] = row[i]; });
      return obj;
    });
  }

  function getAccount(accountId, userId) {
    const result = db.exec('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [accountId, userId]);
    const accounts = rowsToObjects(result);
    return accounts[0] || null;
  }

  router.get('/:accountId/transactions', (req, res) => {
    const account = getAccount(req.params.accountId, req.userId);
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;

    const countResult = db.exec('SELECT COUNT(*) FROM transactions WHERE account_id = ?', [account.id]);
    const total = countResult[0].values[0][0];

    const result = db.exec(
      'SELECT * FROM transactions WHERE account_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [account.id, limit, offset]
    );
    const transactions = rowsToObjects(result);

    res.json({ transactions, total, page, limit });
  });

  router.post('/:accountId/deposit', (req, res) => {
    const account = getAccount(req.params.accountId, req.userId);
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const amountInCents = Math.round(parseFloat(req.body.amount) * 100);
    if (!amountInCents || amountInCents <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    const newBalance = account.balance + amountInCents;
    db.run('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, account.id]);
    db.run(
      'INSERT INTO transactions (account_id, type, amount, balance_after, description) VALUES (?, ?, ?, ?, ?)',
      [account.id, 'deposit', amountInCents, newBalance, req.body.description || 'Deposit']
    );
    saveDb();

    const txnResult = db.exec('SELECT * FROM transactions WHERE id = last_insert_rowid()');
    const transaction = rowsToObjects(txnResult)[0];
    res.json({ transaction, account: { ...account, balance: newBalance } });
  });

  router.post('/:accountId/withdraw', (req, res) => {
    const account = getAccount(req.params.accountId, req.userId);
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const amountInCents = Math.round(parseFloat(req.body.amount) * 100);
    if (!amountInCents || amountInCents <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }
    if (account.balance < amountInCents) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    const newBalance = account.balance - amountInCents;
    db.run('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, account.id]);
    db.run(
      'INSERT INTO transactions (account_id, type, amount, balance_after, description) VALUES (?, ?, ?, ?, ?)',
      [account.id, 'withdrawal', amountInCents, newBalance, req.body.description || 'Withdrawal']
    );
    saveDb();

    const txnResult = db.exec('SELECT * FROM transactions WHERE id = last_insert_rowid()');
    const transaction = rowsToObjects(txnResult)[0];
    res.json({ transaction, account: { ...account, balance: newBalance } });
  });

  router.post('/transfer', (req, res) => {
    const { fromAccountId, toAccountId, amount, description } = req.body;

    const amountInCents = Math.round(parseFloat(amount) * 100);
    if (!amountInCents || amountInCents <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    const fromAccount = getAccount(fromAccountId, req.userId);
    const toAccount = getAccount(toAccountId, req.userId);

    if (!fromAccount || !toAccount) {
      return res.status(404).json({ error: 'Account not found' });
    }
    if (fromAccount.id === toAccount.id) {
      return res.status(400).json({ error: 'Cannot transfer to the same account' });
    }
    if (fromAccount.balance < amountInCents) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    const newFromBalance = fromAccount.balance - amountInCents;
    const newToBalance = toAccount.balance + amountInCents;

    db.run('UPDATE accounts SET balance = ? WHERE id = ?', [newFromBalance, fromAccount.id]);
    db.run('UPDATE accounts SET balance = ? WHERE id = ?', [newToBalance, toAccount.id]);

    db.run(
      'INSERT INTO transactions (account_id, type, amount, balance_after, description) VALUES (?, ?, ?, ?, ?)',
      [fromAccount.id, 'transfer_out', amountInCents, newFromBalance, description || `Transfer to ${toAccount.name}`]
    );
    const debitId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];

    db.run(
      'INSERT INTO transactions (account_id, type, amount, balance_after, description, related_transaction_id) VALUES (?, ?, ?, ?, ?, ?)',
      [toAccount.id, 'transfer_in', amountInCents, newToBalance, description || `Transfer from ${fromAccount.name}`, debitId]
    );
    const creditId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];

    db.run('UPDATE transactions SET related_transaction_id = ? WHERE id = ?', [creditId, debitId]);
    saveDb();

    res.json({
      fromAccount: { ...fromAccount, balance: newFromBalance },
      toAccount: { ...toAccount, balance: newToBalance },
    });
  });

  return router;
}

module.exports = { createTransactionsRouter };
