/**
 * PolyRank — Hero Section Component
 * Animated hero with floating orbs, gradient text, stat counters, and search
 */

import { formatViews, formatNumber } from '../utils/format.js';

/**
 * Render the hero section
 * @param {object} stats - Stats summary object
 * @returns {string} HTML string
 */
export function renderHero(stats = {}) {
  const totalAccounts = stats.total_accounts || 10_000;
  const totalViews = stats.total_views || 892_450_000;
  const totalTweets = stats.total_tweets_and_replies || 3_847_200;

  return `
  <section class="hero" id="hero-section">
    <!-- Animated floating orbs -->
    <div class="hero-orb hero-orb-1"></div>
    <div class="hero-orb hero-orb-2"></div>
    <div class="hero-orb hero-orb-3"></div>
    <div class="hero-orb hero-orb-4"></div>

    <div class="hero-content">
      <h1 class="hero-title">
        <span class="hero-title-gradient">Track Your Polymarket Impact</span>
      </h1>
      <p class="hero-subtitle">
        See how you rank among ${formatNumber(totalAccounts)}+ accounts putting Polymarket on the map
      </p>

      <!-- Stat Counter Cards -->
      <div class="hero-stats" id="hero-stats">
        <div class="glass-card hero-stat-card" id="hero-stat-accounts">
          <div class="hero-stat-value" data-count="${totalAccounts}" id="hero-stat-accounts-value">0</div>
          <div class="hero-stat-label">Accounts Tracked</div>
        </div>
        <div class="glass-card hero-stat-card" id="hero-stat-views">
          <div class="hero-stat-value" data-count="${totalViews}" data-format="views" id="hero-stat-views-value">0</div>
          <div class="hero-stat-label">Total Views</div>
        </div>
        <div class="glass-card hero-stat-card" id="hero-stat-tweets">
          <div class="hero-stat-value" data-count="${totalTweets}" data-format="number" id="hero-stat-tweets-value">0</div>
          <div class="hero-stat-label">Tweets &amp; Replies Counted</div>
        </div>
      </div>

      <!-- Hero Search -->
      <form class="hero-search" id="hero-search-form">
        <input
          type="text"
          class="hero-search-input"
          id="hero-search-input"
          placeholder="Enter your @handle to find your rank..."
          autocomplete="off"
          spellcheck="false"
        />
        <button type="submit" class="hero-search-btn" id="hero-search-btn" aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
      </form>

      <!-- CTA Link -->
      <a class="hero-cta-link" href="#/leaderboard" id="hero-cta-leaderboard">
        View Full Leaderboard
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"/>
          <path d="m12 5 7 7-7 7"/>
        </svg>
      </a>
    </div>
  </section>`;
}

/**
 * Bind hero section events and start count-up animations
 */
export function bindHero() {
  // Search form handler
  const form = document.getElementById('hero-search-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('hero-search-input');
      const handle = input.value.trim().replace('@', '');
      if (handle) {
        window.location.hash = `#/profile/${handle}`;
        input.value = '';
      }
    });
  }

  // Count-up animation using IntersectionObserver
  const statValues = document.querySelectorAll('.hero-stat-value[data-count]');
  if (statValues.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCountUp(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  statValues.forEach(el => observer.observe(el));
}

/**
 * Animate a number counting up
 */
function animateCountUp(el) {
  const target = parseInt(el.dataset.count, 10);
  const format = el.dataset.format;
  const duration = 1500;
  const startTime = performance.now();

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutExpo(progress);
    const currentValue = Math.round(target * easedProgress);

    if (format === 'views') {
      el.textContent = formatViews(currentValue);
    } else if (format === 'number') {
      el.textContent = formatNumber(currentValue);
    } else {
      el.textContent = formatNumber(currentValue);
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}
