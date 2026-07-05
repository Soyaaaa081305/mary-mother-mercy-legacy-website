require('dotenv').config();

const { pool } = require('../src/config/db');
const { setupDatabase } = require('../src/utils/databaseSetup');

async function run() {
  if (process.env.CONFIRM_RESET !== 'YES') {
    throw new Error('Refusing to reset the database. Run with CONFIRM_RESET=YES.');
  }

  try {
    await setupDatabase(pool, { reset: true });
  } finally {
    await pool.end();
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
