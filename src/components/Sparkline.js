/**
 * PolyRank — Sparkline Component
 * Renders inline SVG mini-charts with smooth curves and gradient fill
 */

/**
 * Render a sparkline SVG from an array of data points
 * @param {number[]} data - Array of ~30 numbers
 * @param {number} width - SVG width (default 120)
 * @param {number} height - SVG height (default 32)
 * @returns {string} SVG HTML string
 */
export function renderSparkline(data, width = 120, height = 32) {
  if (!data || data.length < 2) {
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg"></svg>`;
  }

  const padding = 2;
  const w = width - padding * 2;
  const h = height - padding * 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Map data to points
  const points = data.map((val, i) => ({
    x: padding + (i / (data.length - 1)) * w,
    y: padding + h - ((val - min) / range) * h,
  }));

  // Build smooth quadratic bezier path
  let linePath = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    linePath += ` Q ${prev.x.toFixed(1)},${prev.y.toFixed(1)} ${cpx.toFixed(1)},${((prev.y + curr.y) / 2).toFixed(1)}`;
  }
  // Final segment to last point
  const last = points[points.length - 1];
  linePath += ` L ${last.x.toFixed(1)},${last.y.toFixed(1)}`;

  // Fill path — close to bottom
  const fillPath = linePath +
    ` L ${last.x.toFixed(1)},${(padding + h).toFixed(1)}` +
    ` L ${points[0].x.toFixed(1)},${(padding + h).toFixed(1)} Z`;

  // Determine line color based on trend (last vs first)
  const trending = data[data.length - 1] >= data[0];
  const lineColor = trending ? '#6366f1' : '#ef4444';
  const gradId = `sparkGrad_${Math.random().toString(36).substr(2, 6)}`;

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${lineColor}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${lineColor}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <path d="${fillPath}" fill="url(#${gradId})"/>
  <path d="${linePath}" stroke="${lineColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;
}
