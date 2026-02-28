const express = require('express');
const { authMiddleware } = require('../middleware/auth');

function createBeLevRouter(db, saveDb) {
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

  // ── POST /api/belev/send ──
  router.post('/send', (req, res) => {
    try {
      const { recipientEmail, fromAccountId, amount, memo } = req.body;

      if (!recipientEmail || !fromAccountId || !amount) {
        return res.status(400).json({ error: 'recipientEmail, fromAccountId, and amount are required' });
      }

      const amountInCents = Math.round(parseFloat(amount) * 100);
      if (!amountInCents || amountInCents <= 0) {
        return res.status(400).json({ error: 'Amount must be positive' });
      }

      // Look up recipient
      const recipientResult = db.exec('SELECT * FROM users WHERE email = ?', [recipientEmail]);
      const recipients = rowsToObjects(recipientResult);
      if (!recipients.length) {
        return res.status(404).json({ error: 'No user found with that email address' });
      }
      const recipient = recipients[0];

      if (recipient.id === req.userId) {
        return res.status(400).json({ error: 'Cannot send money to yourself' });
      }

      // Verify sender account
      const senderAccResult = db.exec('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [fromAccountId, req.userId]);
      const senderAccounts = rowsToObjects(senderAccResult);
      if (!senderAccounts.length) {
        return res.status(404).json({ error: 'Sender account not found' });
      }
      const senderAccount = senderAccounts[0];

      if (senderAccount.balance < amountInCents) {
        return res.status(400).json({ error: 'Insufficient funds' });
      }

      // Auto-select recipient's first checking account
      const recipAccResult = db.exec(
        "SELECT * FROM accounts WHERE user_id = ? AND type = 'checking' ORDER BY created_at ASC LIMIT 1",
        [recipient.id]
      );
      let recipientAccounts = rowsToObjects(recipAccResult);
      if (!recipientAccounts.length) {
        // Fall back to any account
        const anyAccResult = db.exec('SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at ASC LIMIT 1', [recipient.id]);
        recipientAccounts = rowsToObjects(anyAccResult);
      }
      if (!recipientAccounts.length) {
        return res.status(400).json({ error: 'Recipient has no accounts' });
      }
      const recipientAccount = recipientAccounts[0];

      // Get sender name for descriptions
      const senderResult = db.exec('SELECT * FROM users WHERE id = ?', [req.userId]);
      const sender = rowsToObjects(senderResult)[0];

      // Execute transfer
      const newSenderBalance = senderAccount.balance - amountInCents;
      const newRecipientBalance = recipientAccount.balance + amountInCents;

      db.run('UPDATE accounts SET balance = ? WHERE id = ?', [newSenderBalance, senderAccount.id]);
      db.run('UPDATE accounts SET balance = ? WHERE id = ?', [newRecipientBalance, recipientAccount.id]);

      const descOut = memo || `BeLev to ${recipient.first_name} ${recipient.last_name}`;
      const descIn = memo || `BeLev from ${sender.first_name} ${sender.last_name}`;

      db.run(
        'INSERT INTO transactions (account_id, type, amount, balance_after, description) VALUES (?, ?, ?, ?, ?)',
        [senderAccount.id, 'transfer_out', amountInCents, newSenderBalance, descOut]
      );
      const debitId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];

      db.run(
        'INSERT INTO transactions (account_id, type, amount, balance_after, description, related_transaction_id) VALUES (?, ?, ?, ?, ?, ?)',
        [recipientAccount.id, 'transfer_in', amountInCents, newRecipientBalance, descIn, debitId]
      );
      const creditId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];

      db.run('UPDATE transactions SET related_transaction_id = ? WHERE id = ?', [creditId, debitId]);

      // Record BeLev transfer
      db.run(
        `INSERT INTO belev_transfers (sender_id, recipient_id, sender_account_id, recipient_account_id, amount, memo, type, status, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, 'send', 'completed', datetime('now'))`,
        [req.userId, recipient.id, senderAccount.id, recipientAccount.id, amountInCents, memo || null]
      );

      saveDb();

      res.json({
        success: true,
        message: `Sent ${(amountInCents / 100).toFixed(2)} to ${recipient.first_name} ${recipient.last_name}`,
        transfer: {
          amount: amountInCents,
          recipientName: `${recipient.first_name} ${recipient.last_name}`,
          recipientEmail: recipient.email,
        },
      });
    } catch (err) {
      console.error('BeLev send error:', err);
      res.status(500).json({ error: 'Failed to send payment' });
    }
  });

  // ── POST /api/belev/request ──
  router.post('/request', (req, res) => {
    try {
      const { recipientEmail, amount, memo } = req.body;

      if (!recipientEmail || !amount) {
        return res.status(400).json({ error: 'recipientEmail and amount are required' });
      }

      const amountInCents = Math.round(parseFloat(amount) * 100);
      if (!amountInCents || amountInCents <= 0) {
        return res.status(400).json({ error: 'Amount must be positive' });
      }

      // Look up the person we're requesting from
      const recipientResult = db.exec('SELECT * FROM users WHERE email = ?', [recipientEmail]);
      const recipients = rowsToObjects(recipientResult);
      if (!recipients.length) {
        return res.status(404).json({ error: 'No user found with that email address' });
      }
      const recipient = recipients[0];

      if (recipient.id === req.userId) {
        return res.status(400).json({ error: 'Cannot request money from yourself' });
      }

      // Create pending request
      // sender_id = person requesting (who will receive the money)
      // recipient_id = person being asked to pay
      db.run(
        `INSERT INTO belev_transfers (sender_id, recipient_id, amount, memo, type, status)
         VALUES (?, ?, ?, ?, 'request', 'pending')`,
        [req.userId, recipient.id, amountInCents, memo || null]
      );

      saveDb();

      res.status(201).json({
        success: true,
        message: `Requested $${(amountInCents / 100).toFixed(2)} from ${recipient.first_name} ${recipient.last_name}`,
      });
    } catch (err) {
      console.error('BeLev request error:', err);
      res.status(500).json({ error: 'Failed to create request' });
    }
  });

  // ── GET /api/belev/activity ──
  router.get('/activity', (req, res) => {
    try {
      const result = db.exec(
        `SELECT
           bt.*,
           su.first_name as sender_first_name,
           su.last_name  as sender_last_name,
           su.email       as sender_email,
           ru.first_name as recipient_first_name,
           ru.last_name  as recipient_last_name,
           ru.email       as recipient_email
         FROM belev_transfers bt
         JOIN users su ON bt.sender_id = su.id
         JOIN users ru ON bt.recipient_id = ru.id
         WHERE bt.sender_id = ? OR bt.recipient_id = ?
         ORDER BY bt.created_at DESC`,
        [req.userId, req.userId]
      );
      const transfers = rowsToObjects(result);

      // Tag each transfer with the current user's perspective
      const activity = transfers.map(t => ({
        ...t,
        direction: t.sender_id === req.userId ? 'outgoing' : 'incoming',
      }));

      res.json({ activity });
    } catch (err) {
      console.error('BeLev activity error:', err);
      res.status(500).json({ error: 'Failed to load activity' });
    }
  });

  // ── POST /api/belev/:id/accept ──
  router.post('/:id/accept', (req, res) => {
    try {
      const { fromAccountId } = req.body;
      const transferId = parseInt(req.params.id);

      if (!fromAccountId) {
        return res.status(400).json({ error: 'fromAccountId is required' });
      }

      // Get the request
      const transferResult = db.exec('SELECT * FROM belev_transfers WHERE id = ?', [transferId]);
      const transfers = rowsToObjects(transferResult);
      if (!transfers.length) {
        return res.status(404).json({ error: 'Request not found' });
      }
      const transfer = transfers[0];

      if (transfer.status !== 'pending') {
        return res.status(400).json({ error: 'This request is no longer pending' });
      }
      if (transfer.type !== 'request') {
        return res.status(400).json({ error: 'Can only accept payment requests' });
      }
      // Current user is the recipient_id (the one being asked to pay)
      if (transfer.recipient_id !== req.userId) {
        return res.status(403).json({ error: 'You cannot accept this request' });
      }

      // Verify payer's account
      const payerAccResult = db.exec('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [fromAccountId, req.userId]);
      const payerAccounts = rowsToObjects(payerAccResult);
      if (!payerAccounts.length) {
        return res.status(404).json({ error: 'Account not found' });
      }
      const payerAccount = payerAccounts[0];

      if (payerAccount.balance < transfer.amount) {
        return res.status(400).json({ error: 'Insufficient funds' });
      }

      // Auto-select requester's first checking account
      const requesterAccResult = db.exec(
        "SELECT * FROM accounts WHERE user_id = ? AND type = 'checking' ORDER BY created_at ASC LIMIT 1",
        [transfer.sender_id]
      );
      let requesterAccounts = rowsToObjects(requesterAccResult);
      if (!requesterAccounts.length) {
        const anyAccResult = db.exec('SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at ASC LIMIT 1', [transfer.sender_id]);
        requesterAccounts = rowsToObjects(anyAccResult);
      }
      if (!requesterAccounts.length) {
        return res.status(400).json({ error: 'Requester has no accounts' });
      }
      const requesterAccount = requesterAccounts[0];

      // Get user names
      const payerResult = db.exec('SELECT * FROM users WHERE id = ?', [req.userId]);
      const payer = rowsToObjects(payerResult)[0];
      const requesterResult = db.exec('SELECT * FROM users WHERE id = ?', [transfer.sender_id]);
      const requester = rowsToObjects(requesterResult)[0];

      // Execute transfer
      const newPayerBalance = payerAccount.balance - transfer.amount;
      const newRequesterBalance = requesterAccount.balance + transfer.amount;

      db.run('UPDATE accounts SET balance = ? WHERE id = ?', [newPayerBalance, payerAccount.id]);
      db.run('UPDATE accounts SET balance = ? WHERE id = ?', [newRequesterBalance, requesterAccount.id]);

      const descOut = transfer.memo || `BeLev to ${requester.first_name} ${requester.last_name}`;
      const descIn = transfer.memo || `BeLev from ${payer.first_name} ${payer.last_name}`;

      db.run(
        'INSERT INTO transactions (account_id, type, amount, balance_after, description) VALUES (?, ?, ?, ?, ?)',
        [payerAccount.id, 'transfer_out', transfer.amount, newPayerBalance, descOut]
      );
      const debitId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];

      db.run(
        'INSERT INTO transactions (account_id, type, amount, balance_after, description, related_transaction_id) VALUES (?, ?, ?, ?, ?, ?)',
        [requesterAccount.id, 'transfer_in', transfer.amount, newRequesterBalance, descIn, debitId]
      );
      const creditId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];

      db.run('UPDATE transactions SET related_transaction_id = ? WHERE id = ?', [creditId, debitId]);

      // Update belev_transfer
      db.run(
        `UPDATE belev_transfers SET status = 'completed', sender_account_id = ?, recipient_account_id = ?, completed_at = datetime('now') WHERE id = ?`,
        [requesterAccount.id, payerAccount.id, transferId]
      );

      saveDb();

      res.json({
        success: true,
        message: `Paid $${(transfer.amount / 100).toFixed(2)} to ${requester.first_name} ${requester.last_name}`,
      });
    } catch (err) {
      console.error('BeLev accept error:', err);
      res.status(500).json({ error: 'Failed to accept request' });
    }
  });

  // ── POST /api/belev/:id/decline ──
  router.post('/:id/decline', (req, res) => {
    try {
      const transferId = parseInt(req.params.id);

      const transferResult = db.exec('SELECT * FROM belev_transfers WHERE id = ?', [transferId]);
      const transfers = rowsToObjects(transferResult);
      if (!transfers.length) {
        return res.status(404).json({ error: 'Request not found' });
      }
      const transfer = transfers[0];

      if (transfer.status !== 'pending') {
        return res.status(400).json({ error: 'This request is no longer pending' });
      }
      // Only the person being asked to pay can decline
      if (transfer.recipient_id !== req.userId) {
        return res.status(403).json({ error: 'You cannot decline this request' });
      }

      db.run(`UPDATE belev_transfers SET status = 'declined', completed_at = datetime('now') WHERE id = ?`, [transferId]);
      saveDb();

      res.json({ success: true, message: 'Request declined' });
    } catch (err) {
      console.error('BeLev decline error:', err);
      res.status(500).json({ error: 'Failed to decline request' });
    }
  });

  return router;
}

module.exports = { createBeLevRouter };
