// Inline SVG placeholder shown when a post image fails to load (dead host,
// deleted file, offline). Kept as a data URI so it needs no network request —
// the whole point is that the network already failed.
const PLACEHOLDER =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <rect width="800" height="450" fill="#e5e7eb"/>
      <g fill="none" stroke="#9ca3af" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
        <rect x="320" y="175" width="160" height="120" rx="12"/>
        <circle cx="360" cy="212" r="14"/>
        <path d="M330 280l45-45 35 35 30-25 40 35"/>
      </g>
      <text x="400" y="340" text-anchor="middle" font-family="system-ui,sans-serif"
            font-size="24" fill="#6b7280">Image unavailable</text>
    </svg>`
  );

/**
 * onError handler for <img>. Swaps in the placeholder once and clears the
 * handler so a failing placeholder can never loop.
 */
export const handleImageError = (e) => {
  if (e.target.dataset.fallbackApplied) return;
  e.target.dataset.fallbackApplied = "true";
  e.target.onerror = null;
  e.target.src = PLACEHOLDER;
};

export default PLACEHOLDER;
