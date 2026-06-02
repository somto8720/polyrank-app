/**
 * PolyRank — Mock Data Generator
 * Generates 10,000 realistic accounts for demo mode
 */

// Seeded pseudo-random number generator for deterministic output
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Top 100 seed accounts based on real PolyTweet data
const TOP_ACCOUNTS = [
  { handle: 'elonmusk', display_name: 'Elon Musk', total_views: 431_000_000, total_tweets: 44 },
  { handle: 'caronpolymarket', display_name: 'Car', total_views: 61_000_000, total_tweets: 855 },
  { handle: 'shayne_coplan', display_name: 'Shayne Coplan', total_views: 52_000_000, total_tweets: 564 },
  { handle: 'newswire_us', display_name: 'NewsWire', total_views: 35_000_000, total_tweets: 329 },
  { handle: 'thegreektrader', display_name: 'The Greek Trader', total_views: 18_000_000, total_tweets: 918 },
  { handle: 'deabordes', display_name: 'Dea Bordes', total_views: 16_500_000, total_tweets: 412 },
  { handle: 'polymarket', display_name: 'Polymarket', total_views: 15_800_000, total_tweets: 287 },
  { handle: 'dustinmoskovitz', display_name: 'Dustin Moskovitz', total_views: 14_200_000, total_tweets: 156 },
  { handle: 'stabordes', display_name: 'StarBordes', total_views: 13_500_000, total_tweets: 634 },
  { handle: 'nikitathecrypto', display_name: 'Nikita Crypto', total_views: 12_800_000, total_tweets: 721 },
  { handle: 'whale_tracker', display_name: 'Whale Tracker', total_views: 11_400_000, total_tweets: 492 },
  { handle: 'polymarketwhale', display_name: 'Poly Whale', total_views: 10_900_000, total_tweets: 385 },
  { handle: 'cryptoaustrian', display_name: 'Crypto Austrian', total_views: 10_200_000, total_tweets: 678 },
  { handle: 'mitchellfyi', display_name: 'Mitchell', total_views: 9_800_000, total_tweets: 312 },
  { handle: 'babordes', display_name: 'Ba Bordes', total_views: 9_400_000, total_tweets: 443 },
  { handle: 'dikitatrader', display_name: 'Dikita Trader', total_views: 8_900_000, total_tweets: 567 },
  { handle: 'predictionking', display_name: 'Prediction King', total_views: 8_500_000, total_tweets: 298 },
  { handle: 'poly_insider', display_name: 'Poly Insider', total_views: 8_100_000, total_tweets: 412 },
  { handle: 'marketseer', display_name: 'Market Seer', total_views: 7_800_000, total_tweets: 534 },
  { handle: 'odds_oracle', display_name: 'Odds Oracle', total_views: 7_400_000, total_tweets: 489 },
  { handle: 'betfair_pro', display_name: 'BetFair Pro', total_views: 7_100_000, total_tweets: 367 },
  { handle: 'trademaster_x', display_name: 'TradeMaster X', total_views: 6_800_000, total_tweets: 445 },
  { handle: 'market_alpha', display_name: 'Market Alpha', total_views: 6_500_000, total_tweets: 512 },
  { handle: 'probabilities_io', display_name: 'Probabilities.io', total_views: 6_200_000, total_tweets: 278 },
  { handle: 'event_trader', display_name: 'Event Trader', total_views: 5_900_000, total_tweets: 398 },
  { handle: 'polydegens', display_name: 'PolyDegens', total_views: 5_700_000, total_tweets: 621 },
  { handle: 'sigma_bets', display_name: 'Sigma Bets', total_views: 5_400_000, total_tweets: 334 },
  { handle: 'crypto_nomad', display_name: 'Crypto Nomad', total_views: 5_200_000, total_tweets: 456 },
  { handle: 'onchain_oracle', display_name: 'OnChain Oracle', total_views: 5_000_000, total_tweets: 289 },
  { handle: 'prediction_mkt', display_name: 'PredictionMkt', total_views: 4_800_000, total_tweets: 512 },
  { handle: 'decentralized_bets', display_name: 'Decentralized Bets', total_views: 4_600_000, total_tweets: 345 },
  { handle: 'market_sage', display_name: 'Market Sage', total_views: 4_400_000, total_tweets: 423 },
  { handle: 'poly_profit', display_name: 'Poly Profit', total_views: 4_200_000, total_tweets: 378 },
  { handle: 'future_caster', display_name: 'FutureCaster', total_views: 4_000_000, total_tweets: 267 },
  { handle: 'bets_on_chain', display_name: 'Bets On Chain', total_views: 3_850_000, total_tweets: 534 },
  { handle: 'alpha_markets', display_name: 'Alpha Markets', total_views: 3_700_000, total_tweets: 412 },
  { handle: 'forecast_daily', display_name: 'Forecast Daily', total_views: 3_550_000, total_tweets: 298 },
  { handle: 'degen_analyst', display_name: 'Degen Analyst', total_views: 3_400_000, total_tweets: 456 },
  { handle: 'market_pulse', display_name: 'Market Pulse', total_views: 3_280_000, total_tweets: 334 },
  { handle: 'poly_research', display_name: 'Poly Research', total_views: 3_150_000, total_tweets: 289 },
  { handle: 'whale_signal', display_name: 'Whale Signal', total_views: 3_020_000, total_tweets: 412 },
  { handle: 'odds_analyst', display_name: 'Odds Analyst', total_views: 2_900_000, total_tweets: 367 },
  { handle: 'crypto_predictor', display_name: 'Crypto Predictor', total_views: 2_780_000, total_tweets: 498 },
  { handle: 'event_markets', display_name: 'Event Markets', total_views: 2_670_000, total_tweets: 345 },
  { handle: 'betting_edge', display_name: 'Betting Edge', total_views: 2_560_000, total_tweets: 423 },
  { handle: 'poly_insights', display_name: 'Poly Insights', total_views: 2_450_000, total_tweets: 312 },
  { handle: 'market_maker_x', display_name: 'Market Maker X', total_views: 2_350_000, total_tweets: 278 },
  { handle: 'chain_prophet', display_name: 'Chain Prophet', total_views: 2_250_000, total_tweets: 389 },
  { handle: 'odds_shark', display_name: 'Odds Shark', total_views: 2_150_000, total_tweets: 456 },
  { handle: 'polymarket_news', display_name: 'Polymarket News', total_views: 2_060_000, total_tweets: 534 },
  { handle: 'alpha_degen', display_name: 'Alpha Degen', total_views: 1_980_000, total_tweets: 312 },
  { handle: 'prediction_pro', display_name: 'Prediction Pro', total_views: 1_900_000, total_tweets: 289 },
  { handle: 'market_deep', display_name: 'Market Deep', total_views: 1_820_000, total_tweets: 445 },
  { handle: 'smart_odds', display_name: 'Smart Odds', total_views: 1_750_000, total_tweets: 367 },
  { handle: 'poly_quant', display_name: 'Poly Quant', total_views: 1_680_000, total_tweets: 234 },
  { handle: 'bets_alpha', display_name: 'Bets Alpha', total_views: 1_610_000, total_tweets: 398 },
  { handle: 'predict_nation', display_name: 'Predict Nation', total_views: 1_550_000, total_tweets: 412 },
  { handle: 'defi_forecaster', display_name: 'DeFi Forecaster', total_views: 1_490_000, total_tweets: 345 },
  { handle: 'market_wiz', display_name: 'Market Wiz', total_views: 1_430_000, total_tweets: 267 },
  { handle: 'poly_edge', display_name: 'Poly Edge', total_views: 1_370_000, total_tweets: 312 },
  { handle: 'crypto_odds', display_name: 'Crypto Odds', total_views: 1_320_000, total_tweets: 456 },
  { handle: 'onchain_bets', display_name: 'OnChain Bets', total_views: 1_270_000, total_tweets: 389 },
  { handle: 'whale_bets', display_name: 'Whale Bets', total_views: 1_220_000, total_tweets: 334 },
  { handle: 'event_oracle', display_name: 'Event Oracle', total_views: 1_170_000, total_tweets: 278 },
  { handle: 'smart_predictor', display_name: 'Smart Predictor', total_views: 1_130_000, total_tweets: 423 },
  { handle: 'market_trend', display_name: 'Market Trend', total_views: 1_090_000, total_tweets: 345 },
  { handle: 'poly_metrics', display_name: 'Poly Metrics', total_views: 1_050_000, total_tweets: 289 },
  { handle: 'forecast_king', display_name: 'Forecast King', total_views: 1_010_000, total_tweets: 367 },
  { handle: 'degen_whale', display_name: 'Degen Whale', total_views: 975_000, total_tweets: 412 },
  { handle: 'market_signal', display_name: 'Market Signal', total_views: 940_000, total_tweets: 298 },
  { handle: 'poly_flows', display_name: 'Poly Flows', total_views: 905_000, total_tweets: 334 },
  { handle: 'alpha_signal', display_name: 'Alpha Signal', total_views: 870_000, total_tweets: 445 },
  { handle: 'bet_analyst', display_name: 'Bet Analyst', total_views: 840_000, total_tweets: 267 },
  { handle: 'chain_markets', display_name: 'Chain Markets', total_views: 810_000, total_tweets: 389 },
  { handle: 'poly_watcher', display_name: 'Poly Watcher', total_views: 780_000, total_tweets: 312 },
  { handle: 'market_radar', display_name: 'Market Radar', total_views: 752_000, total_tweets: 423 },
  { handle: 'event_bets', display_name: 'Event Bets', total_views: 725_000, total_tweets: 345 },
  { handle: 'smart_market', display_name: 'Smart Market', total_views: 698_000, total_tweets: 278 },
  { handle: 'crypto_forecast', display_name: 'Crypto Forecast', total_views: 672_000, total_tweets: 456 },
  { handle: 'poly_signal', display_name: 'Poly Signal', total_views: 648_000, total_tweets: 367 },
  { handle: 'odds_master', display_name: 'Odds Master', total_views: 624_000, total_tweets: 298 },
  { handle: 'market_matrix', display_name: 'Market Matrix', total_views: 601_000, total_tweets: 412 },
  { handle: 'predict_flow', display_name: 'Predict Flow', total_views: 579_000, total_tweets: 334 },
  { handle: 'poly_depth', display_name: 'Poly Depth', total_views: 558_000, total_tweets: 289 },
  { handle: 'alpha_predict', display_name: 'Alpha Predict', total_views: 538_000, total_tweets: 445 },
  { handle: 'chain_odds', display_name: 'Chain Odds', total_views: 518_000, total_tweets: 312 },
  { handle: 'defi_odds', display_name: 'DeFi Odds', total_views: 499_000, total_tweets: 378 },
  { handle: 'bet_maker', display_name: 'Bet Maker', total_views: 481_000, total_tweets: 345 },
  { handle: 'whale_predict', display_name: 'Whale Predict', total_views: 463_000, total_tweets: 267 },
  { handle: 'event_pro', display_name: 'Event Pro', total_views: 446_000, total_tweets: 398 },
  { handle: 'poly_alpha', display_name: 'Poly Alpha', total_views: 430_000, total_tweets: 312 },
  { handle: 'market_vision', display_name: 'Market Vision', total_views: 414_000, total_tweets: 289 },
  { handle: 'crypto_market_cap', display_name: 'Crypto Market Cap', total_views: 399_000, total_tweets: 456 },
  { handle: 'forecast_hub', display_name: 'Forecast Hub', total_views: 385_000, total_tweets: 334 },
  { handle: 'smart_chain', display_name: 'Smart Chain', total_views: 371_000, total_tweets: 412 },
  { handle: 'predict_alpha', display_name: 'Predict Alpha', total_views: 358_000, total_tweets: 278 },
  { handle: 'odds_flow', display_name: 'Odds Flow', total_views: 345_000, total_tweets: 389 },
  { handle: 'degen_market', display_name: 'Degen Market', total_views: 333_000, total_tweets: 345 },
  { handle: 'poly_futures', display_name: 'Poly Futures', total_views: 321_000, total_tweets: 267 },
  { handle: 'market_intel', display_name: 'Market Intel', total_views: 310_000, total_tweets: 423 },
  { handle: 'bet_signal', display_name: 'Bet Signal', total_views: 299_000, total_tweets: 312 },
];

