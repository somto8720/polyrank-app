/**
 * index.js — PolyRank server entry point.
 *
 * Boots Express, mounts API routes, schedules the daily cron refresh,
 * and starts listening on the configured PORT.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const apiRoutes = require('./api');
const { runDailyRefresh } = require('./cron');
const { getDb } = require('./db');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3001;
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '0 6 * * *';

// ──────────────────────────────────────────────────────────
//  Middleware
// ──────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ──────────────────────────────────────────────────────────
//  Routes
// ──────────────────────────────────────────────────────────
app.use(apiRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ──────────────────────────────────────────────────────────
//  Scheduled cron job
// ──────────────────────────────────────────────────────────
if (cron.validate(CRON_SCHEDULE)) {
  cron.schedule(CRON_SCHEDULE, async () => {
    console.log(`\n⏰ Cron triggered at ${new Date().toISOString()}`);
    await runDailyRefresh();
  });
  console.log(`📅 Cron scheduled: "${CRON_SCHEDULE}"`);
} else {
  console.warn(`⚠️  Invalid CRON_SCHEDULE: "${CRON_SCHEDULE}" — cron job not started.`);
}

// ──────────────────────────────────────────────────────────
//  Start
// ──────────────────────────────────────────────────────────

async function start() {
  // Eagerly initialise the DB so tables are ready before the first request
  await getDb();

  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║   🏆 PolyRank Server                    ║
║   Port:  ${String(PORT).padEnd(31)}║
║   Cron:  ${CRON_SCHEDULE.padEnd(31)}║
╚══════════════════════════════════════════╝
    `);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
