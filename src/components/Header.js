/**
 * PolyRank — Header Component
 * Fixed glassmorphic header with logo, nav, search, and update badge
 */

import { getInitials, getAvatarColor, formatViews, timeAgo } from '../utils/format.js';

let searchTimeout = null;
let currentDropdownCleanup = null;

/**
 * Render the fixed header
 * @param {object} options
 * @param {string} options.activeRoute - Current hash route
 * @param {object} options.stats - Stats object with last_updated
 * @param {object[]} options.accounts - Full accounts array for search
 * @returns {string} HTML string
 */
export function renderHeader({ activeRoute = '#/', stats = {}, accounts = [] } = {}) {
  const isHome = activeRoute === '#/' || activeRoute === '';
  const isLeaderboard = activeRoute === '#/leaderboard';

  const lastUpdated = stats.last_updated ? timeAgo(stats.last_updated) : '2h ago';

  return `
  <header class="header" id="main-header">
    <a class="header-logo" href="#/" id="header-logo">
      <span class="header-logo-text">PolyRank</span>
      <span class="header-logo-badge">Beta</span>
    </a>

    <nav class="header-nav" id="header-nav">
      <a class="header-nav-link ${isHome ? 'active' : ''}" href="#/" id="nav-home">Home</a>
      <a class="header-nav-link ${isLeaderboard ? 'active' : ''}" href="#/leaderboard" id="nav-leaderboard">Leaderboard</a>
    </nav>

    <div class="header-right">
      <div class="header-search" id="header-search">
        <svg class="header-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          class="header-search-input"
          id="header-search-input"
          placeholder="Search @handle..."
          autocomplete="off"
          spellcheck="false"
        />
        <div id="header-search-dropdown" class="header-search-dropdown" style="display:none;"></div>
      </div>

      <div class="update-badge" id="header-update-badge">
        <span class="update-badge-dot"></span>
        Updated ${lastUpdated}
      </div>
    </div>
  </header>`;
}

/**
 * Bind header search events (call after rendering)
 */
export function bindHeaderSearch(accounts) {
  // Clean up previous listeners
  if (currentDropdownCleanup) {
    currentDropdownCleanup();
    currentDropdownCleanup = null;
  }

  const input = document.getElementById('header-search-input');
  const dropdown = document.getElementById('header-search-dropdown');
  if (!input || !dropdown) return;

  function onInput() {
    clearTimeout(searchTimeout);
    const query = input.value.trim().toLowerCase().replace('@', '');

    if (query.length < 2) {
      dropdown.style.display = 'none';
      dropdown.innerHTML = '';
      return;
    }

    searchTimeout = setTimeout(() => {
      const results = accounts
        .filter(a =>
          a.handle.toLowerCase().includes(query) ||
          a.display_name.toLowerCase().includes(query)
        )
        .slice(0, 8);

      if (results.length === 0) {
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
        return;
      }

      dropdown.innerHTML = results.map(a => `
        <div class="search-result-item" data-handle="${a.handle}" id="search-result-${a.handle}">
          <div class="result-avatar" style="background:${getAvatarColor(a.handle)}">${getInitials(a.display_name)}</div>
          <div class="result-info">
            <div class="result-name">${a.display_name}</div>
            <div class="result-handle">@${a.handle}</div>
          </div>
          <div class="result-rank">#${a.current_rank}</div>
        </div>
      `).join('');
      dropdown.style.display = 'block';
    }, 300);
  }

  function onClickResult(e) {
    const item = e.target.closest('.search-result-item');
    if (item) {
      const handle = item.dataset.handle;
      input.value = '';
      dropdown.style.display = 'none';
      dropdown.innerHTML = '';
      window.location.hash = `#/profile/${handle}`;
    }
  }

  function onClickOutside(e) {
    if (!e.target.closest('#header-search')) {
      dropdown.style.display = 'none';
      dropdown.innerHTML = '';
    }
  }

  function onFocusInput() {
    if (input.value.trim().length >= 2) {
      onInput(); // Re-show results
    }
  }

  input.addEventListener('input', onInput);
  dropdown.addEventListener('click', onClickResult);
  document.addEventListener('click', onClickOutside);
  input.addEventListener('focus', onFocusInput);

  currentDropdownCleanup = () => {
    input.removeEventListener('input', onInput);
    dropdown.removeEventListener('click', onClickResult);
    document.removeEventListener('click', onClickOutside);
    input.removeEventListener('focus', onFocusInput);
    clearTimeout(searchTimeout);
  };
}
