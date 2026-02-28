const express = require('express');
const cors = require('cors');
const { createAuthRouter } = require('./routes/auth');
const { createAccountsRouter } = require('./routes/accounts');
const { createTransactionsRouter } = require('./routes/transactions');
const { createBeLevRouter } = require('./routes/belev');

function createApp(db, saveDb) {
  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  app.use('/api/auth', createAuthRouter(db, saveDb));
  app.use('/api/accounts', createAccountsRouter(db, saveDb));
  app.use('/api/accounts', createTransactionsRouter(db, saveDb));
  app.use('/api/belev', createBeLevRouter(db, saveDb));

  return app;
}

module.exports = { createApp };