// First name pools for generating random accounts
const FIRST_NAMES = [
  'Alex', 'Jordan', 'Casey', 'Morgan', 'Quinn', 'Blake', 'Riley', 'Avery',
  'Dakota', 'Sage', 'Phoenix', 'Kai', 'Nova', 'Echo', 'Arrow', 'Raven',
  'Crypto', 'Market', 'Poly', 'Alpha', 'Sigma', 'Delta', 'Omega', 'Theta',
  'Degen', 'Bull', 'Bear', 'Whale', 'Smart', 'Deep', 'Edge', 'Flow',
];

const LAST_NAMES = [
  'Trader', 'Bets', 'Market', 'Chain', 'Capital', 'Ventures', 'Labs',
  'Protocol', 'Finance', 'Analytics', 'Signal', 'Alpha', 'Research',
  'Insights', 'Watch', 'Track', 'Pulse', 'Scope', 'Meta', 'Data',
];

/**
 * Generate sparkline data: 30 daily data points with slight upward trend
 */
function generateSparkline(rand, baseValue) {
  const data = [];
  let current = baseValue * (0.7 + rand() * 0.3);
  for (let i = 0; i < 30; i++) {
    const change = (rand() - 0.45) * baseValue * 0.08; // slight upward bias
    current = Math.max(current + change, baseValue * 0.1);
    data.push(Math.round(current));
  }
  return data;
}

