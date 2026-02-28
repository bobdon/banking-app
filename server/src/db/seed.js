const bcrypt = require('bcryptjs');

function generateAccountNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

async function seed(db) {
  const passwordHash = await bcrypt.hash('password123', 10);

  db.run(
    `INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)`,
    ['jane@example.com', passwordHash, 'Jane', 'Smith']
  );

  const userId = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];

  const checkingNum = generateAccountNumber();
  const savingsNum = generateAccountNumber();

  db.run(
    `INSERT INTO accounts (user_id, name, type, account_number, balance) VALUES (?, ?, ?, ?, ?)`,
    [userId, 'Primary Checking', 'checking', checkingNum, 523450]
  );
  const checkingId = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];

  db.run(
    `INSERT INTO accounts (user_id, name, type, account_number, balance) VALUES (?, ?, ?, ?, ?)`,
    [userId, 'Vacation Savings', 'savings', savingsNum, 1275000]
  );
  const savingsId = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];

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
      [checkingId, type, amount, balanceAfter, desc, date]
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
      [savingsId, type, amount, balanceAfter, desc, date]
    );
  }
}

module.exports = { seed };
