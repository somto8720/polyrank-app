/**
 * backfill.js — CLI script to backfill historical tweet data.
 *
 * Usage:  npm run backfill              (defaults to 30 days ago)
 *         node backfill.js 2025-05-01   (custom start date)
 */

require('dotenv').config();
const { runBackfill } = require('./cron');

const startDate = process.argv[2] || (() => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
})();

console.log(`🚀 Backfill starting from ${startDate}`);
runBackfill(startDate).then(() => {
  console.log('Done.');
  process.exit(0);
}).catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
