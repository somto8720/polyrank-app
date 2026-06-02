/**
 * twitterApi.js — TwitterAPI.io client for fetching Polymarket-related tweets.
 *
 * All requests use the X-API-Key header read from process.env.TWITTERAPI_KEY.
 * Includes auto-pagination with a polite 500ms delay between pages.
 */

const BASE_URL = 'https://api.twitterapi.io/twitter';

/**
 * Small delay helper to avoid hammering the API.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch wrapper that injects the API key header and parses JSON.
 * Throws on non-2xx responses with a descriptive message.
 */
async function apiFetch(endpoint) {
  const apiKey = process.env.TWITTERAPI_KEY;
  if (!apiKey) {
    throw new Error('TWITTERAPI_KEY is not set in environment variables');
  }

  const url = `${BASE_URL}${endpoint}`;
  console.log(`  [TwitterAPI] GET ${url}`);

  const res = await fetch(url, {
    headers: { 'X-API-Key': apiKey },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`TwitterAPI ${res.status}: ${body.slice(0, 300)}`);
  }

  return res.json();
}

/**
 * Search for tweets mentioning "polymarket" within a date range.
 *
 * @param {string} sinceDate — YYYY-MM-DD
 * @param {string} untilDate — YYYY-MM-DD
 * @param {string|null} cursor — pagination cursor (null for first page)
 * @returns {{ tweets: object[], has_next_page: boolean, next_cursor: string }}
 */
async function searchPolymarketMentions(sinceDate, untilDate, cursor = null) {
  const query = encodeURIComponent(`polymarket since:${sinceDate} until:${untilDate}`);
  let endpoint = `/tweet/advanced_search?query=${query}&queryType=Latest`;

  if (cursor) {
    endpoint += `&cursor=${encodeURIComponent(cursor)}`;
  }

  const data = await apiFetch(endpoint);

  return {
    tweets: data.tweets || [],
    has_next_page: !!data.has_next_page,
    next_cursor: data.next_cursor || null,
  };
}

/**
 * Auto-paginate through ALL results for a given date range.
 * Collects every tweet into a single array.
 *
 * @param {string} sinceDate — YYYY-MM-DD
 * @param {string} untilDate — YYYY-MM-DD
 * @returns {object[]} — flat array of all tweet objects
 */
async function fetchAllPages(sinceDate, untilDate) {
  const allTweets = [];
  let cursor = null;
  let page = 0;

  console.log(`[TwitterAPI] Fetching all pages for ${sinceDate} → ${untilDate}`);

  do {
    page++;
    const result = await searchPolymarketMentions(sinceDate, untilDate, cursor);

    console.log(`  Page ${page}: ${result.tweets.length} tweets`);
    allTweets.push(...result.tweets);

    if (!result.has_next_page || !result.next_cursor) break;

    cursor = result.next_cursor;

    // Be respectful — wait 500ms between pages
    await sleep(500);
  } while (true);

  console.log(`[TwitterAPI] Done — ${allTweets.length} total tweets fetched.`);
  return allTweets;
}

module.exports = { searchPolymarketMentions, fetchAllPages };
