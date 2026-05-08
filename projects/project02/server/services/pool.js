// Approach 01-foundation.md § Phase 7 Task 7.1
// mysql2 connection pool factory for Project 02.
// Single pool per process; closePool() is called from server.js SIGTERM handler.
// Future shared-core extraction candidate once stable.
//
// Config source: PHOTOAPP_CONFIG_PATH env (override for tests/docker) or the
// Project 02-owned client/photoapp-config.ini fallback.
const fs = require('fs');
const path = require('path');
const ini = require('ini');
const mysql2 = require('mysql2/promise');

const CONFIG_PATH =
  process.env.PHOTOAPP_CONFIG_PATH || path.resolve(__dirname, '../../client/photoapp-config.ini');

let pool = null;

function readConfig() {
  return ini.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function getPool() {
  if (pool) return pool;
  const cfg = readConfig();
  pool = mysql2.createPool({
    host: cfg.rds.endpoint,
    port: Number(cfg.rds.port_number),
    user: cfg.rds.user_name,
    password: cfg.rds.user_pwd,
    database: cfg.rds.db_name,
    multipleStatements: true, // required by DELETE /images per spec; nowhere else
    connectionLimit: 5,
    waitForConnections: true,
    queueLimit: 0,
  });
  return pool;
}

async function closePool() {
  if (!pool) return;
  const p = pool;
  pool = null;
  await p.end();
}

module.exports = { getPool, closePool };
