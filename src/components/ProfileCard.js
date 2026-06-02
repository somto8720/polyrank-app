/**
 * PolyRank — Profile Card Component
 * Detailed account profile with stats grid, large sparkline, and animated gradient border
 */

import { formatViews, formatNumber, getInitials, getAvatarColor } from '../utils/format.js';
import { renderSparkline } from './Sparkline.js';

/**
 * Render a full profile page for an account
 * @param {object} account - Account data object
 * @returns {string} HTML string
 */
export function renderProfile(account) {
  if (!account) {
    return renderNotFound();
  }

  const avatarColor = getAvatarColor(account.handle);
  const initials = getInitials(account.display_name);
  const sparkline = renderSparkline(account.sparkline_data, 800, 200);

  const changeClass = account.rank_change > 0
    ? 'rank-change-up'
    : account.rank_change < 0
      ? 'rank-change-down'
      : 'rank-change-neutral';

  const changeText = account.rank_change > 0
    ? `▲ ${account.rank_change}`
    : account.rank_change < 0
      ? `▼ ${Math.abs(account.rank_change)}`
      : '—';

  return `
  <section class="profile-section page-enter" id="profile-section">
    <button class="profile-back" id="profile-back-btn" onclick="window.location.hash='#/leaderboard'">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m15 18-6-6 6-6"/>
      </svg>
      Back to Leaderboard
    </button>

    <!-- Profile Header -->
    <div class="glass-card-static profile-header-card" id="profile-header-card">
      <div class="profile-avatar-large" style="background:${avatarColor}" id="profile-avatar">
        ${initials}
        <div class="profile-rank-overlay" id="profile-rank-overlay">#${account.current_rank}</div>
      </div>
      <h1 class="profile-name" id="profile-name">${escapeHtml(account.display_name)}</h1>
      <p class="profile-handle" id="profile-handle">@${escapeHtml(account.handle)}</p>
      <p class="profile-rank-text" id="profile-rank-text">Rank #${account.current_rank} of 10,000</p>
    </div>

    <!-- Stats Grid -->
    <div class="profile-stats-grid" id="profile-stats-grid">
      <div class="glass-card profile-stat-card" id="profile-stat-views">
        <div class="profile-stat-icon">👁️</div>
        <div class="profile-stat-value">${formatViews(account.total_views)}</div>
        <div class="profile-stat-label">Total Views</div>
      </div>
      <div class="glass-card profile-stat-card" id="profile-stat-tweets">
        <div class="profile-stat-icon">📝</div>
        <div class="profile-stat-value">${formatNumber(account.total_tweets)}</div>
        <div class="profile-stat-label">Total Tweets</div>
      </div>
      <div class="glass-card profile-stat-card" id="profile-stat-replies">
        <div class="profile-stat-icon">💬</div>
        <div class="profile-stat-value">${formatNumber(account.total_replies)}</div>
        <div class="profile-stat-label">Total Replies</div>
      </div>
      <div class="glass-card profile-stat-card" id="profile-stat-avg">
        <div class="profile-stat-icon">📊</div>
        <div class="profile-stat-value">${formatViews(account.avg_views_per_tweet)}</div>
        <div class="profile-stat-label">Avg Views / Tweet</div>
      </div>
      <div class="glass-card profile-stat-card" id="profile-stat-rank">
        <div class="profile-stat-icon">🏆</div>
        <div class="profile-stat-value">#${formatNumber(account.current_rank)}</div>
        <div class="profile-stat-label">Current Rank</div>
      </div>
      <div class="glass-card profile-stat-card" id="profile-stat-change">
        <div class="profile-stat-icon">${account.rank_change > 0 ? '📈' : account.rank_change < 0 ? '📉' : '➡️'}</div>
        <div class="profile-stat-value">
          <span class="rank-change ${changeClass}">${changeText}</span>
        </div>
        <div class="profile-stat-label">Rank Change</div>
      </div>
    </div>

    <!-- Sparkline Chart -->
    <div class="glass-card-static profile-chart-card" id="profile-chart-card">
      <div class="profile-chart-label" id="profile-chart-label">30-Day Trend</div>
      <div class="profile-chart-container" id="profile-chart-container">
        ${sparkline}
      </div>
    </div>
  </section>`;
}

/**
 * Render a "not found" state
 */
function renderNotFound() {
  return `
  <section class="profile-section page-enter" id="profile-section">
    <button class="profile-back" id="profile-back-btn" onclick="window.location.hash='#/leaderboard'">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m15 18-6-6 6-6"/>
      </svg>
      Back to Leaderboard
    </button>

    <div class="empty-state" id="profile-not-found">
      <div class="empty-state-icon">🔍</div>
      <h2 class="empty-state-title">Account Not Found</h2>
      <p class="empty-state-text">
        We couldn't find this account in our leaderboard. They may not have enough Polymarket-related tweets yet.
      </p>
      <a class="hero-cta-link" href="#/leaderboard" id="not-found-cta">
        View Full Leaderboard
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"/>
          <path d="m12 5 7 7-7 7"/>
        </svg>
      </a>
    </div>
  </section>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
