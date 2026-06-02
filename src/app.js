/**
 * PolyRank — Main Application
 * SPA with hash-based routing, API fallback to mock data, and smooth page transitions
 */

import { renderHeader, bindHeaderSearch } from './components/Header.js';
import { renderHero, bindHero } from './components/HeroSection.js';
import { renderLeaderboard, bindLeaderboard, getRowsPerPage } from './components/LeaderboardTable.js';
import { renderProfile } from './components/ProfileCard.js';
import { renderFooter } from './components/Footer.js';
import { generateMockAccounts, generateMockStats } from './data/mockData.js';

// ---- Global State ----
export const state = {
  accounts: [],
  stats: {},
  currentPage: 1,
  isLoading: false,
  useMockData: false,
};

// ---- Constants ----
const ROWS_PER_PAGE = getRowsPerPage();

// ---- App Initialization ----
async function init() {
  state.isLoading = true;
  renderLoadingState();

  // Try to fetch from API, fallback to mock data
  try {
    const [statsRes, accountsRes] = await Promise.all([
      fetch('/api/stats', { signal: AbortSignal.timeout(5000) }),
      fetch('/api/leaderboard?limit=10000', { signal: AbortSignal.timeout(5000) })
    ]);
    
    if (!statsRes.ok) throw new Error(`HTTP ${statsRes.status}`);
    if (!accountsRes.ok) throw new Error(`HTTP ${accountsRes.status}`);
    
    const statsData = await statsRes.json();
    const accountsData = await accountsRes.json();
    
    state.stats = statsData.stats || statsData;
    state.accounts = accountsData.accounts || [];
    state.useMockData = false;
  } catch {
    console.log('[PolyRank] API unreachable — switching to demo mode with mock data');
    state.useMockData = true;
    state.accounts = generateMockAccounts();
    state.stats = generateMockStats();
  }

  state.isLoading = false;

  // Set up routing
  window.addEventListener('hashchange', onRouteChange);
  onRouteChange();
}

// ---- Routing ----
function parseRoute() {
  const hash = window.location.hash || '#/';

  if (hash === '#/' || hash === '#' || hash === '') {
    return { route: 'home', params: {} };
  }

  if (hash === '#/leaderboard') {
    return { route: 'leaderboard', params: {} };
  }

  const profileMatch = hash.match(/^#\/profile\/(.+)$/);
  if (profileMatch) {
    return { route: 'profile', params: { handle: decodeURIComponent(profileMatch[1]) } };
  }

  return { route: 'home', params: {} };
}

function onRouteChange() {
  const { route, params } = parseRoute();

  // Animate page transition
  const app = document.getElementById('app');
  const mainContent = document.getElementById('main-content');

  if (mainContent) {
    mainContent.classList.add('page-exit');
    setTimeout(() => renderRoute(route, params), 200);
  } else {
    renderRoute(route, params);
  }
}

function renderRoute(route, params) {
  const app = document.getElementById('app');
  const hash = window.location.hash || '#/';

  let pageContent = '';

  switch (route) {
    case 'home':
      pageContent = renderHomePage();
      break;

    case 'leaderboard':
      pageContent = renderLeaderboardPage();
      break;

    case 'profile':
      pageContent = renderProfilePage(params.handle);
      break;

    default:
      pageContent = renderHomePage();
  }

  const mockBanner = state.useMockData
    ? `<div class="mock-banner" id="mock-data-banner">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        Demo Mode — Showing mock data. Connect API for live data.
      </div>`
    : '';

  app.innerHTML =
    renderHeader({ activeRoute: hash, stats: state.stats, accounts: state.accounts }) +
    mockBanner +
    `<main id="main-content" style="${state.useMockData ? 'padding-top: 36px;' : ''}">` +
    pageContent +
    '</main>' +
    renderFooter();

  // Bind events after rendering
  bindHeaderSearch(state.accounts);

  switch (route) {
    case 'home':
      bindHero();
      break;
    case 'leaderboard':
      bindLeaderboard(handlePageChange);
      break;
  }

  // Scroll to top on route change
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- Page Renderers ----

function renderHomePage() {
  return renderHero(state.stats);
}

function renderLeaderboardPage() {
  const totalPages = Math.ceil(state.accounts.length / ROWS_PER_PAGE);
  // Clamp current page
  if (state.currentPage > totalPages) state.currentPage = totalPages;
  if (state.currentPage < 1) state.currentPage = 1;

  return renderLeaderboard(state.accounts, state.currentPage, totalPages);
}

function renderProfilePage(handle) {
  const account = state.accounts.find(
    a => a.handle.toLowerCase() === handle.toLowerCase()
  );
  return renderProfile(account);
}

// ---- Event Handlers ----

function handlePageChange(newPage) {
  const totalPages = Math.ceil(state.accounts.length / ROWS_PER_PAGE);
  if (newPage < 1 || newPage > totalPages) return;
  state.currentPage = newPage;

  // Re-render just the leaderboard content
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.innerHTML = renderLeaderboardPage();
    bindLeaderboard(handlePageChange);
    // Smooth scroll to table top
    const tableWrapper = document.getElementById('leaderboard-table-wrapper');
    if (tableWrapper) {
      tableWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

// ---- Loading State ----

function renderLoadingState() {
  const app = document.getElementById('app');
  const skeletonRows = Array.from({ length: 10 }, (_, i) =>
    `<div class="skeleton skeleton-row" style="animation-delay: ${(i * 0.1).toFixed(1)}s"></div>`
  ).join('');

  app.innerHTML = `
    ${renderHeader()}
    <main id="main-content" style="padding-top: calc(var(--header-height) + 32px); max-width: var(--max-width); margin: 0 auto; padding-left: 24px; padding-right: 24px;">
      <div style="margin-bottom: 24px;">
        <div class="skeleton skeleton-text" style="width: 200px; height: 24px; margin-bottom: 16px;"></div>
        <div class="skeleton skeleton-text" style="width: 120px; height: 14px;"></div>
      </div>
      <div class="glass-card-static" style="border-radius: var(--radius-lg); overflow: hidden;">
        ${skeletonRows}
      </div>
    </main>
  `;
}

// ---- Global Navigate Function ----
export function navigateTo(hash) {
  window.location.hash = hash;
}

// ---- Boot ----
init();
