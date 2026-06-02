/**
 * cron.js — Daily refresh and historical backfill logic.
 *
 * runDailyRefresh()  — fetches yesterday's tweets, upserts them, recalculates rankings.
 * runBackfill(start) — walks backwards in weekly chunks from `start` to bootstrap history.
 */

const { getDb, updateMeta, runStmt, queryAll, queryOne, persist } = require('./db');
const { fetchAllPages } = require('./twitterApi');

// ──────────────────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────────────────

const delay = (ms) => new Promise(res => setTimeout(res, ms));

/** Format a Date as YYYY-MM-DD */
function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

/** Return a new Date shifted by `days` from `base`. */
function addDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

// ──────────────────────────────────────────────────────────
//  Tweet upsert
// ──────────────────────────────────────────────────────────

/**
 * Upsert a batch of raw tweet objects from the API into the database.
 * Also ensures every author has an `accounts` row.
 */
async function upsertTweets(tweets) {
  const db = await getDb();
  const now = new Date().toISOString();

  for (const t of tweets) {
    const author = t.author || {};
    const handle = (author.userName || '').toLowerCase();
    const name = author.name || author.userName || '';
    const avatar = author.profileImageUrl || `https://unavatar.io/twitter/${handle}`;

    // Ensure account exists
    db.run(`
      INSERT INTO accounts (handle, display_name, avatar_url, first_seen, last_updated)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(handle) DO UPDATE SET
        display_name = COALESCE(excluded.display_name, accounts.display_name),
        avatar_url   = COALESCE(excluded.avatar_url,   accounts.avatar_url),
        last_updated = excluded.last_updated
    `, [handle, name, avatar, now, now]);

    // Upsert tweet
    db.run(`
      INSERT INTO tweets (tweet_id, author_handle, text_snippet, view_count,
                          like_count, retweet_count, reply_count, is_reply, is_quote,
                          created_at, fetched_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(tweet_id) DO UPDATE SET
        view_count    = excluded.view_count,
        like_count    = excluded.like_count,
        retweet_count = excluded.retweet_count,
        reply_count   = excluded.reply_count,
        fetched_at    = excluded.fetched_at
    `, [
      t.id,
      handle,
      (t.text || '').slice(0, 280),
      t.viewCount || 0,
      t.likeCount || 0,
      t.retweetCount || 0,
      t.replyCount || 0,
      t.isReply ? 1 : 0,
      t.isQuote ? 1 : 0,
      t.createdAt || '',
      now,
    ]);
  }

  persist();
  console.log(`  ✅ Upserted ${tweets.length} tweets`);
}

// ──────────────────────────────────────────────────────────
//  Recalculate rankings
// ──────────────────────────────────────────────────────────

/**
 * Rebuild account aggregates from the tweets table and reassign ranks.
 */
async function recalcRankings() {
  const db = await getDb();

  // 1. Aggregate tweet stats per author
  db.run(`
    UPDATE accounts SET
      total_views  = COALESCE((SELECT SUM(view_count)   FROM tweets WHERE author_handle = accounts.handle), accounts.total_views),
      total_tweets = COALESCE((SELECT COUNT(*)           FROM tweets WHERE author_handle = accounts.handle), accounts.total_tweets),
      total_replies= COALESCE((SELECT SUM(is_reply)      FROM tweets WHERE author_handle = accounts.handle), 0),
      avg_views_per_tweet = CASE
        WHEN COALESCE((SELECT COUNT(*) FROM tweets WHERE author_handle = accounts.handle), 0) > 0
        THEN CAST(COALESCE((SELECT SUM(view_count) FROM tweets WHERE author_handle = accounts.handle), 0) AS REAL)
           / (SELECT COUNT(*) FROM tweets WHERE author_handle = accounts.handle)
        ELSE accounts.avg_views_per_tweet
      END,
      last_updated = datetime('now')
    WHERE EXISTS (SELECT 1 FROM tweets WHERE author_handle = accounts.handle)
  `);

  // 2. Shift current_rank → previous_rank
  db.run(`UPDATE accounts SET previous_rank = current_rank`);

  // 3. Assign new ranks by total_views DESC
  const ranked = queryAll(db, `SELECT handle FROM accounts ORDER BY total_views DESC`);

  for (let i = 0; i < ranked.length; i++) {
    const newRank = i + 1;
    db.run(`
      UPDATE accounts SET current_rank = ?, rank_change = COALESCE(previous_rank, ?) - ?
      WHERE handle = ?
    `, [newRank, newRank, newRank, ranked[i].handle]);
  }

  persist();
  console.log(`  ✅ Rankings recalculated for ${ranked.length} accounts`);
}

