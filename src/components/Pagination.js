/**
 * PolyRank — Pagination Component
 * Glass-styled pagination with page numbers, ellipsis, and jump-to-page
 */

/**
 * Render pagination controls
 * @param {number} currentPage - Current page (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {string} onPageChangeAttr - Global function name for page changes
 * @returns {string} HTML string
 */
export function renderPagination(currentPage, totalPages) {
  if (totalPages <= 1) return '';

  const pages = getPageNumbers(currentPage, totalPages);

  const prevDisabled = currentPage <= 1 ? 'disabled' : '';
  const nextDisabled = currentPage >= totalPages ? 'disabled' : '';

  const pageButtons = pages.map(p => {
    if (p === '...') {
      return `<span class="pagination-ellipsis">…</span>`;
    }
    const activeClass = p === currentPage ? 'active' : '';
    return `<button
      class="pagination-btn ${activeClass}"
      data-page="${p}"
      id="pagination-page-${p}"
      ${p === currentPage ? 'aria-current="page"' : ''}
    >${p}</button>`;
  }).join('');

  return `
  <nav class="pagination" id="pagination-nav" aria-label="Leaderboard pagination">
    <button class="pagination-btn" id="pagination-prev" data-page="${currentPage - 1}" ${prevDisabled}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m15 18-6-6 6-6"/>
      </svg>
      Prev
    </button>

    ${pageButtons}

    <button class="pagination-btn" id="pagination-next" data-page="${currentPage + 1}" ${nextDisabled}>
      Next
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m9 18 6-6-6-6"/>
      </svg>
    </button>

    ${totalPages > 10 ? `
    <div class="pagination-jump">
      <span class="pagination-jump-label">Go to</span>
      <input
        type="number"
        class="pagination-jump-input"
        id="pagination-jump-input"
        min="1"
        max="${totalPages}"
        placeholder="#"
      />
    </div>
    ` : ''}
  </nav>`;
}

/**
 * Bind pagination click events
 * @param {function} onPageChange - Callback receiving new page number
 */
export function bindPagination(onPageChange) {
  const nav = document.getElementById('pagination-nav');
  if (!nav) return;

  nav.addEventListener('click', (e) => {
    const btn = e.target.closest('.pagination-btn');
    if (!btn || btn.disabled || btn.classList.contains('active')) return;
    const page = parseInt(btn.dataset.page, 10);
    if (!isNaN(page)) {
      onPageChange(page);
    }
  });

  // Jump to page
  const jumpInput = document.getElementById('pagination-jump-input');
  if (jumpInput) {
    jumpInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const page = parseInt(jumpInput.value, 10);
        const max = parseInt(jumpInput.max, 10);
        if (!isNaN(page) && page >= 1 && page <= max) {
          onPageChange(page);
        }
      }
    });
  }
}

/**
 * Calculate which page numbers to show
 * Shows: first, last, current ±2, with ellipsis
 */
function getPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set();
  pages.add(1);
  pages.add(total);

  // Current and neighbors
  for (let i = Math.max(2, current - 2); i <= Math.min(total - 1, current + 2); i++) {
    pages.add(i);
  }

  // Convert to sorted array and insert ellipsis
  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push('...');
    }
    result.push(sorted[i]);
  }

  return result;
}
