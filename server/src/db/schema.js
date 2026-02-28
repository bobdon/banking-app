function initSchema(db) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      first_name    TEXT    NOT NULL,
      last_name     TEXT    NOT NULL,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name           TEXT    NOT NULL,
      type           TEXT    NOT NULL CHECK(type IN ('checking', 'savings')),
      account_number TEXT    NOT NULL UNIQUE,
      balance        INTEGER NOT NULL DEFAULT 0,
      created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id                     INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id             INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      type                   TEXT    NOT NULL CHECK(type IN ('deposit', 'withdrawal', 'transfer_in', 'transfer_out')),
      amount                 INTEGER NOT NULL,
      balance_after          INTEGER NOT NULL,
      description            TEXT,
      related_transaction_id INTEGER,
      created_at             TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS belev_transfers (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id           INTEGER NOT NULL REFERENCES users(id),
      recipient_id        INTEGER NOT NULL REFERENCES users(id),
      sender_account_id   INTEGER REFERENCES accounts(id),
      recipient_account_id INTEGER REFERENCES accounts(id),
      amount              INTEGER NOT NULL,
      memo                TEXT,
      type                TEXT    NOT NULL CHECK(type IN ('send', 'request')),
      status              TEXT    NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'declined', 'cancelled')),
      created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
      completed_at        TEXT
    )
  `);
}

module.exports = { initSchema };
