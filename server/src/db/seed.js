const bcrypt = require('bcryptjs');

function generateAccountNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

async function seed(db) {
  const passwordHash = await bcrypt.hash('password123', 10);

  // ── User 1: Jane Smith ──
  db.run(
    `INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)`,
    ['jane@example.com', passwordHash, 'Jane', 'Smith']
  );
  const janeId = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];

  const checkingNum = generateAccountNumber();
  const savingsNum = generateAccountNumber();

  db.run(
    `INSERT INTO accounts (user_id, name, type, account_number, balance) VALUES (?, ?, ?, ?, ?)`,
    [janeId, 'Primary Checking', 'checking', checkingNum, 523450]
  );
  const janeCheckingId = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];

  db.run(
    `INSERT INTO accounts (user_id, name, type, account_number, balance) VALUES (?, ?, ?, ?, ?)`,
    [janeId, 'Vacation Savings', 'savings', savingsNum, 1275000]
  );
  const janeSavingsId = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];

  const checkingTxns = [
    ['deposit', 250000, 250000, 'Direct Deposit - Employer', '2026-01-15 09:00:00'],
    ['withdrawal', 4500, 245500, 'Coffee Shop', '2026-01-16 08:30:00'],
    ['withdrawal', 12000, 233500, 'Grocery Store', '2026-01-18 14:20:00'],
    ['deposit', 250000, 483500, 'Direct Deposit - Employer', '2026-02-01 09:00:00'],
    ['withdrawal', 150000, 333500, 'Rent Payment', '2026-02-03 10:00:00'],
    ['withdrawal', 8500, 325000, 'Electric Bill', '2026-02-05 11:30:00'],
    ['transfer_out', 50000, 275000, 'Transfer to Vacation Savings', '2026-02-10 13:00:00'],
    ['deposit', 250000, 525000, 'Direct Deposit - Employer', '2026-02-15 09:00:00'],
    ['withdrawal', 1550, 523450, 'Streaming Service', '2026-02-20 07:00:00'],
  ];

  for (const [type, amount, balanceAfter, desc, date] of checkingTxns) {
    db.run(
      `INSERT INTO transactions (account_id, type, amount, balance_after, description, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [janeCheckingId, type, amount, balanceAfter, desc, date]
    );
  }

  const savingsTxns = [
    ['deposit', 1000000, 1000000, 'Initial Deposit', '2025-12-01 10:00:00'],
    ['deposit', 100000, 1100000, 'Monthly Savings', '2026-01-01 10:00:00'],
    ['deposit', 100000, 1200000, 'Monthly Savings', '2026-01-15 10:00:00'],
    ['withdrawal', 25000, 1175000, 'Emergency Fund Withdrawal', '2026-01-28 16:00:00'],
    ['transfer_in', 50000, 1225000, 'Transfer from Primary Checking', '2026-02-10 13:00:00'],
    ['deposit', 50000, 1275000, 'Birthday Gift', '2026-02-14 12:00:00'],
  ];

  for (const [type, amount, balanceAfter, desc, date] of savingsTxns) {
    db.run(
      `INSERT INTO transactions (account_id, type, amount, balance_after, description, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [janeSavingsId, type, amount, balanceAfter, desc, date]
    );
  }

  // ── User 2: Bob Johnson (for BeLev P2P demo) ──
  db.run(
    `INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)`,
    ['bob@example.com', passwordHash, 'Bob', 'Johnson']
  );
  const bobId = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];

  db.run(
    `INSERT INTO accounts (user_id, name, type, account_number, balance) VALUES (?, ?, ?, ?, ?)`,
    [bobId, 'Main Checking', 'checking', generateAccountNumber(), 350000]
  );
  const bobCheckingId = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];

  const bobTxns = [
    ['deposit', 300000, 300000, 'Direct Deposit - Freelance', '2026-01-20 09:00:00'],
    ['withdrawal', 5000, 295000, 'Lunch', '2026-01-22 12:30:00'],
    ['deposit', 100000, 395000, 'Side Project Payment', '2026-02-05 10:00:00'],
    ['withdrawal', 45000, 350000, 'Internet Bill', '2026-02-12 08:00:00'],
  ];

  for (const [type, amount, balanceAfter, desc, date] of bobTxns) {
    db.run(
      `INSERT INTO transactions (account_id, type, amount, balance_after, description, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [bobCheckingId, type, amount, balanceAfter, desc, date]
    );
  }

  // ── BeLev P2P Seed Data ──

  // Completed: Jane sent $25 to Bob for lunch
  db.run(
    `INSERT INTO belev_transfers (sender_id, recipient_id, sender_account_id, recipient_account_id, amount, memo, type, status, created_at, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, 'send', 'completed', '2026-02-18 12:00:00', '2026-02-18 12:00:00')`,
    [janeId, bobId, janeCheckingId, bobCheckingId, 2500, 'Lunch split', ]
  );

  // Completed: Bob sent $40 to Jane for concert tickets
  db.run(
    `INSERT INTO belev_transfers (sender_id, recipient_id, sender_account_id, recipient_account_id, amount, memo, type, status, created_at, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, 'send', 'completed', '2026-02-22 18:30:00', '2026-02-22 18:30:00')`,
    [bobId, janeId, bobCheckingId, janeCheckingId, 4000, 'Concert tickets']
  );

  // Pending: Bob requested $30 from Jane for dinner
  db.run(
    `INSERT INTO belev_transfers (sender_id, recipient_id, amount, memo, type, status, created_at)
     VALUES (?, ?, ?, ?, 'request', 'pending', '2026-02-26 20:00:00')`,
    [bobId, janeId, 3000, 'Dinner last Friday']
  );
}

module.exports = { seed };
