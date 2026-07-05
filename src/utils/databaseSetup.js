const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '../..');
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

async function existingAppTables(connection) {
  const [rows] = await connection.query(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = DATABASE()
       AND table_name IN (?)`,
    [appTables]
  );

  return rows.map((row) => row.TABLE_NAME || row.table_name);
}

async function dropAppTables(connection) {
  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const table of appTables) {
    await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
  }
  await connection.query('SET FOREIGN_KEY_CHECKS = 1');
}

async function runSqlFiles(connection) {
  for (const file of sqlFiles) {
    console.log(`Running ${file}`);
    for (const statement of statementsFromFile(file)) {
      await connection.query(statement);
    }
  }
}

async function summarizeDatabase(connection) {
  const [[tableCount]] = await connection.query(
    `SELECT COUNT(*) AS total
     FROM information_schema.tables
     WHERE table_schema = DATABASE()`
  );
  const [[pageCount]] = await connection.query('SELECT COUNT(*) AS total FROM pages');
  const [[supportCount]] = await connection.query('SELECT COUNT(*) AS total FROM support_information');

  return {
    tables: tableCount.total,
    pages: pageCount.total,
    supportRecords: supportCount.total
  };
}

async function setupDatabase(pool, { reset = false, initializeIfEmpty = false } = {}) {
  const connection = await pool.getConnection();

  try {
    const [[databaseInfo]] = await connection.query('SELECT DATABASE() AS database_name');
    const existingTables = await existingAppTables(connection);

    if (reset) {
      console.log(`Resetting database: ${databaseInfo.database_name}`);
      await dropAppTables(connection);
    } else if (initializeIfEmpty) {
      if (existingTables.length === appTables.length) {
        console.log(`Database already initialized: ${databaseInfo.database_name}`);
        return summarizeDatabase(connection);
      }

      if (existingTables.length > 0) {
        throw new Error(
          `Database has a partial CMS schema (${existingTables.length}/${appTables.length} tables). ` +
          'Use CONFIRM_RESET=YES npm run db:setup to reset it intentionally.'
        );
      }

      console.log(`Initializing empty database: ${databaseInfo.database_name}`);
    }

    await runSqlFiles(connection);
    const summary = await summarizeDatabase(connection);
    console.log(`Database setup complete: ${summary.tables} tables, ${summary.pages} pages, ${summary.supportRecords} support record.`);
    return summary;
  } finally {
    connection.release();
  }
}

module.exports = {
  setupDatabase
};
