const path = require('path');
const serverless = require('serverless-http');
const initSqlJs = require('sql.js');
const { initSchema } = require('../../server/src/db/schema');
const { seed } = require('../../server/src/db/seed');
const { createApp } = require('../../server/src/app');

// In production, JWT_SECRET is set via Netlify env vars.
// Fallback for local testing only.
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'dev-secret-change-in-production';
}

let handlerPromise = null;

function init() {
  if (handlerPromise) return handlerPromise;

  handlerPromise = (async () => {
    const SQL = await initSqlJs({
      locateFile: file => path.join(__dirname, file),
    });
    const db = new SQL.Database();
    db.run('PRAGMA foreign_keys = ON');
    initSchema(db);

    const userCount = db.exec('SELECT COUNT(*) FROM users');
    if (userCount[0].values[0][0] === 0) {
      await seed(db);
    }

    // No-op saveDb in serverless (in-memory only)
    const app = createApp(db, () => {});
    return serverless(app);
  })();

  return handlerPromise;
}

exports.handler = async (event, context) => {
  const handler = await init();
  return handler(event, context);
};