/**
 * Generate all 10,000 mock accounts
 */
export function generateMockAccounts() {
  const rand = seededRandom(42);
  const accounts = [];

  // Process top 100 seeded accounts
  for (let i = 0; i < TOP_ACCOUNTS.length; i++) {
    const seed = TOP_ACCOUNTS[i];
    const replyRatio = 0.3 + rand() * 0.3; // 30-60% are replies
    const total_replies = Math.round(seed.total_tweets * replyRatio);
    const actual_tweets = seed.total_tweets - total_replies;
    const avg_views = actual_tweets > 0 ? Math.round(seed.total_views / actual_tweets) : 0;
    const rank_change = Math.round((rand() - 0.5) * 10); // -5 to +5

    accounts.push({
      handle: seed.handle,
      display_name: seed.display_name,
      total_views: seed.total_views,
      total_tweets: seed.total_tweets,
      total_replies: total_replies,
      avg_views_per_tweet: avg_views,
      current_rank: i + 1,
      previous_rank: i + 1 - rank_change,
      rank_change: rank_change,
      sparkline_data: generateSparkline(rand, seed.total_views / 30),
    });
  }

  // Generate remaining 9,900 accounts (ranks 101-10000)
  for (let i = 100; i < 10_000; i++) {
    const rank = i + 1;

    // Exponential decay for views — more realistic distribution
    const viewMultiplier = Math.pow(0.9993, i); // Smooth decay
    const baseViews = 299_000 * viewMultiplier * (0.8 + rand() * 0.4);
    const total_views = Math.max(Math.round(baseViews), 50 + Math.round(rand() * 200));

    const total_tweets = Math.round(50 + rand() * 600);
    const replyRatio = 0.3 + rand() * 0.3;
    const total_replies = Math.round(total_tweets * replyRatio);
    const actual_tweets = total_tweets - total_replies;
    const avg_views = actual_tweets > 0 ? Math.round(total_views / actual_tweets) : 0;
    const rank_change = Math.round((rand() - 0.5) * 10);

    const firstName = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    const suffix = Math.floor(rand() * 9999);
    const handle = `${firstName.toLowerCase()}_${lastName.toLowerCase()}${suffix}`;
    const display_name = `${firstName} ${lastName}`;

    accounts.push({
      handle,
      display_name,
      total_views,
      total_tweets,
      total_replies,
      avg_views_per_tweet: avg_views,
      current_rank: rank,
      previous_rank: rank - rank_change,
      rank_change,
      sparkline_data: generateSparkline(rand, total_views / 30),
    });
  }

  return accounts;
}

/**
 * Generate mock stats summary
 */
export function generateMockStats() {
  return {
    total_accounts: 10_000,
    total_views: 892_450_000,
    total_tweets_and_replies: 3_847_200,
    last_updated: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    next_update: new Date(Date.now() + 21 * 3600 * 1000 + 15 * 60 * 1000).toISOString(),
  };
}
