/**
 * api.js — Express routes for the PolyRank API.
 *
 * Endpoints:
 *   GET /api/leaderboard — paginated, sortable leaderboard
 *   GET /api/search      — fuzzy account search
 *   GET /api/profile/:h  — full account + 30-day sparkline
 *   GET /api/stats        — global dashboard stats
 */

const { Router } = require('express');
const { getDb, getMeta, queryAll, queryOne } = require('./db');

const router = Router();

// ──────────────────────────────────────────────────────────
//  GET /api/leaderboard
// ──────────────────────────────────────────────────────────

router.get('/api/leaderboard', async (req, res) => {
  try {
    const db = await getDb();

    const page  = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const offset = (page - 1) * limit;

    // Determine sort column (whitelist to prevent injection)
    const SORT_MAP = {
      views:  'total_views',
      tweets: 'total_tweets',
      avg:    'avg_views_per_tweet',
      rank:   'current_rank',
    };
    const sortKey = SORT_MAP[req.query.sort] || 'total_views';
    // Rank sorts ascending; everything else descending
    const direction = sortKey === 'current_rank' ? 'ASC' : 'DESC';

    const countRow = queryOne(db, 'SELECT COUNT(*) AS c FROM accounts');
    const total = countRow ? countRow.c : 0;

    // Safe: sortKey + direction come from our whitelist, not user input
    const accounts = queryAll(db, `
      SELECT handle, display_name, avatar_url, total_views, total_tweets,
             total_replies, avg_views_per_tweet, current_rank, previous_rank,
             rank_change, first_seen, last_updated
      FROM accounts
      ORDER BY ${sortKey} ${direction}
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    res.json({
      accounts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ──────────────────────────────────────────────────────────
//  GET /api/search?q=term
// ──────────────────────────────────────────────────────────

router.get('/api/search', async (req, res) => {
  try {
    const db = await getDb();
    const q = (req.query.q || '').trim();

    if (!q) {
      return res.json({ accounts: [] });
    }

    const pattern = `%${q}%`;
    const accounts = queryAll(db, `
      SELECT handle, display_name, avatar_url, total_views, current_rank, rank_change
      FROM accounts
      WHERE handle LIKE ? OR display_name LIKE ?
      ORDER BY total_views DESC
      LIMIT 20
    `, [pattern, pattern]);

    res.json({ accounts });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ──────────────────────────────────────────────────────────
//  GET /api/profile/:handle
// ──────────────────────────────────────────────────────────

router.get('/api/profile/:handle', async (req, res) => {
  try {
    const db = await getDb();
    const handle = req.params.handle.toLowerCase();

    const account = queryOne(db, `SELECT * FROM accounts WHERE handle = ?`, [handle]);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Last 30 daily snapshots for the sparkline chart
    const snapshots = queryAll(db, `
      SELECT date, rank, total_views, total_tweets
      FROM daily_snapshots
      WHERE handle = ?
      ORDER BY date DESC
      LIMIT 30
    `, [handle]);

    // Reverse so the array goes oldest → newest (easier for chart libs)
    snapshots.reverse();

    // Recent tweets
    const recentTweets = queryAll(db, `
      SELECT tweet_id, text_snippet, view_count, like_count, retweet_count,
             reply_count, is_reply, is_quote, created_at
      FROM tweets
      WHERE author_handle = ?
      ORDER BY created_at DESC
      LIMIT 20
    `, [handle]);

    res.json({ account, snapshots, recentTweets });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ──────────────────────────────────────────────────────────
//  GET /api/stats
// ──────────────────────────────────────────────────────────

router.get('/api/stats', async (req, res) => {
  try {
    const db = await getDb();

    const countRow = queryOne(db, 'SELECT COUNT(*) AS totalAccounts FROM accounts');
    const totalAccounts = countRow ? countRow.totalAccounts : 0;

    const viewsRow = queryOne(db, 'SELECT COALESCE(SUM(total_views), 0) AS totalViews FROM accounts');
    const totalViews = viewsRow ? viewsRow.totalViews : 0;

    const tweetsRow = queryOne(db, 'SELECT COALESCE(SUM(total_tweets), 0) AS totalTweets FROM accounts');
    const totalTweets = tweetsRow ? tweetsRow.totalTweets : 0;

    const lastRefresh = getMeta('last_refresh_time') || null;

    // Compute next scheduled refresh from CRON_SCHEDULE env var
    const cronSchedule = process.env.CRON_SCHEDULE || '0 6 * * *';
    const cronParts = cronSchedule.split(' ');
    const nextRefresh = cronParts.length >= 2
      ? `Daily at ${cronParts[1].padStart(2, '0')}:${cronParts[0].padStart(2, '0')} UTC`
      : 'Unknown';

    res.json({
      totalAccounts,
      totalViews,
      totalTweets,
      lastRefresh,
      nextRefresh,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
