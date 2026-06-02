/**
 * PolyRank — Leaderboard Table Component
 * Premium data table with rank badges, sparklines, and staggered animations
 */

import { formatViews, formatNumber, getInitials, getAvatarColor } from '../utils/format.js';
import { renderSparkline } from './Sparkline.js';
import { renderPagination, bindPagination } from './Pagination.js';

const ROWS_PER_PAGE = 25;

/**
 * Render the leaderboard page
 * @param {object[]} accounts - All accounts (sorted by rank)
 * @param {number} page - Current page (1-indexed)
 * @param {number} totalPages - Total pages
 * @param {function} onPageChange - Page change callback
 * @returns {string} HTML string
 */
export function renderLeaderboard(accounts, page = 1, totalPages = 1) {
  const start = (page - 1) * ROWS_PER_PAGE;
  const end = start + ROWS_PER_PAGE;
  const pageAccounts = accounts.slice(start, end);

  const rows = pageAccounts.map((a, idx) => {
    const rankClass = getRankClass(a.current_rank);
    const rowClass = getRankRowClass(a.current_rank);
    const badgeClass = getRankBadgeClass(a.current_rank);
    const changeHtml = renderRankChange(a.rank_change);
    const avatarColor = getAvatarColor(a.handle);
    const initials = getInitials(a.display_name);
    const sparkline = renderSparkline(a.sparkline_data, 120, 32);

    return `
    <tr class="${rowClass}" data-handle="${a.handle}" id="leaderboard-row-${a.handle}" style="animation-delay: ${(idx * 0.025).toFixed(3)}s">
      <td>
        <span class="rank-badge ${badgeClass}" id="rank-badge-${a.current_rank}">${a.current_rank}</span>
      </td>
      <td>
        <div class="account-cell">
          <div class="account-avatar" style="background:${avatarColor}" id="avatar-${a.handle}">${initials}</div>
          <div class="account-info">
            <div class="account-name">${escapeHtml(a.display_name)}</div>
            <div class="account-handle">@${escapeHtml(a.handle)}</div>
          </div>
        </div>
      </td>
      <td class="views-cell mono">${formatViews(a.total_views)}</td>
      <td class="tweets-cell mono">${formatNumber(a.total_tweets)}</td>
      <td class="replies-cell mono">${formatNumber(a.total_replies)}</td>
      <td class="avg-cell mono">${formatViews(a.avg_views_per_tweet)}</td>
      <td class="sparkline-cell">${sparkline}</td>
      <td>${changeHtml}</td>
    </tr>`;
  }).join('');

  return `
  <section class="leaderboard-section page-enter" id="leaderboard-section">
    <div class="leaderboard-header">
      <h2 class="leaderboard-title" id="leaderboard-title">Leaderboard</h2>
      <span class="leaderboard-count" id="leaderboard-count">${formatNumber(accounts.length)} accounts</span>
    </div>

    <div class="leaderboard-table-wrapper glass-card-static" id="leaderboard-table-wrapper">
      <table class="leaderboard-table" id="leaderboard-table">
        <thead>
          <tr>
            <th style="width:60px">Rank</th>
            <th style="min-width:200px">Account</th>
            <th>Views</th>
            <th>Tweets</th>
            <th>Replies</th>
            <th>Avg Views</th>
            <th style="width:140px">Trend</th>
            <th style="width:80px">Change</th>
          </tr>
        </thead>
        <tbody id="leaderboard-tbody">
          ${rows}
        </tbody>
      </table>
    </div>

    ${renderPagination(page, totalPages)}
  </section>`;
}

/**
 * Bind leaderboard row click and pagination events
 */
export function bindLeaderboard(onPageChange) {
  // Row clicks → navigate to profile
  const tbody = document.getElementById('leaderboard-tbody');
  if (tbody) {
    tbody.addEventListener('click', (e) => {
      const row = e.target.closest('tr[data-handle]');
      if (row) {
        window.location.hash = `#/profile/${row.dataset.handle}`;
      }
    });
  }

  // Pagination
  bindPagination(onPageChange);
}

/**
 * Get the number of rows per page
 */
export function getRowsPerPage() {
  return ROWS_PER_PAGE;
}

// ---- Helper Functions ----

function getRankRowClass(rank) {
  if (rank === 1) return 'rank-gold';
  if (rank === 2) return 'rank-silver';
  if (rank === 3) return 'rank-bronze';
  return '';
}

function getRankBadgeClass(rank) {
  if (rank === 1) return 'rank-badge-gold';
  if (rank === 2) return 'rank-badge-silver';
  if (rank === 3) return 'rank-badge-bronze';
  return '';
}

function getRankClass(rank) {
  if (rank <= 3) return 'top-three';
  return '';
}

function renderRankChange(change) {
  if (change > 0) {
    return `<span class="rank-change rank-change-up" id="change-up-${change}">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-8 8h5v8h6v-8h5z"/></svg>
      ${change}
    </span>`;
  }
  if (change < 0) {
    return `<span class="rank-change rank-change-down" id="change-down-${Math.abs(change)}">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20l8-8h-5V4H9v8H4z"/></svg>
      ${Math.abs(change)}
    </span>`;
  }
  return `<span class="rank-change rank-change-neutral">—</span>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
