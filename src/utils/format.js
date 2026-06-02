/**
 * PolyRank — Formatting Utilities
 * Pure functions for number/date formatting
 */

/**
 * Format large view counts into human-readable strings
 * 431000000 → "431M", 15200000 → "15.2M", 431000 → "431K", 1500 → "1.5K"
 */
export function formatViews(n) {
  if (n == null) return '0';
  if (n >= 1_000_000_000) {
    const val = n / 1_000_000_000;
    return val % 1 === 0 ? `${val}B` : `${val.toFixed(1)}B`;
  }
  if (n >= 1_000_000) {
    const val = n / 1_000_000;
    return val >= 100
      ? `${Math.round(val)}M`
      : val >= 10
        ? `${Math.round(val)}M`
        : `${parseFloat(val.toFixed(1))}M`;
  }
  if (n >= 1_000) {
    const val = n / 1_000;
    return val >= 100
      ? `${Math.round(val)}K`
      : val >= 10
        ? `${Math.round(val)}K`
        : `${parseFloat(val.toFixed(1))}K`;
  }
  return n.toString();
}

/**
 * Format number with commas: 1373 → "1,373"
 */
export function formatNumber(n) {
  if (n == null) return '0';
  return n.toLocaleString('en-US');
}

/**
 * Convert ISO date to relative time: "3h ago", "2d ago"
 */
export function timeAgo(isoDate) {
  if (!isoDate) return 'just now';
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return `${Math.floor(diffSec / 604800)}w ago`;
}

/**
 * Countdown to a future ISO date: "21h 15m"
 */
export function countdownTo(isoDate) {
  if (!isoDate) return '--';
  const now = Date.now();
  const target = new Date(isoDate).getTime();
  const diff = target - now;
  if (diff <= 0) return 'now';

  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  return `${hours}h ${minutes}m`;
}

/**
 * Get initials from a display name: "Elon Musk" → "EM"
 */
export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Deterministic HSL color from a handle string hash
 */
export function getAvatarColor(handle) {
  if (!handle) return 'hsl(240, 50%, 40%)';
  let hash = 0;
  for (let i = 0; i < handle.length; i++) {
    hash = handle.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit int
  }
  const hue = Math.abs(hash) % 360;
  const saturation = 55 + (Math.abs(hash >> 8) % 20);  // 55-75
  const lightness = 35 + (Math.abs(hash >> 16) % 15);   // 35-50
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
