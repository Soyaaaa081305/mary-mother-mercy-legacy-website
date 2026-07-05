const fs = require('fs');
const mysql = require('mysql2/promise');

function booleanFromEnv(value) {
  if (value === undefined || String(value).trim() === '') return null;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function sslCaFromEnv() {
  if (process.env.DB_SSL_CA) {
    return process.env.DB_SSL_CA.replace(/\\n/g, '\n');
  }

  if (process.env.DB_SSL_CA_PATH) {
    return fs.readFileSync(process.env.DB_SSL_CA_PATH, 'utf8');
  }

  return null;
}

function sslConfig(searchParams = new URLSearchParams()) {
  const mode = String(
    process.env.DB_SSL_MODE ||
    searchParams.get('ssl-mode') ||
    searchParams.get('sslmode') ||
    ''
  ).toLowerCase();

  if (['disabled', 'disable', 'false', '0', 'off'].includes(mode)) return undefined;

  const ca = sslCaFromEnv();
  const rejectUnauthorized = booleanFromEnv(process.env.DB_SSL_REJECT_UNAUTHORIZED);

  if (!mode && !ca && rejectUnauthorized === null) return undefined;

  const ssl = {};
  if (ca) ssl.ca = ca;
  if (rejectUnauthorized !== null) {
    ssl.rejectUnauthorized = rejectUnauthorized;
  } else if (ca || ['verify-ca', 'verify_identity', 'verify-identity'].includes(mode)) {
    ssl.rejectUnauthorized = true;
  } else if (['required', 'require', 'true', '1', 'on'].includes(mode)) {
    ssl.rejectUnauthorized = false;
  }

  return ssl;
}

function configFromUrl(databaseUrl) {
  const url = new URL(databaseUrl);
  const pathname = decodeURIComponent(url.pathname || '').replace(/^\//, '');

  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username || ''),
    password: decodeURIComponent(url.password || ''),
    database: pathname || process.env.DB_NAME || 'mary_mother_cms',
    ssl: sslConfig(url.searchParams)
  };
}

function configFromEnv() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mary_mother_cms',
    ssl: sslConfig()
  };
}

const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.DB_URL;
const pool = mysql.createPool({
  ...(databaseUrl ? configFromUrl(databaseUrl) : configFromEnv()),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true
});

async function query(sql, params = {}) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function getOne(sql, params = {}) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

module.exports = {
  pool,
  query,
  getOne
};
