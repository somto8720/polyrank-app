/**
 * seed.js — Populate the database with the PolyTweet top-100 leaderboard data.
 *
 * Run once:  npm run seed
 *
 * Inserts 100 accounts, generates 30 days of fake daily_snapshots (with slight
 * random variation so sparklines look realistic), and sets meta keys.
 */

require('dotenv').config();
const { getDb, updateMeta, runStmt, persist } = require('./db');

// ──────────────────────────────────────────────────────────
//  PolyTweet Top 100 — seeded to bootstrap the leaderboard
// ──────────────────────────────────────────────────────────
const POLYTWEET_DATA = [
  { rank: 1, name: 'Elon Musk', handle: 'elonmusk', views: 431000000, tweets: 44 },
  { rank: 2, name: 'Car', handle: 'caronpolymarket', views: 61000000, tweets: 855 },
  { rank: 3, name: 'Shayne Coplan', handle: 'shayne_coplan', views: 52000000, tweets: 564 },
  { rank: 4, name: 'NewsWire', handle: 'newswire_us', views: 35000000, tweets: 329 },
  { rank: 5, name: 'The Greek Trader', handle: 'thegreektrader', views: 18000000, tweets: 918 },
  { rank: 6, name: 'haeju.eth', handle: 'jeonghaeju', views: 17000000, tweets: 280 },
  { rank: 7, name: 'AdiiX', handle: 'adiix_official', views: 15000000, tweets: 1373 },
  { rank: 8, name: 'Movez', handle: '0xmovez', views: 15000000, tweets: 1282 },
  { rank: 9, name: 'Argona', handle: 'argona0x', views: 15000000, tweets: 1346 },
  { rank: 10, name: 'Rothmus', handle: 'rothmus', views: 15000000, tweets: 97 },
  { rank: 11, name: 'AB Kuai.Dong', handle: '_forab', views: 14000000, tweets: 93 },
  { rank: 12, name: 'Pentagon Pizza Watch', handle: 'pizzintwatch', views: 13000000, tweets: 753 },
  { rank: 13, name: 'Lirrato', handle: 'itslirrato', views: 12000000, tweets: 1059 },
  { rank: 14, name: 'Lunar', handle: 'lunarresearcher', views: 11000000, tweets: 342 },
  { rank: 15, name: 'Watcher.Guru', handle: 'watcherguru', views: 11000000, tweets: 20 },
  { rank: 16, name: 'may.crypto', handle: 'xmayeth', views: 11000000, tweets: 537 },
  { rank: 17, name: 'X', handle: 'x', views: 10000000, tweets: 1 },
  { rank: 18, name: 'wincy.eth', handle: 'gusik4ever', views: 10000000, tweets: 1929 },
  { rank: 19, name: 'gemchanger', handle: 'gemchange_ltd', views: 9800000, tweets: 758 },
  { rank: 20, name: 'PolymarketHistory', handle: 'polymarketstory', views: 9800000, tweets: 1059 },
  { rank: 21, name: 'ascetic', handle: 'ascetic0x', views: 8900000, tweets: 852 },
  { rank: 22, name: 'camol', handle: 'camolnft', views: 8900000, tweets: 842 },
  { rank: 23, name: 'LeGate', handle: 'williamlegate', views: 8800000, tweets: 761 },
  { rank: 24, name: 'Blaze', handle: 'browomo', views: 8700000, tweets: 233 },
  { rank: 25, name: 'zoomer', handle: 'zoomerfied', views: 8500000, tweets: 57 },
  { rank: 26, name: "Dexter's Lab", handle: 'dexterssolab', views: 7500000, tweets: 439 },
  { rank: 27, name: 'mahera', handle: 'mahera777', views: 7200000, tweets: 1836 },
  { rank: 28, name: 'Carm1ne', handle: 'carm1nee', views: 7100000, tweets: 367 },
  { rank: 29, name: 'Archive', handle: 'archiveexplorer', views: 6900000, tweets: 542 },
  { rank: 30, name: 'Mr. Buzzoni', handle: 'polydao', views: 6800000, tweets: 794 },
  { rank: 31, name: 'DEGEN NEWS', handle: 'degeneratenews', views: 6700000, tweets: 151 },
  { rank: 32, name: 'Didi', handle: 'diditrading', views: 6700000, tweets: 156 },
  { rank: 33, name: 'Phosphen', handle: 'phosphenq', views: 6200000, tweets: 1002 },
  { rank: 34, name: 'Hanako', handle: 'hanakoxbt', views: 6200000, tweets: 1153 },
  { rank: 35, name: 'Shelpid.WI3M', handle: 'shelpid_wi3m', views: 6200000, tweets: 185 },
  { rank: 36, name: 'Domer', handle: 'domahhhh', views: 6200000, tweets: 242 },
  { rank: 37, name: 'bl888m', handle: 'bl888m', views: 5900000, tweets: 1504 },
  { rank: 38, name: 'self.dll', handle: 'seelffff', views: 5900000, tweets: 304 },
  { rank: 39, name: 'Nick Tomaino', handle: 'ntmoney', views: 5800000, tweets: 253 },
  { rank: 40, name: 'duanlan', handle: 'waveking1314', views: 5400000, tweets: 97 },
  { rank: 41, name: 'dedsec', handle: 'dedsec', views: 5300000, tweets: 490 },
  { rank: 42, name: 'Breezy 4L', handle: 'breezyjpg', views: 5300000, tweets: 624 },
  { rank: 43, name: 'ZER', handle: 'zerqfer', views: 4700000, tweets: 465 },
  { rank: 44, name: 'Aleiah', handle: 'aleiahlock', views: 4500000, tweets: 947 },
  { rank: 45, name: 'Jack', handle: 'jackkk', views: 4300000, tweets: 177 },
  { rank: 46, name: 'Polymarket Traders', handle: 'polymarkettrade', views: 4100000, tweets: 120 },
  { rank: 47, name: '0xRicker', handle: '0xricker', views: 4100000, tweets: 943 },
  { rank: 48, name: 'Lorden', handle: 'lorden_eth', views: 4100000, tweets: 1807 },
  { rank: 49, name: 'zostaff', handle: 'zostaff', views: 3900000, tweets: 969 },
  { rank: 50, name: 'slash1s', handle: 'slash1sol', views: 3800000, tweets: 488 },
  { rank: 51, name: 'Matthew Modabber', handle: 'matthewmodabber', views: 3800000, tweets: 32 },
  { rank: 52, name: 'AshenSoul', handle: '0xashensoul', views: 3700000, tweets: 971 },
  { rank: 53, name: 'igorizuchaetcrypty', handle: 'igor_mikerin', views: 3700000, tweets: 805 },
  { rank: 54, name: 'Jayden', handle: 'thejayden', views: 3600000, tweets: 325 },
  { rank: 55, name: 'izlam', handle: 'bckfv_eth', views: 3600000, tweets: 1703 },
  { rank: 56, name: 'mert', handle: 'mert', views: 3600000, tweets: 66 },
  { rank: 57, name: 'Atlantis liquidity', handle: 'atlantislq', views: 3500000, tweets: 437 },
  { rank: 58, name: 'wale.moca', handle: 'waleswoosh', views: 3500000, tweets: 585 },
  { rank: 59, name: 'Oracle Boar', handle: 'bored2boar', views: 3400000, tweets: 394 },
  { rank: 60, name: 'tsybka', handle: 'tsybka', views: 3400000, tweets: 1049 },
  { rank: 61, name: 'Kyle the Writer', handle: 'kyledewriter', views: 3200000, tweets: 1088 },
  { rank: 62, name: 'MovieTime', handle: 'movietimedev', views: 3100000, tweets: 52 },
  { rank: 63, name: 'Goaty', handle: 'goatyishere', views: 3100000, tweets: 859 },
  { rank: 64, name: 'Mnimiy', handle: 'mnilax', views: 2900000, tweets: 1084 },
  { rank: 65, name: 'Easy', handle: 'notsoeasymoney', views: 2900000, tweets: 226 },
  { rank: 66, name: 'd1namit', handle: '0xd1namit', views: 2800000, tweets: 1609 },
  { rank: 67, name: 'Suhail Kakar', handle: 'suhailkakar', views: 2800000, tweets: 141 },
  { rank: 68, name: 'Talley', handle: '__talley__', views: 2800000, tweets: 165 },
  { rank: 69, name: 'Moses', handle: 'holy_moses7', views: 2800000, tweets: 819 },
  { rank: 70, name: 'VALIX', handle: 'retrovalix', views: 2700000, tweets: 1557 },
  { rank: 71, name: 'Pranjal Bora', handle: 'crypto_pranjal', views: 2700000, tweets: 931 },
  { rank: 72, name: 'BagCalls', handle: 'bagcalls', views: 2700000, tweets: 1573 },
  { rank: 73, name: 'Ansem', handle: 'blknoiz06', views: 2700000, tweets: 70 },
  { rank: 74, name: 'threadguy', handle: 'notthreadguy', views: 2600000, tweets: 151 },
  { rank: 75, name: 'rari', handle: '0xwhrrari', views: 2600000, tweets: 464 },
  { rank: 76, name: 'JesterTheGoose', handle: 'jesterthegoose', views: 2500000, tweets: 108 },
  { rank: 77, name: 'TGweb3', handle: 'tgweb3333', views: 2500000, tweets: 659 },
  { rank: 78, name: 'BuBBliK', handle: 'k1rallik', views: 2400000, tweets: 1120 },
  { rank: 79, name: '0x_Miko', handle: 'mikocrypto11', views: 2400000, tweets: 678 },
  { rank: 80, name: 'frostikk', handle: 'frostikkkk', views: 2300000, tweets: 388 },
  { rank: 81, name: 'rb', handle: 'rb_tweets', views: 2300000, tweets: 577 },
  { rank: 82, name: 'Mustafa', handle: 'mustafap0ly', views: 2300000, tweets: 171 },
  { rank: 83, name: 'Rekt Specter', handle: 'rektspecter', views: 2300000, tweets: 1711 },
  { rank: 84, name: 'Alex', handle: 'de1lymoon', views: 2200000, tweets: 1304 },
  { rank: 85, name: 'trading_axe', handle: 'trading_axe', views: 2100000, tweets: 78 },
  { rank: 86, name: 'cryptoxiaoxiang', handle: 'cryptoxiaoxiang', views: 2100000, tweets: 868 },
  { rank: 87, name: 'PolyMax', handle: 'maximilian_evm', views: 2100000, tweets: 1486 },
  { rank: 88, name: 'The Smart Ape', handle: 'the_smart_ape', views: 2100000, tweets: 211 },
  { rank: 89, name: 'gavelsv.patron', handle: 'gavelsvtw', views: 2000000, tweets: 2047 },
  { rank: 90, name: 'cvxv666', handle: 'antpalkin', views: 2000000, tweets: 1700 },
  { rank: 91, name: 'PredictTrader', handle: 'polymarketbet', views: 2000000, tweets: 48 },
  { rank: 92, name: 'Senzer', handle: 'senzer', views: 2000000, tweets: 719 },
  { rank: 93, name: 'zishi', handle: 'silverfang88', views: 2000000, tweets: 73 },
  { rank: 94, name: 'Qwerty', handle: 'qwerty_ytrevvq', views: 2000000, tweets: 1001 },
  { rank: 95, name: 'Nikita Bier', handle: 'nikitabier', views: 2000000, tweets: 4 },
  { rank: 96, name: 'fabiano.sol', handle: 'fabianosolana', views: 1900000, tweets: 140 },
  { rank: 97, name: 'db', handle: 'tier10k', views: 1900000, tweets: 9 },
  { rank: 98, name: 'Said', handle: 'said116dao', views: 1900000, tweets: 1398 },
  { rank: 99, name: 'aixbt', handle: 'aixbt_agent', views: 1800000, tweets: 1268 },
  { rank: 100, name: 'dunik', handle: 'dunik_7', views: 1800000, tweets: 1523 },
];