// ──────────────────────────────────────────────────────────
//  Snapshot today's state
// ──────────────────────────────────────────────────────────

async function takeSnapshot(dateStr) {
  const db = await getDb();

  // Get all accounts and insert a snapshot row for each
  const accounts = queryAll(db, `SELECT handle, current_rank, total_views, total_tweets FROM accounts`);

  let inserted = 0;
  for (const a of accounts) {
    db.run(`
      INSERT OR IGNORE INTO daily_snapshots (handle, date, rank, total_views, total_tweets)
      VALUES (?, ?, ?, ?, ?)
    `, [a.handle, dateStr, a.current_rank, a.total_views, a.total_tweets]);
    inserted++;
  }

  persist();
  console.log(`  ✅ Snapshot saved for ${dateStr} (${inserted} rows)`);
}

// ──────────────────────────────────────────────────────────
//  Daily refresh (called by cron)
// ──────────────────────────────────────────────────────────

/**
 * Full daily refresh pipeline:
 * 1. Fetch yesterday's tweets from TwitterAPI.io
 * 2. Upsert into DB
 * 3. Recalculate rankings
 * 4. Save daily snapshot
 * 5. Update meta timestamps
 */
async function runDailyRefresh() {
  console.log('\n🔄 Starting daily refresh…');
  const today = new Date();
  const yesterday = addDays(today, -1);

  const sinceDate = fmtDate(yesterday);
  const untilDate = fmtDate(today);

  try {
    // 1. Fetch
    const tweets = await fetchAllPages(sinceDate, untilDate);
    console.log(`  Fetched ${tweets.length} tweets for ${sinceDate}`);

    if (tweets.length > 0) {
      // 2. Upsert
      await upsertTweets(tweets);

      // 3. Recalculate
      await recalcRankings();
    } else {
      console.log('  No new tweets found — skipping recalc.');
    }

    // 4. Snapshot
    await takeSnapshot(fmtDate(today));

    // 5. Meta
    const db = await getDb();
    updateMeta('last_refresh_time', new Date().toISOString());
    const countRow = queryOne(db, 'SELECT COUNT(*) AS c FROM accounts');
    updateMeta('total_accounts', String(countRow ? countRow.c : 0));

    console.log('✅ Daily refresh complete.\n');
  } catch (err) {
    console.error('❌ Daily refresh failed:', err.message);
  }
}

// ──────────────────────────────────────────────────────────
//  Backfill (historical fetch in weekly chunks)
// ──────────────────────────────────────────────────────────

/**
 * Walk backwards from `startDate` to today in 7-day windows.
 * Useful for bootstrapping tweet history without hitting API limits in one go.
 *
 * @param {string} startDate — YYYY-MM-DD to begin backfill from
 */
async function runBackfill(startDate) {
  console.log(`\n📦 Starting backfill from ${startDate}…`);

  let cursor = new Date(startDate);
  const today = new Date();

  while (cursor < today) {
    const chunkEnd = new Date(Math.min(addDays(cursor, 7).getTime(), today.getTime()));
    const sinceStr = fmtDate(cursor);
    const untilStr = fmtDate(chunkEnd);

    console.log(`\n--- Backfill chunk: ${sinceStr} → ${untilStr} ---`);

    try {
      const tweets = await fetchAllPages(sinceStr, untilStr);
      if (tweets.length > 0) {
        await upsertTweets(tweets);
      }
    } catch (err) {
      console.error(`  ❌ Chunk failed: ${err.message}`);
    }

    cursor = chunkEnd;
    await delay(5500); // Respect 1 req / 5s limit
  }

  // Recalc once at the end
  await recalcRankings();
  await takeSnapshot(fmtDate(today));
  updateMeta('last_refresh_time', new Date().toISOString());

  console.log('\n📦 Backfill complete.\n');
}

module.exports = { runDailyRefresh, runBackfill };
