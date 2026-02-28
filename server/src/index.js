require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { getDb, saveDb } = require('./db/connection');
const { initSchema } = require('./db/schema');
const { seed } = require('./db/seed');
const { createApp } = require('./app');

const PORT = process.env.PORT || 3001;

async function main() {
  const db = await getDb();
  initSchema(db);

  const userCount = db.exec('SELECT COUNT(*) FROM users');
  if (userCount[0].values[0][0] === 0) {
    await seed(db);
    saveDb();
    console.log('Database seeded with demo data');
  }

  const app = createApp(db, saveDb);

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

main().catch(console.error);