// ──────────────────────────────────────────────────────────
//  Main seed logic
// ──────────────────────────────────────────────────────────
async function run() {
  const db = await getDb();
  const now = new Date().toISOString();

  console.log('🌱 Seeding PolyRank database…');

  // ---------- 1. Insert accounts ----------
  let currentViews = 1800000; // start below the top 100
  let currentRank = 101;

  for (const row of POLYTWEET_DATA) {
    const avgViews = row.tweets > 0 ? Math.round(row.views / row.tweets) : 0;
    const avatar = `https://unavatar.io/x/${row.handle}`;

    db.run(`
      INSERT OR REPLACE INTO accounts
        (handle, display_name, avatar_url, total_views, total_tweets, total_replies,
         avg_views_per_tweet, current_rank, previous_rank, rank_change, first_seen, last_updated)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, 0, ?, ?)
    `, [row.handle, row.name, avatar, row.views, row.tweets, avgViews,
        row.rank, row.rank, now, now]);
  }

  // Generate the remaining 9,900 accounts
  const totalAccounts = 10000;
  for (let i = currentRank; i <= totalAccounts; i++) {
    const handle = `user${i}_poly`;
    const name = `Polymarket Trader ${i}`;
    const avatar = `https://unavatar.io/x/${handle}`;
    
    // Decrement views randomly to ensure realistic sorting
    const decrease = Math.floor(Math.random() * 500) + 1;
    currentViews = Math.max(100, currentViews - decrease);
    
    const tweets = Math.floor(Math.random() * 50) + 1;
    const avgViews = Math.round(currentViews / tweets);

    db.run(`
      INSERT OR REPLACE INTO accounts
        (handle, display_name, avatar_url, total_views, total_tweets, total_replies,
         avg_views_per_tweet, current_rank, previous_rank, rank_change, first_seen, last_updated)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, 0, ?, ?)
    `, [handle, name, avatar, currentViews, tweets, avgViews, i, i, now, now]);

    // Push to POLYTWEET_DATA for the snapshot generation loop below
    POLYTWEET_DATA.push({
      rank: i,
      name,
      handle,
      views: currentViews,
      tweets
    });
  }

  console.log(`  ✅ Inserted ${totalAccounts} accounts`);

  // ---------- 2. Generate 30 days of daily_snapshots ----------
  const today = new Date();

  for (const acct of POLYTWEET_DATA) {
    for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
      const d = new Date(today);
      d.setDate(d.getDate() - dayOffset);
      const dateStr = d.toISOString().slice(0, 10);

      // Apply a small random daily variation (±5%) so sparklines aren't flat
      const jitter = 1 + (Math.random() - 0.5) * 0.1; // 0.95 – 1.05
      const dailyViews = Math.round(acct.views * jitter);

      // Rank can fluctuate slightly too (±2 positions, clamped 1–100)
      const rankJitter = Math.round((Math.random() - 0.5) * 4);
      const dailyRank = Math.max(1, Math.min(100, acct.rank + rankJitter));

      db.run(`
        INSERT OR IGNORE INTO daily_snapshots (handle, date, rank, total_views, total_tweets)
        VALUES (?, ?, ?, ?, ?)
      `, [acct.handle, dateStr, dailyRank, dailyViews, acct.tweets]);
    }
  }
  console.log('  ✅ Generated 30 days of daily snapshots (3,000 rows)');

  // ---------- 3. Set meta keys ----------
  // Persist once before meta helpers (they also persist)
  const { persist } = require('./db');
  persist();

  updateMeta('last_refresh_time', now);
  updateMeta('total_accounts', String(POLYTWEET_DATA.length));
  console.log('  ✅ Meta keys set');

  console.log('\n🎉 Seed complete! Database ready at polyrank.db');
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
