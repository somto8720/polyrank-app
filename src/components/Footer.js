/**
 * PolyRank — Footer Component
 */

export function renderFooter() {
  return `
  <footer class="footer" id="footer">
    <div class="footer-text">
      PolyRank tracks the reach and impact of tweets mentioning
      <a href="https://polymarket.com" target="_blank" rel="noopener">Polymarket</a>.
      Rankings are based on aggregated view counts and are updated periodically.
      This site is not affiliated with, endorsed by, or connected to Polymarket.
    </div>
    <div class="footer-divider"></div>
    <div class="footer-text">
      Data powered by <a href="https://twitterapi.io" target="_blank" rel="noopener">TwitterAPI.io</a>
    </div>
    <div class="footer-copyright">
      &copy; 2026 PolyRank. All data is provided for informational purposes only.
    </div>
  </footer>`;
}
