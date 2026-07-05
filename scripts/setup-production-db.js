require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

const root = path.join(__dirname, '..');
const sqlFiles = [
  'database/01_schema.sql',
  'database/02_seed.sql',
  'database/07_populate_mary_mother_content.sql',
  'database/08_prepare_cloud_deployment.sql'
];

const appTables = [
  'activity_logs',
  'event_participations',
  'events',
  'site_videos',
  'donation_records',
  'contact_messages',
  'contact_team_members',
  'support_information',
  'gallery_images',
  'gallery_categories',
  'caregiver_stories',
  'legacy_entries',
  'admin_otp_trusted_devices',
  'admin_login_otps',
  'pages',
  'admin_users'
];

function isDatabaseDirective(statement) {
  return /^(DROP\s+DATABASE|CREATE\s+DATABASE|USE)\b/i.test(statement.trim());
}

function statementsFromFile(relativePath) {
  const fullPath = path.join(root, relativePath);
  const sql = fs.readFileSync(fullPath, 'utf8');

  return sql
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean)
    .filter((statement) => !isDatabaseDirective(statement));
}

async function run() {
  if (process.env.CONFIRM_RESET !== 'YES') {
    throw new Error('Refusing to reset the database. Run with CONFIRM_RESET=YES.');
  }

  const connection = await pool.getConnection();
  try {
    const [[databaseInfo]] = await connection.query('SELECT DATABASE() AS database_name');
    console.log(`Preparing database: ${databaseInfo.database_name}`);

    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of appTables) {
      await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    for (const file of sqlFiles) {
      console.log(`Running ${file}`);
      for (const statement of statementsFromFile(file)) {
        await connection.query(statement);
      }
    }

    const [[tableCount]] = await connection.query(
      `SELECT COUNT(*) AS total
       FROM information_schema.tables
       WHERE table_schema = DATABASE()`
    );
    const [[pageCount]] = await connection.query('SELECT COUNT(*) AS total FROM pages');
    const [[supportCount]] = await connection.query('SELECT COUNT(*) AS total FROM support_information');

    console.log(`Database setup complete: ${tableCount.total} tables, ${pageCount.total} pages, ${supportCount.total} support record.`);
  } finally {
    connection.release();
    await pool.end();
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
